import manifest from '../../../public/assets/audio/battle-manifest.json' with{type:'json'};
import HallwayMusic from '../exploration/HallwayMusic.js';
import{BATTLE_MUSIC_KEY,BATTLE_MUSIC_VOLUME}from'./musicConfig.js';
import{audioSettingsFor,setTrackVolume}from'./AudioSettings.js';
const sessions=new WeakMap();
export function preloadBattleMusic(scene,assets=manifest){
    if(assets.music?.file)scene.load.audio(BATTLE_MUSIC_KEY,`${import.meta.env?.BASE_URL??'./'}${assets.music.file}`);
}
// One cached instance, restarted per battle. Hallway keeps its seek/preference.
export default class BattleMusic{
    static forScene(scene){
        if(!sessions.has(scene.sound))sessions.set(scene.sound,new BattleMusic(scene.sound));
        const music=sessions.get(scene.sound);music.attach(scene);return music;
    }
    constructor(sound){this.sound=sound;this.track=null;this.active=false;this.settings=audioSettingsFor(sound);this.settings.subscribe(()=>setTrackVolume(this.track,this.settings.music('battleMusic')));}
    attach(scene){
        this.detach?.();this.scene=scene;this.active=true;this.suspended=false;
        HallwayMusic.setBattleActive(this.sound,true);
        const attempt=()=>this.start(),pause=()=>{this.suspended=true;this.pause();},resume=()=>{this.suspended=false;this.start();};
        const detach=()=>{this.leave();scene.input.off('pointerdown',attempt);scene.input.keyboard?.off('keydown',attempt);this.sound.off?.('unlocked',attempt);
            scene.events.off('pause',pause);scene.events.off('resume',resume);scene.events.off('shutdown',detach);if(this.detach===detach)this.detach=null;};
        this.detach=detach;
        scene.input.on('pointerdown',attempt);scene.input.keyboard?.on('keydown',attempt);this.sound.on?.('unlocked',attempt);
        scene.events.on('pause',pause);scene.events.on('resume',resume);scene.events.once('shutdown',detach);
        this.start();
    }
    start(){
        if(!this.active||this.suspended||this.sound.locked||this.sound.noAudio)return false;
        try{
            if(!this.scene?.cache.audio.exists(BATTLE_MUSIC_KEY))return false;
            const volume=this.settings.music('battleMusic');this.track??=this.sound.get(BATTLE_MUSIC_KEY)??this.sound.add(BATTLE_MUSIC_KEY,{loop:true,volume});setTrackVolume(this.track,volume);
            if(this.track.isPlaying)return true;
            return this.track.isPaused?this.track.resume():this.track.play({loop:true,volume});
        }catch{return false;}
    }
    pause(){try{if(this.track?.isPlaying)this.track.pause();}catch{/* Optional audio. */}}
    leave(){
        this.active=false;
        try{this.track?.stop();}catch{/* Optional audio. */}
        HallwayMusic.setBattleActive(this.sound,false);
    }
}
