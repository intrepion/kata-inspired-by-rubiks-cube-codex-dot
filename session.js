(function(root,factory){if(typeof module==='object')module.exports=factory(require('./model.js'));else root.CubeSession=factory(root.Cube);})(globalThis,function(C){
 'use strict';
 return class CubeSession {
  constructor(){this.duration=180;this.reset();}
  reset(){this.baseline=C.solved();this.scramble=[];this.restart();}
  restart(){this.state=this.baseline;this.queue=[];this.active=null;this.history=[];this.moves=0;this.started=null;this.stopped=null;this.complete=false;this.assisted=false;}
  newScramble(moves=C.scramble()){const state=C.apply(C.solved(),moves);this.baseline=state;this.scramble=[...moves];this.restart();}
  enqueue(move){C.parse(move);if(this.queue.length>=128)return false;this.queue.push({move});return true;}
  undo(){if(this.queue.length>=128)return false;this.queue.push({undo:true});return true;}
  elapsed(now){return this.started===null?0:Math.max(0,(this.stopped??now)-this.started);}
  tick(now){
   if(this.active&&now-this.active.start>=this.duration){
    const a=this.active;this.state=C.turn(this.state,a.move);this.moves++;
    if(a.undo){this.history.pop();this.assisted=true;}else this.history.push(a.move);
    this.active=null;
    if(C.isSolved(this.state)){this.complete=true;this.stopped=now;}
   }
   while(!this.active&&this.queue.length){
    const action=this.queue.shift();
    if(action.undo&&!this.history.length)continue;
    if(this.complete){const elapsed=this.elapsed(now);this.complete=false;this.started=now-elapsed;this.stopped=null;}
    if(this.started===null)this.started=now;
    this.active={move:action.undo?C.inverse(this.history.at(-1)):action.move,undo:!!action.undo,start:now};
   }
  }
 };
});
