import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import QTable from '../src/game/ai/QTable.js';
import QLearningGuardPolicy from '../src/game/ai/QLearningGuardPolicy.js';
import StateEncoder, { hpBucket, donutState } from '../src/game/ai/StateEncoder.js';
import CombatSystem, { GUARD_ACTIONS, validActions, DONUT_HEAL } from '../src/game/combat/CombatSystem.js';
import TrainingEnvironment from '../src/game/training/TrainingEnvironment.js';
import { seededRandom, deriveSeed } from '../src/game/training/SeededRandom.js';
import { BOT_TYPES } from '../src/game/training/PlayerBots.js';
import { argumentsFor, saveJSON } from './guardCli.mjs';
const args = argumentsFor(process.argv.slice(2), ['table','episodes','seed','output']);
const bytes = await readFile(args.table ?? 'public/assets/ai/guard_qtable.json');
const saved = JSON.parse(bytes), table = QTable.fromJSON(saved), encoder = new StateEncoder();
const before = JSON.stringify(table.toJSON());
const inspect=(label,gHp,pHp,status=null,spent=false)=>{
 const state=new CombatSystem().snapshot();Object.assign(state.guard,{hp:gHp,sp:50,status:status?{name:status,turns:3}:null,wifeCallAvailable:!spent,donutAvailable:!spent});Object.assign(state.player,{hp:pHp,sp:50});state.previousPlayerAction='attack';
 const key=encoder.encode(state),valid=validActions(state,'guard'),visited=valid.filter(a=>table.hasVisited(key,a));
 const policy=new QLearningGuardPolicy({table,mode:'EVAL',random:seededRandom(deriveSeed(20261111,label,spent?'spent':'ready'))});const chosen=policy.chooseAction(state);
 return {label,state:key,guardHp:gHp,playerHp:pHp,guardSp:50,playerSp:50,wifeAvailable:!spent,donutAvailable:!spent,donutState:donutState(state.guard),
  learnedState:table.rows.has(key),learnedActions:[...GUARD_ACTIONS].filter(a=>table.hasVisited(key,a)),values:Object.fromEntries(GUARD_ACTIONS.map(a=>[a,valid.includes(a)?table.get(key,a):null])),
  visits:Object.fromEntries(GUARD_ACTIONS.map(a=>[a,table.getVisitCount(key,a)])),validActions:valid,evalCandidates:visited,chosen,fallback:policy.lastSelection.fallback,
  preferred:visited.filter(a=>table.get(key,a)===table.maxQ(key,visited))};
};
const definitions=[['A',60,50,null],['B',60,700,null],['C',1080,50,null],['D',480,400,null],['E',480,200,'RILED'],['F',240,700,null],['G',60,200,null],['H',1190,700,null]];
const examples=definitions.map(args=>inspect(...args));
const spentResourceExamples=definitions.filter(args=>args[0]!=='F').map(args=>inspect(...args,true));
const actions={},criticalActions={},bothCriticalActions={},criticalPlayerActions={},criticalGuardHighPlayerActions={},riledActions={};
const donutUseByValue={FULL_VALUE:0,PARTIAL_VALUE:0,UNAVAILABLE:0};
const executedDonutsByValue={FULL_VALUE:0,PARTIAL_VALUE:0,UNAVAILABLE:0},executedDonutsByHp={};
let executedDonuts=0,executedDonutsAbove75=0,riledEntries=0;
let fallbackDecisions=0;
const donutUseByHpBucket=Object.fromEntries(['CRITICAL','LOW','MID','HIGH','VERY_HIGH'].map(bucket=>[bucket,0]));
const increment=(counts,key)=>counts[key]=(counts[key]??0)+1;
let rounds=0,decisions=0,donuts=0,nearFullDonuts=0,over90Donuts=0,wifeAfterCrack=0,cracks=0,repeatedCracks=0,donutHealedHp=0,donutRestoredSp=0;
let stumbles=0,fatalStumbles=0,riledPhysical=0,riledMisses=0,maxDefendStreak=0,roundLimitDraws=0;
let riledHits=0,riledCrits=0,battlesRiled=0,crackExecuted=0,criticalPlayerDefendChains=0,longestCriticalPlayerDefendChain=0;
const seed=Number(args.seed??20261108),episodes=Number(args.episodes??1000);
if(!Number.isInteger(episodes)||episodes<1||!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw Error('Invalid inspection count/seed');
for(const bot of BOT_TYPES)for(let episode=0;episode<episodes;episode++){
    const episodeSeed=deriveSeed(seed,bot,String(episode));
    const env=new TrainingEnvironment({seed:episodeSeed,bot,randomizedStart:false});
    const policy=new QLearningGuardPolicy({table,mode:'EVAL',random:seededRandom(deriveSeed(episodeSeed,'guard-policy'))});
    let previous=null,defendStreak=0,criticalPlayerDefendStreak=0,enteredRiled=false;
    while(!env.terminal){
        const state=env.observation(),action=policy.chooseAction(state),g=hpBucket(state.guard),p=hpBucket(state.player);
        decisions++;increment(actions,action);fallbackDecisions+=Number(policy.lastSelection.fallback);
        if(g==='CRITICAL')increment(criticalActions,action);
        if(g==='CRITICAL'&&p==='CRITICAL')increment(bothCriticalActions,action);
        if(p==='CRITICAL')increment(criticalPlayerActions,action);
        if(g==='CRITICAL'&&p==='HIGH')increment(criticalGuardHighPlayerActions,action);
        if(state.guard.status?.name==='RILED')increment(riledActions,action);
        if(action==='eatDonut'){donuts++;donutUseByValue[donutState(state.guard)]++;donutUseByHpBucket[g]++;if(state.guard.hp/state.guard.maxHp>.75)nearFullDonuts++;if(state.guard.hp/state.guard.maxHp>.9)over90Donuts++;}
        if(action==='crackKnuckles'){cracks++;if(previous==='crackKnuckles')repeatedCracks++;}
        if(action==='callWife'&&previous==='crackKnuckles')wifeAfterCrack++;
        defendStreak=action==='defend'?defendStreak+1:0;maxDefendStreak=Math.max(maxDefendStreak,defendStreak);
        criticalPlayerDefendStreak=action==='defend'&&p==='CRITICAL'?criticalPlayerDefendStreak+1:0;
        if(criticalPlayerDefendStreak===2)criticalPlayerDefendChains++;
        longestCriticalPlayerDefendChain=Math.max(longestCriticalPlayerDefendChain,criticalPlayerDefendStreak);
        const transition=env.step(action);rounds+=transition.rounds;
        const events=transition.transitions.flatMap(t=>t.events);
        const heal=events.find(e=>e.type==='restored'&&e.targetId==='guard'&&action==='eatDonut');
        if(heal){executedDonuts++;increment(executedDonutsByHp,g);executedDonutsByValue[donutState(state.guard)]++;executedDonutsAbove75+=Number(state.guard.hp/state.guard.maxHp>.75);}
        riledEntries+=events.filter(e=>e.type==='statusApplied'&&e.targetId==='guard'&&e.status==='RILED').length;
        if(action==='eatDonut')for(const event of events.filter(e=>e.type==='restored'&&e.targetId==='guard')){donutHealedHp+=event.hp;donutRestoredSp+=event.sp;}
        // A completed attack has a miss or damage event. Cancelled attacks do not.
        riledPhysical+=events.filter(e=>e.actorId==='guard'&&e.physical&&e.actorStatus==='RILED'&&['miss','damage'].includes(e.type)).length;
        riledMisses+=events.filter(e=>e.type==='miss'&&e.actorId==='guard'&&e.actorStatus==='RILED').length;
        riledHits+=events.filter(e=>e.type==='damage'&&e.actorId==='guard'&&e.physical&&e.actorStatus==='RILED').length;
        riledCrits+=events.filter(e=>e.type==='damage'&&e.actorId==='guard'&&e.physical&&e.actorStatus==='RILED'&&e.critical).length;
        if(events.some(e=>e.type==='statusApplied'&&e.targetId==='guard'&&e.status==='RILED'))enteredRiled=true;
        if(action==='crackKnuckles'&&!events.some(e=>e.type==='actionCancelled'&&e.targetId==='guard'))crackExecuted++;
        stumbles+=events.filter(e=>e.type==='stumbled').length;
        fatalStumbles+=events.filter(e=>e.source==='stumble'&&e.hpAfter===0).length;
        previous=action;
        if(transition.rounds>1){defendStreak=0;criticalPlayerDefendStreak=0;} // Forced skipped rounds break a real consecutive chain.
    }
    roundLimitDraws+=Number(env.roundLimitReached);
    battlesRiled+=Number(enteredRiled);
}
if(JSON.stringify(table.toJSON())!==before)throw Error('Inspection mutated Q-table');
const result={tableSha256:createHash('sha256').update(bytes).digest('hex'),schema:saved.stateSchema,seed,episodesPerBot:episodes,
    startMode:'normal-only', representativeStates:examples,spentResourceExamples,behavior:{decisions,rounds,actions,criticalActions,bothCriticalActions,criticalPlayerActions,criticalGuardHighPlayerActions,riledActions,
        donuts,donutUseByHpBucket,donutUseByValue,executedDonuts,executedDonutsByValue,executedDonutsByHp,executedDonutsAbove75,riledEntries,fallbackDecisions,meanEffectiveHeal:executedDonuts?donutHealedHp/executedDonuts:0,meanWastedHeal:executedDonuts?DONUT_HEAL-donutHealedHp/executedDonuts:0,nearFullDonuts,over90Donuts,donutHealedHp,donutRestoredSp,wifeAfterCrack,cracks,crackExecuted,repeatedCracks,battlesRiled,
        stumbles,fatalStumbles,riledPhysical,riledMisses,riledHits,riledCrits,maxDefendStreak,criticalPlayerDefendChains,longestCriticalPlayerDefendChain,roundLimitDraws},
    caveats:['EVAL masks unvisited valid actions; no visited valid action uses explicit Random fallback.','Action counts are commitments, including later interruptions.','This is bot evaluation, not evidence of human difficulty.']};
await saveJSON(args.output??'public/assets/ai/guard_policy_inspection.json',result);
console.log(JSON.stringify(result,null,2));
