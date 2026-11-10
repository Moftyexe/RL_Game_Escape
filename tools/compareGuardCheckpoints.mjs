import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import QTable from '../src/game/ai/QTable.js';
import QLearningGuardPolicy from '../src/game/ai/QLearningGuardPolicy.js';
import RandomGuardPolicy from '../src/game/combat/RandomGuardPolicy.js';
import HeuristicGuardPolicy from '../src/game/ai/HeuristicGuardPolicy.js';
import TrainingEnvironment from '../src/game/training/TrainingEnvironment.js';
import {summarizeEpisodes} from '../src/game/training/Metrics.js';
import {seededRandom,deriveSeed} from '../src/game/training/SeededRandom.js';
import {hpBucket,donutState} from '../src/game/ai/StateEncoder.js';
import {DONUT_HEAL} from '../src/game/combat/CombatSystem.js';
import {EVALUATION_CONFIG} from '../src/game/training/TrainingConfig.js';
import CatchBreathAudit from './CatchBreathAudit.mjs';
import {PLAYER_BOT_SCHEMA} from '../src/game/training/PlayerBots.js';
import DefensiveStallAudit from './DefensiveStallAudit.mjs';
const seed=EVALUATION_CONFIG.seed,episodesPerBot=Number(process.argv[2]??1000);
const series=process.argv[3]??'v7',checkpointKs=(process.argv[4]??'60,80,100').split(',').map(Number);
const productionMode=process.argv.includes('--production');
const output=process.argv.find(a=>a.startsWith('--output='))?.slice('--output='.length)??`tools/guard-${series}-comparison.json`;
if(!/^v\d+$/.test(series)||checkpointKs.some(k=>!Number.isInteger(k)||k<1))throw Error('Bad checkpoint series');
if(!Number.isInteger(episodesPerBot)||episodesPerBot<1)throw Error('Bad evaluation episodes');
const add=(o,k,n=1)=>o[k]=(o[k]??0)+n;
const policies=[{name:'random'},{name:'heuristic'}];
for(const k of checkpointKs){
 const file=productionMode?'public/assets/ai/guard_qtable.json':`tools/checkpoints/${series}/guard_qtable_${k}k.json`,bytes=await readFile(file),saved=JSON.parse(bytes);
 if(productionMode&&(checkpointKs.length!==1||saved.metadata.episodes!==k*1000))throw Error('Production table episode count mismatch');
 policies.push({name:`q-${k}k`,file,sha256:createHash('sha256').update(bytes).digest('hex'),saved,table:QTable.fromJSON(saved)});
}
const results=[];
for(const spec of policies){
 const before=spec.table?JSON.stringify(spec.table.toJSON()):null;
 for(const bot of ['random','aggressive','tricky']){
  const catchAudit=new CatchBreathAudit();
  const stallAudit=new DefensiveStallAudit();
  const records=[],d={guardActions:{},playerActions:{},executedGuardActions:{},executedPlayerActions:{},guardDamage:0,playerDamage:0,donuts:0,donutHp:0,donutUnder100:0,donutAbove75:0,donutByHp:Object.fromEntries(['CRITICAL','LOW','MID','HIGH','VERY_HIGH'].map(k=>[k,0])),donutByValue:{FULL_VALUE:0,PARTIAL_VALUE:0},criticalGuardDecisions:0,criticalGuardDefends:0,maxDefendChain:0,maxPlayerCriticalDefendChain:0,criticalPlayerDefendChains:0,crack:0,repeatCrack:0,riledEntries:0,riledBattles:0,riledHits:0,riledMisses:0,riledCrits:0,stumbles:0,fatalStumbles:0,fallbackDecisions:0};
  for(let episode=0;episode<episodesPerBot;episode++){
   const episodeSeed=deriveSeed(seed,bot,String(episode)),random=seededRandom(deriveSeed(episodeSeed,'guard-policy'));
   const p=spec.table?new QLearningGuardPolicy({table:spec.table,mode:'EVAL',random}):spec.name==='random'?new RandomGuardPolicy(random):new HeuristicGuardPolicy(random);
   const env=new TrainingEnvironment({seed:episodeSeed,bot,randomizedStart:false,maxRounds:EVALUATION_CONFIG.maxRounds});
   catchAudit.attach(env.combat);
   let chain=0,criticalChain=0,previous=null,riled=false;
   while(!env.terminal){
    const s=env.observation(),action=p.chooseAction(s);add(d.guardActions,action);d.fallbackDecisions+=Number(p.lastSelection?.fallback??false);
    if(hpBucket(s.guard)==='CRITICAL'){d.criticalGuardDecisions++;d.criticalGuardDefends+=Number(action==='defend');}
    chain=action==='defend'?chain+1:0;criticalChain=action==='defend'&&hpBucket(s.player)==='CRITICAL'?criticalChain+1:0;
    d.maxDefendChain=Math.max(d.maxDefendChain,chain);d.maxPlayerCriticalDefendChain=Math.max(d.maxPlayerCriticalDefendChain,criticalChain);d.criticalPlayerDefendChains+=Number(criticalChain===2);
    if(action==='crackKnuckles'){d.crack++;d.repeatCrack+=Number(previous===action);}
    const t=env.step(action);
    for(const round of t.transitions){
     stallAudit.observe(round.playerAction);
     if(round.playerAction)add(d.playerActions,round.playerAction);
     // Resolved action events reveal execution but never influence selection.
     for(const e of round.events){
      if(e.type==='damage'&&e.actorId!==e.targetId){if(e.actorId==='guard')d.guardDamage+=e.hpBefore-e.hpAfter;else d.playerDamage+=e.hpBefore-e.hpAfter;}
      if(e.type==='restored'&&e.targetId==='guard'&&round.guardAction==='eatDonut'){
       d.donuts++;d.donutHp+=e.hp;d.donutUnder100+=Number(e.hp<100);d.donutAbove75+=Number(s.guard.hp/s.guard.maxHp>.75);add(d.donutByHp,hpBucket(s.guard));add(d.donutByValue,donutState(s.guard));
      }
      if(e.type==='statusApplied'&&e.targetId==='guard'&&e.status==='RILED'){d.riledEntries++;riled=true;}
      if(e.actorId==='guard'&&e.physical&&e.actorStatus==='RILED'){
       if(e.type==='miss')d.riledMisses++;
       if(e.type==='damage'){d.riledHits++;d.riledCrits+=Number(e.critical);}
      }
      if(e.type==='stumbled')d.stumbles++;
      if(e.source==='stumble'&&e.hpAfter===0)d.fatalStumbles++;
     }
     for(const [id,a]of [['player',round.playerAction],['guard',round.guardAction]]){
      if(a&&!round.events.some(e=>e.targetId===id&&['actionCancelled','turnSkipped','offGuardSkipped'].includes(e.type)))add(id==='guard'?d.executedGuardActions:d.executedPlayerActions,a);
     }
    }
    if(t.rounds>1){chain=0;criticalChain=0;}
    previous=action;
   }
   d.riledBattles+=Number(riled);records.push(env.summary());stallAudit.endBattle();
  }
  const total=o=>Object.values(o).reduce((n,v)=>n+v,0),percent=(n,t)=>t?100*n/t:0;
  const gd=d.guardActions.attack??0,pd=['attack','swingBackpack','talkSmack'].reduce((n,a)=>n+(d.playerActions[a]??0),0),gTotal=total(d.guardActions),pTotal=total(d.playerActions);
  const derived={guardDamagingPercent:percent(gd,gTotal),guardSetupPercent:percent(gTotal-gd,gTotal),playerDamagingPercent:percent(pd,pTotal),playerCatchBreathPercent:percent(d.playerActions.catchBreath??0,pTotal),playerBackpackPercent:percent(d.playerActions.swingBackpack??0,pTotal),guardDefendPercent:percent(d.guardActions.defend??0,gTotal),guardDonutPercent:percent(d.guardActions.eatDonut??0,gTotal),averageGuardDamage:d.guardDamage/episodesPerBot,averagePlayerDamage:d.playerDamage/episodesPerBot,meanEffectiveDonut:d.donuts?d.donutHp/d.donuts:0,meanWastedDonut:d.donuts?DONUT_HEAL-d.donutHp/d.donuts:0,donutUnder100Percent:percent(d.donutUnder100,d.donuts),donutAbove75Percent:percent(d.donutAbove75,d.donuts),criticalDefendPercent:percent(d.criticalGuardDefends,d.criticalGuardDecisions),riledHitPercent:percent(d.riledHits,d.riledHits+d.riledMisses),riledMissPercent:percent(d.riledMisses,d.riledHits+d.riledMisses),riledCritAmongHitsPercent:percent(d.riledCrits,d.riledHits),stumbleAmongMissesPercent:percent(d.stumbles,d.riledMisses)};
  const catchBreath=catchAudit.toJSON();
  const row={policy:spec.name,bot,...summarizeEpisodes(records),diagnostics:d,rates:derived,catchBreath,playerStall:stallAudit.toJSON()};results.push(row);
  console.log(spec.name,bot,row.wins,row.losses,row.draws,`${(100*row.winRate).toFixed(1)}%`);
 }
 if(spec.table&&JSON.stringify(spec.table.toJSON())!==before)throw Error('Evaluation mutated table');
}
const checkpoints=policies.filter(p=>p.table).map(p=>({policy:p.name,file:p.file,sha256:p.sha256,metadata:p.saved.metadata,coverage:p.table.coverage()}));
await writeFile(output,JSON.stringify({seed,episodesPerBot,maxRounds:EVALUATION_CONFIG.maxRounds,playerBotSchema:PLAYER_BOT_SCHEMA,startMode:'normal-only',learning:false,checkpoints,results},null,2)+'\n');
