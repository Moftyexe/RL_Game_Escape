// Pure mapping of already-resolved presentation events. Never rolls combat RNG.
export function actionStartSfx(action){return ({attack:['swing'],swingBackpack:['heavySwing'],defend:['brace'],catchBreath:['breath'],crackKnuckles:['crack'],blowWhistle:['whistle'],callWife:['phoneButton'],lookThere:['distracted']})[action]??[];}
export function resultSfx(result){
 const e=result.events,damage=e.find(x=>x.type==='damage'&&x.source!=='stumble');
 const cues=[];
 if(damage){cues.push(damage.blocked?'block':result.action==='talkSmack'?'smack':result.action==='swingBackpack'?'heavyHit':'hit');if(damage.critical)cues.push('critical');}
 else if(e.some(x=>x.type==='miss'))cues.push(result.action==='swingBackpack'?'heavySwing':'reveal');
 const status=e.some(x=>x.type==='stunApplied')?'stun':e.some(x=>x.type==='offGuardApplied')?'offGuard':e.find(x=>x.type==='statusApplied')?.status;
 const statusId=({FOCUSED:'focused',RILED:'riled',DISTRACTED:'distracted',stun:'stun',offGuard:'offGuard'})[status];
 if(statusId)cues.push(statusId);else if(e.some(x=>x.type==='restored'&&x.hp>0))cues.push('heal');
 return cues.slice(0,2);
}
export function playCues(sfx,ids){for(const id of ids)sfx?.play(id);}
