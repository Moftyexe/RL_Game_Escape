import test from 'node:test';
import assert from 'node:assert/strict';
import CombatSystem, { ACTIONS, getEffectiveStats, STATUSES } from './CombatSystem.js';
import guardReward from '../ai/RewardFunction.js';
import { mechanicalCommentary } from '../battle/mechanicalCommentary.js';
const create = random => new CombatSystem({ random: random ?? (() => .5), tieRandom: () => 0, dialogueRandom: () => 0 });
const round = (c, p, g) => { c.beginRound(); assert.ok(c.lockActions(p,g)); c.revealActions(); c.resolveNextAction(); c.resolveNextAction(); return c.endRound(); };
const riled = c => c.guard.status = { name: 'RILED', turns: 3 };

test('Donut heals only, caps HP, spends its single use, and never recovers SP',()=>{
 for(const hp of [1,1000,1199]){const c=create();c.guard.hp=hp;c.guard.sp=7;const r=round(c,'catchBreath','eatDonut');assert.equal(c.guard.hp,Math.min(1200,hp+200));assert.equal(c.guard.sp,7);assert.equal(c.guard.donutAvailable,false);assert.equal(c.getValidActions('guard').includes('eatDonut'),false);const e=r.events.find(e=>e.type==='restored'&&e.targetId==='guard');assert.equal(e.sp,0);assert.equal(mechanicalCommentary(r.results.find(r=>r.action==='eatDonut'))[0].text.includes('SP'),false);}
 const c=create();c.guard.sp=0;assert.equal(c.getValidActions('guard').includes('eatDonut'),false);c.guard.hp=999;assert.equal(c.getValidActions('guard').includes('eatDonut'),true);
});

test('Player 1000 / Guard 1200 HP and both 100 SP with original neutral offensive stats', () => {
    const c=create();for(const actor of [c.player,c.guard])assert.deepEqual([actor.hp,actor.maxHp,actor.sp,actor.maxSp,actor.baseAttackDamage,actor.baseAccuracy,actor.baseCriticalChance,actor.criticalDamageMultiplier],[actor===c.guard?1200:1000,actor===c.guard?1200:1000,100,100,80,.9,.1,1.5]);
});
test('Catch Breath heals150 HP for30 SP without defense and consumes its only action',()=>{
    const c=create();c.player.hp=500;c.player.sp=70;const r=round(c,'catchBreath','attack');
    assert.equal(c.player.hp,570);assert.equal(c.player.sp,40);assert.equal(c.player.defending,false);
    assert.deepEqual(r.events.find(e=>e.type==='restored'),{type:'restored',targetId:'player',hp:150,sp:0});
    assert.equal(r.results.filter(result=>result.actorId==='player').length,1);
    assert.match(mechanicalCommentary(r.results[0])[0].text,/\+150 HP/);
});
test('Catch Breath caps HP and pays full SP cost',()=>{const c=create();c.player.hp=980;c.player.sp=90;round(c,'catchBreath','defend');assert.equal(c.player.hp,1000);assert.equal(c.player.sp,60);});
test('Lock In costs 15 and applies unchanged three-round FOCUSED',()=>{const c=create();round(c,'broLockIn','defend');assert.equal(c.player.sp,85);assert.deepEqual(c.player.status,{name:'FOCUSED',turns:3});assert.equal(getEffectiveStats(c.player).defendReduction,.65);});
test('Talk Smack deals exactly 30 nonphysical direct damage regardless of defense/status with zero combat RNG',()=>{
    for(const name of [null,...Object.keys(STATUSES)]){
        const c=create(()=>{throw Error('Talk Smack must not roll');});c.player.status=name?{name,turns:3}:null;c.guard.hp=500;
        const r=round(c,'talkSmack','defend'),event=r.events.find(e=>e.type==='damage');
        assert.deepEqual([event.source,event.damage,event.physical,event.critical,event.blocked],['talkSmack',30,false,false,false]);
        assert.equal(c.guard.hp,470);assert.equal(c.player.sp,85);assert.equal(c.guard.status.name,'RILED');assert.equal(r.events.some(e=>e.type==='stumbled'),false);
        assert.match(mechanicalCommentary(r.results[1])[0].text,/-30 HP   Guard is RILED/);
    }
});
test('lethal emotional damage cancels later Guard action without SP charge',()=>{const c=create();c.guard.hp=30;const r=round(c,'talkSmack','crackKnuckles');assert.equal(r.outcome,'VICTORY');assert.equal(r.results[1].skipped,true);assert.equal(c.guard.sp,100);});
test('Backpack is 140/80%/20 SP and still uses crit and status modifiers',()=>{
    assert.deepEqual([ACTIONS.swingBackpack.damage,ACTIONS.swingBackpack.accuracy,ACTIONS.swingBackpack.cost],[140,.8,20]);
    const rolls=[.79,.05],c=create(()=>rolls.shift());c.player.status={name:'RILED',turns:3};
    // RILED lowers accuracy to .55: use a hit followed by a critical.
    rolls[0]=.49;const r=round(c,'swingBackpack','crackKnuckles');assert.equal(r.events.find(e=>e.type==='damage').damage,315);assert.equal(c.player.sp,80);assert.equal(rolls.length,0);
});
test('RILED has 65% basic accuracy, 35% crit, 120 damage and unchanged 40% defense',()=>{const c=create();riled(c);const s=getEffectiveStats(c.guard);assert.ok(Math.abs(s.accuracy-.65)<1e-12);assert.ok(Math.abs(s.criticalChance-.35)<1e-12);assert.equal(s.damageMultiplier,1.5);assert.equal(s.defendReduction,.4);const r=round(c,'catchBreath','attack');assert.equal(r.events.find(e=>e.type==='damage').damage,120);});
test('RILED critical basic attack deals 180 and does not roll stumble on hit',()=>{const rolls=[.59,.29],c=create(()=>{assert.ok(rolls.length);return rolls.shift();});riled(c);const r=round(c,'defend','attack');assert.equal(r.events.find(e=>e.type==='damage').damage,90);assert.equal(r.events.find(e=>e.type==='damage').critical,true);assert.equal(rolls.length,0);assert.equal(r.events.some(e=>e.type==='stumbled'),false);
    const rolls2=[.59,.29],d=create(()=>rolls2.shift());riled(d);assert.equal(round(d,'catchBreath','attack').events.find(e=>e.type==='damage').damage,180);
});
for(const [roll,stumbled] of [[0,true],[.199999,true],[.2,false],[.99,false]])test(`RILED physical miss stumble boundary ${roll}`,()=>{
    const rolls=[.9,roll],c=create(()=>{assert.ok(rolls.length);return rolls.shift();});riled(c);const r=round(c,'catchBreath','attack');
    assert.equal(r.events.some(e=>e.type==='stumbled'),stumbled);assert.equal(c.guard.hp,stumbled?1150:1200);assert.equal(rolls.length,0);
    assert.equal(c.guard.offGuard,false);assert.equal(c.guard.stunned,false);assert.ok(c.getValidActions('guard').includes('attack'));
    if(stumbled){const e=r.events.find(e=>e.source==='stumble');assert.equal(e.damage,50);assert.equal(e.targetId,'guard');assert.equal(guardReward({events:r.events}),-2.7);}
});
test('neutral misses and RILED Player misses consume no stumble roll',()=>{for(const id of ['guard','player']){let n=0;const c=create(()=>{assert.equal(++n,1);return .99;});if(id==='player')c.player.status={name:'RILED',turns:3};const r=round(c,id==='player'?'attack':'catchBreath',id==='guard'?'attack':'defend');assert.equal(r.events.some(e=>e.type==='stumbled'),false);assert.equal(n,1);}});
test('RILED nonphysical skills never consume stumble RNG',()=>{for(const action of ['defend','crackKnuckles','callWife','eatDonut']){const c=create(()=>{throw Error('nonphysical roll');});riled(c);c.guard.sp=50;c.guard.hp=900;const r=round(c,'catchBreath',action);assert.equal(r.events.some(e=>e.type==='stumbled'),false);}let rolls=0;const c=create(()=>{rolls++;return .9;});riled(c);round(c,'catchBreath','blowWhistle');assert.equal(rolls,1);});
test('fatal stumble ends battle without creating a future skip',()=>{const rolls=[.99,.1],c=create(()=>rolls.shift());riled(c);c.guard.hp=50;const r=round(c,'catchBreath','attack');assert.equal(r.outcome,'VICTORY');assert.equal(c.guard.hp,0);assert.equal(c.guard.offGuard,false);assert.equal(c.guard.stunned,false);});
test('fatal first-action stumble cancels the remaining committed attack without charging its SP',()=>{
 const rolls=[.99,.1],c=create(()=>rolls.shift());c.tieRandom=()=>1;riled(c);c.guard.hp=50;
 const r=round(c,'swingBackpack','attack');assert.equal(r.results[0].actorId,'guard');assert.equal(r.outcome,'VICTORY');assert.equal(r.results[1].skipped,true);assert.equal(c.player.sp,100);assert.equal(c.player.hp,1000);
});
test('RILED accuracy and critical thresholds are exclusive at exactly 65% / 35%',()=>{
 const missRolls=[.65,.2],c=create(()=>missRolls.shift());riled(c);const miss=round(c,'catchBreath','attack');assert.equal(miss.events.some(e=>e.type==='miss'),true);assert.equal(miss.events.some(e=>e.type==='stumbled'),false);assert.equal(missRolls.length,0);
 const hitRolls=[.64,.35],d=create(()=>hitRolls.shift());riled(d);const hit=round(d,'catchBreath','attack').events.find(e=>e.type==='damage');assert.equal(hit.critical,false);assert.equal(hit.damage,120);
});
for(const name of [null,'FOCUSED','RILED','DISTRACTED'])test(`Wife always applies/refreshed FOCUSED and +20 SP from ${name}`,()=>{const c=create();c.guard.sp=50;c.guard.status=name?{name,turns:1}:null;const r=round(c,'catchBreath','callWife');assert.deepEqual(c.guard.status,{name:'FOCUSED',turns:3});assert.equal(c.guard.sp,70);assert.equal(c.guard.wifeCallAvailable,false);assert.equal(r.events.some(e=>e.type==='statusRemoved'),false);});
