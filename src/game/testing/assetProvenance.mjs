import{readFile}from'node:fs/promises';import{createHash}from'node:crypto';import assert from'node:assert/strict';
// Raw authoring exports are optional local inputs, not runtime dependencies.
// Always validate the recorded digest; also check source bytes when restored.
export async function verifyOptionalSource(path,sha256){
 assert.match(sha256,/^[a-f0-9]{64}$/);
 try{const b=await readFile(path);assert.equal(createHash('sha256').update(b).digest('hex'),sha256);return b;}catch(e){if(e.code==='ENOENT')return null;throw e;}
}
