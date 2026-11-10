export const BATTLE_ENTRY_TIMING=Object.freeze({pause:200,close:420,black:80,reveal:220});
function bars(scene){
 const w=scene.scale.width,h=scene.scale.height,root=scene.add.container(0,0).setScrollFactor(0).setDepth(10000);
 const top=scene.add.rectangle(0,0,w,h/2+1,0x000000).setOrigin(0,0),bottom=scene.add.rectangle(0,h,w,h/2+1,0x000000).setOrigin(0,1);root.add([top,bottom]);return {root,top,bottom};
}
// Short, stepped horizontal shutters, deliberately different from the day card.
export default class BattleEntryTransition{
 constructor(scene){this.scene=scene;this.started=false;this.closed=false;this.timers=[];this.cleanup=()=>this.destroy();scene.events.once('shutdown',this.cleanup);}
 later(ms,fn){this.timers.push(this.scene.time.delayedCall(ms,()=>{if(!this.closed)fn();}));}
 start(onBlack){if(this.started||this.closed)return false;this.started=true;
  this.later(BATTLE_ENTRY_TIMING.pause,()=>{this.scene.sfx?.play('wipe');this.cover=bars(this.scene);this.cover.top.setScale(1,0);this.cover.bottom.setScale(1,0);
   this.tween=this.scene.tweens.add({targets:[this.cover.top,this.cover.bottom],scaleY:1,duration:BATTLE_ENTRY_TIMING.close,ease:'Stepped',easeParams:[8],onComplete:()=>{if(!this.closed)this.later(BATTLE_ENTRY_TIMING.black,onBlack);}});
  });return true;
 }
 destroy(){if(this.closed)return;this.closed=true;for(const t of this.timers)t.remove(false);this.tween?.stop();this.cover?.root.destroy();this.scene.events.off('shutdown',this.cleanup);}
}
export function revealBattle(scene,onComplete=()=>{}){
 const cover=bars(scene);let closed=false;
 const cleanup=()=>{if(closed)return;closed=true;tween?.stop();cover.root.destroy();scene.events.off('shutdown',cleanup);};let tween;
 scene.events.once('shutdown',cleanup);scene.sfx?.play('reveal');
 tween=scene.tweens.add({targets:[cover.top,cover.bottom],scaleY:0,duration:BATTLE_ENTRY_TIMING.reveal,ease:'Stepped',easeParams:[8],onComplete:()=>{if(closed)return;cleanup();onComplete();}});
 return cleanup;
}
