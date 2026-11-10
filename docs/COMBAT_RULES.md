# Current combat rules (balance/schema v7)

For the current presentation implementation, see [Presentation / UX polish](PRESENTATION_UX_POLISH.md). Earlier visual measurements below describe the previous pass.

Presentation has since been updated; see [Final visual/readability pass](VISUAL_READABILITY_PASS.md) for current animation mappings, scaling, commentary and timing.

Player starts with 1000/1000 HP; Guard starts with 1200/1200 HP. Both start with 100/100 SP. Base Attack is 80 damage,
90% accuracy, 10% critical chance, and a 1.5 critical damage multiplier.

## Player commands

The main menu is ATTACK, DEFEND, SKILLS. Opening/closing SKILLS does not commit an action.

| Action | SP cost | Effect |
|---|---:|---|
| ATTACK | 0 | 80 base damage, 90% base accuracy |
| DEFEND | 0 | Incoming hits this round are reduced; recover 10 SP |
| BRO, LOCK IN | 15 | Apply FOCUSED to Player |
| TALK SMACK | 15 | 30 fixed emotional damage + RILED to Guard; select one of 15 PLAYER_INSULTS |
| LOOK THERE! | 18 | 25% OFF_GUARD: interrupt pending action plus next-round skip; 75% DISTRACTED |
| SWING BACKPACK | 20 | 140 base damage, 80% base accuracy |
| CATCH BREATH | 30 | Heal150 HP capped1000; no SP restoration or defense; FAST; cost paid only on execution |

The five skills appear in the order listed above. All attacks, including Backpack,
use the attacker's normal effective critical chance. Dialogue randomness has a
separate injectable dependency from mechanical hit/crit/stun rolls.

## Guard commands

| Action | SP cost | Effect |
|---|---:|---|
| ATTACK | 0 | Same basic Attack as Player |
| DEFEND | 0 | Same Defend as Player |
| CRACK KNUCKLES | 15 | Apply RILED to Guard |
| BLOW WHISTLE | 20 | Apply DISTRACTED to Player; separately roll 10% stun |
| CALL WIFE | 0 | Once per battle; always FOCUSED and 20 SP recovery |
| EAT DONUT | 0 | Once per battle; recover 200 HP only; no SP |

The shared CombatSystem validity function enforces actor ownership,
stun, HP, affordability and finite uses. Donut is invalid at full HP, regardless of SP; any missing HP permits it.
Call Wife is available until used, including at full SP. It can refresh FOCUSED.
RandomGuardPolicy samples equal-sized random intervals over this valid list;
it contains no tactical preferences.

`donutAvailable` and `wifeCallAvailable` are independent Guard booleans. Each
changes to false on use and resets only when a new combat system is created.

### Call Wife

Initial dialogue: `"That kid is bullying me again!"`.

| Current Guard state | Result | Wife response |
|---|---|---|
| RILED | Replace with FOCUSED (3); +20 SP | `"Calm down, honey. It's a child."` |
| DISTRACTED | Replace with FOCUSED (3); +20 SP | `"Focus, honey. You've got this."` |
| Neutral | Apply FOCUSED (3); +20 SP | `"You've got this, honey."` |
| FOCUSED | Refresh FOCUSED to 3; +20 SP | `"You're doing great, honey."` |

There is no random outcome or additional mental effect.

## Mental effects and defense

| State | Subsequent rounds | Accuracy modifier | Critical modifier | Damage multiplier | Defend reduction |
|---|---:|---:|---:|---:|---:|
| Neutral | — | 0 | 0 | 1 | 50% |
| FOCUSED | 3 | +15 percentage points | +10 points | 1 | 65% |
| DISTRACTED | 2 | -25 points | 0 | 1 | 35% |
| RILED | 3 | -25 points | +25 points | 1.50 | 40% |

Only one mental effect is active at once. Different effects replace it; the same
status refreshes it. Effects apply immediately, including to the slower action
in the same round. Defense is separate, applies on execution, persists for the
rest of the current round, and always clears at round end, even if unused.
Its reduction uses the defender's actual status at the incoming hit.

Mental effects already active at round start tick once at round end. Newly
applied, replaced or refreshed status objects keep their full duration that
round. FOCUSED/RILED start at 3 and DISTRACTED at 2; effects expire at zero.

## Rolls and damage

All random values use the range [0, 1). A roll strictly below accuracy hits.
Only a hit takes a second, separate critical roll; below effective critical chance
is a critical. Missed paid attacks still spend their SP.

```text
accuracy = clamp(action base accuracy + mental accuracy modifier, 0, 1)
criticalChance = clamp(0.10 + mental critical modifier, 0, 1)
defendReduction = defending ? clamp(0.50 + defender mental modifier, 0, 1) : 0
damage = round(base damage * outgoing multiplier * (1 - defendReduction)
               * (critical ? 1.5 : 1))
```

Rounding happens once at the end. HP cannot fall below zero; recovery caps at
actor maximum HP (Player 1000, Guard 1000) / 100 SP. A normal miss causes no target damage. A Guard physical miss while RILED takes a separate 20% stumble roll: success deals 50 self-damage, without a future skip. Hits take no stumble roll.

## Stun

BLOW WHISTLE is a status skill, not an accuracy-based attack. It always applies
DISTRACTED and takes one mechanical random roll; below 0.10 sets `stunned=true`.
Stun is a separate, non-stacking boolean, not a fourth mental status.

Stun consumes the next pending action opportunity. Before the slower Player
acts, it cancels that committed action immediately without spending SP. If the
Player already acted, it carries to the next round's opportunity. That round
commits null for the stunned actor, automatically shows the skipped opportunity,
and clears stun. It never skips two actions from one application. No recovery
occurs for a cancelled action. Mental status still follows normal round ticking.

## Hidden rounds and priority

Both actions commit against one detached pre-round snapshot. RandomGuardPolicy
receives HP/SP, visible statuses, finite uses, and previous Player action/category,
never either current commitment. It remains uniform over valid actions.
BattleModel.state also excludes selections. Previous action/category update only
after the round resolves, even when the committed action was cancelled.

| Priority | Player | Guard |
|---|---|---|
| FAST | Defend, Catch Breath | Defend, Call Wife, Eat Donut |
| NORMAL | Bro, Lock In; Talk Smack; Look There! | Crack Knuckles, Blow Whistle |
| SLOW | Attack, Swing Backpack | Attack |

State machine: WAITING_FOR_PLAYER -> PLAYER_ACTION_SELECTED -> ACTIONS_LOCKED ->
REVEALING -> RESOLVING_FIRST -> RESOLVING_SECOND -> ROUND_END ->
WAITING_FOR_PLAYER / VICTORY / DEFEAT / DRAW. Selection/round-end are atomic
transitions. Both banners reveal for 800 ms before any execution.

Higher priority executes completely first. Same-tier ties take exactly one
injected tieRandom roll: below 0.5 Player first; otherwise Guard first. No tie
roll is taken for unequal tiers. tieRandom defaults to the combat RNG; tests
can inject it independently of hit/crit/stun and dialogue randomness.

Validity is checked against the pre-round snapshot. SP and finite resources are
spent only when execution occurs. Death cancels remaining actions. DRAW requires
both actual HP values to reach zero; attacks are never forced after death.
Call Wife always applies/refreshed FOCUSED at execution, then a later Talk Smack can
replace its FOCUSED with RILED. Eat Donut heals before a slower incoming attack.
Catch Breath costs30 SP and heals150 HP (capped1000) before slower actions; it restores no SP and supplies no defense. Talk Smack direct damage bypasses accuracy, crit, physical modifiers and defense.

CombatSystem has no Phaser dependency. resolveRound(preRoundState, playerAction,
guardAction, rng) returns orderedActions, individual results, events, nextState,
and outcome without mutating input. rng may be a function or an options object
with separate random, tieRandom and dialogueRandom functions. The scene uses the
same lock/reveal/resolve/end methods, gating each next action on presentation.

## Presentation and compatibility

Both characters have basic Attack, Defend, Hurt and dedicated critical attacks.
All five Player skills and all four Guard skills have inspected animation mappings.
Missing animations still fall back to battle idle; critical basic attacks fall back
to ordinary Attack if their critical sheet is missing. Critical Backpack retains
its own swing animation. Player/Guard victory and Guard defeat now have dedicated sheets. Player defeat and stunned sheets remain absent; Player defeat holds a static Hurt fallback.

Defend plays once and holds its final pose while the authoritative defending flag
is true. Misses preserve the hold. A blocked hit plays Hurt and then restores the defensive pose until round end. Other temporary actions restore the correct defensive/idle
stance afterward. Missing Defend art keeps idle with status feedback.

Presentation timing lives in battle/presentationTiming.js. Motion FPS is unchanged.
Talk Smack now plays source poses1,2,3,5,6 at8FPS, with a1500ms hold on pose3; total2125ms and cue250ms remain unchanged. Current timing constants for all other actions are in presentationTiming.js; their values were not changed in v6.
Character-local wrapped speech boxes display only resolved dialogue. Talk Smack
reading time is clamped to 1500-2200 ms based on the selected insult length.
Call Wife uses Guard speech, a 150 ms gap, then a distinct WIFE / PHONE box; the
phone remains at the ear during the exchange. Total presentation is about 3140 ms.
Compact skill/backpack banners last 550 ms; the bottom log remains history.

Physical impacts pause only attacker/target animations (100 ms normal, 80 ms
blocked, 140 ms critical), then reveal HP, hurt, flash, shake and damage feedback.
Misses have no hit-stop, flash or damage shake. Status effects use colored local
pulses and small 3 px reactions (5 px for stun), with exact-position restoration.
Stun feedback and each single skipped turn remain visible for 1700 ms.
Actions end with a 100 ms physical or 140 ms skill recovery beat. Helpers own
and clean up bubbles, banners, feedback labels, tint timers, local tweens and
hit-stop pauses on turn completion/shutdown. No presentation helper rolls RNG
or applies combat results. Nearby indicators include DEFENDING alongside mental
status and STUNNED. The bottom panels retain numeric resource/effect details.

The original BattleModel is only a compatibility adapter to CombatSystem; it no
longer maintains a conflicting set of rules. Q-learning now lives in separate headless ai/training modules; human battles use read-only EVAL. See [Guard Q-learning](GUARD_Q_LEARNING.md).

Superseded actions are unavailable: generic Buff/Debuff, Lock In, Talk Back,
Look Sir, While You're Looking, Radio Check, Show Me Your ID, Policy Says No,
Shoulder Check and Growl. BRO, LOCK IN and LOOK THERE! are the finalized replacements.
Old animation source files are retained on disk.

Run `node --test` for deterministic combat, policy, animation and presentation tests.
Build with `npm.cmd run build-nolog`.


## Current Look There / OFF_GUARD rules

LOOK THERE! stays NORMAL and costs 18 SP on execution. One injected combat roll
strictly below 0.25 applies OFF_GUARD; 0.25 or higher applies normal DISTRACTED
for its existing two-round duration. OFF_GUARD is not a mental status and does
not replace an existing mental effect. It interrupts a pending Guard action
without SP/effects, survives round end, then reserves a null Guard action next
round. Neither the scene nor BattleModel calls Guard policy for that round.
The reveal says OFF GUARD; consuming the reserved skip immediately clears the
mechanical flag. Presentation holds the away pose through the skip notice, then
restores the current stance. Guard can act normally the following round.
If Guard already acted when Look There succeeds, that completed action stays
resolved, and OFF_GUARD still causes the next-round skip. A fresh success after
consuming an old penalty can apply a new one.

Visual priority: terminal > OFF_GUARD held frame > Defend > Riled idle > normal
idle. Normal DISTRACTED uses yellow reaction/label and ordinary idle, never a
persistent looking-away pose. Blow Whistle remains guaranteed Player DISTRACTED
plus its separate 10% stun roll. Donut is now +200 HP only, capped at Guard
1200 HP/100 SP. See [final audit](FINAL_COMBAT_RUN_AUDIT.md) for verification.

## v7 Player-only Defend evasion and gate portraits

Player Defend also subtracts5 percentage points from incoming accuracy-rolled physical attacks. Guard Defend adds zero evasion. Normal Guard90% becomes85%, RILED65% becomes60%; fixed/nonphysical/always-hit actions and status applications are unaffected. Damage reduction and10SP remain. Status modifiers and evasion combine before the final probability clamp. Gate dialogue now triggers automatically within the existing150px Guard radius; real Player and Guard portrait PNGs are loaded and switched by speaker. See V7_COMBAT_GATE_PORTRAITS.md for current results and audits.
