import { Scene, Textures } from 'phaser';
import BattleMusic, {preloadBattleMusic} from '../audio/BattleMusic.js';
import CombatSystem, { ACTIONS, PLAYER_SKILLS, ROUND_STATES } from '../combat/CombatSystem.js';
import GuardAIController, { Q_TABLE_CACHE_KEY } from '../ai/GuardAIController.js';
import { createGuardDebugOverlay } from '../battle/guardAIDebug.js';
import { preloadBattleAnimations, createBattleAnimations, initialBattleTexture,
    playBattleAction, restoreBattleStance, BATTLE_CANVAS } from '../battle/battleAnimations.js';

import { presentBattleResult } from '../battle/presentBattleResult.js';

import { preloadBattleBackdrop, createBattleBackdrop } from '../battle/battleBackdrop.js';
import PresentationEffects from '../battle/presentationEffects.js';
import { waitBattlePresentation } from '../battle/battleAnimations.js';
import { PRESENTATION_TIMING as TIMING } from '../battle/presentationTiming.js';
import {runStateForScene,readinessForTier,tierForDay} from '../progression/RunState.js';
import {actionContext,statusBadges,defendSummary,guardResources} from '../battle/battleUIModel.js';
import SoundEffects,{preloadSfx} from '../audio/SoundEffects.js';
import {revealBattle} from '../battle/BattleEntryTransition.js';
import {GAME_DIALOGUE} from '../dialogue/dialogueScript.js';

const MAIN_MENU = ['attack', 'defend', 'skills'];
const STATUS_COLORS = { FOCUSED: '#86d8ff', DISTRACTED: '#e5c67c', RILED: '#ff9a79', STUN: '#ed9cff' };

export default class BattleScene extends Scene {
    constructor() {
        super('BattleScene');
    }

    init({ returnScene = 'SchoolScene',runContext=null,encounterId=null } = {}) {
        this.returnScene = returnScene;
        this.runState=runStateForScene(this);this.encounterId=encounterId??this.runState.beginEncounter();
        const context={...this.runState.snapshot(),...(runContext??{})},day=Math.max(1,Math.floor(Number(context.dayNumber)||this.runState.dayNumber)),tier=tierForDay(day);
        this.runContext={...context,dayNumber:day,readinessTier:tier,readinessName:readinessForTier(tier).name};
        this.narrativeOutcome=null;this.leavingNarrative=false;
        this.combat = new CombatSystem();
        this.guardAI = new GuardAIController({runContext:this.runContext});
        this.guardPolicy = this.guardAI.policy;
        this.aiDebugOpen = false;
        this.aiDebugAdvanced=false;
        this.selected = 0;
        this.menu = 'main';
        this.presentationBusy = false;
        this.presentationSerial = 0;
        this.presentationHealth = null;
        this.presentationState = null;
        this.effects = null;
        this.displayedState = this.combat.snapshot();
    }

    preload() {
        preloadSfx(this);
        preloadBattleMusic(this);
        preloadBattleAnimations(this);
        preloadBattleBackdrop(this);
        this.load.text(Q_TABLE_CACHE_KEY, `${import.meta.env?.BASE_URL ?? './'}assets/ai/guard_qtable.json`);
    }

    create() {
        this.sfx=new SoundEffects(this);this.entryBusy=true;
        this.guardAI.load(this.cache.text.get(Q_TABLE_CACHE_KEY));
        this.guardPolicy = this.guardAI.policy;
        createBattleAnimations(this, Textures.FilterMode.NEAREST);
        this.cameras.main.setBackgroundColor('#101421');
        this.ui = this.add.container(0, 0);
        const fit = () => {
            const scale = Math.min(this.scale.width / 1024, this.scale.height / 768);
            this.ui.setScale(scale).setPosition((this.scale.width - 1024 * scale) / 2, (this.scale.height - 768 * scale) / 2);
        };
        fit();
        this.scale.on('resize', fit);
        this.panel(24, 20, 976, 370);
        createBattleBackdrop(this, Textures.FilterMode.NEAREST);
        this.text(512, 30, 'SCHOOL GUARD', 22, '#f5db91').setOrigin(0.5, 0);
        this.readinessLabel=this.text(512,65,`DAY ${this.runContext.dayNumber}  /  ${this.runContext.readinessName}`,12,'#c6d3e8').setOrigin(.5,0);
        this.rect(512, 384, 930, 2, 0x53627e);
        this.actors = {
            player: this.createActor('player', 205, 328, 0x628bb3, 'PLAYER', 62, 344),
            guard: this.createActor('guard', 760, 328, 0xa97563, 'SCHOOL GUARD', 62, 344)
        };
        this.aiButton = this.text(42, 36, '', 10, '#879ab4').setInteractive({ useHandCursor: true });
        this.aiButton.on('pointerdown', () => this.toggleGuardAI());
        const debugButton = this.text(982, 36, 'AI DEBUG [F2]', 10, '#879ab4').setOrigin(1, 0).setInteractive({ useHandCursor: true });
        debugButton.on('pointerdown', () => this.toggleAIDebug());
        this.outcome = this.text(512, 87, '', 28, '#f5db91').setOrigin(0.5);
        this.panel(24, 402, 976, 90);
        this.contextTitle=this.text(42,411,'',16,'#f5db91');
        this.contextDescription=this.text(42,434,'',13,'#e7edf7').setWordWrapWidth(930);
        this.contextDetails=this.text(42,457,'',11,'#bacbe2').setWordWrapWidth(740);
        this.contextTags=this.text(980,412,'',12,'#b6d7f5').setOrigin(1,0);
        this.contextPriority=this.text(980,456,'',10,'#91a9c6').setOrigin(1,0);
        this.panel(24, 721, 976, 28);
        this.logText = this.text(42, 727, '', 11, '#99a8bf').setWordWrapWidth(935);
        this.panels = {
            player: this.createStatus(24, 'PLAYER'),
            guard: this.createStatus(358, 'SCHOOL GUARD')
        };
        this.panel(692, 504, 308, 210);
        this.turnText = this.text(710, 516, '', 18, '#f5db91');
        // Six rows cover the five skills plus Back. Main menu uses three rows.
        this.buttons = Array.from({ length: 6 }, (_, index) => this.createMenuButton(index));
        this.text(24, 753, 'W/S or Arrows: select  A/D: back/open  Enter/Space: confirm  1-6: choose', 11, '#a8b6ce');
        const back = this.text(1000, 753, 'Return to room [Esc]', 11, '#f5db91')
            .setOrigin(1, 0).setInteractive({ useHandCursor: true });
        back.on('pointerdown', () => this.returnToRoom());
        const onKey = event => this.handleKey(event);
        this.input.keyboard.on('keydown', onKey);
        this.events.once('shutdown', () => {
            this.presentationSerial++;
            this.presentationBusy = false;
            this.input.keyboard.off('keydown', onKey);
            this.scale.off('resize', fit);
            this.time.removeAllEvents();
            this.tweens.killAll();
        });
        this.aiDebugOverlay = createGuardDebugOverlay(this);
        this.refresh();
        revealBattle(this,()=>{this.entryBusy=false;this.battleMusic=BattleMusic.forScene(this);this.refresh();});
    }

    createMenuButton(index) {
            const box = this.rect(846, 0, 272, 25, 0x28364d).setInteractive({ useHandCursor: true });
            const label = this.text(720, 0, '', 14).setOrigin(0, 0.5);
            const cost = this.text(974, 0, '', 10, '#b9c9e4').setOrigin(1, 0.5);
            box.on('pointerover', () => {
                this.highlightMenuEntry(index);
            });
            box.on('pointerdown', () => {this.highlightMenuEntry(index);this.activateMenuEntry(this.menuEntries()[index]);});
            return { box, label, cost };
    }

    text(x, y, value, size = 20, color = '#e7edf7') {
        const text = this.add.text(x, y, value, { fontFamily: 'monospace', fontSize: `${size}px`, color });
        this.ui.add(text);
        return text;
    }

    rect(x, y, width, height, color, alpha = 1) {
        const rectangle = this.add.rectangle(x, y, width, height, color, alpha);
        this.ui.add(rectangle);
        return rectangle;
    }

    panel(x, y, width, height) {
        return this.rect(x + width / 2, y + height / 2, width, height, 0x10192a, 0.96).setStrokeStyle(2, 0xb6c3d8);
    }

    createActor(id, x, floorY, color, name, nameY, barY) {
        const texture = initialBattleTexture(this, id);
        // Normalized frames share one scale and a foot-anchored origin. Keep a
        // placeholder only if even the idle asset failed to load.
        const y = floorY - BATTLE_CANVAS.characterHeight / 2;
        const shadow = this.add.ellipse(x, floorY + 2, id === 'player' ? 76 : 104, id === 'player' ? 12 : 14, 0x030712, 0.3);
        this.ui.add(shadow);
        const body = texture ? this.add.sprite(x, floorY, texture)
            .setOrigin(0.5, (BATTLE_CANVAS.baseline + 1) / BATTLE_CANVAS.height)
            : this.add.rectangle(x, y, 72, BATTLE_CANVAS.characterHeight, color);
        body.setScale(id === 'player' ? 1.18 : 1.13);
        this.ui.add(body);
        playBattleAction(this, body, id, 'idle');
        // The centered header names the encounter; keep the battlefield uncluttered.
        this.text(x - 96, barY, 'HP', 12).setOrigin(0, 0.5);
        this.text(x - 96, barY + 16, 'SP', 12).setOrigin(0, 0.5);
        this.rect(x - 70, barY, 140, 9, 0x090e18).setOrigin(0, 0.5);
        this.rect(x - 70, barY + 16, 140, 7, 0x090e18).setOrigin(0, 0.5);
        const hpBar = this.rect(x - 70, barY, 140, 9, 0x6ac48a).setOrigin(0, 0.5);
        const spBar = this.rect(x - 70, barY + 16, 140, 7, 0x6da8e2).setOrigin(0, 0.5);
        const status = this.text(x, barY + 31, '', 12).setOrigin(0.5).setStroke('#080c14', 3);
        return { x, y, body, shadow, floorY, restBodyY: body.y, color, hpBar, spBar, status, displayedHp: this.combat[id].hp, displayedSp: this.combat[id].sp };
    }

    createStatus(x, title) {
        this.panel(x, 504, 320, 210);
        this.text(x + 18, 518, title, 17, '#f5db91');
        const hpText = this.text(x + 18, 548, '', 17);
        const spText = this.text(x + 18, 590, '', 17);
        this.rect(x + 18, 576, 284, 10, 0x090e18).setOrigin(0, 0.5);
        this.rect(x + 18, 618, 284, 10, 0x090e18).setOrigin(0, 0.5);
        const hpBar = this.rect(x + 18, 576, 284, 10, 0x6ac48a).setOrigin(0, 0.5);
        const spBar = this.rect(x + 18, 618, 284, 10, 0x6da8e2).setOrigin(0, 0.5);
        const effects = this.text(x + 18, 636, '', 11, '#bec9dd').setWordWrapWidth(284);
        const defense = this.text(x + 18, 669, '', 10, '#9ab5d2');
        const resources = this.text(x + 18, 692, '', 11, '#d6c79d');
        return { hpText, spText, hpBar, spBar, effects, defense, resources };
    }

    update() {
        for (const actor of Object.values(this.actors ?? {})) {
            actor.shadow?.setPosition(actor.body.x, actor.floorY + actor.body.y - actor.restBodyY + 2);
        }
    }

    menuEntries() {
        return this.menu === 'skills' ? [...PLAYER_SKILLS, 'back'] : MAIN_MENU;
    }

    canInspectMenu() {return !this.entryBusy && !this.presentationBusy && !this.combat.player.stunned && this.combat.turnState===ROUND_STATES.WAITING_FOR_PLAYER;}

    highlightMenuEntry(index) {
        if(!this.canInspectMenu() || !this.menuEntries()[index])return;
        if(this.selected!==index)this.sfx?.play('uiMove');this.selected=index;this.refresh();
    }

    refreshContext() {
        if(!this.contextTitle)return;
        const context=this.canInspectMenu()?actionContext(this.menuEntries()[this.selected],this.combat.player,this.combat.getValidActions('player')):null;
        if(context){
            this.contextTitle.setText(context.title);
            this.contextDescription.setText(context.description);
            this.contextTags.setText(context.tags.map(t=>`[${t}]`).join(' '));
            this.contextDetails.setText([context.warning,context.details].filter(Boolean).join('   |   ')).setColor(context.warning?'#e5ac83':'#bacbe2');
            this.contextPriority?.setText(context.priority?`YOUR ACTION: ${context.priority}\nFAST > NORMAL > SLOW`:'');
        }else{
            this.contextTitle.setText('BATTLE');this.contextTags.setText('');
            this.contextDescription.setText(this.contextFeedback || this.combat.log.at(-1) || GAME_DIALOGUE.battle.introduction);
            this.contextDetails.setText('');
            this.contextPriority?.setText('');
        }
    }

    isMenuEntryEnabled(entry) {
        if (this.entryBusy || this.presentationBusy || this.combat.player.stunned || this.combat.turnState !== ROUND_STATES.WAITING_FOR_PLAYER || !entry) return false;
        if (entry === 'back' || entry === 'skills') return true;
        return this.combat.getValidActions('player').includes(entry);
    }

    activateMenuEntry(entry) {
        if (!this.isMenuEntryEnabled(entry)) {if(this.canInspectMenu()&&entry)this.sfx?.play('uiInvalid');return;}
        this.sfx?.play(entry==='back'?'uiCancel':'uiConfirm');
        if (entry === 'skills' || entry === 'back') {
            this.menu = entry === 'skills' ? 'skills' : 'main';
            this.selected = entry === 'back' ? 2 : 0;
            this.refresh();
        } else this.chooseAction(entry);
    }

    toggleGuardAI() {
        this.guardAI.toggle(); this.guardPolicy = this.guardAI.policy;
        this.refreshAI();
    }

    toggleAIDebug() { this.aiDebugOpen = !this.aiDebugOpen;if(this.aiDebugOpen)this.aiDebugAdvanced=false;this.refreshAI(); }
    toggleAIAdvanced(){this.aiDebugAdvanced=!this.aiDebugAdvanced;this.refreshAI();}

    refreshAI() {
        this.aiButton?.setText(`GUARD AI: ${this.guardAI.mode} [P]`);
        // Showing a chosen action is gated by the authoritative reveal state.
        const revealed = !!this.combat.round && !['WAITING_FOR_PLAYER', 'PLAYER_ACTION_SELECTED', 'ACTIONS_LOCKED'].includes(this.combat.turnState);
        this.aiDebugOverlay?.update(this.guardAI.debugView(this.combat.snapshot(), revealed), this.aiDebugOpen,this.aiDebugAdvanced);
    }

    handleKey(event) {
        if (event.repeat) return;
        if (event.code === 'KeyP') { event.preventDefault(); this.toggleGuardAI(); return; }
        if (event.code === 'F2') { event.preventDefault(); this.toggleAIDebug(); return; }
        if(this.aiDebugOpen&&event.code==='KeyA'){event.preventDefault();this.toggleAIAdvanced();return;}
        if (event.code === 'Escape' || event.code === 'Backspace') {
            event.preventDefault();
            if (this.menu === 'skills') {
                if(this.canInspectMenu())this.sfx?.play('uiCancel');
                this.menu = 'main';
                this.selected = 2;
                this.refresh();
            } else if (event.code === 'Escape') this.returnToRoom();
            return;
        }
        if (this.entryBusy || this.presentationBusy || this.combat.player.stunned || this.combat.turnState !== ROUND_STATES.WAITING_FOR_PLAYER) return;
        const entries = this.menuEntries();
        if (['ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(event.code)) {
            event.preventDefault();
            const step = ['ArrowDown', 'KeyS'].includes(event.code) ? 1 : -1;
            this.selected = (this.selected + step + entries.length) % entries.length;
            this.sfx?.play('uiMove');
            this.refresh();
        } else if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
            event.preventDefault();
            if (this.menu === 'skills') this.activateMenuEntry('back');
        } else if (event.code === 'KeyD' || event.code === 'ArrowRight') {
            event.preventDefault();
            if (entries[this.selected] === 'skills') this.activateMenuEntry('skills');
        } else if (event.code === 'Enter' || event.code === 'Space') {
            event.preventDefault();
            this.activateMenuEntry(entries[this.selected]);
        } else if (/^Digit[1-6]$/.test(event.code)) {
            const index=Number(event.code.slice(-1))-1;
            this.highlightMenuEntry(index);
            this.activateMenuEntry(entries[index]);
        }
    }

    refresh() {
        for (const id of ['player', 'guard']) {
            const actor = this.presentationState?.[id] ?? this.combat[id], panel = this.panels[id], nearby = this.actors[id];
            const visibleHp = this.presentationHealth?.[id] ?? actor.hp;
            panel.hpText.setText(`HP ${visibleHp} / ${actor.maxHp}`);
            panel.spText.setText(`SP ${actor.sp} / ${actor.maxSp}`);
            panel.hpBar.setScale(visibleHp / actor.maxHp, 1);
            panel.spBar.setScale(actor.sp / actor.maxSp, 1);
            if (nearby.displayedSp !== actor.sp) {
                this.tweens.killTweensOf(nearby.spBar);
                this.tweens.add({ targets: nearby.spBar, scaleX: actor.sp / actor.maxSp,
                    duration: TIMING.barTween, ease: 'Sine.Out' });
                nearby.displayedSp = actor.sp;
            }
            if (nearby.displayedHp !== visibleHp) {
                this.tweens.killTweensOf(nearby.hpBar);
                this.tweens.add({ targets: nearby.hpBar, scaleX: visibleHp / actor.maxHp,
                    duration: TIMING.barTween, ease: 'Sine.Out' });
                nearby.displayedHp = visibleHp;
            }
            const status = actor.status ? `${actor.status.name} (${actor.status.turns})` : '';
            nearby.status.setText([actor.status ? status : '', actor.offGuard ? 'OFF GUARD' : '', actor.defending ? 'DEFENDING' : '', actor.stunned ? 'STUNNED' : ''].filter(Boolean).join(' / '))
                .setColor(actor.offGuard ? STATUS_COLORS.DISTRACTED : actor.stunned ? STATUS_COLORS.STUN : STATUS_COLORS[actor.status?.name] ?? '#bec9dd');
            panel.effects.setText(statusBadges(actor,id));
            panel.defense?.setText(defendSummary(actor,id));
            panel.resources?.setText(id==='guard'?guardResources(actor):'');
        }
        const entries = this.menuEntries();
        if(!entries[this.selected])this.selected=0;
        this.buttons.forEach(({ box, label, cost }, index) => {
            const entry = entries[index];
            const enabled = this.isMenuEntryEnabled(entry);
            const y = this.menu === 'skills' ? 554 + index * 27 : 563 + index * 45;
            box.setY(y).setVisible(!!entry);
            label.setY(y).setVisible(!!entry).setFontSize(this.menu === 'skills' ? 12 : 19);
            cost.setY(y).setVisible(!!entry);
            box.input.enabled = this.canInspectMenu() && !!entry;
            const highlighted=this.canInspectMenu() && index===this.selected;
            box.setFillStyle(highlighted ? 0x485d7e : 0x202d43).setAlpha(enabled ? 1 : 0.55);
            box.setStrokeStyle?.(highlighted?2:1,highlighted?0xf5db91:0x35435b);
            const name = entry === 'skills' ? 'SKILLS >' : entry === 'back' ? '< BACK' : ACTIONS[entry]?.label ?? '';
            label.setAlpha(enabled ? 1 : 0.6).setText(`${highlighted ? '\u25b6' : ' '} ${index + 1}. ${name}`);
            cost.setAlpha(enabled ? 1 : 0.75).setColor(enabled?'#b9c9e4':'#d19a79').setText(ACTIONS[entry] ? `${ACTIONS[entry].priority} ${ACTIONS[entry].cost} SP` : '');
        });
        this.refreshAI();
        this.logText.setText(this.combat.log.slice(-1).join('\n'));
        const state = this.combat.turnState;
        this.turnText.setText(this.presentationBusy ? 'RESOLVING' : state === ROUND_STATES.WAITING_FOR_PLAYER ? (this.menu === 'skills' ? 'SKILLS [Esc: back]' : 'CHOOSE ACTION') : state.replaceAll('_', ' '));
        this.outcome.setText(!this.presentationBusy && [ROUND_STATES.VICTORY, ROUND_STATES.DEFEAT, ROUND_STATES.DRAW].includes(state) ? state : '');
        this.refreshContext();
    }

    floatFeedback(id, message, color, size = 20, lane = 0, duration = TIMING.feedbackFloat) {
        const actor = this.actors[id];
        const text = this.text(actor.x + 120, actor.y - 30 - lane * 28, message, size, color)
            .setOrigin(0.5).setAlign('center').setStroke('#101421', 4);
        const overlay = this.effects.track(text, duration);
        this.tweens.add({ targets: text, y: text.y - 28, alpha: 0, duration,
            ease: 'Sine.Out', onComplete: overlay.dispose });
    }

    showFeedback(result) {
        const lanes = { player: 0, guard: 0 };
        for (const event of result.events) {
            const id = event.targetId;
            switch (event.type) {
                case 'damage': {
                    const shake = event.blocked ? TIMING.blockedShake : event.critical ? TIMING.criticalShake : TIMING.normalShake;
                    const intensity = event.blocked ? 0.001 : event.critical ? 0.004 : 0.002;
                    this.cameras.main.shake(shake, intensity, true);
                    this.effects.pulse(id, event.critical ? 0xffb55e : 0xffffff,
                        event.critical ? TIMING.criticalFlash : TIMING.targetFlash);
                    const label = `${event.critical ? 'CRITICAL\n' : ''}-${event.damage}${event.blocked ? '\nBLOCKED' : ''}`;
                    this.floatFeedback(id, label, event.critical ? '#ffd574' : '#ffffff', event.critical ? 27 : 22, lanes[id]++);
                    break;
                }
                case 'miss': this.floatFeedback(id, 'MISS', '#c7d2e8', 22, lanes[id]++); break;
                case 'defending': this.floatFeedback(id, 'DEFENDING', '#9dd5ff', 18, lanes[id]++); break;
                case 'statusApplied':
                    this.effects.playStatusReaction(id, event.status);
                    this.floatFeedback(id, event.status, STATUS_COLORS[event.status], 19, lanes[id]++); break;
                case 'offGuardSkipped':
                    this.floatFeedback(id, 'OFF GUARD\nACTION LOST', STATUS_COLORS.DISTRACTED, 22, lanes[id]++); break;
                case 'offGuardApplied':
                    this.effects.playStatusReaction(id, 'DISTRACTED');
                    this.floatFeedback(id, 'OFF GUARD', STATUS_COLORS.DISTRACTED, 22, lanes[id]++); break;
                case 'stunApplied':
                    this.effects.playStatusReaction(id, 'STUN');
                    this.floatFeedback(id, 'STUNNED!', STATUS_COLORS.STUN, 32, lanes[id]++, TIMING.stunFeedbackHold); break;
                case 'turnSkipped':
                    this.floatFeedback(id, 'STUNNED\n\u2014 TURN SKIPPED', STATUS_COLORS.STUN, 28, lanes[id], TIMING.stunFeedbackHold);
                    lanes[id] += 2;
                    break;
                case 'statusRemoved':
                    if (event.reason !== 'consumed') this.floatFeedback(id, `${event.status} ENDED`, '#bec9dd', 14, lanes[id]++);
                    break;
                case 'restored': {
                    const label = [event.hp ? `+${event.hp} HP` : '', event.sp ? `+${event.sp} SP` : ''].filter(Boolean).join('\n');
                    if (label) {
                        if (!result.events.some(effect => effect.type === 'statusApplied' && effect.targetId === id)) {
                            this.effects.pulse(id, 0x9af0bb);
                        }
                        this.floatFeedback(id, label, '#8ee6aa', 18, lanes[id]++);
                    }
                    break;
                }
            }
        }
    }

    chooseAction(action) {
        if (this.entryBusy || this.presentationBusy || this.combat.turnState !== ROUND_STATES.WAITING_FOR_PLAYER) return;
        if (this.combat.player.stunned ? action !== null : !this.combat.getValidActions('player').includes(action)) return;
        const observation = this.combat.beginRound();
        // Guard sees the same pre-round data regardless of the selected action.
        const guardAction = observation.guard.offGuard ? null : this.guardPolicy.chooseAction(observation);
        if (!this.combat.lockActions(action, guardAction)) return;
        this.guardAI.recordDecision(observation, guardAction);
        this.menu = 'main'; this.selected = 0;
        void this.presentRoundReveal();
    }

    async presentRoundReveal() {
        this.presentationBusy = true;
        const serial = ++this.presentationSerial;
        const effects = this.effects ??= new PresentationEffects(this);
        const ordered = this.combat.revealActions();
        for (const {actorId, action} of ordered) effects.showActionBanner(actorId,
            ACTIONS[action] ? ACTIONS[action].label + ' / ' + ACTIONS[action].priority : actorId === 'guard' && this.combat.round.preRoundState.guard.offGuard ? 'OFF GUARD' : 'STUNNED', TIMING.actionReveal);
        this.refresh();
        if (!await waitBattlePresentation(this, TIMING.actionReveal) || serial !== this.presentationSerial || effects.closed) return;
        effects.clearPresentationOverlay();
        this.advanceResolution();
    }

    presentResult(result) { return presentBattleResult(this, result); }

    advanceResolution() {
        const result = this.combat.resolveNextAction();
        if (result) {
            if (result.skipped && !['stunned', 'offGuard'].includes(result.action)) { this.advanceResolution(); return; }
            void this.presentResult(result);
            return;
        }
        const round = this.combat.endRound();
        if (!round) return;
        this.presentationBusy = false;
        this.displayedState = this.combat.snapshot();
        for (const id of ['player','guard']) {
            const terminal = round.outcome;
            if (terminal) playBattleAction(this, this.actors[id].body, id,
                terminal === ROUND_STATES.DRAW ? 'defeat' : (id === 'player') === (terminal === ROUND_STATES.VICTORY) ? 'victory' : 'defeat', { returnToIdle:false });
            else restoreBattleStance(this, this.actors[id].body, id);
        }
        this.refresh();
        // A carried stun consumes the next opportunity without asking for a move.
        if (!round.outcome && this.combat.player.stunned) this.chooseAction(null);
        if(round.outcome)this.finishNarrativeBattle(round.outcome);
    }

    finishNarrativeBattle(outcome){
        if(this.narrativeOutcome)return;
        this.narrativeOutcome=outcome;this.runState.completeEncounter(this.encounterId,outcome);
        if(outcome==='VICTORY')this.sfx?.play('victory');else if(outcome==='DEFEAT')this.sfx?.play('defeat');
        this.narrativeTimer=this.time.delayedCall(1800,()=>this.returnToRoom());
    }

    returnToRoom() {
        if(this.leavingNarrative)return;this.leavingNarrative=true;this.narrativeTimer?.remove(false);
        const outcome=this.narrativeOutcome??'RETRY';this.runState.completeEncounter(this.encounterId,outcome);
        this.battleMusic?.leave(); // Stop battle BEFORE School resume starts hallway.
        this.scene.stop(this.returnScene);
        if(outcome==='VICTORY')this.scene.start('DayTransitionScene',{returnScene:this.returnScene});
        else this.scene.start(this.returnScene);
    }
}
