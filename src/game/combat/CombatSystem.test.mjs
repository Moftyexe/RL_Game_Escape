import test from 'node:test';
import assert from 'node:assert/strict';
import CombatSystem, { ACTIONS, PRIORITY, ROUND_STATES, STATUSES, PLAYER_ACTIONS, GUARD_ACTIONS, getEffectiveStats, resolveRound } from './CombatSystem.js';
import RandomGuardPolicy from './RandomGuardPolicy.js';
import BattleModel from '../battle/BattleModel.js';
import { PLAYER_INSULTS } from './combatDialogue.js';
const create = (options={}) => new CombatSystem({random:()=>0.5,tieRandom:()=>0,dialogueRandom:()=>0,...options});
const start = (c,p,g) => { c.beginRound(); assert.equal(c.lockActions(p,g),true); return c.revealActions(); };
const round = (c,p,g) => { start(c,p,g); c.resolveNextAction(); c.resolveNextAction(); return c.endRound(); };
const damage = r => r.events.find(e=>e.type==='damage');
const status = name => ({name,turns:STATUSES[name].turns});

test('catalogs and base stats stay fixed; final Catch Breath costs30 SP',()=>{
 const c=create(); assert.deepEqual(PLAYER_ACTIONS,['attack','defend','broLockIn','talkSmack','lookThere','swingBackpack','catchBreath']);
 assert.deepEqual(GUARD_ACTIONS,['attack','defend','crackKnuckles','blowWhistle','callWife','eatDonut']);
 assert.deepEqual(PLAYER_ACTIONS.map(a=>ACTIONS[a].cost),[0,0,15,15,18,20,30]);
 assert.deepEqual(GUARD_ACTIONS.map(a=>ACTIONS[a].cost),[0,0,15,20,0,0]);
 assert.deepEqual([c.player.hp,c.player.sp,c.player.baseAttackDamage,c.player.baseAccuracy,c.player.baseCriticalChance,c.player.criticalDamageMultiplier],[1000,100,80,.9,.1,1.5]); assert.equal(PLAYER_INSULTS.length,15);
});
for (const [p,g,first] of [['defend','crackKnuckles','player'],['lookThere','attack','player'],['attack','defend','guard'],['swingBackpack','callWife','guard'],['attack','blowWhistle','guard']]) test(`priority ${p} vs ${g}`,()=>{
 const c=create({tieRandom:()=>{throw Error('not a tie');}}); assert.equal(start(c,p,g)[0].actorId,first);
});
for(const [roll,first] of [[0,'player'],[.49999,'player'],[.5,'guard'],[.999,'guard']]) test(`tie RNG ${roll} chooses ${first}`,()=>{
 let count=0; const c=create({tieRandom:()=>{count++;return roll;}}); assert.equal(start(c,'attack','attack')[0].actorId,first); assert.equal(count,1);
});
test('priority table is centralized and exact',()=>{
 for(const a of ['defend','catchBreath','callWife','eatDonut']) assert.equal(ACTIONS[a].priority,PRIORITY.FAST);
 for(const a of ['broLockIn','talkSmack','lookThere','crackKnuckles','blowWhistle']) assert.equal(ACTIONS[a].priority,PRIORITY.NORMAL);
 for(const a of ['attack','swingBackpack']) assert.equal(ACTIONS[a].priority,PRIORITY.SLOW);
});
test('both commitments lock before reveal, duplicate execution rejected',()=>{
 const c=create(); c.beginRound(); assert.equal(c.lockActions('attack','defend'),true); assert.equal(c.turnState,ROUND_STATES.ACTIONS_LOCKED); assert.equal(c.resolveNextAction(),null);
 assert.equal(c.lockActions('attack','attack'),false); c.revealActions(); assert.equal(c.revealActions(),null); c.resolveNextAction(); c.resolveNextAction(); assert.equal(c.resolveNextAction(),null); c.endRound(); assert.equal(c.endRound(),null);
});
test('Guard sees detached pre-round data and previous action, never current selection',async()=>{
 const model=new BattleModel({guardAgent:{chooseAction(observation){
 assert.equal(observation.previousPlayerAction,'lookThere'); assert.equal(observation.previousPlayerActionCategory,'skill');
 for(const key of ['playerAction','guardAction','selection','round']) assert.equal(key in observation,false);
 observation.player.hp=1; return 'attack'; }}});
 model.previousPlayerAction='lookThere'; model.previousPlayerActionCategory='skill'; model.selectPlayerAction('swingBackpack');
 assert.equal(model.state.playerAction,undefined); await model.requestGuardAction(); assert.equal(model.player.hp,1000); assert.equal(model.turnState,ROUND_STATES.ACTIONS_LOCKED);
 assert.equal(model.previousPlayerAction,'lookThere'); model.revealActions(); model.resolveNextAction(); model.resolveNextAction(); model.endRound(); assert.equal(model.previousPlayerAction,'swingBackpack');
});
for(const id of ['player','guard']) test(`${id} Defend applies immediately and clears at round end`,()=>{
 const c=create(); start(c,id==='player'?'defend':'attack',id==='guard'?'defend':'attack');
 assert.equal(c[id].defending,false); c.resolveNextAction(); assert.equal(c[id].defending,true); const r=c.resolveNextAction(); assert.equal(damage(r).damage,40); assert.equal(c[id].defending,true);
 c.endRound(); assert.equal(c[id].defending,false); round(c,'attack','attack'); assert.equal(c[id].hp,c[id].maxHp-120);
});
test('unused defense expires even against support and restores 10 SP',()=>{const c=create();c.player.sp=50;round(c,'defend','callWife');assert.equal(c.player.sp,60);assert.equal(c.player.defending,false);});
test('Look There changes the slower attack accuracy immediately',()=>{const c=create({random:()=>.7});const r=round(c,'lookThere','attack');assert.ok(r.events.some(e=>e.type==='miss'&&e.actorId==='guard'));assert.equal(c.player.hp,1000);});
test('Whistle changes the slower Player attack accuracy immediately without stun',()=>{const c=create({random:()=>.7});const r=round(c,'attack','blowWhistle');assert.ok(r.events.some(e=>e.type==='miss'&&e.actorId==='player'));});
for(const [tie,expected] of [[0,'DISTRACTED'],[1,'FOCUSED']]) test(`Lock In/Whistle tie ${tie} changes final status`,()=>{const c=create({tieRandom:()=>tie});round(c,'broLockIn','blowWhistle');assert.deepEqual(c.player.status,status(expected));});
test('Crack Knuckles immediately modifies a later Guard attack',()=>{const c=create();round(c,'catchBreath','crackKnuckles');const r=round(c,'catchBreath','attack');assert.equal(damage(r).damage,120);});
test('Whistle stun cancels pending backpack without cost and never skips twice',()=>{
 const c=create({random:()=>.05});const r=round(c,'swingBackpack','blowWhistle');assert.equal(c.player.sp,100);assert.equal(c.guard.hp,1200);assert.equal(c.player.stunned,false);assert.ok(r.events.some(e=>e.type==='turnSkipped'));
 c.random=()=>.5;round(c,'swingBackpack','defend');assert.equal(c.player.sp,80);
});
test('stun after Player acted consumes next opportunity exactly once',()=>{
 const c=create({random:()=>0});round(c,'broLockIn','blowWhistle');assert.equal(c.player.stunned,true);assert.deepEqual(c.getValidActions('player'),[]);
 round(c,null,'defend');assert.equal(c.player.stunned,false);assert.equal(c.player.sp,85);round(c,'catchBreath','defend');assert.equal(c.player.sp,55);
});
test('Whistle stun threshold remains exclusive 10 percent',()=>{const c=create({random:()=>.1});round(c,'broLockIn','blowWhistle');assert.equal(c.player.stunned,false);});
test('Donut heals before slower attack, does not restore SP, and cannot repeat',()=>{const c=create();c.guard.hp=50;c.guard.sp=0;const r=round(c,'attack','eatDonut');assert.equal(r.orderedActions[0].action,'eatDonut');assert.equal(c.guard.hp,170);assert.equal(c.guard.sp,0);assert.equal(c.guard.donutAvailable,false);assert.ok(!c.getValidActions('guard').includes('eatDonut'));});
for(const name of [null,'FOCUSED','RILED','DISTRACTED']) test(`Wife uses actual execution status ${name}`,()=>{
 const c=create();c.guard.status=name?status(name):null;c.guard.sp=0;start(c,'talkSmack','callWife');const r=c.resolveNextAction();
 assert.equal(c.guard.status?.name,'FOCUSED');assert.equal(r.action,'callWife');assert.equal(c.guard.sp,20);c.resolveNextAction();c.endRound();assert.deepEqual(c.guard.status,status('RILED'));assert.equal(c.guard.wifeCallAvailable,false);
});
test('Catch Breath heals150 and pays30 before slower action',()=>{const c=create();c.player.sp=70;start(c,'catchBreath','attack');c.resolveNextAction();assert.equal(c.player.sp,40);assert.equal(c.player.hp,1000);});
for(const [tie,dead,outcome] of [[0,'guard','VICTORY'],[1,'player','DEFEAT']]) test(`death cancels second action: ${outcome}`,()=>{
 const c=create({tieRandom:()=>tie});c[dead].hp=1;const r=round(c,'swingBackpack','attack');assert.equal(r.outcome,outcome);assert.equal(r.results[1].skipped,true);assert.equal(c[dead].sp,100);assert.equal(c[dead==='player'?'guard':'player'].hp,c[dead==='player'?'guard':'player'].maxHp);
});
test('DRAW requires both HP actually zero within an event chain',()=>{const c=create();const original=c.attack.bind(c);c.attack=(...args)=>{original(...args);c.player.hp=0;c.guard.hp=0;};const r=round(c,'attack','attack');assert.equal(r.outcome,'DRAW');assert.equal(r.results[1].skipped,true);});
for(const name of Object.keys(STATUSES)) test(`${name} ticks once each round and expires`,()=>{
 const c=create();c.player.status=status(name);const turns=c.player.status.turns;
 for(let i=0;i<turns;i++){const r=round(c,'catchBreath','defend');assert.equal(c.player.status?.turns??0,turns-i-1);if(i===turns-1)assert.equal(r.events.filter(e=>e.reason==='expired').length,1);}
});
test('new and refreshed status keeps full duration; replacement resets duration',()=>{const c=create();round(c,'broLockIn','defend');assert.equal(c.player.status.turns,3);round(c,'catchBreath','defend');assert.equal(c.player.status.turns,2);round(c,'broLockIn','defend');assert.equal(c.player.status.turns,3);round(c,'catchBreath','blowWhistle');assert.deepEqual(c.player.status,status('DISTRACTED'));});
for(const [name,accuracy,crit,multiplier,reduction] of [['FOCUSED',1,.2,1,.65],['DISTRACTED',.65,.1,1,.35],['RILED',.65,.35,1.5,.4]])test(`current ${name} modifiers`,()=>{const c=create();c.player.status=status(name);const stats=getEffectiveStats(c.player);for(const [key,value] of Object.entries({accuracy,criticalChance:crit,damageMultiplier:multiplier,defendReduction:reduction}))assert.ok(Math.abs(stats[key]-value)<1e-10);});
for(const [roll,expected] of [[.05,120],[.5,80],[.9,0]])test(`attack hit/crit mechanics roll ${roll}`,()=>{const c=create({random:()=>roll});const r=round(c,'attack','callWife');assert.equal(damage(r)?.damage??0,expected);});
test('Backpack uses 140 damage, 80 percent accuracy and execution cost on miss',()=>{const c=create();let r=round(c,'swingBackpack','callWife');assert.equal(damage(r).damage,140);assert.equal(c.player.sp,80);c.random=()=>.8;r=round(c,'swingBackpack','crackKnuckles');assert.equal(damage(r),undefined);assert.equal(c.player.sp,60);});
test('all paid actions validate affordability at commitment',()=>{
 for(const [id,actions] of [['player',PLAYER_ACTIONS],['guard',GUARD_ACTIONS]])for(const action of actions){if(!ACTIONS[action].cost)continue;const c=create();c[id].sp=ACTIONS[action].cost-1;c.beginRound();assert.equal(c.lockActions(id==='player'?action:'defend',id==='guard'?action:'defend'),false);assert.equal(c[id].sp,ACTIONS[action].cost-1);}
});
test('uniform random policy uses only valid pre-round actions across resource states',()=>{
 for(const sp of [0,14,15,19,20,100])for(const hp of [500,900,1000])for(const donut of [false,true])for(const wife of [false,true]){
 const c=create();Object.assign(c.guard,{sp,hp,donutAvailable:donut,wifeCallAvailable:wife});const observation=c.beginRound(),allowed=c.getValidActions('guard');const before=structuredClone(observation);
 allowed.forEach((a,i)=>assert.equal(new RandomGuardPolicy(()=>(i+.5)/allowed.length).chooseAction(observation),a));assert.deepEqual(observation,before);
 assert.equal(allowed.includes('eatDonut'),donut&&hp<c.guard.maxHp);assert.equal(allowed.includes('callWife'),wife);
 }
});
test('headless round copies input and returns order, events, state, outcome',()=>{const pre=create().snapshot(),before=structuredClone(pre);const r=resolveRound(pre,'lookThere','attack',{random:()=>.7,tieRandom:()=>0});assert.deepEqual(pre,before);assert.equal(r.nextState.guard.status.name,'DISTRACTED');assert.equal(r.orderedActions[0].actorId,'player');assert.equal(r.outcome,null);});

test('direct locking captures a fresh snapshot each new round',()=>{const c=create();assert.equal(c.lockActions('lookThere','attack'),true);c.revealActions();c.resolveNextAction();c.resolveNextAction();c.endRound();c.player.sp=0;assert.equal(c.lockActions('lookThere','attack'),false);});
test('policy observations are identical across different hidden Player choices',async()=>{
 const observations=[];for(const action of PLAYER_ACTIONS){const model=new BattleModel({guardAgent:{chooseAction:s=>{observations.push(s);return 'defend';}}});model.selectPlayerAction(action);await model.requestGuardAction();}
 for(const observation of observations)assert.deepEqual(observation,observations[0]);
});
test('duplicate async policy requests lock exactly one Guard action',async()=>{let calls=0;const model=new BattleModel({guardAgent:{async chooseAction(){calls++;return 'defend';}}});model.selectPlayerAction('attack');await Promise.all([model.requestGuardAction(),model.requestGuardAction()]);assert.equal(calls,1);assert.equal(model.turnState,'ACTIONS_LOCKED');});
for(const [name,expected] of [[null,40],['FOCUSED',28],['DISTRACTED',52],['RILED',48]])test(`round defense retains ${name} reduction`,()=>{const c=create();c.guard.status=name?status(name):null;assert.equal(damage(round(c,'attack','defend')).damage,expected);});
test('all insults retain their original dialogue and identical mechanical effects',()=>{for(let i=0;i<PLAYER_INSULTS.length;i++){const c=create({dialogueRandom:()=>(i+.5)/PLAYER_INSULTS.length,random:()=>{throw Error('unexpected combat roll');}});const r=round(c,'talkSmack','defend');assert.equal(r.results[1].messages[0],PLAYER_INSULTS[i]);assert.equal(c.player.sp,85);assert.deepEqual(c.guard.status,status('RILED'));}});
test('recovery caps and independent finite resources',()=>{const c=create();c.guard.hp=1190;c.guard.sp=99;round(c,'catchBreath','eatDonut');assert.equal(c.guard.hp,1200);assert.equal(c.guard.sp,99);assert.equal(c.guard.wifeCallAvailable,true);round(c,'catchBreath','callWife');assert.equal(c.guard.wifeCallAvailable,false);assert.equal(c.guard.donutAvailable,false);});

test('Guard starts at 1200 HP / 100 SP while Player stays 1000 HP',()=>{const c=create();assert.deepEqual([c.player.hp,c.player.maxHp,c.guard.hp,c.guard.maxHp,c.guard.sp,c.guard.maxSp],[1000,1000,1200,1200,100,100]);});
for(const [roll,full] of [[0,true],[.249999,true],[.25,false],[.99999,false]])test(`Look There 25-percent boundary at ${roll}`,()=>{
 let rolls=0;const c=create({random:()=>{rolls++;return roll;}});start(c,'lookThere','attack');const first=c.resolveNextAction();
 assert.equal(c.guard.offGuard,full);assert.equal(first.events.some(e=>e.type==='offGuardApplied'),full);assert.equal(c.guard.status?.name,full?undefined:'DISTRACTED');assert.equal(c.player.sp,82);assert.equal(rolls,1);
 assert.equal(ACTIONS.lookThere.cost,18);assert.equal(ACTIONS.lookThere.priority,PRIORITY.NORMAL);assert.equal('OFF_GUARD' in STATUSES,false);
});
for(const action of ['attack','crackKnuckles','blowWhistle'])test(`OFF_GUARD cancels pending ${action} without cost or effects`,()=>{
 let rolls=0;const c=create({random:()=>{rolls++;return 0;}});start(c,'lookThere',action);const first=c.resolveNextAction();assert.equal(first.events.find(e=>e.type==='offGuardApplied').interrupted,true);
 const second=c.resolveNextAction();assert.equal(second.skipped,true);assert.equal(second.action,action);assert.deepEqual(second.events,[{type:'actionCancelled',targetId:'guard',action,reason:'offGuard'}]);
 assert.equal(c.guard.sp,100);assert.equal(c.player.status,null);assert.equal(c.guard.status,null);assert.equal(c.player.hp,1000);assert.equal(rolls,1);
 const ended=c.endRound();assert.equal(c.guard.offGuard,true);assert.equal(ended.events.some(e=>e.type==='offGuardCleared'),false);assert.equal(ended.nextState.guard.offGuard,true);
 const skipped=round(c,'catchBreath',null);assert.ok(skipped.events.some(e=>e.type==='offGuardSkipped'));assert.equal(c.guard.offGuard,false);
 c.random=()=>.5;const next=round(c,'catchBreath','attack');assert.ok(next.events.some(e=>e.type==='damage'&&e.actorId==='guard'));
});
test('partial Look There keeps slower action and immediately reduces accuracy',()=>{
 const values=[.35,.7];const c=create({random:()=>{assert.ok(values.length);return values.shift();}});const r=round(c,'lookThere','attack');
 assert.equal(r.results[1].skipped,false);assert.ok(r.results[1].events.some(e=>e.type==='miss'));assert.equal(c.guard.offGuard,false);assert.deepEqual(c.guard.status,status('DISTRACTED'));assert.equal(c.player.hp,1000);
});
test('partial Look There lowers existing defense effectiveness normally next round',()=>{const c=create();round(c,'lookThere','attack');const r=round(c,'attack','defend');assert.equal(damage(r).damage,52);assert.equal(c.guard.status.turns,1);});
test('full Look There after faster Donut does not undo HP recovery or resource use',()=>{
 const c=create({random:()=>0});c.guard.hp=800;c.guard.sp=80;start(c,'lookThere','eatDonut');const first=c.resolveNextAction();assert.equal(first.action,'eatDonut');assert.equal(c.guard.hp,1000);assert.equal(c.guard.sp,80);
 const second=c.resolveNextAction();assert.equal(second.events.find(e=>e.type==='offGuardApplied').interrupted,false);assert.equal(c.guard.offGuard,true);assert.equal(c.guard.donutAvailable,false);assert.equal(c.guard.status,null);c.endRound();assert.equal(c.guard.offGuard,true);assert.equal(c.guard.hp,1000);round(c,'catchBreath',null);assert.equal(c.guard.offGuard,false);assert.equal(c.guard.hp,1000);
});
test('full Look There after Guard wins NORMAL tie preserves already-applied RILED and SP cost',()=>{
 const c=create({random:()=>0,tieRandom:()=>1});start(c,'lookThere','crackKnuckles');c.resolveNextAction();const r=c.resolveNextAction();assert.equal(c.guard.sp,85);assert.deepEqual(c.guard.status,status('RILED'));assert.equal(r.events.find(e=>e.type==='offGuardApplied').interrupted,false);c.endRound();assert.deepEqual(c.guard.status,status('RILED'));
});
for(const [hp,expected] of [[500,700],[1000,1200],[1199,1200]])test(`Donut +200 caps at Guard's new max from ${hp}`,()=>{const c=create();c.guard.hp=hp;c.guard.sp=70;round(c,'catchBreath','eatDonut');assert.equal(c.guard.hp,expected);assert.equal(c.guard.sp,70);});
test('seeded Look There results are repeatable through headless round API',()=>{
 const seed=()=>{let state=1234;return()=>{state=(1664525*state+1013904223)>>>0;return state/2**32;};};const pre=create().snapshot();const a=resolveRound(pre,'lookThere','attack',{random:seed(),tieRandom:()=>0});const b=resolveRound(pre,'lookThere','attack',{random:seed(),tieRandom:()=>0});assert.deepEqual(a,b);
});

test('Guard cannot commit normal actions in carried OFF_GUARD round; clears exactly on skip',()=>{
 const c=create();c.guard.offGuard=true;assert.deepEqual(c.getValidActions('guard'),[]);c.beginRound();assert.equal(c.lockActions('attack','attack'),false);assert.equal(c.lockActions('attack',null),true);c.revealActions();
 const first=c.resolveNextAction();assert.equal(first.actorId,'guard');assert.equal(first.action,'offGuard');assert.equal(first.skipped,true);assert.equal(c.guard.offGuard,false);assert.equal(c.guard.sp,100);assert.ok(first.events.some(e=>e.type==='offGuardCleared'));
 c.resolveNextAction();c.endRound();assert.ok(c.getValidActions('guard').includes('attack'));
});
test('adapter bypasses Guard agent entirely for an OFF_GUARD round',async()=>{
 let calls=0;const model=new BattleModel({guardAgent:{chooseAction(){calls++;throw Error('Must not choose');}}});model.guard.offGuard=true;model.selectPlayerAction('attack');assert.equal(await model.requestGuardAction(),null);assert.equal(calls,0);assert.equal(model.turnState,'ACTIONS_LOCKED');assert.equal(model.round.guardAction,null);
});
test('carried OFF_GUARD survives Player-first FAST action before consuming Guard skip',()=>{
 const c=create();c.guard.offGuard=true;start(c,'defend',null);assert.equal(c.resolveNextAction().actorId,'player');assert.equal(c.guard.offGuard,true);assert.equal(c.resolveNextAction().action,'offGuard');assert.equal(c.guard.offGuard,false);c.endRound();assert.equal(c.guard.offGuard,false);
});
test('a new full success after the carried skip can apply a fresh next-round penalty',()=>{
 const c=create({random:()=>0});c.guard.offGuard=true;start(c,'lookThere',null);const skip=c.resolveNextAction();assert.equal(skip.action,'offGuard');assert.equal(c.guard.offGuard,false);const look=c.resolveNextAction();assert.equal(look.events.find(e=>e.type==='offGuardApplied').interrupted,false);assert.equal(c.guard.offGuard,true);c.endRound();assert.equal(c.guard.offGuard,true);
});
