import path from 'node:path';
import {readdir,readFile,writeFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=path.resolve('500-game-sound-effects');
const manifestPath='docs/SFX_AUDIT.json';
const verify=process.argv.includes('--verify');
async function walk(dir){const result=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())result.push(...await walk(p));else if(e.isFile())result.push(p);else throw Error('Unexpected symlink/special file in collection');}return result.sort();}
const sha=b=>createHash('sha256').update(b).digest('hex');
function wavInfo(b){
 if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WAVE')return {metadataError:'Not a RIFF/WAVE file'};
 let fmt=null,data=null;const metadata=[];
 for(let i=12;i+8<=b.length;){const id=b.toString('ascii',i,i+4),n=b.readUInt32LE(i+4),start=i+8;if(start+n>b.length)throw Error('Truncated WAV');
  if(id==='fmt '&&n>=16)fmt={encoding:b.readUInt16LE(start),channels:b.readUInt16LE(start+2),sampleRate:b.readUInt32LE(start+4),byteRate:b.readUInt32LE(start+8),bits:b.readUInt16LE(start+14)};
  if(id==='data')data={offset:start,bytes:n};
  if(['LIST','bext','iXML'].includes(id))metadata.push({chunk:id,text:b.subarray(start,start+Math.min(n,4096)).toString('utf8').replace(/[^\x20-\x7e\n]/g,' ').trim()});
  i=start+n+(n%2);
 }
 if(!fmt||!data)throw Error('WAV missing format/data');
 let peak=0,sum=0,samples=0;
 if(fmt.encoding===1&&fmt.bits===16)for(let i=data.offset;i+1<data.offset+data.bytes;i+=2){const x=b.readInt16LE(i)/32768;peak=Math.max(peak,Math.abs(x));sum+=x*x;samples++;}
 return {...fmt,durationSeconds:data.bytes/fmt.byteRate,dataBytes:data.bytes,peak: samples?peak:null,rms:samples?Math.sqrt(sum/samples):null,metadata};
}
function classify(relative){
 const [folder,file]=relative.split('/'),name=file.replace(/_48kHz.*/i,'');
 // Only specific, unmistakably themed sounds are removed. Generic impacts,
 // gear, eerie atmospheres, magic feedback and vague creature hurt are kept.
 if(folder==='05_combat_ranged'&&!/^arrow_(feathers|grab_from_quiver|return_to_quiver)$/.test(name))return {decision:'delete',reason:'Explicit firearm, ammunition or ranged weapon effect; no ranged weapons in this game.'};
 if(folder==='06_explosions_destruction')return {decision:'delete',reason:'Explicit bomb/explosion/destruction effect; unrelated to school melee combat.'};
 if(folder==='04_combat_melee'&&/^(sword|wpn_sword|knife_(draw|sheathe|slash))/.test(name))return {decision:'delete',reason:'Explicit sword/knife weapon effect; unrelated to the Player/Guard kits.'};
 if(folder==='07_magic_spells'&&/^(fireball|spell_fire)$/.test(name))return {decision:'delete',reason:'Explicit offensive fire spell/fireball; no elemental attacks in this game.'};
 if(folder==='08_creatures_monsters'&&/^(ghost_moan|giant|goblin|monster|ogre|roar|slime|zombie)$/.test(name))return {decision:'delete',reason:'Explicit supernatural creature/monster vocal or effect; unrelated character theme.'};
 if(folder==='17_machinery_technology'&&/^(engine|engine_circular|space_engine|robot|robotics)$/.test(name))return {decision:'delete',reason:'Explicit engine/space/robot machinery; unrelated school setting.'};
 if(folder==='18_sci_fi_energy'&&/^(laser|laser_heavy|laser_light|phaser_down|phaser_up)$/.test(name))return {decision:'delete',reason:'Explicit sci-fi laser/phaser weapon effect; unrelated combat theme.'};
 let category='Miscellaneous potentially useful';
 if(folder==='01_ui_interface')category=/victory|game_over|negative/.test(name)?'Victory/defeat and feedback':'UI';
 if(folder==='02_footsteps'||folder==='03_movement_cloth_gear'||folder==='05_combat_ranged')category=/land/.test(name)?'Stumble/fall':'Footsteps/movement/gear';
 if(folder==='04_combat_melee')category=/swing|swosh|whoosh/.test(name)?'Misses/swishes':'Hits/blocks/scrapes';
 if(folder==='09_human_nonverbal')category=/whistle/.test(name)?'Whistle':/drink/.test(name)?'Eating/recovery':/breath|gasp/.test(name)?'Hurt/recovery':'Human/comedic/hurt';
 if(folder==='10_impacts_materials')category='Hits/blocks/material impacts';
 if(folder==='11_doors_locks')category='Doors/interaction';
 if(folder==='12_items_inventory'||folder==='13_paper_books')category='Items/paper/books/interaction';
 if(folder==='07_magic_spells'||folder==='18_sci_fi_energy')category='Status/recovery/transition candidates';
 if(['14_water_mud_slime','15_nature_weather','16_ambiences'].includes(folder))category='Ambience/liquids/miscellaneous';
 if(folder==='17_machinery_technology')category='Computer/UI/switch/alarm';
 return {decision:'keep',category,reason:'Plausible school, movement, combat, feedback or comedic use; uncertain candidates retained.'};
}
const protections=async()=>{const entries=[];for(const base of ['public/assets','src/game/audio','src/game/exploration'])for(const p of await walk(path.resolve(base))){if(base==='public/assets'||/Music|music|musician/i.test(p))entries.push([path.relative('.',p).replaceAll('\\','/'),sha(await readFile(p))]);}return Object.fromEntries(entries);};
let report;
if(verify){
 report=JSON.parse(await readFile(manifestPath,'utf8'));
 for(const f of report.files){const p=path.resolve(root,f.relativePath);if(!p.startsWith(root+path.sep))throw Error('Escaped collection');let bytes=null;try{bytes=await readFile(p);}catch(e){if(e.code!=='ENOENT')throw e;}
  if(f.decision==='delete'){if(bytes)throw Error('Planned deletion still exists: '+f.relativePath);f.status='deleted';}else{if(!bytes||sha(bytes)!==f.sha256)throw Error('Retained file changed: '+f.relativePath);f.status='retained';}}
 const after=await protections();if(JSON.stringify(after)!==JSON.stringify(report.protectedFiles))throw Error('Music/runtime/image/animation files changed during cleanup');
 for(const p of await walk(path.resolve('src'))){const source=await readFile(p,'utf8');for(const f of report.files.filter(f=>f.decision==='delete'))if(source.includes(f.filename)||source.includes(f.relativePath))throw Error('Runtime reference to deleted file: '+p);}
 const actual=(await walk(root)).filter(p=>/\.(wav|mp3|mpeg|ogg|m4a|aac|flac|webm)$/i.test(p));
 if(actual.length!==report.files.filter(f=>f.decision==='keep').length)throw Error('Unexpected collection count');
 report.verified=true;
}else{
 const files=[];
 for(const p of await walk(root)){if(!/\.(wav|mp3|mpeg|ogg|m4a|aac|flac|webm)$/i.test(p))continue;
  const b=await readFile(p),relativePath=path.relative(root,p).replaceAll('\\','/');
  files.push({filename:path.basename(p),relativePath,extension:path.extname(p),sizeBytes:b.length,sha256:sha(b),...wavInfo(b),...classify(relativePath),status:'planned'});
 }
 const groups=new Map();for(const f of files){if(!groups.has(f.sha256))groups.set(f.sha256,[]);groups.get(f.sha256).push(f);}
 const duplicateGroups=[...groups.entries()].filter(([,g])=>g.length>1).map(([hash,g])=>({sha256:hash,files:g.map(f=>f.relativePath),retained:g.find(f=>f.decision==='keep')?.relativePath??null}));
 // Leave all duplicates in place: auditable option, avoids deleting useful aliases.
 report={root:path.relative('.',root),before:files.length,verified:false,method:'WAV headers, duration, PCM peak/RMS, category context and SHA256; no perceptual listening or elaborate audio classification. Ambiguous sounds kept. No renaming/transcoding/integration.',files,duplicateGroups,protectedFiles:await protections()};
}
report.retained=report.files.filter(f=>f.decision==='keep').length;report.deleted=report.before-report.retained;
await writeFile(manifestPath,JSON.stringify(report,null,2)+'\n');
let md=`# SFX source collection audit\n\nFolder: \`${report.root}\`. Before: **${report.before} audio files**; retained **${report.retained}**; ${report.verified?'deleted':'planned deletions'} **${report.deleted}**. README/LICENSES retained.\n\n${report.method}\n\nNo SFX were copied to runtime, preloaded, registered or connected to gameplay. Existing hallway/battle music, volumes and transitions were untouched. ${report.verified?'Verified: all retained hashes unchanged; every deleted path is inside this collection; no runtime references to deleted files; all protected runtime/music/image/animation hashes unchanged.':'Deletion plan written before cleanup.'}\n\nMetadata for every original file (path, extension, bytes, SHA256, duration, sample rate, channels, bit depth, metadata and peak/RMS): [SFX_AUDIT.json](SFX_AUDIT.json). WAV headers were inspected rather than trusting filename duration/rate. This does not claim auditioning sounds.\n\n## Kept\n\n`;
const categories=[...new Set(report.files.filter(f=>f.decision==='keep').map(f=>f.category))].sort();
for(const category of categories){md+=`### ${category}\n\n`;for(const f of report.files.filter(f=>f.decision==='keep'&&f.category===category))md+=`- \`${f.relativePath}\` — ${f.durationSeconds.toFixed(3)}s, ${f.sampleRate} Hz, ${f.channels} channels, ${f.sizeBytes} bytes\n`;md+='\n';}
md+='## Deleted\n\n';for(const f of report.files.filter(f=>f.decision==='delete'))md+=`- \`${report.root}/${f.relativePath}\` — ${f.reason}\n`;
md+='\n## Duplicates\n\n';
if(!report.duplicateGroups.length)md+='No byte-for-byte duplicate audio files found. Different takes and processed variants retained.\n';
for(const g of report.duplicateGroups)md+=`- SHA256 ${g.sha256}: ${g.files.map(p=>'`'+p+'`').join(', ')}. ${g.retained?'Retained copies left intact; no duplicate deletion.':'All copies independently irrelevant by theme.'}\n`;
md+='\n## Manual selection\n\nListen to retained files before selecting sounds. Generic magic/status feedback, creature hurt, gear rattles, scrapes, atmospheres, impacts and water sounds were intentionally kept when plausible or uncertain. No dedicated phone or eating bite was confidently identified; drink/swallow, UI and inventory candidates remain available for audition.\n';
await writeFile('docs/SFX_AUDIT.md',md);
console.log(JSON.stringify({before:report.before,retained:report.retained,deleted:report.deleted,duplicateGroups:report.duplicateGroups.length,verified:report.verified}));
