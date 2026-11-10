import {readdir,readFile,mkdir,copyFile,writeFile}from'node:fs/promises';
import{createHash}from'node:crypto';
const files=await readdir('.');
const source=files.filter(f=>/battle|combat|fight/i.test(f)&&/\.(mp3|mpeg|ogg|wav|m4a|aac|webm)$/i.test(f)).sort()[0];
const manifest={music:null};
await mkdir('public/assets/audio',{recursive:true});
if(source){
 const bytes=await readFile(source);
 const format=bytes.subarray(0,3).toString()==='ID3'||/\.mp3(?:\.mpeg)?$/i.test(source)?'mp3':source.split('.').at(-1).toLowerCase();
 const file=`assets/audio/battle.${format}`;
 await copyFile(source,'public/'+file);
 manifest.music={source,file,format,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
}
await writeFile('public/assets/audio/battle-manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest,null,2));
