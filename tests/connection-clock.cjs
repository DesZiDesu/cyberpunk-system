// Drive only the connection's 80 ms timer; keep unrelated host timers real.
module.exports=function connectionClock(w){
 const set=w.setInterval,clear=w.clearInterval,now=w.performance.now,tasks=new Map();let time=now.call(w.performance),serial=-1;
 w.performance.now=()=>time;
 w.setInterval=(fn,ms,...args)=>{if(ms!==80)return set.call(w,fn,ms,...args);const id=serial--;tasks.set(id,()=>fn(...args));return id;};
 w.clearInterval=id=>{if(tasks.has(id))tasks.delete(id);else clear.call(w,id);};
 return {tasks,advance(ms){while(ms>0){const step=Math.min(80,ms);time+=step;ms-=step;for(const fn of [...tasks.values()])fn();}},jump(ms){time+=ms;for(const fn of [...tasks.values()])fn();},restore(){tasks.clear();w.setInterval=set;w.clearInterval=clear;w.performance.now=now;}};
};
