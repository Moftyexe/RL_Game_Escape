import {STATE_SCHEMA_VERSION} from '../ai/schema.js';
const readable=value=>String(value??'None').toLowerCase().replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
export function rankedDebugActions(view){return view.actions.filter(a=>a.valid&&a.visits>0).slice().sort((a,b)=>b.q-a.q);}
export function debugSituation(key){const t=String(key).split('|'),find=p=>t.find(x=>x.startsWith(p))?.slice(p.length);
 return [`Guard health:   ${readable(find('GHP_'))}`,`Player health:  ${readable(find('PHP_'))}`,`Guard SP:       ${readable(find('GSP_'))}`,`Player SP:      ${readable(find('PSP_'))}`,`Guard status:   ${readable(find('G_'))}`,`Player status:  ${readable(find('P_'))}`,`Donut:          ${find('DONUT_')==='UNAVAILABLE'?'Used':'Available'}`,`Call Wife:      ${find('W')==='1'?'Available':'Used'}`,`Player stunned: ${find('PSTUN')==='1'?'Yes':'No'}`,`Last Player move: ${readable(find('PREV_'))}`];
}
export function guardDebugSections(view){
 const rank=rankedDebugActions(view),weights=view.narrative?.distribution??[1],names=['Best learned move','Second-best move','Third-best move'];
 const header=[`Day ${view.narrative?.dayNumber??1} / Guard readiness: ${view.narrative?.readinessName??'Not set'}`,`AI: ${view.mode==='Q-LEARNING'?'Q-Learning':'Random'} / Learning during battle: OFF`];
 const left=['HOW THE GUARD CHOOSES',...(view.mode==='RANDOM'?['Randomly picks an available move.','Readiness ranking is not active.']:weights.map((n,i)=>`${names[i]??'Other'}: ${Math.round(n*100)}%`)),...(view.mode==='RANDOM'?[]:['(Uses available learned moves.)']),'','CURRENT SITUATION',...debugSituation(view.stateKey)];
 const actions=[...rank,...view.actions.filter(a=>!rank.includes(a))].map(a=>{const i=rank.indexOf(a),rating=!a.valid?'Unavailable':!a.visits?'Not learned yet':i===0?'Best':i<3?'Good':i===3?'Fair':'Low';return `${i===0?'\u2605':' '} ${readable(a.label).padEnd(17)} ${rating}`;});
 const right=['LEARNED OPTIONS',...actions,'',view.fallback?'No learned option here.':'',view.fallback?'Using safe Random fallback.':'','Guard move:',view.revealed?(view.forced?'Off guard (forced skip)':readable(view.chosen)):'Hidden until reveal'];
 return {header,left,right,ordered:[...rank,...view.actions.filter(a=>!rank.includes(a))]};
}
export function formatGuardDebug(view,advanced=false){
 const p=guardDebugSections(view);if(!advanced)return ['GUARD AI',...p.header,...p.left,...p.right].filter(Boolean).join('\n');
 const rank=rankedDebugActions(view),weights=view.narrative?.distribution??[1],sum=weights.slice(0,Math.min(3,rank.length)).reduce((a,b)=>a+b,0);
 return ['GUARD AI / ADVANCED',...p.header,`Schema: ${STATE_SCHEMA_VERSION} / EVAL / epsilon 0`,view.loadStatus,`Escapes ${view.narrative?.successfulEscapes??0} / Tier ${view.narrative?.readinessTier??1}`,
  `Rank weights: ${weights.map((n,i)=>`#${i+1} ${Math.round(n*100)}%`).join(' / ')}`,
  `Applied ranks: ${rank.slice(0,3).map((a,i)=>`${a.label} ${sum?((weights[i]??0)/sum*100).toFixed(1):0}%`).join(' / ')}`,
  `State: ${view.stateKey}`,'',...view.actions.map(a=>`${a.label.padEnd(17)} ${!a.valid?'Unavailable':!a.visits?'UNVISITED':`Q ${a.q.toFixed(2)}  N ${a.visits}`}`),'',
  'Q-value: how valuable training believes this move is here.',
  'Training visits (N): times tried from this learned state.',view.fallback?'Q state unseen - Random fallback':'',view.revealed?`Chosen: ${view.forced?'OFF GUARD (forced skip)':view.chosen??'none'}`:'Chosen: hidden until reveal'].filter(Boolean).join('\n');
}
export function createGuardDebugOverlay(scene){
 const overlay=scene.add.container(152,104),box=scene.add.rectangle(0,0,720,454,0x070c16,.98).setOrigin(0).setStrokeStyle(2,0xb6c3d8).setInteractive();
 const style={fontFamily:'monospace',fontSize:'13px',color:'#e7edf7',lineSpacing:3,wordWrap:{width:328}};
 const title=scene.add.text(20,14,'GUARD AI',{...style,fontSize:'20px',color:'#f5db91'}),head=scene.add.text(20,46,'',{...style,wordWrap:{width:680}}),left=scene.add.text(20,103,'',style),right=scene.add.text(378,103,'LEARNED OPTIONS',style),technical=scene.add.text(20,103,'',{...style,fontSize:'12px',wordWrap:{width:680,useAdvancedWrap:true}});
 const options=Array.from({length:6},(_,i)=>scene.add.text(378,129+i*22,'',style)),footer=scene.add.text(378,286,'',style);
 const toggle=scene.add.text(698,18,'ADVANCED [A]',{...style,fontSize:'11px',color:'#b7cee7'}).setOrigin(1,0).setInteractive({useHandCursor:true});toggle.on('pointerdown',()=>scene.toggleAIAdvanced());
 overlay.add([box,title,head,left,right,...options,footer,technical,toggle]);scene.ui.add(overlay);overlay.setVisible(false);
 return {update(view,visible,advanced=false){overlay.setVisible(visible);if(!visible)return;const p=guardDebugSections(view);head.setText(p.header.join('\n'));left.setText(p.left.join('\n')).setVisible(!advanced);right.setVisible(!advanced);for(let i=0;i<options.length;i++)options[i].setText(p.right[i+1]??'').setVisible(!advanced).setColor(!p.ordered[i]?.valid?'#8290a5':i===0&&p.ordered[i]?.visits?'#f5db91':'#e7edf7');footer.setText(p.right.slice(7).filter(Boolean).join('\n')).setVisible(!advanced);technical.setText(advanced?formatGuardDebug(view,true).split('\n').slice(3).join('\n'):'').setVisible(advanced);toggle.setText(advanced?'SIMPLE VIEW [A]':'ADVANCED [A]');}};
}
