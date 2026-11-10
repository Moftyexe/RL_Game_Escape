import test from 'node:test';import assert from 'node:assert/strict';import DefensiveStallAudit from './DefensiveStallAudit.mjs';
test('Player stall audit counts healing cycles and breaks chains across skips/battles',()=>{
 const a=new DefensiveStallAudit();for(const v of ['defend','defend','defend','catchBreath','defend','catchBreath',null,'defend'])a.observe(v);assert.deepEqual(a.toJSON(),{maxDefendChain:3,defendToCatch:2,defendCatchDefendCycles:1,threeOrMoreDefendsThenCatch:1});a.endBattle();a.observe('defend');assert.equal(a.maxDefendChain,3);
});
