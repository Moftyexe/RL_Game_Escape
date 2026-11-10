import { HALLWAY_MUSIC_KEY } from './hallwayAssets.js';
import { HALLWAY_MUSIC_VOLUME } from '../audio/musicConfig.js';
import {audioSettingsFor,setTrackVolume} from '../audio/AudioSettings.js';
export { HALLWAY_MUSIC_VOLUME } from '../audio/musicConfig.js';
const sessions = new WeakMap();
const battleManagers = new WeakSet();

// One track and preference per game's SoundManager. Pause preserves position.
export default class HallwayMusic {
    static setBattleActive(sound,active){
        if(active)battleManagers.add(sound);else battleManagers.delete(sound);
        const music=sessions.get(sound);
        if(active)music?.pause();else music?.start();
    }
    static forScene(scene) {
        if (!sessions.has(scene.sound)) sessions.set(scene.sound, new HallwayMusic(scene.sound));
        const music = sessions.get(scene.sound);
        music.attach(scene);
        return music;
    }
    constructor(sound) { this.sound = sound; this.enabled = true; this.exploring = false; this.track = null;this.settings=audioSettingsFor(sound);this.settings.subscribe(()=>setTrackVolume(this.track,this.settings.music('hallwayMusic'))); }
    attach(scene) {
        this.detach?.();
        this.scene = scene; this.exploring = true;
        const attempt = () => this.start();
        const pause = () => { this.exploring = false; this.pause(); };
        const resume = () => { this.exploring = true; this.start(); };
        scene.input.on('pointerdown', attempt);
        scene.input.keyboard?.on('keydown', attempt);
        this.sound.on?.('unlocked', attempt);
        scene.events.on('pause', pause);
        scene.events.on('resume', resume);
        const detach = () => {
            pause();
            scene.input.off('pointerdown', attempt);
            scene.input.keyboard?.off('keydown', attempt);
            this.sound.off?.('unlocked', attempt);
            scene.events.off('pause', pause); scene.events.off('resume', resume);
            scene.events.off('shutdown', detach);
            if (this.detach === detach) this.detach = null;
        };
        this.detach = detach;
        scene.events.once('shutdown', detach);
        this.start();
    }
    start() {
        if (!this.enabled || !this.exploring || battleManagers.has(this.sound) || this.sound.locked || this.sound.noAudio) return false;
        try {
            if (!this.scene?.cache.audio.exists(HALLWAY_MUSIC_KEY)) return false;
            const volume=this.settings.music('hallwayMusic');
            this.track ??= this.sound.get(HALLWAY_MUSIC_KEY) ?? this.sound.add(HALLWAY_MUSIC_KEY, { loop: true, volume });setTrackVolume(this.track,volume);
            if (this.track.isPlaying) return true;
            return this.track.isPaused ? this.track.resume() : this.track.play({ loop: true, volume });
        } catch { return false; } // Missing/undecodable audio never blocks play.
    }
    pause() { try { if (this.track?.isPlaying) this.track.pause(); } catch { /* Optional audio. */ } }
    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) this.start(); else this.pause();
        return this.enabled;
    }
}
