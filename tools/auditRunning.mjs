import sharp from 'sharp';
import { auditLabel } from './auditLabels.mjs';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { playerAnimations } from '../src/game/exploration/explorationTestHarness.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const before=process.argv.includes('--before');
const output=path.join(root,before?'docs/run-audit-before':'public/assets/player/movement/run-audit');
const hash=data=>createHash('sha256').update(data).digest('hex');
const runManifest=JSON.parse(await readFile(path.join(root,'public/assets/player/movement/run-manifest.json'),'utf8'));
const processing=JSON.parse(await readFile(path.join(root,'public/assets/player/movement/processing-report.json'),'utf8'));
const processor=await readFile(path.join(root,'tools/processPlayerSprites.mjs'),'utf8');
const configs=[];playerAnimations.createPlayerAnimations({textures:{get:()=>({setFilter(){}})},anims:{exists:()=>false,create:config=>configs.push(config)}});
const loaded=[];playerAnimations.preloadPlayer({load:{image:(key,url)=>loaded.push({key,url})}});
function bounds(data,width,height) {
 let left=width,right=-1,top=height,bottom=-1,pixels=0;
 for(let p=0;p<width*height;p++)if(data[p*4+3]){pixels++;const x=p%width,y=Math.floor(p/width);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 let sum=0,weight=0;for(let y=top;y<Math.min(top+60,height);y++)for(let x=0;x<width;x++){const alpha=data[(y*width+x)*4+3];sum+=(x+.5)*alpha;weight+=alpha;}
 return {left,top,width:right-left+1,height:bottom-top+1,baseline:bottom,centerX:(left+right+1)/2,headCenterX:+(sum/weight).toFixed(3),pixels};
}
// Independent alpha-component scan verifies the processor's recorded crops.
function poses(data,width,height,threshold,region) {
 const seen=new Uint8Array(width*height),queue=new Int32Array(width*height),items=[];
 const inside=p=>!region||(Math.floor(p/width)>=region.top&&Math.floor(p/width)<region.top+region.height);
 for(let start=0;start<seen.length;start++){
  if(seen[start]||!inside(start)||data[start*4+3]<threshold)continue;
  let head=0,tail=1,left=width,right=0,top=height,bottom=0;queue[0]=start;seen[start]=1;
  while(head<tail){const p=queue[head++],x=p%width,y=Math.floor(p/width);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||nx>=width||ny<0||ny>=height)continue;const n=ny*width+nx;if(!seen[n]&&inside(n)&&data[n*4+3]>=threshold){seen[n]=1;queue[tail++]=n;}}
  }
  if(tail>=10000){const crop={left,top,width:right-left+1,height:bottom-top+1},isolated=Buffer.alloc(crop.width*crop.height*4);
   for(let i=0;i<tail;i++){const p=queue[i],target=((Math.floor(p/width)-top)*crop.width+p%width-left)*4;data.copy(isolated,target,p*4,p*4+4);}
   const item={bounds:crop,isolatedSha256:hash(isolated),pixels:tail};Object.defineProperty(item,'isolated',{value:isolated,enumerable:false});items.push(item);
  }
 }
 return items.sort((a,b)=>a.bounds.left-b.bounds.left);
}
function diff(a,b){let union=0,changed=0,silhouette=0,total=0;for(let p=0;p<a.length;p+=4){const aa=a[p+3]>0,bb=b[p+3]>0;if(!aa&&!bb)continue;union++;if(aa!==bb)silhouette++;let delta=0;for(let c=0;c<4;c++)delta=Math.max(delta,Math.abs(a[p+c]-b[p+c]));if(delta>32)changed++;for(let c=0;c<4;c++)total+=Math.abs(a[p+c]-b[p+c]);}return {changedPercent:+(100*changed/union).toFixed(2),silhouetteChangedPercent:+(100*silhouette/union).toFixed(2),normalizedMeanDifference:+(total/(union*4*255)).toFixed(4)};}
const candidates=[];
for(const filename of (await readdir(path.join(root,'P_Animations'))).filter(n=>/run/i.test(n)&&/\.png$/i.test(n))){
 const bytes=await readFile(path.join(root,'P_Animations',filename)),metadata=await sharp(bytes).metadata();const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const sheet=processing.sheets.find(s=>s.source===filename),threshold=sheet?.animation==='run_side'?16:1;
 const region=sheet?.analysisRegion??null,detected=poses(data,info.width,info.height,threshold,region);
 candidates.push({filename,dimensions:[info.width,info.height],bytes:bytes.length,sha256:hash(bytes),hasAlpha:metadata.hasAlpha,sheetAlphaBounds:bounds(data,info.width,info.height),referencedByProcessor:processor.includes(filename),animation:sheet?.animation??null,threshold,analysisRegion:region,poses:detected});
}
const animations=[],layers=[],comparisonLayers=[];
for(const [row,folder] of ['run_side','run_down','run_up'].entries()){
 const config=configs.find(c=>c.key===folder.replace('_','-')),sheet=processing.sheets.find(s=>s.animation===folder),source=candidates.find(c=>c.filename===sheet.source);
 const files=(await readdir(path.join(root,'public/assets/player/movement',folder))).filter(n=>/^\d+\.png$/.test(n)).sort((a,b)=>parseInt(a)-parseInt(b));
 const frames=[],raw=[];
 for(const [position,registered] of config.frames.entries()){
  const load=loaded.find(l=>l.key===registered.key);const match=load.url.match(/(assets\/player\/movement\/[^?]+)(?:\?|$)/);const file=match[1],index=parseInt(path.basename(file));const png=await readFile(path.join(root,'public',file));const {data,info}=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});raw.push(data);
  frames.push({position,index,file:'public/'+file,textureKey:registered.key,sha256:hash(png),rawSha256:hash(data),alphaBounds:bounds(data,info.width,info.height),sourcePose:source.poses[runManifest.animations[folder].frames[position].sourcePoseIndex],
   sourceCropMatchesManifest:source.poses[index].isolatedSha256===runManifest.animations[folder].frames[position].sourceCropSha256,durationMs:registered.duration||1000/config.frameRate});
  layers.push({input:png,left:position*256,top:row*300+40});
  const crop=source.poses[index];
  const sourcePreview=await sharp(crop.isolated,{raw:{width:crop.bounds.width,height:crop.bounds.height,channels:4}}).resize({width:248,height:240,fit:'inside',kernel:'nearest'}).png().toBuffer();
  comparisonLayers.push({input:sourcePreview,left:position*256+4,top:row*600+40});
  comparisonLayers.push({input:png,left:position*256,top:row*600+340});
 }
 const transitions=frames.map((frame,i)=>({from:frame.index,to:frames[(i+1)%frames.length].index,...diff(raw[i],raw[(i+1)%raw.length])}));
 const pairs=[],duplicates=[],pixelDuplicates=[];
 for(let i=0;i<frames.length;i++)for(let j=i+1;j<frames.length;j++){
  const comparison=diff(raw[i],raw[j]);if(frames[i].sha256===frames[j].sha256)duplicates.push([frames[i].index,frames[j].index]);if(frames[i].rawSha256===frames[j].rawSha256)pixelDuplicates.push([frames[i].index,frames[j].index]);
  if(comparison.silhouetteChangedPercent<15||comparison.changedPercent<15)pairs.push({frames:[frames[i].index,frames[j].index],...comparison});
 }
 animations.push({folder,source:source.filename,sourceSha256:source.sha256,sourceMatchesProcessingReport:source.sha256===sheet.sha256,sourcePoseCount:source.poses.length,processedCount:files.length,fps:config.frameRate,skipMissedFrames:config.skipMissedFrames??true,repeat:config.repeat,playbackOrder:frames.map(f=>f.index),frames,exactDuplicates:duplicates,pixelExactDuplicates:pixelDuplicates,contiguousFiles:files.every((file,i)=>file===i+'.png'),
   cropsMatchManifest:frames.every(frame=>frame.sourceCropMatchesManifest),noSkippedOrReusedIndexes:new Set(frames.map(f=>f.index)).size===source.poses.length&&frames.length===source.poses.length,
   geometry:{headTopRange:[Math.min(...frames.map(f=>f.alphaBounds.top)),Math.max(...frames.map(f=>f.alphaBounds.top))],visibleFootRange:[Math.min(...frames.map(f=>f.alphaBounds.baseline)),Math.max(...frames.map(f=>f.alphaBounds.baseline))],headCenterRange:[Math.min(...frames.map(f=>f.alphaBounds.headCenterX)),Math.max(...frames.map(f=>f.alphaBounds.headCenterX))]},nearDuplicates:pairs,transitions});
}
const report={phase:before?'before fixes':'final',metric:'Changed pixels: max RGBA difference >32, divided by union of visible pixels. Silhouette: alpha occupancy XOR / visible union. All adjacent pairs include loop closure. Near-duplicate flag: silhouette or pixel changed percentage <15; diagnostic, not proof of identical art.',candidates,animations};
await mkdir(path.dirname(output),{recursive:true});await writeFile(output+'.json',JSON.stringify(report,null,2)+'\n');
let md='# Running source-to-playback audit\n\n'+report.metric+'\n\n## Candidate sources\n\n';
for(const source of candidates){md+=`### ${source.filename}\n\n${source.dimensions.join('x')}; ${source.bytes} bytes; alpha ${source.hasAlpha}; poses ${source.poses.length}; processor referenced ${source.referencedByProcessor}; runtime ${source.animation??'not selected'}.\n\nSHA-256: ${source.sha256}\n\nFull-sheet alpha bounds: ${JSON.stringify(source.sheetAlphaBounds)}\n\nDetection threshold ${source.threshold}; analysis region ${JSON.stringify(source.analysisRegion)}.\n\n`+source.poses.map((p,i)=>`Pose ${i}: bounds ${JSON.stringify(p.bounds)}; isolated RGBA crop SHA-256 ${p.isolatedSha256}`).join('\n\n')+'\n\n';}
for(const animation of animations){md+=`## ${animation.folder.toUpperCase()}\n\nSource: ${animation.source}\n\nSource SHA-256: ${animation.sourceSha256}\n\nSource matches processor report: ${animation.sourceMatchesProcessingReport}. Poses ${animation.sourcePoseCount}; processed ${animation.processedCount}; FPS ${animation.fps}; repeat ${animation.repeat}; skipMissedFrames ${animation.skipMissedFrames}.\n\nPlayback order: ${animation.playbackOrder.join(',')}\n\nRaw-pixel exact duplicates: ${JSON.stringify(animation.pixelExactDuplicates)}. Contiguous files: ${animation.contiguousFiles}; crops verified against manifest: ${animation.cropsMatchManifest}; indexes used once: ${animation.noSkippedOrReusedIndexes}. Geometry: ${JSON.stringify(animation.geometry)}.

Exact duplicates: ${animation.exactDuplicates.length?JSON.stringify(animation.exactDuplicates)+' EXACT DUPLICATE':'none'}.\n\nNear-duplicate candidates: ${JSON.stringify(animation.nearDuplicates)}\n\n### Exact runtime frames\n\n`;
 for(const f of animation.frames)md+=`Frame ${f.index} (playback position ${f.position})\n\nFile: ${f.file}\n\nSHA-256: ${f.sha256}\n\nPhaser key: ${f.textureKey}; duration ${f.durationMs} ms\n\nAlpha bounds: ${JSON.stringify(f.alphaBounds)}\n\nIsolated source crop SHA-256: ${f.sourcePose.isolatedSha256}\n\n`;
 md+='### Adjacent transitions (including loop closure)\n\n| From -> To | Changed pixels | Silhouette changed | Mean normalized difference | Flag |\n|---|---:|---:|---:|---|\n'+animation.transitions.map(t=>`| ${t.from} -> ${t.to} | ${t.changedPercent}% | ${t.silhouetteChangedPercent}% | ${t.normalizedMeanDifference} | ${t.silhouetteChangedPercent<15?'near duplicate':t.silhouetteChangedPercent>50?'large silhouette change':'-'} |`).join('\n')+'\n\n';
}
await writeFile(output+'.md',md);
// Labels are SVG text only; poses are the exact PNGs loaded by registration.
let svg='<svg width="2560" height="900">';
let comparisonSvg='<svg width="2560" height="1800">';
for(let r=0;r<animations.length;r++) {
 svg+=auditLabel(animations[r].folder,8,r*300+17);
 for(let i=0;i<animations[r].frames.length;i++)svg+=auditLabel(String(animations[r].frames[i].index),i*256+8,r*300+35);
 for(const [offset,label] of [[0,'SOURCE CROP (PREVIEW FIT)'],[300,'EXACT RUNTIME PNG']]){
  comparisonSvg+=auditLabel(animations[r].folder+' / '+label,8,r*600+offset+17);
  for(let i=0;i<animations[r].frames.length;i++)comparisonSvg+=auditLabel(String(i),i*256+8,r*600+offset+35);
 }
}
svg+='</svg>';comparisonSvg+='</svg>';
await sharp({create:{width:2560,height:1800,channels:4,background:'#404b5c'}}).composite([...comparisonLayers,{input:Buffer.from(comparisonSvg),left:0,top:0}]).png().toFile(output+'-source-vs-processed.png');
await sharp({create:{width:2560,height:900,channels:4,background:'#404b5c'}}).composite([...layers,{input:Buffer.from(svg),left:0,top:0}]).png().toFile(output+'.png');
console.log(JSON.stringify(report.animations.map(a=>({folder:a.folder,source:a.source,sha256:a.sourceSha256,poses:a.sourcePoseCount,count:a.processedCount,duplicates:a.exactDuplicates,near:a.nearDuplicates,transitions:a.transitions,skipMissedFrames:a.skipMissedFrames})),null,2));
