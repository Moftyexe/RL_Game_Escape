import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {silhouetteMask} from './videoRunMask.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const latest=process.argv.includes('--latest');
const video=latest?'P_Animations/8-frame side run cycle.mp4':'P_Animations/3.mp4',folder=latest?'tools/new-run-video-frames':'tools/run-video-frames';
const stem=latest?'latest-run-side':'3-run-side',workingSize=latest?[960,540]:[540,960];
const ffmpeg=process.env.RUN_VIDEO_FFMPEG??'tools/video-deps/node_modules/ffmpeg-static/ffmpeg.exe';
await mkdir(folder,{recursive:true});
const extraction=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-i',video,'-t',latest?'2':'1.2','-an','-vsync','0','-y',folder+'/frame-%03d.png'],{encoding:'utf8',windowsHide:true});
if(extraction.error||extraction.status!==0)throw Error(extraction.error?.message??extraction.stderr);
// Eight inspected chronological key poses. Latest clip's idle introduction is
// excluded; the previous clip keeps its established .8s extraction/selection.
const sourceIndices=latest?[9,11,13,15,18,20,22,24]:[3,6,8,10,12,15,18,21],frames=[],layers=[];
for(const[index,sourceFrame]of sourceIndices.entries()){
 const bytes=await readFile(`${folder}/frame-${String(sourceFrame+1).padStart(3,'0')}.png`);
 const{data,info}=await sharp(bytes).resize(...workingSize,{kernel:'nearest'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const mask=silhouetteMask(data,info.width,info.height,latest?5:8),rgba=Buffer.from(data);
 let left=info.width,top=info.height,right=-1,bottom=-1,pixels=0;
 for(let p=0;p<mask.length;p++){rgba[p*4+3]=mask[p]?255:0;if(mask[p]){pixels++;const x=p%info.width,y=Math.floor(p/info.width);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}
 if(pixels<(latest?20000:50000))throw Error('Incomplete video silhouette at frame'+sourceFrame);
 const crop={left,top,width:right-left+1,height:bottom-top+1};
 if(crop.width>500||crop.height>720)throw Error('Unexpected video pose bounds');
 const isolated=await sharp(rgba,{raw:info}).extract(crop).png().toBuffer();
 // Stabilize video framing by hair-top alignment; one scale, not per-frame fit.
 // Pose-dependent knee/foot lift remains relative to the head/body.
 const placement={left:index*540+Math.floor((540-crop.width)/2),top:24};
 layers.push({input:isolated,...placement});
 frames.push({index,sourceFrame,timeSeconds:sourceFrame/30,rawFrameSha256:hash(bytes),maskedCropSha256:hash(isolated),crop,placement,pixels});
}
const sheet=await sharp({create:{width:4320,height:760,channels:4,background:'#00000000'}}).composite(layers).png().toBuffer();
const metadata={video,videoSha256:hash(await readFile(video)),videoDimensions:latest?[1920,1080]:[1080,1920],videoFps:30,durationSeconds:latest?5.22:5.18,
 sheet:`P_Animations/${stem}.png`,sheetSha256:hash(sheet),sheetDimensions:[4320,760],cells:[540,760],frameCount:8,frameRate:latest?12:10,sourceIndices,frames,
 backgroundRemoval:`At${workingSize.join('x')} nearest sample: RGB neighbor-edge threshold${latest?5:8},4px edge closure, exterior flood-fill,4px erosion, largest silhouette; internal dark clothing retained. Hard alpha, no AI redraw/recolor.`,
 stabilization:'Common hair-top at24 source pixels before existing proportional240px-height/common-floor/head-centroid pipeline. No individual frame rescaling.',
 scope:'Side-facing only. Existing front/rear, movement speed, collision and controls unchanged. Video audio ignored.'};
await writeFile(metadata.sheet,sheet);await writeFile(`P_Animations/${stem}.json`,JSON.stringify(metadata,null,2)+'\n');
console.log(JSON.stringify({sheet:metadata.sheet,frames:8,fps:metadata.frameRate,sourceIndices},null,2));
