import {validActions,DONUT_HEAL}from'../combat/CombatSystem.js';
import {guardObservation}from'./StateEncoder.js';

// Diagnostic ONLY. Never imported by live scenes, Q training, or fallback.
export default class HeuristicGuardPolicy {
    constructor(random=Math.random){this.random=random;}
    chooseAction(snapshot){
        const s=guardObservation(snapshot),valid=validActions(s,'guard'),g=s.guard,p=s.player;
        if(!valid.length)return null;
        // Emergency survival before a speculative simultaneous finishing hit.
        if(g.hp/g.maxHp<=.25&&g.maxHp-g.hp>=DONUT_HEAL&&valid.includes('eatDonut'))return'eatDonut';
        if(p.hp/p.maxHp<=.10)return'attack';
        if(valid.includes('callWife')&&(['RILED','DISTRACTED'].includes(g.status?.name)||g.sp<=80||!g.status))return'callWife';
        const weights={attack:6,defend:g.sp<20?2:.25,crackKnuckles:g.status? .25:2,blowWhistle:p.status?.name==='DISTRACTED'? .5:3,
            callWife:.5,eatDonut:g.maxHp-g.hp>=DONUT_HEAL?1:.1};
        const total=valid.reduce((n,a)=>n+weights[a],0);let roll=this.random()*total;
        for(const a of valid){roll-=weights[a];if(roll<0)return a;}
        return valid.at(-1);
    }
}
