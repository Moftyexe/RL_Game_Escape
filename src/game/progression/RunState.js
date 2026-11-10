export const READINESS_TIERS = Object.freeze([
    {name:'CASUAL',weights:[.60,.25,.15]}, {name:'ALERT',weights:[.70,.20,.10]},
    {name:'PREPARED',weights:[.80,.15,.05]}, {name:'DETERMINED',weights:[.90,.08,.02]},
    {name:'LOCKED IN',weights:[1,0,0]}
]);
export const tierForDay=day=>Math.min(5,Math.max(1,Math.floor(Number(day)||1)));
export const readinessForTier=tier=>READINESS_TIERS[tierForDay(tier)-1];
// Successful escapes are canonical; day/readiness cannot drift independently.
export default class RunState {
    constructor(){this.successfulEscapes=0;this.lastBattleOutcome=null;this.encounterSerial=0;this.completedEncounter=0;}
    get dayNumber(){return this.successfulEscapes+1;}
    get readinessTier(){return tierForDay(this.dayNumber);}
    snapshot(){return {dayNumber:this.dayNumber,successfulEscapes:this.successfulEscapes,readinessTier:this.readinessTier,readinessName:readinessForTier(this.readinessTier).name,lastBattleOutcome:this.lastBattleOutcome};}
    beginEncounter(){return ++this.encounterSerial;}
    completeEncounter(id,outcome){
        if(!Number.isInteger(id)||id<1||id!==this.encounterSerial||id<=this.completedEncounter)return false;
        this.completedEncounter=id;this.lastBattleOutcome=outcome;
        if(outcome==='VICTORY')this.successfulEscapes++;
        return true;
    }
}
const sessions=new WeakMap();
export function runStateForScene(scene){
    if(!scene.game)return scene.runState??new RunState();
    if(!sessions.has(scene.game))sessions.set(scene.game,new RunState());
    return sessions.get(scene.game);
}
