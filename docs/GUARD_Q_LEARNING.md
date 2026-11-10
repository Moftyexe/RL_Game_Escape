# Guard Q-learning v7

Current experiment: [Combat, automatic gate, portraits and checkpoints](V7_COMBAT_GATE_PORTRAITS.md).

CombatSystem is authoritative in Phaser and headless training. Player max HP1000,
Guard1200, both max SP100. Catch Breath is FAST,30 SP
paid only on execution,150 HP healing capped1000, no SP restoration or defense.
Player Defend adds .05 evasion against accuracy-rolled physical attacks; Guard Defend adds none. All other balance, rewards, bot choice weights and RILED remain unchanged.
Existing narrative day/readiness selection remains; no DDA redesign, SFX integration or human-session learning.

State uses five percentage HP bins, three SP bands, both mental statuses, Wife
availability, Donut value (UNAVAILABLE/FULL_VALUE/PARTIAL_VALUE at200 missing HP),
Player stun and previous Player action category. Theoretical space259,200; sparse
rows only. Hidden current Player choices are never observed. Explicit visits
separate learned Q=0 from unvisited zero. TRAIN prioritizes unvisited currently
valid actions, then epsilon-greedy; EVAL greedily considers visited valid actions
and uses Random fallback for wholly unseen valid states, without table mutation.
Live game stays EVAL/epsilon0; P toggles policy and F2 shows Q/visits/fallback.
Diagnostic heuristic is evaluation only.

## Corrected simulated-Player healing

Current bots scale only Catch Breath's existing personality weight by
min(max(missingHP,0),150)/150, after authoritative action validity. Full-HP
weight is zero for Random/Aggressive/Tricky. All other personality weights stay
unchanged. Evaluation metadata is player-bots-v2-heal-utility, distinct from
combat schema v7. Production is the fresh Q60k checkpoint selected over Q80k/Q100k based on held-out evaluation, reward and behavior. The previous corrected-bot v6 audit remains historical; see the current v7 report for results.

Fresh100k training saves60k/80k/100k prefixes of one continuous seeded run. Alpha.10,
gamma.95. epsilonDecayEpisodes=45000 is an absolute index horizon, independent of
total episodes: epsilon=1+(.05-1)*clamp(episode/45000,0,1). At0 it is1, at22500
it is.525, and at45000 and every subsequent index it is.05. Episode index is
zero-based; checkpoints count completed episodes. The floor does not move to75k.

Target starts75% normal/25% randomized; bots Aggressive50%/Random25%/Tricky25%.
Randomized starts retain valid drafts, a real unrewarded setup round, and rejection
of terminal/forced-Guard-skip states. One committed Guard decision gets one Q
update and visit, even if subsequently cancelled; forced rounds aggregate return
without extra visits. No rewards or hyperparameters were retuned.

Checkpoint JSON stores values, visits, observed legal-action unions, schema,
combat signature, completed/planned episodes, RNG seed/config and coverage.
Loader rejects v6 and older. Checkpoint callbacks serialize synchronously before
future updates and consume no RNG. Tests verify deterministic serialization.

Reproduce:

    node tools/trainGuard.mjs --episodes 200 --output tools/guard-v7-smoke-qtable.json --metrics tools/guard-v7-smoke-metrics.json
    node tools/trainGuard.mjs --episodes 100000 --checkpoints 60000,80000,100000 --output tools/checkpoints/v7/guard_final_run.json --metrics tools/checkpoints/v7/guard_full_run_metrics.json
    node tools/compareGuardCheckpoints.mjs

Evaluation uses identical held-out seeds and1000 normal full battles per policy/bot
for Random, heuristic and all three checkpoints. Production is selected after
comparison, rather than automatically choosing the largest episode count.
