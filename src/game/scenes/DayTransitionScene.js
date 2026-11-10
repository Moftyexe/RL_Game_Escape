import {Scene} from 'phaser';
import {runStateForScene} from '../progression/RunState.js';
import SoundEffects,{preloadSfx} from '../audio/SoundEffects.js';
import {GAME_DIALOGUE} from '../dialogue/dialogueScript.js';
export default class DayTransitionScene extends Scene {
    constructor(){super('DayTransitionScene');}
    init({returnScene='SchoolScene'}={}){this.returnScene=returnScene;this.leaving=false;}
    preload(){preloadSfx(this);}
    create(){
        this.sfx=new SoundEffects(this);this.sfx.play('nextDay');
        const s=runStateForScene(this).snapshot(),w=this.scale.width,h=this.scale.height;
        this.cameras.main.setBackgroundColor('#080d18');this.cameras.main.fadeIn(350,0,0,0);
        this.add.text(w/2,h*.34,GAME_DIALOGUE.narrative.nextDay,{fontFamily:'monospace',fontSize:'22px',color:'#aebed5',letterSpacing:3}).setOrigin(.5);
        this.add.text(w/2,h*.46,`DAY ${s.dayNumber}`,{fontFamily:'monospace',fontSize:'64px',color:'#f5db91'}).setOrigin(.5);
        this.add.text(w/2,h*.61,GAME_DIALOGUE.narrative.readiness.replace('{readiness}',s.readinessName.toLowerCase()),{fontFamily:'monospace',fontSize:'20px',color:'#e5edf7'}).setOrigin(.5);
        this.time.delayedCall(1900,()=>this.finish());
    }
    finish(){if(this.leaving)return;this.leaving=true;this.cameras.main.fadeOut(350,0,0,0);this.time.delayedCall(350,()=>this.scene.start(this.returnScene));}
}
