import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {components} from './spriteComponents.mjs';
const previous=JSON.parse(await readFile('public/assets/player/movement/processing-report.json','utf8'));
const sources=[];
for(const filename of (await readdir('P_Animations')).filter(n=>/run/i.test(n)&&/\.png$/i.test(n))){
 const bytes=await readFile('P_Animations/'+filename),metadata=await sharp(bytes).metadata();
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const threshold=filename==='Pixel Running Cycle Sprite Sheet.png'?16:1;
 const region=filename==='Six-Frame Pixel Art Run Cycle.png'?{top:95,bottom:615}:null;
 for(let p=0;p<info.width*info.height;p++){const y=Math.floor(p/info.width);if(data[p*4+3]<threshold||(region&&(y<region.top||y>=region.bottom)))data[p*4+3]=0;}
 const {poses}=components(data,info.width,info.height),hash=createHash('sha256').update(bytes).digest('hex');
 const prior=previous.sheets.find(s=>s.source===filename);
 sources.push({path:'P_Animations/'+filename,bytes:bytes.length,width:metadata.width,height:metadata.height,hasAlpha:metadata.hasAlpha,sha256:hash,matchesPreviousProcessedSource:prior?.sha256===hash,detectedPoses:poses.length,connectivityAlphaThreshold:threshold,analysisRegion:region,layout:'horizontal row, alpha silhouettes with unequal gaps',poses:poses.map((p,i)=>({sourceIndex:i,crop:p.crop,sourceFeetY:p.crop.top+p.crop.height-1}))});
}
const newEightFrameSourceLocated=sources.some(s=>s.detectedPoses===8&&!s.matchesPreviousProcessedSource);
await writeFile('docs/RUN_V6_SOURCE_INVENTORY.json',JSON.stringify({newEightFrameSourceLocated,runUpdateWithdrawnByUser:true,sources,conclusion:newEightFrameSourceLocated?'New source detected; visual inspection required.':'User clarified the run artwork was not updated. Existing6/10/6/6-pose sources and runtime running retained; eight-frame integration request withdrawn.'},null,2)+'\n');
console.table(sources.map(s=>({path:s.path,size:s.width+'x'+s.height,poses:s.detectedPoses,unchanged:s.matchesPreviousProcessedSource})));
