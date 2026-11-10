// Observes committed Player opportunities, including null forced skips.
export default class DefensiveStallAudit {
    constructor(){this.maxDefendChain=0;this.defendToCatch=0;this.defendCatchDefendCycles=0;this.threeOrMoreDefendsThenCatch=0;this.chain=0;this.previous=[];}
    observe(action){
        if(action==='catchBreath'&&this.chain){this.defendToCatch++;if(this.chain>=3)this.threeOrMoreDefendsThenCatch++;}
        if(action==='defend'&&this.previous[0]==='defend'&&this.previous[1]==='catchBreath')this.defendCatchDefendCycles++;
        this.chain=action==='defend'?this.chain+1:0;this.maxDefendChain=Math.max(this.maxDefendChain,this.chain);this.previous.push(action);if(this.previous.length>2)this.previous.shift();
    }
    endBattle(){this.chain=0;this.previous=[];}
    toJSON(){return {maxDefendChain:this.maxDefendChain,defendToCatch:this.defendToCatch,defendCatchDefendCycles:this.defendCatchDefendCycles,threeOrMoreDefendsThenCatch:this.threeOrMoreDefendsThenCatch};}
}
