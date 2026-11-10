const sessions=new WeakMap();
export const AUDIO_DEFAULTS=Object.freeze({hallwayMusic:.35,battleMusic:.35,sfx:1,footsteps:.30,musicMuted:false});
const KEY='school-escape-audio-v1';
function storage(){try{return globalThis.localStorage;}catch{return null;}}
export default class AudioSettings{
 constructor(store=storage()){this.store=store;this.values={...AUDIO_DEFAULTS};this.listeners=new Set();try{const saved=JSON.parse(store?.getItem(KEY)??'null');if(saved)for(const k of Object.keys(AUDIO_DEFAULTS))if(k==='musicMuted'){this.values[k]=saved[k]===true;}else if(Number.isFinite(saved[k]))this.values[k]=Math.max(0,Math.min(1,saved[k]));}catch{}}
 get(k){return this.values[k];}
 set(k,value){if(!(k in AUDIO_DEFAULTS))return;this.values[k]=k==='musicMuted'?!!value:Math.max(0,Math.min(1,Number.isFinite(Number(value))?Number(value):this.values[k]));try{this.store?.setItem(KEY,JSON.stringify(this.values));}catch{}for(const fn of this.listeners)fn(this.values);}
 music(k){return this.values.musicMuted?0:this.values[k];}
 subscribe(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
}
export function audioSettingsFor(sound){if(!sound||!['object','function'].includes(typeof sound))return new AudioSettings(null);if(!sessions.has(sound))sessions.set(sound,new AudioSettings());return sessions.get(sound);}
export function setTrackVolume(track,value){if(!track)return;if(track.setVolume)track.setVolume(value);else track.volume=value;}
