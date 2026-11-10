import manifest from '../../../public/assets/audio/sfx/manifest.json' with {type:'json'};
import {audioSettingsFor,setTrackVolume} from './AudioSettings.js';
export const SFX=Object.freeze(manifest);
export const SFX_VOLUMES=Object.freeze({ui:.22,dialogue:.10,footsteps:.09,combat:.38,status:.25,transition:.30});
export const FOOTSTEP_DISTANCE=128;
export function preloadSfx(scene){for(const a of Object.values(SFX))if(!scene.cache?.audio?.exists(a.key))scene.load.audio(a.key,`${import.meta.env?.BASE_URL??'./'}${a.file}`);}
// Bounded, scene-owned reusable voices. Locked-browser effects are dropped, never
// queued to burst after unlock. The next interaction plays normally after unlock.
export default class SoundEffects{
 constructor(scene){this.scene=scene;this.voices=new Map();this.last=new Map();this.closed=false;this.footDistance=0;this.footIndex=0;
  this.settings=audioSettingsFor(scene.sound);this.unsubscribe=this.settings.subscribe(()=>{for(const[id,voice]of this.voices)setTrackVolume(voice,this.volume(SFX[id]));});
  this.cleanup=()=>this.destroy();this.pause=()=>this.stop();scene.events?.once('shutdown',this.cleanup);scene.events?.on('pause',this.pause);
 }
 play(id){const a=SFX[id],s=this.scene,sound=s.sound;if(this.closed||!a||!sound||sound.noAudio||sound.locked)return false;
  const now=s.time?.now??performance.now(),cooldown=a.category==='dialogue'?75:a.category==='ui'?45:60;
  if(now-(this.last.get(id)??-Infinity)<cooldown)return false;
  try{if(!s.cache?.audio?.exists(a.key))return false;
   if([...this.voices.values()].filter(v=>v.isPlaying).length>=8)return false;
   let voice=this.voices.get(id);if(!voice){voice=sound.add(a.key);this.voices.set(id,voice);if(a.maxDuration)voice.addMarker({name:'short',start:0,duration:Math.min(a.maxDuration,a.metadata.duration),config:{loop:false}});}
   if(voice.isPlaying)voice.stop();this.last.set(id,now);const config={volume:this.volume(a),loop:false};
   return a.maxDuration?voice.play('short',config):voice.play(config);
  }catch{return false;}
 }
 volume(a){return a.category==='footsteps'?.30*this.settings.get('footsteps')*a.gain:SFX_VOLUMES[a.category]*this.settings.get('sfx')*a.gain;}
 step(distance){this.footDistance+=Math.max(0,distance);if(this.footDistance>=FOOTSTEP_DISTANCE){this.footDistance%=FOOTSTEP_DISTANCE;this.play(['foot1','foot2','foot3'][this.footIndex++%3]);}}
 stop(){for(const v of this.voices.values())try{v.stop();}catch{}this.footDistance=0;}
 destroy(){if(this.closed)return;this.closed=true;this.unsubscribe?.();this.stop();for(const v of this.voices.values())try{v.destroy();}catch{}this.voices.clear();this.scene.events?.off('pause',this.pause);this.scene.events?.off('shutdown',this.cleanup);}
}
