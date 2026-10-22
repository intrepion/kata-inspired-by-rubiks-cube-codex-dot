const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../model.js');
const serial=s=>JSON.stringify([...s].sort((a,b)=>a.id.localeCompare(b.id)));
test('solved cube contains all 26 cubies and 54 stickers',()=>{const s=C.solved();assert.equal(s.length,26);assert.equal(s.flatMap(c=>c.stickers).length,54);assert.ok(C.isSolved(s));assert.ok(C.legality(s));});
test('every face has fourth-power identity, inverse cancellation and half turns',()=>{
 for(const f of Object.keys(C.FACES)){
  const s=C.solved();assert.equal(serial(C.apply(s,[f,f,f,f])),serial(s));
  assert.equal(serial(C.apply(s,[f,C.inverse(f)])),serial(s));
  assert.equal(serial(C.turn(s,f+'2')),serial(C.apply(s,[f,f])));
  assert.equal(serial(C.apply(s,[f+'2',f+'2'])),serial(s));assert.ok(!C.isSolved(C.turn(s,f)));
 }
});
test('known F and R corner permutations match Kociemba Cubie Level reference',()=>{
 assert.deepEqual(C.coordinates(C.turn(C.solved(),'F'),C.CORNERS).map(x=>[x.index,x.orientation]),[[1,1],[5,2],[2,0],[3,0],[0,2],[4,1],[6,0],[7,0]]);
 assert.deepEqual(C.coordinates(C.turn(C.solved(),'R'),C.CORNERS).map(x=>[x.index,x.orientation]),[[4,2],[1,0],[2,0],[0,1],[7,1],[5,0],[6,0],[3,2]]);
});
test('100 seeded 25-turn scrambles preserve legal pieces and reverse exactly',()=>{
 let seed=123456;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
 const start=C.solved();const inventory=start.map(c=>c.id+':'+c.stickers.map(s=>s.face).sort().join('')).sort();
 for(let i=0;i<100;i++){
  const moves=C.scramble(25,rand);assert.equal(moves.length,25);let state=start;
  for(const m of moves){state=C.turn(state,m);assert.ok(C.legality(state),`illegal after ${moves.join(' ')} at ${m}`);}
  assert.deepEqual(state.map(c=>c.id+':'+c.stickers.map(s=>s.face).sort().join('')).sort(),inventory);
  assert.ok(!C.isSolved(state));assert.equal(serial(C.apply(state,C.reverse(moves))),serial(start));
 }
});
test('impossible single edge flip, corner twist, corner reflection and odd permutation rejected',()=>{
 let s=C.solved();let e=s.find(c=>c.stickers.length===2);[e.stickers[0].n,e.stickers[1].n]=[e.stickers[1].n,e.stickers[0].n];assert.ok(!C.legality(s));
 s=C.solved();let c=s.find(c=>c.stickers.length===3);[c.stickers[0].n,c.stickers[1].n,c.stickers[2].n]=[c.stickers[1].n,c.stickers[2].n,c.stickers[0].n];assert.ok(!C.legality(s));
 s=C.solved();c=s.find(c=>c.stickers.length===3);[c.stickers[0].n,c.stickers[1].n]=[c.stickers[1].n,c.stickers[0].n];assert.ok(!C.legality(s));
 s=C.solved();const a=s.find(c=>c.id==='1,1,0'),b=s.find(c=>c.id==='-1,1,0');[a.p,b.p]=[b.p,a.p];a.stickers.find(s=>s.face==='R').n=[-1,0,0];b.stickers.find(s=>s.face==='L').n=[1,0,0];assert.ok(!C.legality(s));
});
test('malformed moves reject without mutating input',()=>{const s=C.solved(),before=serial(s);for(const m of ['X','R3','r','R22',''])assert.throws(()=>C.turn(s,m));assert.equal(serial(s),before);});
test('all six clockwise corner permutations and twists match published CubeDefs',()=>{
 const fixtures={U:[[3,0,1,2,4,5,6,7],[0,0,0,0,0,0,0,0]],D:[[0,1,2,3,5,6,7,4],[0,0,0,0,0,0,0,0]],L:[[0,2,6,3,4,1,5,7],[0,1,2,0,0,2,1,0]],B:[[0,1,3,7,4,5,2,6],[0,0,1,2,0,0,2,1]]};
 for(const [f,[permutation,orientation]] of Object.entries(fixtures)){const result=C.coordinates(C.turn(C.solved(),f),C.CORNERS);assert.deepEqual(result.map(x=>x.index),permutation);assert.deepEqual(result.map(x=>x.orientation),orientation);}
});
