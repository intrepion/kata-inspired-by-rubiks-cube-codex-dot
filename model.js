/* Integer geometry is authoritative; rendering never writes back into the puzzle. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object') module.exports = api;
  else root.Cube = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const FACES = {
    U:{axis:1, sign:1, normal:[0,1,0], color:'#f4eedc', name:'Ivory · Up'},
    R:{axis:0, sign:1, normal:[1,0,0], color:'#ef725d', name:'Coral · Right'},
    F:{axis:2, sign:1, normal:[0,0,1], color:'#65c9ae', name:'Mint · Front'},
    D:{axis:1, sign:-1, normal:[0,-1,0], color:'#efc759', name:'Gold · Down'},
    L:{axis:0, sign:-1, normal:[-1,0,0], color:'#ee9c52', name:'Apricot · Left'},
    B:{axis:2, sign:-1, normal:[0,0,-1], color:'#779de4', name:'Blue · Back'}
  };
  const same = (a,b) => a.every((x,i)=>x===b[i]);
  function solved() {
    const pieces=[];
    for(let x=-1;x<=1;x++) for(let y=-1;y<=1;y++) for(let z=-1;z<=1;z++) {
      if(!x&&!y&&!z) continue;
      const p=[x,y,z];
      pieces.push({id:p.join(','),p,stickers:Object.entries(FACES).filter(([,f])=>p[f.axis]===f.sign).map(([face,f])=>({face,n:[...f.normal]}))});
    }
    return pieces;
  }
  function parse(move) {
    if(typeof move!=='string'||!/^([URFDLB])(['2]?)$/.test(move)) throw Error('Invalid face turn: '+move);
    const face=move[0], f=FACES[face], turns=move[1]==='2'?2:move[1]==="'"?-1:1;
    return {face,...f,turns,angle:-f.sign*turns*Math.PI/2};
  }
  function rotate(v,axis,quarter) {
    let [x,y,z]=v;
    for(let i=0;i<((quarter%4)+4)%4;i++) {
      if(axis===0) [y,z]=[-z,y];
      if(axis===1) [x,z]=[z,-x];
      if(axis===2) [x,y]=[-y,x];
    }
    return [x,y,z].map(x=>x||0);
  }
  function turn(state,move) {
    const m=parse(move), q=-m.sign*m.turns;
    return state.map(c=>c.p[m.axis]===m.sign?{id:c.id,p:rotate(c.p,m.axis,q),stickers:c.stickers.map(s=>({face:s.face,n:rotate(s.n,m.axis,q)}))}:c);
  }
  const inverse = move => {parse(move);return move.endsWith('2')?move:move.endsWith("'")?move[0]:move+"'";};
  const apply = (state,moves) => moves.reduce(turn,state);
  const reverse = moves => [...moves].reverse().map(inverse);
  function scramble(length=25, random=Math.random) {
    const moves=[];let axis=-1;
    for(let i=0;i<length;i++) {
      const choices=Object.keys(FACES).filter(f=>FACES[f].axis!==axis);
      const face=choices[Math.floor(random()*choices.length)];
      moves.push(face+['',"'",'2'][Math.floor(random()*3)]);axis=FACES[face].axis;
    }
    return moves;
  }
  function isSolved(state) {return state.every(c=>c.stickers.every(s=>same(s.n,FACES[s.face].normal)));}
  // Each face is read from outside, row-major, with Up above Front.
  const basis={U:[[1,0,0],[0,0,1]],R:[[0,0,-1],[0,-1,0]],F:[[1,0,0],[0,-1,0]],D:[[1,0,0],[0,0,-1]],L:[[0,0,1],[0,-1,0]],B:[[-1,0,0],[0,-1,0]]};
  const dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0);
  function facelets(state) {
    const out={};
    for(const [face,f] of Object.entries(FACES)) {
      out[face]=Array(9);
      for(const c of state) for(const s of c.stickers) if(same(s.n,f.normal)) out[face][(dot(c.p,basis[face][1])+1)*3+dot(c.p,basis[face][0])+1]=s.face;
    }
    return out;
  }
  const CORNERS=['URF','UFL','ULB','UBR','DFR','DLF','DBL','DRB'];
  const EDGES=['UR','UF','UL','UB','DR','DF','DL','DB','FR','FL','BL','BR'];
  function coordinates(state,names) {
    return names.map(name=>{
      const p=[0,0,0];for(const f of name) p[FACES[f].axis]=FACES[f].sign;
      const c=state.find(c=>same(c.p,p));
      const colors=[...name].map(f=>c?.stickers.find(s=>same(s.n,FACES[f].normal))?.face);
      const index=names.findIndex(n=>[...n].sort().join('')===[...colors].sort().join(''));
      const orientation=colors.findIndex(f=>name.length===3?f==='U'||f==='D':f===names[index]?.[0]);
      return {index,orientation,colors};
    });
  }
  function parity(values) {let p=0;for(let i=0;i<values.length;i++)for(let j=i+1;j<values.length;j++)if(values[i].index>values[j].index)p^=1;return p;}
  function legality(state) {
    try {
      if(state.length!==26||new Set(state.map(c=>c.id)).size!==26||new Set(state.map(c=>c.p.join(','))).size!==26) return false;
      const home=solved();
      for(const c of state) {
        const h=home.find(h=>h.id===c.id);
        if(!h||c.p.length!==3||c.p.some(x=>![-1,0,1].includes(x))||c.p.every(x=>x===0)||c.stickers.length!==h.stickers.length) return false;
        if(c.stickers.map(s=>s.face).sort().join('')!==h.stickers.map(s=>s.face).sort().join(''))return false;
        if(new Set(c.stickers.map(s=>s.n.join(','))).size!==c.stickers.length)return false;
        for(const s of c.stickers) {
          const f=Object.values(FACES).find(f=>same(f.normal,s.n));
          if(!f||c.p[f.axis]!==f.sign)return false;
        }
        if(c.stickers.length===1&&(!same(c.p,h.p)||!same(c.stickers[0].n,h.stickers[0].n)))return false;
      }
      const corners=coordinates(state,CORNERS), edges=coordinates(state,EDGES);
      if(corners.some(c=>c.index<0||c.orientation<0)||edges.some(c=>c.index<0||c.orientation<0))return false;
      // Corner chirality: twisting is legal, mirroring the sticker order is not.
      if(corners.some(c=>c.colors[(c.orientation+1)%3]!==CORNERS[c.index][1]||c.colors[(c.orientation+2)%3]!==CORNERS[c.index][2]))return false;
      return corners.reduce((n,c)=>n+c.orientation,0)%3===0&&edges.reduce((n,c)=>n+c.orientation,0)%2===0&&parity(corners)===parity(edges);
    } catch {return false;}
  }
  return {FACES,solved,parse,rotate,turn,inverse,apply,reverse,scramble,isSolved,facelets,legality,coordinates,CORNERS,EDGES};
});
