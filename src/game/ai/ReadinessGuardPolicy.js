import {validActions} from '../combat/CombatSystem.js';
import StateEncoder,{guardObservation} from './StateEncoder.js';
import {readinessForTier,tierForDay} from '../progression/RunState.js';
// Live-play adapter only. Frozen Q-policy remains EVAL; no learning or writes.
export default class ReadinessGuardPolicy {
    constructor(qPolicy,tier=1,random=Math.random){this.qPolicy=qPolicy;this.tier=tierForDay(tier);this.random=random;this.encoder=new StateEncoder();this.lastSelection=null;}
    chooseAction(snapshot){
        const s=guardObservation(snapshot),valid=validActions(s,'guard');
        if(!valid.length){this.lastSelection={forced:true,fallback:false};return null;}
        const key=this.encoder.encode(s),table=this.qPolicy.table,visited=valid.filter(a=>table.hasVisited(key,a));
        if(!visited.length){const a=this.qPolicy.chooseAction(s);this.lastSelection={...this.qPolicy.lastSelection};return a;}
        const ranked=visited.map(action=>({action,q:table.get(key,action)})).sort((a,b)=>b.q-a.q);
        // Shuffle exact-Q tie groups, avoiding catalog-order tactical bias.
        for(let start=0;start<ranked.length;){let end=start+1;while(end<ranked.length&&ranked[end].q===ranked[start].q)end++;
            for(let i=end-1;i>start;i--){const j=start+Math.floor(this.random()*(i-start+1));[ranked[i],ranked[j]]=[ranked[j],ranked[i]];}start=end;}
        const candidates=ranked.slice(0,3),weights=readinessForTier(this.tier).weights.slice(0,candidates.length),total=weights.reduce((a,n)=>a+n,0);
        let chosen=candidates[0].action;
        if(candidates.length>1&&weights.filter(w=>w>0).length>1){let roll=this.random()*total;for(let i=0;i<candidates.length;i++){roll-=weights[i];if(roll<0){chosen=candidates[i].action;break;}}}
        this.lastSelection={fallback:false,ranked:candidates.map((c,i)=>({...c,probability:weights[i]/total})),tier:this.tier};return chosen;
    }
}
