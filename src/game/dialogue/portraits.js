// Runtime copies are byte-identical to the inspected original portrait PNGs.
import {SPEAKERS} from './dialogueScript.js';
export const PORTRAITS = SPEAKERS;
export function preloadPortraits(scene,registry=PORTRAITS){for(const p of Object.values(registry))if(p?.file&&p.textureKey)scene.load.image(p.textureKey,`${import.meta.env?.BASE_URL??'./'}${p.file}`);}
export function portraitFor(speaker,registry=PORTRAITS){return registry[speaker]??{name:String(speaker??'Narrator'),textureKey:null,file:null};}
