import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { installPresentationHarness } from './presentationTestHarness.mjs';
import QTable from '../ai/QTable.js';
import StateEncoder from '../ai/StateEncoder.js';
import QLearningGuardPolicy from '../ai/QLearningGuardPolicy.js';
import RandomGuardPolicy from '../combat/RandomGuardPolicy.js';
import ReadinessGuardPolicy from '../ai/ReadinessGuardPolicy.js';
import {runStateForScene} from '../progression/RunState.js';
import { resolveRound } from '../combat/CombatSystem.js';
import { dialogueDuration, PRESENTATION_TIMING as TIMING } from './presentationTiming.js';

// Test the actual scene's async orchestration without a browser renderer. Only
// Phaser's Scene base class is stubbed; combat and animation helpers are real.
const sceneUrl = new URL('../scenes/BattleScene.js', import.meta.url);
const phaserStub = 'data:text/javascript,' + encodeURIComponent('export class Scene {} export const Textures = { FilterMode: { NEAREST: 1 } };');
const source = (await readFile(sceneUrl, 'utf8')).replace(/from '([^']+)'/g, (match, specifier) => {
    if (specifier === 'phaser') return `from '${phaserStub}'`;
    if (specifier.startsWith('.')) return `from '${new URL(specifier, sceneUrl).href}'`;
    return match;
});
const { default: BattleScene } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
test('return stops battle music before resetting same-day exploration',()=>{
 const s=new BattleScene();s.init();const order=[];s.battleMusic={leave:()=>order.push('battle stopped')};s.scene={start:key=>order.push('start '+key),stop:key=>order.push('stop '+key)};s.returnToRoom();assert.deepEqual(order,['battle stopped','stop SchoolScene','start SchoolScene']);assert.equal(s.runState.dayNumber,1);
});

test('victory advances once, then next-day transition starts only after the result hold',async()=>{
 const f=setup();f.scene.combat.guard.hp=1;f.scene.combat.tieRandom=()=>0;f.scene.chooseAction('attack');await f.advance(15000);
 assert.equal(f.scene.runState.dayNumber,2);assert.equal(f.scene.runState.readinessTier,2);assert.equal(f.scene.runState.successfulEscapes,1);
 const starts=f.calls.filter(c=>c.type==='sceneStart');assert.equal(starts.length,1);assert.equal(starts[0].key,'DayTransitionScene');f.scene.returnToRoom();f.scene.finishNarrativeBattle('VICTORY');assert.equal(f.scene.runState.dayNumber,2);
});
test('defeat on a later day resets exploration without changing readiness; metadata reaches live adapter',async()=>{
 const s=new BattleScene();s.game={};const run=runStateForScene(s);for(let i=0;i<2;i++)run.completeEncounter(run.beginEncounter(),'VICTORY');s.init();const f=installPresentationHarness(s);
 assert.equal(s.runContext.dayNumber,3);assert.equal(s.guardAI.runContext.readinessTier,3);
 s.combat.player.hp=1;s.chooseAction('defend');await f.advance(15000);assert.equal(run.dayNumber,3);assert.equal(run.readinessTier,3);assert.equal(run.successfulEscapes,2);
 assert.ok(f.calls.some(c=>c.type==='sceneStart'&&c.key==='SchoolScene'));assert.equal(f.calls.some(c=>c.type==='sceneStart'&&c.key==='DayTransitionScene'),false);
});

test('RILED miss presents fall then get-up once, restores RILED and loses no future action',async()=>{
 const f=setup();let choices=0;f.scene.guardPolicy={chooseAction:()=>{choices++;return 'attack';}};
 f.scene.combat.guard.status={name:'RILED',turns:3};const rolls=[.9,.1];f.scene.combat.random=()=>rolls.shift();
 f.scene.chooseAction('defend');await f.advance(20000);
 assert.equal(f.scene.combat.guard.hp,1150);assert.equal(f.scene.combat.guard.stunned,false);assert.equal(f.scene.combat.guard.offGuard,false);
 const fall=f.calls.find(c=>c.type==='play'&&c.key==='guard-battle-stumble'),up=f.calls.find(c=>c.type==='play'&&c.key==='guard-battle-recovery');
 assert.ok(fall);assert.ok(up.at>fall.at);assert.equal(f.calls.filter(c=>c.type==='play'&&c.key==='guard-battle-stumble').length,1);
 assert.ok(f.calls.some(c=>c.type==='play'&&c.key==='guard-battle-riled'&&c.at>=up.at));
 assert.ok(f.calls.some(c=>c.message?.includes('fell on his face')));assert.equal(f.scene.combat.turnState,'WAITING_FOR_PLAYER');
 f.scene.combat.random=()=>.5;f.scene.chooseAction('catchBreath');await f.advance(20000);assert.equal(choices,2);assert.equal(f.scene.combat.player.hp,880);
});
test('stumble without art safely finishes, and fatal stumble never gets up',async()=>{
 for(const fatal of [false,true]){
  const f=setup({missingAnimations:!fatal});f.scene.guardPolicy={chooseAction:()=> 'attack'};f.scene.combat.guard.status={name:'RILED',turns:3};if(fatal)f.scene.combat.guard.hp=50;
  const rolls=[.9,.1];f.scene.combat.random=()=>rolls.shift();f.scene.chooseAction('catchBreath');await f.advance(20000);
  assert.equal(f.scene.presentationBusy,false);assert.equal(f.scene.combat.turnState,fatal?'VICTORY':'WAITING_FOR_PLAYER');
  if(fatal)assert.equal(f.calls.some(c=>c.key==='guard-battle-recovery'),false);
 }
});
for(const when of [3000,3800])test('shutdown during stumble/recovery stops later presentation at '+when,async()=>{
 const f=setup();f.scene.guardPolicy={chooseAction:()=> 'attack'};f.scene.combat.guard.status={name:'RILED',turns:3};const rolls=[.9,.1];f.scene.combat.random=()=>rolls.shift();
 f.scene.chooseAction('defend');await f.advance(when);f.scene.events.emit('shutdown');const count=f.calls.length;await f.advance(20000);
 assert.equal(f.scene.effects.closed,true);assert.equal(f.calls.slice(count).some(c=>c.type==='play'),false);assert.equal(f.scene.combat.guard.hp,1150);
});

function setup({ missingAnimations = false } = {}) {
    const scene = new BattleScene();
    scene.init();
    return installPresentationHarness(scene, { missingAnimations });
}

test('SFX presentation hooks leave combat traces and RNG identical; recovery and terminal cues occur once',async()=>{
 const a=setup(),b=setup(),ids=[];b.scene.sfx={play:id=>ids.push(id)};
 for(const f of [a,b]){f.scene.combat.tieRandom=()=>0;f.scene.combat.player.hp=600;}
 for(const action of ['catchBreath','attack','swingBackpack']){a.scene.chooseAction(action);b.scene.chooseAction(action);await a.advance(20000);await b.advance(20000);assert.deepEqual(a.scene.combat.snapshot(),b.scene.combat.snapshot());assert.deepEqual(a.scene.combat.log,b.scene.combat.log);}
 assert.ok(ids.includes('breath'));assert.ok(ids.includes('heal'));assert.ok(ids.includes('swing'));assert.ok(ids.includes('heavySwing'));assert.ok(ids.includes('hit'));
 b.scene.finishNarrativeBattle('VICTORY');b.scene.finishNarrativeBattle('VICTORY');assert.equal(ids.filter(id=>id==='victory').length,1);
});
test('stumble emits fall then recovery, and skipped Whistle-cancelled Backpack has no swing sound',async()=>{
 const f=setup(),ids=[];f.scene.sfx={play:id=>ids.push(id)};f.scene.combat.guard.status={name:'RILED',turns:3};const rolls=[.9,.1];f.scene.combat.random=()=>rolls.shift();f.scene.chooseAction('defend');await f.advance(20000);assert.ok(ids.indexOf('fall')<ids.indexOf('getUp'));assert.ok(ids.includes('fall'));
 const g=setup(),other=[];g.scene.sfx={play:id=>other.push(id)};g.scene.guardPolicy={chooseAction:()=> 'blowWhistle'};g.scene.combat.random=()=>0;g.scene.chooseAction('swingBackpack');await g.advance(20000);assert.ok(other.includes('whistle'));assert.ok(other.includes('stun'));assert.equal(other.includes('heavySwing'),false);
});


test('both actions lock before 800 ms reveal and no action executes during reveal',async()=>{
 const f=setup();f.scene.combat.tieRandom=()=>0;
 f.scene.chooseAction('lookThere');
 assert.equal(f.scene.combat.turnState,'REVEALING');assert.equal(f.scene.combat.guard.status,null);
 assert.equal(f.scene.isMenuEntryEnabled('attack'),false);
 assert.ok(f.calls.some(c=>c.type==='text'&&c.message==='LOOK THERE! / NORMAL'));
 assert.ok(f.calls.some(c=>c.type==='text'&&c.message==='ATTACK / SLOW'));
 f.scene.chooseAction('attack');assert.equal(f.calls.filter(c=>c.type==='guardChoice').length,1);
 await f.advance(TIMING.actionReveal-1);assert.equal(f.calls.some(c=>c.type==='play'&&c.key==='player-battle-look-there'),false);
 await f.advance(1);assert.equal(f.scene.combat.turnState,'RESOLVING_FIRST');assert.equal(f.scene.combat.guard.status.name,'DISTRACTED');
 await f.advance(12000);assert.equal(f.scene.combat.turnState,'WAITING_FOR_PLAYER');assert.equal(f.scene.presentationBusy,false);
 const first=f.calls.find(c=>c.type==='play'&&c.key==='player-battle-look-there');const second=f.calls.find(c=>c.type==='play'&&c.key==='guard-battle-attack');assert.ok(second.at>first.at);
 assert.equal(f.calls.filter(c=>c.type==='guardChoice').length,1);
});

test('Guard selection sees only detached pre-round information and never leaks before reveal',()=>{
 const f=setup();let observed;
 f.scene.guardPolicy={chooseAction:s=>{observed=s;assert.equal(f.calls.some(c=>c.type==='text'),false);return 'defend';}};
 f.scene.chooseAction('attack');assert.equal(observed.playerAction,undefined);assert.equal(observed.guardAction,undefined);assert.equal(observed.round,undefined);
 assert.equal(f.scene.combat.guard.defending,false);assert.ok(f.calls.some(c=>c.message==='DEFEND / FAST'));
});

test('Guard FAST defense presents first and blocks slower attack then expires',async()=>{
 const f=setup();f.scene.guardPolicy={chooseAction:()=> 'defend'};f.scene.chooseAction('attack');await f.advance(12000);
 const plays=f.calls.filter(c=>c.type==='play');assert.ok(plays.find(c=>c.key==='guard-battle-defend').at<plays.find(c=>c.key==='player-battle-attack').at);
 assert.equal(f.scene.combat.guard.hp,1160);assert.equal(f.scene.combat.guard.defending,false);assert.equal(f.scene.presentationBusy,false);
});

test('hit stop, shake, hurt and feedback remain synchronized after reveal',async()=>{
 const f=setup();f.scene.combat.tieRandom=()=>0;f.scene.chooseAction('attack');await f.advance(TIMING.actionReveal+300);
 assert.ok(f.calls.some(c=>c.type==='pause'&&c.id==='player'));assert.equal(f.calls.some(c=>c.type==='shake'),false);
 await f.advance(100);assert.ok(f.calls.some(c=>c.type==='shake'&&c.at===TIMING.actionReveal+400));assert.ok(f.calls.some(c=>c.type==='play'&&c.key==='guard-battle-hurt'));
 assert.equal(f.scene.actors.guard.displayedHp,1120);
});

test('Backpack critical uses its own animation and impact',async()=>{
 const f=setup();f.scene.combat.tieRandom=()=>0;f.scene.combat.random=()=>.05;f.scene.chooseAction('swingBackpack');await f.advance(TIMING.actionReveal+540);
 assert.ok(f.calls.some(c=>c.type==='play'&&c.key==='player-battle-backpack'));assert.ok(f.calls.some(c=>c.message?.includes('CRITICAL')&&c.at===TIMING.actionReveal+540));assert.equal(f.calls.some(c=>c.key==='player-battle-critical'),false);
});

test('Call Wife preserves emphasized dialogue before second action',async()=>{
 const f=setup();f.scene.guardPolicy={chooseAction:()=> 'callWife'};f.scene.chooseAction('talkSmack');await f.advance(15000);
 const phone=f.calls.find(c=>c.message==='WIFE / PHONE');const player=f.calls.find(c=>c.type==='play'&&c.key==='player-battle-talk-smack');assert.ok(phone);assert.ok(player.at>phone.at);assert.equal(f.scene.combat.guard.status.name,'RILED');
 assert.equal(f.scene.combat.turnState,'WAITING_FOR_PLAYER');assert.equal(f.scene.presentationBusy,false);assert.equal(f.scene.combat.player.sp,85);
});

for(const when of [200,1000])test('shutdown safely cancels reveal/resolution at '+when,async()=>{
 const f=setup();f.scene.combat.tieRandom=()=>0;f.scene.chooseAction('attack');await f.advance(when);f.scene.events.emit('shutdown');const count=f.calls.length;await f.advance(15000);
 assert.equal(f.scene.effects.closed,true);assert.equal(f.scene.effects.overlays.size,0);assert.equal(f.calls.slice(count).some(c=>c.type==='float'||c.type==='guardChoice'),false);
 assert.equal(f.scene.actors.player.body.anims.isPaused,false);
});

test('missing assets use idle fallback and still complete round',async()=>{
 const f=setup({missingAnimations:true});f.scene.chooseAction('lookThere');await f.advance(15000);assert.equal(f.scene.combat.turnState,'WAITING_FOR_PLAYER');assert.equal(f.scene.presentationBusy,false);
});

test('lethal first attack prevents second attack presentation',async()=>{
 const f=setup();f.scene.combat.tieRandom=()=>0;f.scene.combat.guard.hp=1;f.scene.chooseAction('attack');await f.advance(15000);
 assert.equal(f.scene.combat.turnState,'VICTORY');assert.equal(f.calls.some(c=>c.key==='guard-battle-attack'),false);assert.equal(f.scene.presentationBusy,false);
});

test('Whistle before backpack cancels animation and cost',async()=>{
 const f=setup();f.scene.guardPolicy={chooseAction:()=> 'blowWhistle'};f.scene.combat.random=()=>0;f.scene.chooseAction('swingBackpack');await f.advance(15000);
 assert.equal(f.calls.some(c=>c.key==='player-battle-backpack'),false);assert.equal(f.scene.combat.player.sp,100);assert.equal(f.scene.combat.player.stunned,false);assert.equal(f.scene.combat.turnState,'WAITING_FOR_PLAYER');
});

test('priority indicator appears on actual menu rows',()=>{
 const f=setup();const label=()=>({text:'',setText(v){this.text=v;return this;},setColor(){return this;},setY(){return this;},setVisible(){return this;},setFontSize(){return this;},setAlpha(){return this;}});
 f.scene.panels={};for(const id of ['player','guard']){f.scene.panels[id]={hpText:label(),spText:label(),hpBar:{setScale(){}},spBar:{setScale(){}},effects:label()};Object.assign(f.scene.actors[id],{status:label(),hpBar:{},spBar:{}});}
 f.scene.buttons=Array.from({length:6},()=>({box:{...label(),input:{},setFillStyle(){return this;}},label:label(),cost:label()}));
 f.scene.logText=label();f.scene.turnText=label();f.scene.outcome=label();f.scene.menu='skills';BattleScene.prototype.refresh.call(f.scene);
 assert.equal(f.scene.panels.guard.hpText.text,'HP 1200 / 1200');assert.equal(f.scene.panels.player.hpText.text,'HP 1000 / 1000');
 assert.equal(f.scene.buttons[0].cost.text,'NORMAL 15 SP');assert.equal(f.scene.buttons[3].cost.text,'SLOW 20 SP');assert.equal(f.scene.buttons[4].cost.text,'FAST 30 SP');
});

test('late Whistle stun automatically consumes next round opportunity without duplicate choices',async()=>{
 const f=setup();let choices=0;f.scene.combat.tieRandom=()=>0;f.scene.combat.random=()=>0;f.scene.guardPolicy={chooseAction:()=>++choices===1?'blowWhistle':'defend'};
 f.scene.chooseAction('broLockIn');await f.advance(20000);assert.equal(choices,2);assert.equal(f.scene.combat.player.stunned,false);assert.equal(f.scene.combat.player.sp,85);assert.equal(f.scene.combat.turnState,'WAITING_FOR_PLAYER');assert.equal(f.scene.presentationBusy,false);
});

test('Call Wife uses readable speech, sequential branch commentary and one execution',async()=>{
 const f=setup();f.scene.guardPolicy={chooseAction:()=> 'callWife'};f.scene.chooseAction('attack');
 await f.advance(TIMING.actionReveal+600);assert.equal(f.scene.actors.guard.body.anims.isPaused,true);
 await f.advance(14000);
 const guard=f.calls.find(c=>c.message==='"That kid is bullying me again!"');
 const wife=f.calls.find(c=>c.message==='WIFE / PHONE');const commentary=f.calls.find(c=>c.message?.startsWith('His wife encouraged him.'));
 assert.ok(wife.at>=guard.at+dialogueDuration('callWife',guard.message)+TIMING.phoneResponsePause);
 assert.ok(commentary.at>wife.at);assert.equal(f.scene.combat.guard.wifeCallAvailable,false);
 assert.equal(f.scene.combat.turnState,'WAITING_FOR_PLAYER');assert.equal(f.scene.actors.guard.body.anims.isPaused,false);
 assert.equal(f.calls.filter(c=>c.message==='The Guard called his wife.').length,1);
});
test('Whistle commentary is sequential and shutdown cancels remaining narration',async()=>{
 const f=setup();f.scene.combat.random=()=>0;f.scene.guardPolicy={chooseAction:()=> 'blowWhistle'};f.scene.chooseAction('attack');await f.advance(1900);
 assert.ok(f.calls.some(c=>c.message?.startsWith('You are DISTRACTED.')));assert.equal(f.calls.some(c=>c.message?.startsWith('The whistle stunned you!')),false);
 f.scene.events.emit('shutdown');await f.advance(15000);assert.equal(f.calls.some(c=>c.message?.startsWith('The whistle stunned you!')),false);
});

for(const [code,arrow] of [['KeyW','ArrowUp'],['KeyS','ArrowDown']])test(`${code} mirrors ${arrow} in battle`,()=>{
 const a=setup().scene,b=setup().scene;const key=code=>({code,preventDefault(){},repeat:false});a.handleKey(key(code));b.handleKey(key(arrow));assert.equal(a.selected,b.selected);assert.equal(a.menu,b.menu);
});
for(const [open,back] of [['KeyD','KeyA'],['ArrowRight','ArrowLeft']])test(`${open}/${back} opens and closes Skills without executing an action`,()=>{
 const f=setup();let selected=[];f.scene.chooseAction=a=>selected.push(a);const key=code=>({code,preventDefault(){}});
 f.scene.selected=2;f.scene.handleKey(key(open));assert.equal(f.scene.menu,'skills');f.scene.handleKey(key(back));assert.equal(f.scene.menu,'main');assert.equal(f.scene.selected,2);assert.deepEqual(selected,[]);
 f.scene.selected=0;f.scene.handleKey(key(open));assert.equal(f.scene.menu,'main');assert.deepEqual(selected,[]);
});
for(const code of ['Enter','Space','Digit1'])test(`${code} still confirms exactly once; busy presentation blocks navigation`,()=>{
 const f=setup();const chosen=[];f.scene.chooseAction=a=>chosen.push(a);f.scene.handleKey({code,preventDefault(){}});assert.deepEqual(chosen,['attack']);
 f.scene.presentationBusy=true;for(const code of ['KeyW','KeyS','KeyA','KeyD','Enter','Space'])f.scene.handleKey({code,preventDefault(){}});assert.deepEqual(chosen,['attack']);assert.equal(f.scene.selected,0);
});
test('battle shadows follow sprite feet, including a local jolt',()=>{const f=setup();const actor=f.scene.actors.player;let position;Object.assign(actor,{shadow:{setPosition:(...args)=>position=args},floorY:328,restBodyY:328});actor.body.x=208;BattleScene.prototype.update.call(f.scene);assert.deepEqual(position,[208,330]);});
test('long Call Wife dialogue keeps phone pose held until response finishes, with shutdown cleanup',async()=>{
 const f=setup();f.scene.guardPolicy={chooseAction:()=> 'callWife'};f.scene.chooseAction('catchBreath');await f.advance(TIMING.actionReveal+4000);
 assert.equal(f.scene.actors.guard.body.anims.isPaused,true);assert.equal(f.scene.combat.guard.wifeCallAvailable,false);
 f.scene.events.emit('shutdown');await f.advance(20000);assert.equal(f.scene.actors.guard.body.anims.isPaused,false);assert.equal(f.scene.effects.overlays.size,0);
});

test('full Look There shows one held OFF GUARD pose, cancels current action and carries until next round skip',async()=>{
 const f=setup();f.scene.combat.random=()=>0;f.scene.guardPolicy={chooseAction:()=> 'blowWhistle'};f.scene.combat.tieRandom=()=>0;f.scene.chooseAction('lookThere');await f.advance(2000);
 assert.equal(f.scene.combat.guard.offGuard,true);assert.equal(f.scene.combat.guard.status,null);assert.ok(f.calls.some(c=>c.type==='texture'&&c.key==='guard-battle-distracted-2'));assert.ok(f.calls.some(c=>c.message?.includes('OFF GUARD')));
 await f.advance(12000);assert.equal(f.scene.combat.guard.offGuard,true);
 f.scene.guardPolicy={chooseAction:()=>{throw Error('Policy must not be asked while OFF GUARD');}};f.scene.chooseAction('catchBreath');assert.ok(f.calls.some(c=>c.type==='text'&&c.message==='OFF GUARD'));await f.advance(12000);
 assert.equal(f.scene.combat.guard.offGuard,false);assert.ok(f.calls.some(c=>c.message==='The Guard is still looking away.\nHe loses his action.'));assert.equal(f.scene.combat.guard.sp,100);assert.equal(f.scene.combat.player.status,null);assert.equal(f.calls.some(c=>c.key==='guard-battle-blow-whistle'),false);
 assert.equal(f.calls.filter(c=>c.type==='play'&&c.key==='guard-battle-distracted').length,1);assert.ok(f.calls.some(c=>c.key==='guard-battle-idle'&&c.at>2000));
});
test('partial Look There uses yellow reaction and normal idle, then Guard still attacks',async()=>{
 const f=setup();f.scene.combat.random=()=>.7;f.scene.chooseAction('lookThere');await f.advance(12000);
 assert.equal(f.scene.combat.guard.status.name,'DISTRACTED');assert.equal(f.calls.some(c=>c.key==='guard-battle-distracted'),false);assert.ok(f.calls.some(c=>c.type==='play'&&c.key==='guard-battle-attack'));assert.equal(f.scene.combat.player.hp,1000);assert.equal(f.scene.combat.guard.offGuard,false);
});


test('policy switch changes next decision only; live Q EVAL never modifies values',async()=>{
 const f=setup();const c=f.scene.combat;c.tieRandom=()=>0;const encoder=new StateEncoder(),table=new QTable();
 const next=resolveRound(c.snapshot(),'attack','attack',{random:()=>.5,tieRandom:()=>0}).nextState;
 table.set(encoder.encode(next),'defend',100);table.incrementVisit(encoder.encode(next),'defend');f.scene.guardAI.load(table.toJSON());f.scene.toggleGuardAI();
 assert.ok(f.scene.guardPolicy instanceof RandomGuardPolicy);f.scene.guardAI.randomPolicy.random=()=>0;
 f.scene.chooseAction('attack');assert.equal(c.round.guardAction,'attack');
 const before=JSON.stringify(f.scene.guardAI.qPolicy.table.toJSON());
 f.scene.handleKey({code:'KeyP',preventDefault(){}});assert.ok(f.scene.guardPolicy instanceof ReadinessGuardPolicy);assert.ok(f.scene.guardPolicy.qPolicy instanceof QLearningGuardPolicy);assert.equal(c.round.guardAction,'attack');
 const debug=f.scene.guardAI.debugView(c.snapshot(),true);assert.equal(debug.committedMode,'RANDOM');assert.equal(debug.mode,'Q-LEARNING');assert.equal(debug.chosen,'attack');
 await f.advance(12000);f.scene.chooseAction('catchBreath');assert.equal(c.round.guardAction,'defend');await f.advance(12000);
 assert.equal(JSON.stringify(f.scene.guardAI.qPolicy.table.toJSON()),before);assert.equal(f.scene.guardAI.qPolicy.epsilon,0);
});
test('Q data preloads as text so malformed JSON cannot crash Phaser JSON processing',()=>{
 const scene=new BattleScene();scene.init();const requests=[];scene.load={image(){},audio(){},text:(key,url)=>requests.push({key,url})};scene.preload();assert.equal(requests.length,1);assert.ok(requests[0].url.endsWith('assets/ai/guard_qtable.json'));
 assert.equal(scene.guardAI.load('{malformed'),false);scene.guardPolicy=scene.guardAI.policy;assert.ok(scene.guardPolicy instanceof RandomGuardPolicy);
});
test('F2 toggles AI overlay without choosing an action or changing commitments',()=>{
 const f=setup();assert.equal(f.scene.aiDebugOpen,false);f.scene.handleKey({code:'F2',preventDefault(){}});assert.equal(f.scene.aiDebugOpen,true);assert.equal(f.scene.aiDebugAdvanced,false);f.scene.handleKey({code:'KeyA',preventDefault(){}});assert.equal(f.scene.aiDebugAdvanced,true);assert.equal(f.scene.combat.round,null);f.scene.handleKey({code:'F2',preventDefault(){}});assert.equal(f.scene.aiDebugOpen,false);f.scene.handleKey({code:'F2',preventDefault(){}});assert.equal(f.scene.aiDebugAdvanced,false);
});
