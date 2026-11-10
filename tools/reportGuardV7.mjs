import {readFile,writeFile} from 'node:fs/promises';
import {createHallwayLayout} from '../src/game/exploration/hallwayLayout.js';
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const r=await json('tools/guard-v7-comparison.json'),selection=await json('tools/guard-v7-selection.json'),evasion=await json('tools/v7-evasion-audit.json'),stress=await json('tools/v7-healing-stall-stress.json');
const portraits=await json('public/assets/portraits/manifest.json'),verify=await json('tools/v7-verification.json'),smoke=await json('tools/guard-v7-smoke-metrics.json');
const f=n=>Number(n).toFixed(2),pct=(n,d)=>d?100*n/d:0,sum=o=>Object.values(o).reduce((n,v)=>n+v,0);
const table=(h,rows)=>'| '+h.join(' | ')+' |\n| '+h.map(()=> '---').join(' | ')+' |\n'+rows.map(a=>'| '+a.join(' | ')+' |').join('\n')+'\n';
const layout=createHallwayLayout(1024,768),qs=r.results.filter(x=>x.policy.startsWith('q-'));
let md=`# v7 Catch Breath, Player evasion, automatic gate and portraits

## Combat scope

Catch Breath changes **100→150HP**; everything else about it stays FAST/30SP/zero SP restoration/no defense/one action/HP capped1000. It requires>=30SP and pays/heals only on execution. Capped recovery commentary reads the actual event (e.g.+150HP or+40HP near full). Player-bot healing utility automatically scales against the new150HP maximum; personality weights were not retuned.

Central constant **PLAYER_DEFEND_EVASION=.05** applies only when the defender is Player, actively defending, and an incoming physical attack uses an accuracy roll. Status accuracy modifiers and evasion are combined before the final0–1 clamp: normal90→85%, RILED65→60%. Guard Defend receives **zero evasion**; Player Attack remains90%, Backpack80% against it. Existing damage reduction and+10SP remain. No evasion applies to fixed/nonphysical damage, Talk Smack, guaranteed status applications or alwaysHit/accuracyRolled=false actions. Always-hit attacks bypass the hit roll. Accuracy metadata added to events is observational, not reward shaping.

All other combat is frozen: Player1000HP/100SP, Guard1200HP/100SP, Donut200HP only/once, Wife20SP/FOCUSED, Whistle10%/exactly one skipped Player opportunity, RILED values/duration/stumble, all action costs/priorities and Talk Smack animation unchanged. No readiness/DDA redesign, reward change, new SFX or run/music/NPC change.

## Automatic gate encounter

Old: Guard was a manual SPACE interaction. New: a dedicated proximity trigger is tested independently of the remaining NPC interaction zones. At1024×768 layout its center is **(${f(layout.guard.x)},${f(layout.guard.y)})**, radius **${f(layout.interactionRadius)} world pixels**. It scales with existing hallway geometry and triggers before contact with the Guard; no Space or collision is required.

Entering the circle immediately hides prompts, settles the run animation to idle, sets gateBusy/inputLocked, and starts day-aware dialogue. Staying inside, repeated updates or duplicate calls cannot reopen it. Movement/interaction updates remain locked; only dialogue controls advance. The completion callback keeps the lock while launching BattleScene with the current day/readiness and encounter ID. Retry/new-day SchoolScene creation resets the trigger latch, at the original spawn. Musician SPACE interaction remains separate and unchanged.

Existing victory→next day/readiness increase, defeat→same day, cap5, next-day card, battle indicator and F2 information remain intact. Their source/state design was not altered.

## Real dialogue portraits

${table(['Speaker','Source','Dimensions','Format / transparency','Runtime copy','Phaser key'],Object.entries(portraits).map(([id,p])=>[id,p.source,p.width+'×'+p.height,p.format+'; alpha'+p.alphaMin+'–'+p.alphaMax,p.file,id+'-dialogue-portrait']))}
Both originals were visually inspected and copied **byte-for-byte**, not edited/redrawn. SchoolScene.preload calls the portrait loader with real file paths. Central speaker mapping selects the Guard image for Guard lines and Player image for Player lines. DialogueBox creates the corresponding Phaser image, destroys the prior speaker image on advance, applies NEAREST filtering and fits the original aspect ratio within108×150 in the reserved left portrait panel. Text/speaker labels remain separate. Missing textures leave a blank panel and working dialogue.

Integration tests verify actual preload registrations, runtime/source hashes, PNG alpha, correct image keys on speaker changes, proportional scaling using real1254×1254/1312×1199 dimensions, nearest filtering, old-image destruction and missing-portrait safety. These establish that graphics are wired into the render path, not unused path declarations. Live browser appearance still needs the manual check listed below; no unobserved browser rendering is claimed.

## Phased validation and fresh training

Before full training,306 non-artifact tests passed, including the required combat/gate/portrait/readiness/Whistle regressions. Shipped-v7/checkpoint compatibility tests awaited the new artifacts. Then a **${smoke.config.episodes}-episode smoke** from an empty table completed and loaded successfully (${smoke.coverage.encounteredStates} states/${smoke.coverage.learnedPairs} pairs). Full training began only after those checks.

Schema **guard-q-v7**, format2; combat signature includes150HP recovery and Player-only.05 evasion. v6 and older tables are rejected. No warm start. One continuous **100,000-episode** run, seed20261106; alpha.10/gamma.95/rewards unchanged; epsilon1→.05 by zero-based episode index45000, then.05 through100k. All checkpoints are prefixes of this same run, with Q values, explicit visits, seed/config, completed/planned count, legal-action coverage and corrected player-bots-v2-heal-utility metadata. No Q architecture, five percentage HP bins, Donut encoding or randomized-start preparation changes.

Target starts75% normal/25% coherent randomized; bots Aggressive50%/Random25%/Tricky25%. Live readiness adapter and human EVAL/no-online-learning design remain unchanged.

${table(['Checkpoint','States','Visited pairs','Mean actions/state','Median','Fully explored observed legal %','SHA256'],r.checkpoints.map(c=>[c.policy,c.coverage.encounteredStates,c.coverage.learnedPairs,f(c.coverage.meanVisitedActions),c.coverage.medianVisitedActions,f(c.coverage.fullyExploredSeenLegalPercent),c.sha256]))}
${table(['Checkpoint','1 visited','2','3','4','5','6'],r.checkpoints.map(c=>[c.policy,...[1,2,3,4,5,6].map(n=>c.coverage.statesByVisitedActions[n]+' ('+f(c.coverage.percentByVisitedActions[n])+'%)')]))}
## Held-out checkpoint evaluation

Seed **${r.seed}**, **${r.episodesPerBot} normal full-start battles per policy/bot**, max100 rounds, same paired seeds, no learning or Q mutation. These evaluate strict Q EVAL, not a particular day's softer readiness distribution. Random and heuristic Guard are independent diagnostic baselines.

${table(['Guard','Player','W/L/D','Win %','Mean rounds','Mean reward'],r.results.map(x=>[x.policy,x.bot,[x.wins,x.losses,x.draws].join('/'),f(100*x.winRate),f(x.averageRounds),f(x.averageReward)]))}
Production chosen: **${selection.selected}**. ${selection.reason}

Installed hash: **${selection.sha256}**. All three v7 checkpoints and matching metrics remain in tools/checkpoints/v7; v6 archives are preserved. Selected bytes are copied unchanged to public/assets/ai/guard_qtable.json. No extra balance adjustment followed evaluation.

## Evasion audit: actual engine events

Seed${evasion.seed},${evasion.samplesPerCase} independent live-engine sample rounds per case. Every event also asserts its exact configured effective accuracy. Hit/miss counts include accuracy rolls, not only landed hits; critical rolls/stumbles do not alter the defined hit threshold.

${table(['Case','Expected hit %','Observed %','Hits','Misses'],evasion.rows.map(x=>[x.label,f(100*x.expected),f(x.observedHitPercent),x.hits,x.misses]))}
## Defensive stall audit: ordinary bots

The following committed Player action chains include forced opportunities, which break chains. D→C means Defend immediately followed by Catch Breath; D→C→D counts a return to Defend; >=3D→C specifically tracks the resource-regeneration/healing pattern. Mean healing comes from actual capped restoration events. Round-limit draws are evaluation limits, not a new human-battle cap.

${table(['Guard','Player','Max Player Defend chain','D→C','D→C→D','>=3D→C','Mean Player healing/battle','Mean rounds','Round-limit draws'],r.results.map(x=>[x.policy,x.bot,x.playerStall.maxDefendChain,x.playerStall.defendToCatch,x.playerStall.defendCatchDefendCycles,x.playerStall.threeOrMoreDefendsThenCatch,f(x.catchBreath.effectiveHealing/x.episodes),f(x.averageRounds),x.roundLimitDraws]))}
### Deliberate healing-loop stress probe

Separate from the training/evaluation personalities: a Player that never attacks, Defends until missing>=150HP and affordable, then heals. Normal starts, seed${stress.seed},${stress.episodesPerPolicy} episodes/policy,100-round audit cap. This probe diagnoses potential stalling rather than providing a win-rate headline or training target.

${table(['Guard','W/L/D','Mean rounds','Round-limit draws','Max Player Defend chain','D→C','>=3D→C','Mean Player healing'],stress.results.map(x=>[x.policy,[x.wins,x.losses,x.draws].join('/'),f(x.averageRounds),x.roundLimitDraws,x.playerStall.maxDefendChain,x.playerStall.defendToCatch,x.playerStall.threeOrMoreDefendsThenCatch,f(x.averagePlayerHealing)]))}
${stress.results.some(x=>x.draws)?'The probe demonstrates long defensive/healing stalls for at least some policies/seeds. Human battles do not have the100-round cap, so these can last longer in live play. This is reported without an automatic Defend/healing nerf.':'No capped draws occurred in this probe; this finite sample does not rule out longer human-created stalls.'}

## Other behavior and regressions

${table(['Q checkpoint','Guard CRITICAL Defend %','Max Guard Defend chain','Donut FULL / PARTIAL','Mean Donut heal / waste','RILED hit / miss %','Crit among hits %','Stumble among misses %','Fatal stumbles'],qs.map(x=>[x.policy+' / '+x.bot,f(x.rates.criticalDefendPercent),x.diagnostics.maxDefendChain,x.diagnostics.donutByValue.FULL_VALUE+' / '+x.diagnostics.donutByValue.PARTIAL_VALUE,f(x.rates.meanEffectiveDonut)+' / '+f(x.rates.meanWastedDonut),f(x.rates.riledHitPercent)+' / '+f(x.rates.riledMissPercent),f(x.rates.riledCritAmongHitsPercent),f(x.rates.stumbleAmongMissesPercent),x.diagnostics.fatalStumbles]))}
Donut still200HP/no SP/once/capped1200; Guard Defend still its existing damage reduction/+10SP with no evasion. RILED's damage, crit, status duration, defense and20%-after-miss/50-damage stumble values remain unchanged; Player evasion naturally changes the number of RILED misses when defending. Whistle's exact one-opportunity stun and OFF_GUARD rules retain their regressions. Day/readiness flow tests pass. Frozen run/music/SFX and unrelated art hashes match the pre-pass inventory.

## Verification and manual checks

Tests **${verify.testsPassed}/${verify.testsTotal} passed**, failures${verify.testsFailed}; syntax **${verify.syntax}**; production build **${verify.buildExitCode===0?'PASS':'FAIL'}** with existing large-chunk warning. Built table, portrait copies, run and music assets match runtime originals. No SFX integration or DDA redesign.

Manual browser checks remain: approach the gate without Space, confirm portrait appearance and speaker switches, complete dialogue with no movement gap, win/new-day and loss/same-day resets, missing-portrait fallback, and in-battle healing/evasion feedback. Runtime portrait render creation is integration-tested; no live browser screenshot verification is claimed. Review extreme Defend/heal play in live readiness tiers before deciding whether any future balance work is warranted.

Artifacts: tools/guard-v7-comparison.json, v7-evasion-audit.json, v7-healing-stall-stress.json, guard-v7-selection.json, v7-verification.json; public/assets/portraits/manifest.json; production AI metrics. Reproduce with trainGuard.mjs, compareGuardCheckpoints.mjs, auditPlayerEvasion.mjs, auditHealingStall.mjs and reportGuardV7.mjs.
`;
await writeFile('docs/V7_COMBAT_GATE_PORTRAITS.md',md);console.log('Wrote docs/V7_COMBAT_GATE_PORTRAITS.md');
