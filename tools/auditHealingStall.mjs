import {readFile,writeFile} from 'node:fs/promises';
import QTable from '../src/game/ai/QTable.js';import QLearningGuardPolicy from '../src/game/ai/QLearningGuardPolicy.js';
import RandomGuardPolicy from '../src/game/combat/RandomGuardPolicy.js';import HeuristicGuardPolicy from '../src/game/ai/HeuristicGuardPolicy.js';
import TrainingEnvironment from '../src/game/training/TrainingEnvironment.js';import {seededRandom,deriveSeed} from '../src/game/training/SeededRandom.js';
import {summarizeEpisodes} from '../src/game/training/Metrics.js';import {validActions,CATCH_BREATH_HEAL} from '../src/game/combat/CombatSystem.js';
import CatchBreathAudit from './CatchBreathAudit.mjs';import DefensiveStallAudit from './DefensiveStallAudit.mjs';
const seed=20261113,episodes=300,results=[];
const bot={type:'defend-heal-stress',chooseAction:s=>s.player.maxHp-s.player.hp>=CATCH_BREATH_HEAL&&validActions(s,'player').includes('catchBreath')?'catchBreath':'defend'};
for(const name of ['random','heuristic','q-60k','q-80k','q-100k']){
 const q=name.startsWith('q-')?QTable.fromJSON(JSON.parse(await readFile(`tools/checkpoints/v7/guard_qtable_${name.slice(2)}.json`,'utf8'))):null,before=q?JSON.stringify(q.toJSON()):null;
 const records=[],catchAudit=new CatchBreathAudit(),stall=new DefensiveStallAudit();
 for(let i=0;i<episodes;i++){
  const episodeSeed=deriveSeed(seed,String(i)),rng=seededRandom(deriveSeed(episodeSeed,'guard-policy'));
  const p=q?new QLearningGuardPolicy({table:q,mode:'EVAL',random:rng}):name==='random'?new RandomGuardPolicy(rng):new HeuristicGuardPolicy(rng);
  const e=new TrainingEnvironment({seed:episodeSeed,bot,maxRounds:100,randomizedStart:false});catchAudit.attach(e.combat);
  while(!e.terminal){const t=e.step(p.chooseAction(e.observation()));for(const r of t.transitions)stall.observe(r.playerAction);}
  stall.endBattle();records.push(e.summary());
 }
 if(q&&JSON.stringify(q.toJSON())!==before)throw Error('Stall audit mutated table');
 const recovery=catchAudit.toJSON(),summary=summarizeEpisodes(records);results.push({policy:name,...summary,playerStall:stall.toJSON(),catchBreath:recovery,averagePlayerHealing:recovery.effectiveHealing/episodes});
 console.log(name,summary.wins,summary.losses,summary.draws,summary.averageRounds);
}
await writeFile('tools/v7-healing-stall-stress.json',JSON.stringify({seed,episodesPerPolicy:episodes,maxRounds:100,normalStartsOnly:true,probe:'Player never attacks; Defend until missing>=150HP and affordable, then Catch Breath. Diagnostic only, not a training opponent.',results},null,2)+'\n');
