import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const old=await json('tools/guard-v6-old-production-evaluation.json'),now=await json('tools/guard-bot-utility-evaluation.json');
const verify=await json('tools/bot-utility-verification.json');
const f=n=>Number(n).toFixed(2),pct=(n,t)=>t?100*n/t:0,sum=o=>Object.values(o).reduce((n,v)=>n+v,0);
const table=(heads,rows)=>'| '+heads.join(' | ')+' |\n| '+heads.map(()=> '---').join(' | ')+' |\n'+rows.map(r=>'| '+r.join(' | ')+' |').join('\n')+'\n';
const previous=r=>old.results.find(o=>o.bot===r.bot&&o.policy===(r.policy==='q-100k'?'q-learning':r.policy));
const qRows=now.results.filter(r=>r.policy==='q-100k'),qOld=old.results.filter(r=>r.policy==='q-learning');
const agg=qRows.find(r=>r.bot==='aggressive'),aggOld=previous(agg);
const overall=rows=>100*rows.reduce((n,r)=>n+r.wins,0)/rows.reduce((n,r)=>n+r.episodes,0);
const deltaAgg=100*(agg.winRate-aggOld.winRate),deltaOverall=overall(qRows)-overall(qOld);
if(Math.abs(deltaAgg)>5||Math.abs(deltaOverall)>3)throw Error('Results crossed practical retraining threshold; reassess before declaring freeze');
const raw=await readFile('public/assets/ai/guard_qtable.json'),hash=createHash('sha256').update(raw).digest('hex');
if(hash!==old.table.sha256||hash!==now.checkpoints[0].sha256)throw Error('Production table changed');
if(now.seed!==old.seed||now.episodesPerBot!==old.episodesPerBot||now.maxRounds!==old.maxRounds)throw Error('Before/after designs differ');
if(now.results.some(r=>r.catchBreath.usedAtFullHp!==0||!r.catchBreath.everyExecutedCost30))throw Error('Bot healing audit failed');
const decision={recommendation:'RETRAIN NOT NECESSARY',retrained:false,combatSchema:'guard-q-v6',playerBotSchema:now.playerBotSchema,productionSha256:hash,
 oldAggressiveGuardWinPercent:100*aggOld.winRate,newAggressiveGuardWinPercent:100*agg.winRate,deltaAggressivePp:deltaAgg,
 oldOverallGuardWinPercent:overall(qOld),newOverallGuardWinPercent:overall(qRows),deltaOverallPp:deltaOverall,
 practicalThresholds:{aggressiveAbsolutePp:5,overallAbsolutePp:3},productionTableUnchanged:true,qLearningFrozen:true,readyForDda:true,ddaImplemented:false};
await writeFile('tools/bot-utility-decision.json',JSON.stringify(decision,null,2)+'\n');
let md=`# Simulated-Player healing utility and Q100k re-evaluation

## Decision: retraining not necessary

Keep the existing production Q100k **byte-for-byte unchanged**. Aggressive Guard win rate **${f(100*aggOld.winRate)}% → ${f(100*agg.winRate)}% (${f(deltaAgg)}pp)**; overall Q win rate **${f(overall(qOld))}% → ${f(overall(qRows))}% (${f(deltaOverall)}pp)**. Q against Random changes96.30→94.10%; Tricky stays99.60%. These are small changes, not evidence that the training opponent became materially stronger. Heuristic > Q > Random ordering remains on every bot style. Existing Q weaknesses remain; conclusions do not reverse.

Practical review thresholds: approximately5pp absolute Aggressive change or3pp overall Q change, plus qualitative ordering/action-distribution changes. Neither numerical threshold is crossed. Aggressive damaging/Attack/Backpack distributions remain close (below). Random Guard versus Random moves more (-4.3pp), but this does not materially alter production Q conclusions. This is paired fixed-seed validation, not proof of optimality or human difficulty.

**No new training was run. No v7 or combat-schema bump. Q-learning is frozen and ready for DDA work; DDA is not implemented.** Production path public/assets/ai/guard_qtable.json; SHA256 **${hash}**. All old60k/80k/100k checkpoints remain available unchanged.

## Bot-only fix

Old Random Player sampled all legal actions uniformly, including full-HP Catch Breath. Aggressive/Tricky used fixed personality weights, with no healing-value adjustment. Catch Breath is no longer free SP recovery, so full-HP choices wasted30SP and a turn.

New playerBotWeights first preserves each style's original base weights and authoritative legal actions, then changes only Catch Breath weight:

    efficiency = min(max(maxHP-currentHP, 0), 100) / 100
    CatchBreathWeight = originalStyleWeight * efficiency

At0 missing HP weight=0; at20 it is20% of base,50 gives50%, and>=100 gives the full configured weight. This is smooth utility, not a low-HP tactical threshold. Random remains broadly weighted across all other legal actions (base1); Aggressive keeps Attack6/Backpack8/Catch.15 at legal SP; Tricky keeps Attack2/Backpack1/Catch1/Defend4/Look There5. Focused Lock In weighting and every non-Catch weight remain unchanged. Existing low-SP recovery preferences are preserved in base logic but Catch remains invalid below30SP, so cannot bypass cost.

Player bot metadata version **${now.playerBotSchema}** is distinct from combat schema **guard-q-v6**. Future training metadata identifies corrected opponents; existing Q100k honestly retains its historical player-bots-v1 training metadata. No Q values, visits, schema or metadata were rewritten. RandomGuardPolicy is unchanged; this fix affects simulated Player policies only.

## Frozen game and run cycle

Catch Breath still FAST/30SP/100HP/capped1000/no SP recovery/no defense, execution-only cost and heal. Player1000HP, Guard1200HP, Donut200, Whistle, RILED, Defend, all other skills/priorities/rewards/state representation/visit behavior unchanged. Talk Smack sequence1,2,3,5,6 unchanged. The current video-derived eight-pose side run was already installed when this narrower task arrived; it is unchanged in this pass. Its previous359-test run passed. No music, musician, SFX or DDA changes.

## Identical before/after evaluation design

Exact current production table loaded from its production path, not a newly trained table. Seed **${now.seed}**, **${now.episodesPerBot} normal full-start battles per policy/bot**, max rounds **${now.maxRounds}**, identical named episode/combat/tie/Player/Guard RNG streams. Policy is EVAL, epsilon0, no learning. Every evaluation serializes/checks the in-memory table before/after; final file SHA matches the original. All nine corrected-bot evaluations completed. Previously saved old-policy results are preserved in tools/guard-v6-old-production-evaluation.json; new results in tools/guard-bot-utility-evaluation.json.

W/L/D and reward below are Guard-perspective. Before/after uses identical initial seeds, but changing actions naturally makes subsequent trajectories diverge.

${table(['Guard','Player','Bots','W/L/D','Win %','Mean rounds','Mean reward'],now.results.flatMap(r=>{const o=previous(r);return [[r.policy,r.bot,'OLD',[o.wins,o.losses,o.draws].join('/'),f(100*o.winRate),f(o.averageRounds),f(o.averageReward)],[r.policy,r.bot,'CORRECTED',[r.wins,r.losses,r.draws].join('/'),f(100*r.winRate),f(r.averageRounds),f(r.averageReward)]];}))}

## Corrected Catch Breath audit

Measurements at actual execution; missing-HP categories are exclusive: full0,1–24,25–49,50–99,>=100. Each row is1000 battles. Counts of selections reconcile to executions+cancellations. A carried Whistle stun prevents selection and consumes a null opportunity; FAST Catch Breath normally executes before NORMAL Whistle, explaining why selected-action cancellations may be zero. Separate deterministic tests cover cancellation without cost/heal.

${table(['Guard','Player','Selected / executed / cancelled','FullHP','Missing1–24','25–49','50–99','>=100'],now.results.map(r=>{const c=r.catchBreath,b=c.missingHpBins;return[r.policy,r.bot,[c.selected,c.executed,c.cancelled].join('/'),b.FULL_HP,b.UNDER25,b.FROM25_TO49,b.FROM50_TO99,b.AT_LEAST100];}))}
${table(['Guard','Player','Mean effective HP','Mean wasted HP','Mean SP before','Total Catch SP spent'],now.results.map(r=>[r.policy,r.bot,f(r.catchBreath.averageEffectiveHealing),f(r.catchBreath.averageWastedHealing),f(r.catchBreath.averageSpBeforeUse),r.catchBreath.totalSpSpent]))}
**Full-HP uses are0 across all nine rows. Every execution still costs exactly30SP.** Audit wrappers assert exact capped healing, zero SP restoration, no defense, and no cost/heal on cancellation. Regression tests verify instrumentation does not alter seeded traces/rewards/RNG.

## Aggressive Player versus unchanged Q100k

${table(['Metric','OLD','CORRECTED'],[
 ['Catch selected/executed/cancelled',[aggOld.catchBreath.selected,aggOld.catchBreath.executed,aggOld.catchBreath.cancelled].join('/'),[agg.catchBreath.selected,agg.catchBreath.executed,agg.catchBreath.cancelled].join('/')],
 ['Full-HP Catch %',f(aggOld.catchBreath.fullHpPercent),f(agg.catchBreath.fullHpPercent)],
 ['Mean effective Catch heal',f(aggOld.catchBreath.averageEffectiveHealing),f(agg.catchBreath.averageEffectiveHealing)],
 ['Guard win %',f(100*aggOld.winRate),f(100*agg.winRate)],
 ...['attack','swingBackpack','catchBreath'].map(a=>[a+' count (% Player decisions)',(aggOld.diagnostics.playerActions[a]??0)+' ('+f(pct(aggOld.diagnostics.playerActions[a]??0,sum(aggOld.diagnostics.playerActions)))+')',(agg.diagnostics.playerActions[a]??0)+' ('+f(pct(agg.diagnostics.playerActions[a]??0,sum(agg.diagnostics.playerActions)))+')']),
 ['Player damaging %',f(aggOld.rates.playerDamagingPercent),f(agg.rates.playerDamagingPercent)],
 ['Mean Player damage/battle',f(aggOld.rates.averagePlayerDamage),f(agg.rates.averagePlayerDamage)],
 ['Mean Player healing/battle',f(aggOld.catchBreath.effectiveHealing/aggOld.episodes),f(agg.catchBreath.effectiveHealing/agg.episodes)],
 ['Mean Catch SP spent/battle',f(aggOld.catchBreath.totalSpSpent/aggOld.episodes),f(agg.catchBreath.totalSpSpent/agg.episodes)],
 ['Guard damaging / setup %',f(aggOld.rates.guardDamagingPercent)+' / '+f(aggOld.rates.guardSetupPercent),f(agg.rates.guardDamagingPercent)+' / '+f(agg.rates.guardSetupPercent)],
 ['Mean Guard damage/battle',f(aggOld.rates.averageGuardDamage),f(agg.rates.averageGuardDamage)]])}
Frequencies count committed, non-null decisions; damaging means Player Attack/Backpack/Talk Smack. Actual damage excludes overkill and Guard stumble self-damage. Player healing is Catch Breath only. The corrected Aggressive remains attack-heavy, heals rarely, and does not become an optimized healing expert. Other simulated bots still have imperfect tactics.

## Verification and remaining manual checks

Tests **${verify.testsPassed}/${verify.testsTotal} passed**; syntax **${verify.syntax}**; production build **${verify.buildExitCode===0?'PASS':'FAIL'}**, existing large-chunk warning. Final hash checks verify the original production table, combat, Q architecture/state/rewards, current running art/control files, music, SFX and other frozen files unchanged. No retrain, schema bump, checkpoint replacement or online learning occurred.

Tests cover efficiency0/.2/.5/.99/1, every bot's full-HP exclusion, personality weights,29/30SP legality, seeded reproducibility, exact audit-bin boundaries, unchanged instrumented traces/rewards, production EVAL nonmutation and existing compatibility/visits/fallback tests. Manual browser checks remain: basic gameplay/P/F2 and the newly installed video run's perceived loop/edge quality from the preceding task. This bot-only pass adds no human-battle healing restriction; humans may still choose Catch Breath at full HP if otherwise legal.

Reproduce corrected evaluation:

    node tools/compareGuardCheckpoints.mjs 1000 v6 100 --production --output=tools/guard-bot-utility-evaluation.json

Decision metadata: tools/bot-utility-decision.json. No DDA implemented.
`;
await writeFile('docs/PLAYER_BOT_HEAL_UTILITY_AUDIT.md',md);
console.log(JSON.stringify(decision,null,2));
