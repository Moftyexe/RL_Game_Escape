import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import CombatSystem,{ACTIONS,PLAYER_ACTIONS} from '../combat/CombatSystem.js';
import {actionContext,statusBadges,defendSummary,guardResources} from './battleUIModel.js';

const url=new URL('../scenes/BattleScene.js',import.meta.url);
const stub='data:text/javascript,'+encodeURIComponent('export class Scene {} export const Textures={FilterMode:{NEAREST:1}};');
const source=(await readFile(url,'utf8')).replace(/from '([^']+)'/g,(m,p)=>`from '${p==='phaser'?stub:new URL(p,url).href}'`);
const {default:BattleScene}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
function widget(){return {text:'',input:{},events:{},alpha:1,
 setText(v){this.text=v;return this;},setColor(v){this.color=v;return this;},setScale(){return this;},setOrigin(){return this;},setY(){return this;},setVisible(v){this.visible=v;return this;},setFontSize(){return this;},setAlpha(v){this.alpha=v;return this;},setFillStyle(v){this.fill=v;return this;},setStrokeStyle(w,c){this.stroke=[w,c];return this;},setInteractive(){return this;},setWordWrapWidth(){return this;},on(e,f){this.events[e]=f;return this;}};}
function setup(){const s=new BattleScene();s.init();s.text=widget;s.rect=widget;s.tweens={killTweensOf(){},add(){}};
 s.panels={player:s.createStatus(24,'PLAYER'),guard:s.createStatus(358,'SCHOOL GUARD')};
 s.actors={};for(const id of ['player','guard'])s.actors[id]={status:widget(),hpBar:widget(),spBar:widget(),displayedHp:s.combat[id].hp,displayedSp:s.combat[id].sp};
 for(const k of ['contextTitle','contextDescription','contextDetails','contextTags','contextPriority','logText','turnText','outcome'])s[k]=widget();
 s.buttons=Array.from({length:6},(_,i)=>s.createMenuButton(i));s.refresh();return s;}
const key=(s,code)=>s.handleKey({code,preventDefault(){}});

test('all Player actions provide descriptions and current cost/priority tags',()=>{
 const c=new CombatSystem();for(const entry of PLAYER_ACTIONS){const v=actionContext(entry,c.player,c.getValidActions('player'));assert.ok(v.description.length>20);assert.ok(v.tags.includes(ACTIONS[entry].priority));assert.ok(v.tags.includes(`${ACTIONS[entry].cost} SP`));}
 assert.ok(actionContext('attack',c.player,['attack']).tags.includes('80 DMG'));
 assert.ok(actionContext('swingBackpack',c.player,['swingBackpack']).tags.includes('80% HIT'));
});
test('resource previews cap healing/SP, never preview speculative damage or negative SP',()=>{
 const c=new CombatSystem();c.player.hp=960;c.player.sp=70;
 assert.match(actionContext('catchBreath',c.player,['catchBreath']).details,/HP 960 -> 1000   SP 70 -> 40/);
 c.player.hp=620;assert.match(actionContext('catchBreath',c.player,['catchBreath']).details,/HP 620 -> 770/);
 c.player.sp=95;assert.match(actionContext('defend',c.player,['defend']).details,/SP 95 -> 100/);
 c.player.sp=29;const v=actionContext('catchBreath',c.player,[]);assert.equal(v.warning,'Not enough SP');assert.equal(v.details,'');
 assert.equal(actionContext('attack',c.player,['attack']).details,'');
});
test('status badges omit empty statuses; Guard defense never advertises evasion; resources reflect actual flags',()=>{
 const c=new CombatSystem();assert.equal(statusBadges(c.player,'player'),'');
 c.player.status={name:'RILED',turns:3};c.player.defending=true;c.player.stunned=true;c.player.offGuard=true;
 assert.equal(statusBadges(c.player,'player'),'[RILED 3] [DEFENDING] [OFF GUARD] [STUN]');
 assert.match(defendSummary(c.player,'player'),/Evasion \+5pp/);c.guard.defending=true;assert.equal(defendSummary(c.guard,'guard'),'Damage -50%');
 assert.equal(guardResources(c.guard),'[DONUT \u2713]  [CALL \u2713]');c.guard.donutAvailable=false;c.guard.wifeCallAvailable=false;assert.equal(guardResources(c.guard),'[DONUT \u2014]  [CALL \u2014]');
});
test('keyboard and real mouse callbacks synchronize descriptions, highlights and disabled inspection',()=>{
 const s=setup();assert.equal(s.contextTitle.text,'ATTACK');key(s,'ArrowDown');assert.equal(s.contextTitle.text,'DEFEND');assert.match(s.contextDetails.text,/evasion/);
 key(s,'KeyS');key(s,'Enter');assert.equal(s.menu,'skills');assert.equal(s.contextTitle.text,'BRO, LOCK IN');
 s.combat.player.sp=0;s.buttons[4].box.events.pointerover();assert.equal(s.selected,4);assert.equal(s.contextTitle.text,'CATCH BREATH');assert.match(s.contextDetails.text,/Not enough SP/);
 assert.equal(s.buttons[4].box.input.enabled,true);assert.ok(s.buttons[4].label.alpha<1);assert.deepEqual(s.buttons[4].box.stroke,[2,0xf5db91]);
 const before=JSON.stringify(s.combat.snapshot());s.buttons[4].box.events.pointerdown();assert.equal(JSON.stringify(s.combat.snapshot()),before);
 key(s,'KeyW');assert.equal(s.contextTitle.text,'SWING BACKPACK');key(s,'Digit5');assert.equal(s.contextTitle.text,'CATCH BREATH');assert.equal(s.combat.round,null);
 s.buttons[5].box.events.pointerdown();assert.equal(s.menu,'main');assert.equal(s.contextTitle.text,'SKILLS');
});
test('number/mouse activation selects the same described command without changing its validity',()=>{
 const s=setup(),chosen=[];s.chooseAction=a=>chosen.push(a);key(s,'Digit2');assert.equal(s.contextTitle.text,'DEFEND');assert.deepEqual(chosen,['defend']);
 s.buttons[0].box.events.pointerdown();assert.equal(s.contextTitle.text,'ATTACK');assert.deepEqual(chosen,['defend','attack']);
});
test('combat mode retains immediate commentary, no-selection has useful feedback, menu return restores descriptions',()=>{
 const s=setup();s.presentationBusy=true;s.contextFeedback='The Guard stumbled and took 50 damage.';s.refresh();assert.equal(s.contextDescription.text,s.contextFeedback);assert.equal(s.contextTitle.text,'BATTLE');assert.equal(s.contextTags.text,'');
 s.presentationBusy=false;s.selected=-1;s.refreshContext();assert.equal(s.contextDescription.text,s.contextFeedback);
 s.selected=0;s.refresh();assert.equal(s.contextTitle.text,'ATTACK');assert.notEqual(s.contextDescription.text,s.contextFeedback);
});
test('UI rendering cannot expose a hidden Guard choice or mutate battle state/RNG',()=>{
 const s=setup();let rolls=0;s.combat.random=()=>{rolls++;return .5;};const before=JSON.stringify(s.combat.snapshot());
 s.combat.round={get guardAction(){throw Error('Hidden action accessed');}};
 for(const entry of PLAYER_ACTIONS){actionContext(entry,s.combat.player,s.combat.getValidActions('player'));s.refresh();}
 assert.equal(rolls,0);assert.equal(JSON.stringify(s.combat.snapshot()),before);
});
test('actual menu handlers emit move/confirm/cancel/invalid cues while retaining disabled validity',()=>{
 const s=setup(),ids=[];s.sfx={play:id=>ids.push(id)};s.chooseAction=()=>{};key(s,'ArrowDown');key(s,'Enter');key(s,'Digit3');key(s,'Escape');
 assert.ok(ids.includes('uiMove'));assert.ok(ids.includes('uiConfirm'));assert.ok(ids.includes('uiCancel'));
 s.activateMenuEntry('skills');s.combat.player.sp=0;s.buttons[4].box.events.pointerdown();assert.equal(ids.at(-1),'uiInvalid');assert.equal(s.combat.round,null);
});
