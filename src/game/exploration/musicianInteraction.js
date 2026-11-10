import AudioSettingsMenu from '../audio/AudioSettingsMenu.js';
import {getDialogue} from '../dialogue/dialogueScript.js';
export function addMusicianInteraction(scene,sprite,placement,radius){
 if(!sprite)return false;
 scene.interactions.add({id:'hallway-musician',x:placement.x,y:placement.y,radius,prompt:'Press SPACE for audio settings',onInteract:()=>{
  if(scene.inputLocked||scene.gateBusy)return;
  scene.inputLocked=true;scene.interactionPrompt.setVisible(false);
  const direction=['left','right'].includes(scene.facing)?'side':scene.facing;scene.player.play(`idle-${direction}`,true);
  scene.storyDialogue.start(getDialogue('musicGuy.greeting'),()=>{scene.inputLocked=true;scene.audioMenu??=new AudioSettingsMenu(scene);scene.audioMenu.open(()=>{scene.inputLocked=false;scene.keys.interact.reset?.();if('fresh'in scene.keys.interact)scene.keys.interact.fresh=false;});});
 }});return true;
}
