/* Detailed NC Zoning Board tile adapter. Coordinate projection adapted from
 * NCZ constants.js (MIT); see third-party/NC-ZONING-LICENSE.txt. No external scripts. */
(() => {
  'use strict';
  const D=globalThis.CyberpunkMapData, NS='http://www.w3.org/2000/svg';
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
  const number=v=>v!==''&&v!==null&&v!==undefined&&Number.isFinite(Number(v));
  const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const district=value=>D.districts.find(d=>norm(d.id)===norm(value)||norm(d.name)===norm(value));
  const locationDistrict=l=>district(norm(l?.district)==='pacifica'&&norm(l?.subdistrict)==='dogtown'?'dogtown':l?.district);
  const project=(x,y)=>[(x-D.bounds.minX)/(D.bounds.maxX-D.bounds.minX)*1000,(D.bounds.maxY-y)/(D.bounds.maxY-D.bounds.minY)*1000];
  const unproject=(x,y)=>({x:Math.round((D.bounds.minX+x/1000*(D.bounds.maxX-D.bounds.minX))*100)/100||0,y:Math.round((D.bounds.maxY-y/1000*(D.bounds.maxY-D.bounds.minY))*100)/100||0});
  const inside=(p,poly)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
  const atPoint=p=>D.districts.find(d=>d.polygon.length&&inside(p,d.polygon))||district('badlands');
  function normalizeLocation(value){
    const d=locationDistrict(value);if(!d)throw Error('Unknown Night City district');
    const l={district:d.id,...Object.fromEntries(['subdistrict','building','floor','area'].map(k=>[k,String(value[k]??'').slice(0,180)])),danger:value.danger===true};
    if(number(value.x)||number(value.y)){
      if(!number(value.x)||!number(value.y))throw Error('Map coordinates require both X and Y');
      const x=Number(value.x),y=Number(value.y);
      if(x<D.bounds.minX||x>D.bounds.maxX||y<D.bounds.minY||y>D.bounds.maxY)throw Error('Coordinates are outside the map');
      l.x=x;l.y=y;
    }else if((value.x!==undefined&&value.x!=='')||(value.y!==undefined&&value.y!==''))throw Error('Invalid map coordinates');
    if(value.z!==undefined&&value.z!==''){if(!number(value.z)||Math.abs(Number(value.z))>10000)throw Error('Invalid elevation');l.z=Number(value.z);}
    return l;
  }
  function pointOf(l){
    const d=locationDistrict(l);if(!d)return null;
    if(number(l.x)&&number(l.y))return {point:project(Number(l.x),Number(l.y)),exact:true,district:d};
    const name=norm(l.subdistrict),area=name&&d.areas.find(a=>norm(a.name)===name||norm(a.name).startsWith(name));
    return {point:(area||d).center,exact:false,district:d};
  }
  function viewport(v,w=390,h=390){
    w=Math.max(1,w);h=Math.max(1,h);v.scale=clamp(v.scale,1,64);
    const unit=1000/v.scale/Math.min(w,h),width=w*unit,height=h*unit;
    v.x=width>=1000?500:clamp(v.x,width/2,1000-width/2);v.y=height>=1000?500:clamp(v.y,height/2,1000-height/2);
    return {x:v.x-width/2,y:v.y-height/2,width,height,unit};
  }
  function tilePlan(box,w,dpr=1){
    let z=clamp(Math.ceil(Math.log2(Math.max(1,w)/box.width*1000*Math.min(1.5,dpr)/256)),0,6),result=[];
    do{
      result=[];const n=2**z,step=1000/n;
      for(let x=Math.max(0,Math.floor(box.x/step));x<=Math.min(n-1,Math.floor((box.x+box.width)/step));x++)
        for(let y=Math.max(0,Math.floor(box.y/step));y<=Math.min(n-1,Math.floor((box.y+box.height)/step));y++)result.push({key:`${z}/${x}/${y}`,z,x,y,left:x*step,top:y*step,size:step});
      if(result.length<=64||z===0)break;z--;
    }while(true);
    return result;
  }
  function mount(area,options){
    const {map:m,escape:E,onSave,onPick,npcs=[],quests=[]}=options,tr=(en,th)=>options.language==='th'?th:en;
    if(norm(m.location?.district)==='pacifica'&&norm(m.location?.subdistrict)==='dogtown'){m.location={...m.location,district:'dogtown'};if(!m.discovered.includes('dogtown'))m.discovered.push('dogtown');}
    const l=m.location||{},current=pointOf(l),source=`https://raw.githubusercontent.com/nczoning/nc-zoning-board/${D.revision}/assets/tiles/`;
    if(m.source!==D.revision){m.view={x:current?.point[0]??500,y:current?.point[1]??500,scale:current?4:1};m.source=D.revision;}
    m.layers={imagery:true,boundaries:true,labels:true,npcs:true,quests:true,fog:true,...m.layers};
    m.view??={x:500,y:500,scale:1};
    const v=m.view,known=id=>m.discovered.includes(id),button=(text,attrs)=>`<button type="button" class="cps-button" ${attrs}>${E(text)}</button>`;
    const addr=[current?.district.name,l.subdistrict,l.building,l.floor?`${tr('Floor','ชั้น')} ${l.floor}`:'',l.area].filter(Boolean).join(' / ');
    const poly=d=>d.polygon.map(p=>p.join(',')).join(' ');
    const markerList=[...(current?[{kind:'player',name:options.playerName||tr('You','คุณ'),location:l,...current}]:[]),...npcs.filter(n=>n.location?.knownToUser===true).map(n=>({kind:'npc',name:n.name,location:n.location,...pointOf(n.location)})),...quests.filter(q=>q.status==='active'&&q.location).map(q=>({kind:'quest',name:q.title,location:q.location,...pointOf(q.location)}))].filter(x=>x.point);
    area.innerHTML=`<header class="cps-section-heading"><div><small>NC ZONING BOARD / NIGHT CITY</small><h3>${E(l.subdistrict||current?.district.name||tr('Night City','ไนท์ซิตี้'))}</h3></div><span class="cps-section-count">16K</span></header>
      <section class="cps-map-position ${l.danger?'danger':''}"><span>${E(tr('STORY LOCATION','ตำแหน่งในเนื้อเรื่อง'))}</span><strong>${E(addr||tr('No location established yet','ยังไม่มีตำแหน่งในเนื้อเรื่อง'))}</strong><div>${[['BUILDING','อาคาร',l.building],['FLOOR','ชั้น',l.floor],['POSITION','ตำแหน่ง',current?(current.exact?`${l.x}, ${l.y}`:tr('Approximate area','พื้นที่โดยประมาณ')):'—']].map(([en,th,value])=>`<span><small>${E(tr(en,th))}</small><b>${E(value||'—')}</b></span>`).join('')}</div></section>
      <div class="cps-map-toolbar"><label>${E(tr('Find a discovered area','ค้นพื้นที่ที่สำรวจแล้ว'))}<select data-map-search><option value="">${E(tr('Choose district / area','เลือกเขต / ย่าน'))}</option>${D.districts.filter(d=>known(d.id)).map(d=>`<optgroup label="${E(d.name)}"><option value="${d.id}">${E(d.name)}</option>${d.areas.map((a,i)=>`<option value="${d.id}:${i}">${E(a.name)}</option>`).join('')}</optgroup>`).join('')}</select></label><div class="cps-map-controls">${button('+','data-map-zoom="in" aria-label="Zoom in"')}<output data-map-scale></output>${button('−','data-map-zoom="out" aria-label="Zoom out"')}${button(tr('Fit','พอดี'),'data-map-reset')}${button(tr('Locate','ตำแหน่ง'),`data-map-center ${current?'':'disabled'}`)}</div></div>
      <div class="cps-map-viewport cps-ncz-viewport"><svg class="cps-world-map cps-ncz-map" role="group" aria-label="${E(tr('Night City map. Drag to pan; pinch to zoom.','แผนที่ Night City ลากเพื่อเลื่อน ใช้สองนิ้วซูม'))}" preserveAspectRatio="none"><defs><mask id="cps-ncz-outside"><rect width="1000" height="1000" fill="white"/>${D.districts.filter(d=>d.polygon.length).map(d=>`<polygon points="${poly(d)}" fill="black"/>`).join('')}</mask></defs><rect x="-1000" y="-1000" width="3000" height="3000" fill="#071018"/><g data-map-imagery><image data-map-base x="0" y="0" width="1000" height="1000" preserveAspectRatio="none"/><g data-map-tiles></g></g><g class="cps-ncz-fog" pointer-events="none">${!known('badlands')?'<rect width="1000" height="1000" fill="#08121a" mask="url(#cps-ncz-outside)"/>':''}${D.districts.filter(d=>d.polygon.length&&!known(d.id)).map(d=>`<polygon points="${poly(d)}" fill="#08121a"/>`).join('')}</g><g data-map-boundaries>${D.districts.filter(d=>d.polygon.length).map(d=>`<polygon class="cps-ncz-boundary ${m.completed.includes(d.id)?'completed':''}" points="${poly(d)}"/>`).join('')}</g><g data-map-labels>${D.districts.map(d=>`<g class="cps-map-zone ${known(d.id)?'discovered':'locked'}" role="button" tabindex="0" data-zone="${d.id}" aria-label="${E(known(d.id)?d.name:tr('Unexplored area','พื้นที่ยังไม่สำรวจ'))}"><text x="${d.center[0]}" y="${d.center[1]}" text-anchor="middle">${E(known(d.id)?d.name.toUpperCase():'LOCKED')}</text></g>`).join('')}</g><g data-map-markers>${markerList.map((p,i)=>`<g class="cps-ncz-marker ${p.kind}" data-marker="${i}" role="button" tabindex="0" aria-label="${E(p.name)}" transform="translate(${p.point.join(' ')})"><circle class="${p.kind==='player'?'cps-map-player':''}"/><text text-anchor="middle">${E(p.name)}</text></g>`).join('')}</g></svg><div class="cps-map-corner" aria-hidden="true">N ↑<br>NC ZONING BOARD</div></div>
      <div class="cps-map-layer-controls">${[['imagery','Satellite','ภาพแผนที่'],['boundaries','Districts','ขอบเขต'],['labels','Labels','ชื่อพื้นที่'],['npcs','Contacts','ผู้ติดต่อ'],['quests','Missions','ภารกิจ'],['fog','Exploration mask','ปิดพื้นที่ไม่สำรวจ']].map(([k,en,th])=>button(tr(en,th),`data-map-layer="${k}" aria-pressed="${m.layers[k]!==false}"`)).join('')}${button(tr('Set my position','กำหนดตำแหน่งฉัน'),'data-map-pin aria-pressed="false"')}</div>
      <p class="cps-rpg-note" data-map-hint>${E(tr('Drag / pinch to explore. Browsing never moves your character. Named areas use approximate pins until you set coordinates.','ลาก / ซูมเพื่อดูแผนที่ การดูไม่ย้ายตัวละคร หมุดพื้นที่เป็นตำแหน่งประมาณจนกว่าจะกำหนดพิกัด'))}</p><div class="cps-map-network"><span role="status" data-map-network>${E(tr('Loading map tiles…','กำลังโหลดภาพแผนที่…'))}</span>${button(tr('Retry','ลองใหม่'),'data-map-retry hidden')}</div><section class="cps-map-dossier" data-map-detail aria-live="polite"></section>
      <p class="cps-ncz-credit"><a href="https://nczoning.net/" target="_blank" rel="noopener noreferrer">NC Zoning Board ↗</a> · Map imagery © CD PROJEKT RED<br>${E(tr('Unofficial fan work; not approved or endorsed by CD PROJEKT RED.','ผลงานแฟนเมดอย่างไม่เป็นทางการ ไม่ได้รับการรับรองจาก CD PROJEKT RED'))}</p><div class="cps-rpg-actions">${button(tr('Update location / coordinates','แก้ไขตำแหน่ง / พิกัด'),'data-rpg="location"')}${button(tr('Mark current district completed','ทำเครื่องหมายเขตปัจจุบันสำเร็จ'),'data-rpg="complete-zone"')}</div>`;
    const svg=area.querySelector('svg'),base=area.querySelector('[data-map-base]'),tiles=area.querySelector('[data-map-tiles]'),network=area.querySelector('[data-map-network]'),retry=area.querySelector('[data-map-retry]');
    let disposed=false,frame=0,moved=false,picking=false,tapTarget=null,box,gesture=null,baseFailed=false,baseLoaded=false;
    const images=new Map(),pointers=new Map();
    const metrics=()=>{const r=svg.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width||390,height:r.height||390};};
    const status=()=>{if(disposed)return;const failed=baseFailed||[...images.values()].some(x=>x.failed);retry.hidden=!failed;network.textContent=failed?tr('Some map tiles could not load. Retry or open the NC Zoning Board link.','โหลดภาพบางส่วนไม่ได้ ลองใหม่หรือเปิด NC Zoning Board'):baseLoaded||[...images.values()].some(x=>x.loaded)?tr('NC Zoning Board · map connected','NC Zoning Board · เชื่อมต่อแผนที่แล้ว'):tr('Loading map tiles…','กำลังโหลดภาพแผนที่…');};
    base.onload=()=>{baseLoaded=true;baseFailed=false;status();};base.onerror=()=>{baseFailed=true;status();};base.setAttribute('href',source+'0/0/0.webp');
    function updateTiles(force=false){
      if(disposed)return;const r=metrics(),wanted=tilePlan(box,r.width,globalThis.devicePixelRatio||1),keys=new Set(wanted.map(t=>t.key));
      for(const [key,item] of images)if(!keys.has(key)||force){item.el.onload=item.el.onerror=null;item.el.remove();images.delete(key);}
      for(const t of wanted){if(images.has(t.key))continue;const el=document.createElementNS(NS,'image'),entry={el,loaded:false,failed:false};images.set(t.key,entry);el.setAttribute('x',t.left);el.setAttribute('y',t.top);el.setAttribute('width',t.size+.02);el.setAttribute('height',t.size+.02);el.setAttribute('preserveAspectRatio','none');el.dataset.tile=t.key;el.onload=()=>{entry.loaded=true;status();};el.onerror=()=>{entry.failed=true;status();};el.setAttribute('href',source+t.key+'.webp'+(force?'?retry='+Date.now():''));tiles.append(el);}
      status();
    }
    function draw(){
      if(disposed)return;const r=metrics();box=viewport(v,r.width,r.height);svg.setAttribute('viewBox',`${box.x} ${box.y} ${box.width} ${box.height}`);area.querySelector('[data-map-scale]').textContent=v.scale.toFixed(1)+'×';
      area.querySelector('[data-map-imagery]').style.display=m.layers.imagery?'':'none';area.querySelector('[data-map-boundaries]').style.display=m.layers.boundaries?'':'none';area.querySelector('[data-map-labels]').style.display=m.layers.labels?'':'none';area.querySelector('.cps-ncz-fog').style.display=m.layers.fog?'':'none';
      area.querySelectorAll('[data-map-labels] text').forEach(t=>t.setAttribute('font-size',11*box.unit));
      area.querySelectorAll('[data-marker]').forEach(g=>{const p=markerList[Number(g.dataset.marker)];g.style.display=(p.kind==='npc'&&!m.layers.npcs)||(p.kind==='quest'&&!m.layers.quests)||(p.kind!=='player'&&m.layers.fog&&!known(p.district.id))?'none':'';g.querySelector('circle').setAttribute('r',6*box.unit);const t=g.querySelector('text');t.setAttribute('font-size',11*box.unit);t.setAttribute('y',-12*box.unit);});
      if(!frame)frame=requestAnimationFrame(()=>{frame=0;updateTiles();});
    }
    const persist=()=>{if(!disposed)onSave();};
    const inspect=id=>{const d=district(id);if(!d)return;area.querySelector('[data-map-detail]').innerHTML=known(d.id)?`<small>${E(m.completed.includes(d.id)?tr('CLEARED','สำเร็จแล้ว'):tr('EXPLORED','สำรวจแล้ว'))}</small><h4>${E(d.name)}</h4><p>${E(d.areas.map(a=>a.name).join(' · '))}</p>`:`<h4>${E(tr('Unexplored area','พื้นที่ยังไม่สำรวจ'))}</h4><p>${E(tr('Explore in the story to reveal its location details.','สำรวจในเนื้อเรื่องเพื่อเปิดรายละเอียดตำแหน่ง'))}</p>`;};
    const inspectMarker=index=>{const p=markerList[Number(index)];if(!p)return;area.querySelector('[data-map-detail]').innerHTML=`<small>${E(p.kind.toUpperCase())} / ${E(p.exact?tr('COORDINATES','พิกัด'):tr('APPROXIMATE AREA','พื้นที่โดยประมาณ'))}</small><h4>${E(p.name)}</h4><p>${E([p.district.name,p.location.subdistrict,p.location.building,p.location.floor?`${tr('Floor','ชั้น')} ${p.location.floor}`:'',p.location.area].filter(Boolean).join(' / '))}</p>`;};
    const jump=(p,scale=6)=>{Object.assign(v,{x:p[0],y:p[1],scale});draw();persist();};
    area.querySelectorAll('[data-map-zoom]').forEach(b=>b.onclick=()=>{v.scale*=b.dataset.mapZoom==='in'?1.5:1/1.5;draw();persist();});
    area.querySelector('[data-map-reset]').onclick=()=>jump([500,500],1);
    area.querySelector('[data-map-center]').onclick=()=>{if(current){jump(current.point);inspectMarker(0);}};
    area.querySelector('[data-map-search]').onchange=e=>{const[id,index]=e.target.value.split(':');const d=district(id);if(d){jump(index!==undefined?d.areas[Number(index)].center:d.center);inspect(id);}};
    area.querySelectorAll('[data-map-layer]').forEach(b=>b.onclick=()=>{const k=b.dataset.mapLayer;m.layers[k]=!m.layers[k];b.setAttribute('aria-pressed',m.layers[k]);draw();persist();});
    area.querySelectorAll('[data-zone],[data-marker]').forEach(g=>{const action=()=>g.dataset.marker!==undefined?inspectMarker(g.dataset.marker):inspect(g.dataset.zone);g.onclick=()=>{if(!moved&&!picking)action();};g.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();action();}};});
    const pinButton=area.querySelector('[data-map-pin]'),hint=area.querySelector('[data-map-hint]'),normalHint=hint.textContent;
    const setPick=enabled=>{picking=enabled;pinButton.setAttribute('aria-pressed',enabled);svg.classList.toggle('picking',enabled);hint.textContent=enabled?tr('Tap a place to move your story position. Escape or press this button again to cancel.','แตะสถานที่เพื่อกำหนดตำแหน่งในเรื่อง กด Escape หรือปุ่มเดิมเพื่อยกเลิก'):normalHint;};pinButton.onclick=()=>setPick(!picking);
    const keydown=e=>{if(e.key==='Escape'&&picking){e.preventDefault();e.stopPropagation();setPick(false);}};area.addEventListener('keydown',keydown,true);
    const midpoint=()=>{const p=[...pointers.values()];return {x:p.reduce((n,a)=>n+a.x,0)/p.length,y:p.reduce((n,a)=>n+a.y,0)/p.length,dist:p.length===2?Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y):0};};
    const begin=()=>{gesture={...midpoint(),view:{...v}};};
    svg.addEventListener('pointerdown',e=>{if(disposed)return;if((e.pointerType==='mouse'&&e.button!==0)||pointers.size>=2)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){moved=false;tapTarget=e.target.closest?.('[data-zone],[data-marker]');}else moved=true;try{svg.setPointerCapture?.(e.pointerId);}catch{}begin();});
    svg.addEventListener('pointermove',e=>{if(disposed)return;if(!pointers.has(e.pointerId)||!gesture)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const p=midpoint(),r=metrics(),old=gesture.view,unit=1000/old.scale/Math.min(r.width,r.height);v.scale=clamp(gesture.dist&&p.dist?old.scale*p.dist/gesture.dist:old.scale,1,64);const nextUnit=1000/v.scale/Math.min(r.width,r.height);v.x=old.x+(gesture.x-r.left-r.width/2)*unit-(p.x-r.left-r.width/2)*nextUnit;v.y=old.y+(gesture.y-r.top-r.height/2)*unit-(p.y-r.top-r.height/2)*nextUnit;if(pointers.size>1||Math.hypot(p.x-gesture.x,p.y-gesture.y)>6)moved=true;draw();});
    const end=e=>{if(disposed)return;if(!pointers.delete(e.pointerId))return;try{svg.releasePointerCapture?.(e.pointerId);}catch{}if(pointers.size){begin();return;}gesture=null;if(e.type==='pointerup'&&!moved){if(picking){const r=metrics(),p=[box.x+(e.clientX-r.left)/r.width*box.width,box.y+(e.clientY-r.top)/r.height*box.height];if(p.every(n=>n>=0&&n<=1000)){setPick(false);const d=atPoint(p),a=d.areas.find(a=>inside(p,a.polygon));onPick({district:d.id,subdistrict:a?.name||'',...unproject(...p)});}}else if(tapTarget?.dataset.marker!==undefined)inspectMarker(tapTarget.dataset.marker);else if(tapTarget?.dataset.zone)inspect(tapTarget.dataset.zone);else{const r=metrics();inspect(atPoint([box.x+(e.clientX-r.left)/r.width*box.width,box.y+(e.clientY-r.top)/r.height*box.height]).id);}}tapTarget=null;persist();};
    for(const name of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(name,end);
    // Wheel zoom stays within the map and does not affect page scrolling elsewhere.
    svg.addEventListener('wheel',e=>{if(disposed)return;e.preventDefault();const r=metrics(),oldUnit=box.unit,x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;v.scale*=Math.exp(-clamp(Math.abs(e.deltaY),0,150)*Math.sign(e.deltaY)*.003);v.scale=clamp(v.scale,1,64);const unit=1000/v.scale/Math.min(r.width,r.height);v.x+=x*(oldUnit-unit);v.y+=y*(oldUnit-unit);draw();persist();},{passive:false});
    retry.onclick=()=>{baseLoaded=false;baseFailed=false;base.setAttribute('href',source+'0/0/0.webp?retry='+Date.now());updateTiles(true);};
    const resize=()=>draw();let observer;
    if(globalThis.ResizeObserver){observer=new ResizeObserver(resize);observer.observe(svg);}else globalThis.addEventListener('resize',resize);
    draw();updateTiles();if(current)inspect(current.district.id);else area.querySelector('[data-map-detail]').textContent=tr('Set your story location, or switch off Exploration mask to browse the full map.','กำหนดตำแหน่งในเรื่อง หรือปิดตัวเลือกพื้นที่ไม่สำรวจเพื่อดูแผนที่เต็ม');
    return ()=>{disposed=true;cancelAnimationFrame(frame);observer?.disconnect();globalThis.removeEventListener('resize',resize);base.onload=base.onerror=null;for(const {el} of images.values())el.onload=el.onerror=null;images.clear();pointers.clear();};
  }
  globalThis.CyberpunkMap=Object.freeze({mount,project,unproject,normalizeLocation,pointOf,viewport,tilePlan,atPoint,district});
})();
