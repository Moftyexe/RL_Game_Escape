import {readFile,writeFile,readdir,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {palette,candidateGroups,futurePrefixes} from './sfxPalette.mjs';
const root='500-game-sound-effects',files=[];
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())await walk(p);else if(/\.wav$/i.test(p))files.push(p.slice(root.length+1));}}await walk(root);files.sort();
const hash=b=>createHash('sha256').update(b).digest('hex');
const inventory=[];
for(const path of files){const b=await readFile(root+'/'+path);let fmt,data;for(let i=12;i+8<=b.length;){const n=b.readUInt32LE(i+4),id=b.toString('ascii',i,i+4);if(id==='fmt ')fmt={encoding:b.readUInt16LE(i+8),channels:b.readUInt16LE(i+10),sampleRate:b.readUInt32LE(i+12),byteRate:b.readUInt32LE(i+16),bits:b.readUInt16LE(i+22)};if(id==='data')data=b.subarray(i+8,i+8+n);i+=8+n+(n%2);}
 if(!fmt||!data||fmt.encoding!==1||fmt.bits!==16)throw Error('Unsupported source '+path);
 let peak=0,sq=0;for(let i=0;i<data.length;i+=2){const n=data.readInt16LE(i)/32768;peak=Math.max(peak,Math.abs(n));sq+=n*n;}
 inventory.push({path,bytes:b.length,format:'WAV PCM',...fmt,duration:data.length/fmt.byteRate,peak,rms:Math.sqrt(sq/(data.length/2)),sha256:hash(b)});
}
const assets={},retained=new Set(),candidates=[],future=[];
async function copy(source,target){await mkdir(target.slice(0,target.lastIndexOf('/')),{recursive:true});await copyFile(root+'/'+source,target);}
for(const[id,[prefix,index,category,gain,maxDuration]]of Object.entries(palette)){
 const matches=files.filter(p=>p.startsWith(prefix)),source=matches[index];if(!source)throw Error('Missing selection '+id+' '+matches.length);
 const file=`assets/audio/sfx/${category}/${id}.wav`,meta=inventory.find(x=>x.path===source);
 await copy(source,'public/'+file);retained.add(source);
 assets[id]={key:'sfx-'+id,file,source:root+'/'+source,category,gain,maxDuration:maxDuration??null,metadata:meta};
}
for(const[group,ids]of Object.entries(candidateGroups)){
 const paths=new Set();for(const id of ids){const prefix=palette[id][0];for(const p of files.filter(x=>x.startsWith(prefix)).slice(0,3))paths.add(p);}
 const active=ids.map(id=>assets[id].source);
 for(const p of paths){if(Object.values(assets).some(a=>a.source===root+'/'+p))continue;const target=`sfx_candidates/${group}/${p.split('/').at(-1)}`;await copy(p,target);retained.add(p);candidates.push({group,source:root+'/'+p,file:target});}
 await mkdir('sfx_candidates/'+group,{recursive:true});await writeFile(`sfx_candidates/${group}/README.md`,'# '+group+'\n\nACTIVE:\n'+active.map(p=>'- '+p).join('\n')+'\n\nAlternatives are byte-identical source copies. Selection uses category, duration and measured peak/RMS, not perceptual audition.\n');
}
for(const p of files)if(futurePrefixes.some(pre=>p.startsWith(pre))){retained.add(p);future.push(p);}
await mkdir('public/assets/audio/sfx',{recursive:true});await writeFile('public/assets/audio/sfx/manifest.json',JSON.stringify(assets,null,2));
for(const name of ['README.txt','LICENSES.txt'])await copyFile(root+'/'+name,'public/assets/audio/sfx/'+name);
const deleted=inventory.filter(x=>!retained.has(x.path)).map(x=>({...x,path:root+'/'+x.path,reason:'Unused after palette selection; not active, a candidate, or a retained school/item future-use sound.'}));
await writeFile('tools/sfx-deletion-manifest.json',JSON.stringify({root,before:files.length,activeCount:Object.keys(assets).length,candidates,retained:[...retained],future,deleted,executed:false},null,2));
await writeFile('tools/sfx-current-inventory.json',JSON.stringify(inventory,null,2));
console.log({before:files.length,active:Object.keys(assets).length,candidateCopies:candidates.length,sourceRetained:retained.size,deletePlanned:deleted.length});
