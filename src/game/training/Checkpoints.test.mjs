import test from 'node:test';
import assert from 'node:assert/strict';
import {trainGuard} from './GuardExperiments.js';
import QTable from '../ai/QTable.js';
test('checkpoint prefixes serialize visits/config and do not perturb seeded continuous training',()=>{
 const snapshots=[];
 const a=trainGuard({episodes:30,seed:876},undefined,{checkpointEpisodes:[10,20,30],onCheckpoint:r=>snapshots.push(JSON.parse(JSON.stringify({q:r.table.toJSON(r.metadata),metrics:r.metrics})))});
 const b=trainGuard({episodes:30,seed:876});assert.deepEqual(a.table.toJSON(a.metadata),b.table.toJSON(b.metadata));
 assert.deepEqual(snapshots.map(s=>s.q.metadata.episodes),[10,20,30]);
 for(const s of snapshots){const t=QTable.fromJSON(s.q);assert.equal(s.q.metadata.plannedEpisodes,30);assert.equal(s.metrics.episodes.length,s.q.metadata.episodes);assert.deepEqual(t.coverage(),s.metrics.coverage);}
 assert.deepEqual(snapshots[2].q,a.table.toJSON(a.metadata));
 assert.ok(snapshots[0].metrics.coverage.totalVisits<snapshots[1].metrics.coverage.totalVisits);
 assert.throws(()=>trainGuard({episodes:2},undefined,{checkpointEpisodes:[3]}));
});
