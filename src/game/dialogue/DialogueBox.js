import {portraitFor,PORTRAITS} from './portraits.js';
import {GAME_DIALOGUE} from './dialogueScript.js';
export const DIALOGUE_TIMING=Object.freeze({characterMs:30,inputDebounceMs:120,blinkMs:450});
export const DIALOGUE_LAYOUT=Object.freeze({x:36,y:558,width:952,height:180,portraitWidth:184,portraitHeight:164,portraitX:138,baseline:730});
export default class DialogueBox {
 constructor(scene,{portraits=PORTRAITS,onLock=()=>{}}={}){this.scene=scene;this.portraits={...PORTRAITS,...portraits};this.onLock=onLock;this.active=false;}
 start(lines,onComplete=()=>{}){
  if(this.active)return false;
  this.lines=(Array.isArray(lines)?lines:[]).filter(l=>typeof l?.text==='string'&&l.text.trim());if(!this.lines.length)this.lines=GAME_DIALOGUE.fallback;
  this.index=0;this.onComplete=onComplete;this.active=true;this.lastInput=-Infinity;this.onLock(true);
  const s=this.scene;this.root=s.add.container(0,0).setScrollFactor(0).setDepth(2000);
  const shade=s.add.rectangle(0,0,1024,768,0x030712,.32).setOrigin(0);
  const box=s.add.rectangle(36,558,952,180,0x101827,.99).setOrigin(0).setStrokeStyle(3,0xe7d19b);
  const inset=s.add.rectangle(42,564,940,168,0x101827,0).setOrigin(0).setStrokeStyle(1,0x53627e);
  this.name=s.add.text(250,575,'',{fontFamily:'monospace',fontSize:'17px',color:'#f5db91'});
  this.body=s.add.text(250,604,'',{fontFamily:'monospace',fontSize:'19px',color:'#eef2f7',wordWrap:{width:710},lineSpacing:4});
  this.indicator=s.add.text(966,710,'\u25bc',{fontFamily:'monospace',fontSize:'15px',color:'#f5db91'}).setOrigin(1,0).setVisible(false);
  this.root.add([shade,box,inset,this.name,this.body,this.indicator]);
  this.resize=()=>{const k=Math.min(s.scale.width/1024,s.scale.height/768);this.root.setScale(k).setPosition((s.scale.width-1024*k)/2,(s.scale.height-768*k)/2);};
  this.inputAdvance=()=>{const now=s.time?.now??performance.now();if(now-this.lastInput<DIALOGUE_TIMING.inputDebounceMs)return;this.lastInput=now;this.advance();};
  this.key=e=>{if(!e.repeat&&(['Space','Enter'].includes(e.code)||[' ','Enter'].includes(e.key))){e.preventDefault?.();this.inputAdvance();}};
  this.click=()=>this.inputAdvance();this.shutdown=()=>this.close(false);
  s.input.on('pointerdown',this.click);s.input.keyboard?.on('keydown',this.key);s.scale.on?.('resize',this.resize);s.events.once('shutdown',this.shutdown);
  s.sfx?.play('dialogueOpen');this.resize();this.render();return true;
 }
 render(){
  this.typeTimer?.remove(false);this.blinkTimer?.remove(false);this.indicator.setVisible(false);
  const line=this.lines[this.index],p=portraitFor(line.portrait??line.speaker,this.portraits);
  this.name.setText(line.name??portraitFor(line.speaker,this.portraits).name);this.body.setText('');this.image?.destroy();this.image=null;
  if(p.textureKey&&this.scene.textures.exists(p.textureKey))try{this.scene.textures.get?.(p.textureKey)?.setFilter?.(1);const image=this.scene.add.image(DIALOGUE_LAYOUT.portraitX,DIALOGUE_LAYOUT.baseline,p.textureKey).setOrigin(.5,1);image.setScale(Math.min(DIALOGUE_LAYOUT.portraitWidth/(image.width||184),DIALOGUE_LAYOUT.portraitHeight/(image.height||164)));this.root.add(image);this.image=image;}catch{}
  this.characters=Array.from(line.text);this.revealed=0;this.typing=true;
  const tick=()=>{if(!this.active||!this.typing)return;this.revealed++;this.body.setText(this.characters.slice(0,this.revealed).join(''));if(this.revealed%3===0&&this.characters[this.revealed-1].trim())this.scene.sfx?.play('dialogueTick');if(this.revealed>=this.characters.length)this.finishTyping();else this.typeTimer=this.scene.time.delayedCall(DIALOGUE_TIMING.characterMs,tick);};
  this.typeTimer=this.scene.time.delayedCall(DIALOGUE_TIMING.characterMs,tick);
 }
 finishTyping(){this.typeTimer?.remove(false);this.typing=false;this.body.setText(this.characters.join(''));this.indicator.setVisible(true);
  const blink=()=>{if(!this.active||this.typing)return;this.indicator.setVisible(!this.indicator.visible);this.blinkTimer=this.scene.time.delayedCall(DIALOGUE_TIMING.blinkMs,blink);};this.blinkTimer?.remove(false);this.blinkTimer=this.scene.time.delayedCall(DIALOGUE_TIMING.blinkMs,blink);
 }
 advance(){if(!this.active)return;if(this.typing){this.finishTyping();return;}this.scene.sfx?.play('dialogueAdvance');if(++this.index<this.lines.length)this.render();else this.close(true);}
 close(complete=false){if(!this.active)return;this.active=false;const s=this.scene;this.typeTimer?.remove(false);this.blinkTimer?.remove(false);
  s.input.off('pointerdown',this.click);s.input.keyboard?.off('keydown',this.key);s.scale.off?.('resize',this.resize);s.events.off('shutdown',this.shutdown);this.root.destroy();this.onLock(false);if(complete)this.onComplete();
 }
}
