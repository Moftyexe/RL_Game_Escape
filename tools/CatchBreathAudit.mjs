import {CATCH_BREATH_HEAL} from '../src/game/combat/CombatSystem.js';
// Evaluation-only observation. No RNG calls, rewards, choices or combat changes.
export default class CatchBreathAudit {
    constructor() {
        Object.assign(this,{selected:0,executed:0,cancelled:0,selectedHp:0,selectedSp:0,
            hpBefore:0,spBefore:0,effectiveHealing:0,wastedHealing:0,totalSpSpent:0,
            healsUnder50:0,usedAtFullHp:0,costViolations:0});
        this.missingHpBins={FULL_HP:0,UNDER25:0,FROM25_TO49:0,FROM50_TO99:0,AT_LEAST100:0};
    }
    attach(combat) {
        const audit=this,lock=combat.lockActions,resolve=combat.resolveNextAction;
        combat.lockActions=function(playerAction,guardAction){
            const ok=lock.call(this,playerAction,guardAction);
            if(ok&&playerAction==='catchBreath'){
                audit.selected++;audit.selectedHp+=this.player.hp;audit.selectedSp+=this.player.sp;
            }
            return ok;
        };
        combat.resolveNextAction=function(){
            const selected=this.round?.playerAction==='catchBreath';
            const before={hp:this.player.hp,sp:this.player.sp,maxHp:this.player.maxHp};
            const result=resolve.call(this);
            if(selected&&result?.actorId==='player'){
                const cost=before.sp-this.player.sp,heal=this.player.hp-before.hp;
                if(result.skipped){
                    audit.cancelled++;
                    if(cost!==0||heal!==0)throw Error('Cancelled Catch Breath spent SP or healed');
                }else{
                    audit.executed++;audit.hpBefore+=before.hp;audit.spBefore+=before.sp;
                    audit.effectiveHealing+=heal;audit.wastedHealing+=CATCH_BREATH_HEAL-heal;
                    audit.totalSpSpent+=cost;audit.healsUnder50+=Number(heal<50);
                    audit.usedAtFullHp+=Number(before.hp===before.maxHp);
                    const missing=before.maxHp-before.hp;
                    audit.missingHpBins[missing===0?'FULL_HP':missing<25?'UNDER25':missing<50?'FROM25_TO49':missing<100?'FROM50_TO99':'AT_LEAST100']++;
                    if(cost!==30){audit.costViolations++;throw Error('Executed Catch Breath did not cost exactly30 SP');}
                    if(heal!==Math.min(CATCH_BREATH_HEAL,before.maxHp-before.hp))throw Error('Incorrect Catch Breath healing');
                    const restored=result.events.find(e=>e.type==='restored'&&e.targetId==='player');
                    if(!restored||restored.sp!==0||this.player.defending)throw Error('Catch Breath restored SP or supplied defense');
                }
            }
            return result;
        };
    }
    toJSON(){
        if(this.selected!==this.executed+this.cancelled)throw Error('Incomplete Catch Breath audit');
        const n=this.executed;
        return {...this,averageHpBeforeUse:n?this.hpBefore/n:0,averageSpBeforeUse:n?this.spBefore/n:0,
            averageEffectiveHealing:n?this.effectiveHealing/n:0,averageWastedHealing:n?this.wastedHealing/n:0,
            under50Percent:n?100*this.healsUnder50/n:0,fullHpPercent:n?100*this.usedAtFullHp/n:0,
            everyExecutedCost30:this.costViolations===0&&this.totalSpSpent===30*n};
    }
}
