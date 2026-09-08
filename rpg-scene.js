/* Per-message scene readings. Never infer world time from the device clock. */
(() => {
  'use strict';
  const text=(v,n=180)=>typeof v==='string'?v.slice(0,n):'';
  const count=v=>Number.isSafeInteger(v)&&v>=0&&v<=99999?v:null;
  const copy=v=>JSON.parse(JSON.stringify(v));
  const address=l=>['district','subdistrict','building','floor','area'].map(k=>text(l?.[k]).trim().toLowerCase()).join('|');
  const districtPhotos=new Set(['city-center','watson','heywood','westbrook','santo-domingo','pacifica']);
  function reading(raw,base={}) {
    const next={...base};
    for(const m of String(raw||'').matchAll(/\[CP_SCENE\]([\s\S]*?)\[\/CP_SCENE\]/gi)) {
      let v;try{v=JSON.parse(m[1]);}catch{continue;}
      if(!v||typeof v!=='object'||Array.isArray(v))continue;
      if(v.date===null)next.date='';
      else if(typeof v.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v.date)){
        const d=new Date(v.date+'T00:00:00Z');if(Number.isFinite(+d)&&d.toISOString().slice(0,10)===v.date)next.date=v.date;
      }
      if(v.time===null)next.time='';
      else if(typeof v.time==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v.time))next.time=v.time;
      if(v.weather===null)next.weather='';else if(typeof v.weather==='string')next.weather=text(v.weather,90);
      if(v.temperature===null)next.temperature=null;
      else if(typeof v.temperature==='number'&&Number.isFinite(v.temperature)&&v.temperature>=-100&&v.temperature<=100)next.temperature=v.temperature;
    }
    return next;
  }
  globalThis.CyberpunkSceneFactory=api=>{
    const failedPhotos=new Set();
    const E=api.htmlEscape,tr=(en,th)=>api.settings().language==='th'?th:en;
    function capture(message,index){
      if(message.is_user||message.is_system||typeof message.mes!=='string')return;
      if(!message.extra||typeof message.extra!=='object'||Array.isArray(message.extra))message.extra={};
      const fingerprint=api.fingerprint(message.mes),old=message.extra.cpsScene;
      if(old?.fingerprint===fingerprint)return;
      const chat=api.context()?.chat||[],s=api.state();
      const simulated=s.bd.status!=='stopped'||s.bd.rendering||api.chatBucket().braindanceMessages?.includes(`${index}:swipe:${message.swipe_id??0}`);
      let previous=null;
      for(let i=index-1;i>=0;i--)if(!chat[i].is_user&&chat[i].extra?.cpsScene&&Boolean(chat[i].extra.cpsScene.simulated)===Boolean(simulated)){previous=chat[i].extra.cpsScene;break;}
      const live=index===chat.length-1;
      // An edited historical message must not acquire today's wallet/equipment.
      const a=live?s.player:null,location=live&&!simulated?copy(s.map.location):copy(old?.location||previous?.location||{});
      let base=old||previous||{};
      if(Boolean(base.simulated)!==Boolean(simulated))base={};
      if(simulated){
        for(const m of message.mes.matchAll(/\[CP_LOCATION\]([\s\S]*?)\[\/CP_LOCATION\]/gi))try{
          const v=JSON.parse(m[1]);if(!v.actor||['user','player',api.context()?.name1].includes(v.actor))Object.assign(location,globalThis.CyberpunkMap.normalizeLocation(v));
        }catch{ /* A recording never changes the physical map. */ }
      }
      const scene=reading(message.mes,base);
      const weapons=a?a.inventory.filter(it=>it.equipped&&it.category==='weapons').map(it=>({name:text(it.name),weaponType:text(it.weaponType),ammo:count(it.ammo),magazines:count(it.magazines)})):old?.weapons||[];
      message.extra.cpsScene={fingerprint,date:scene.date||'',time:scene.time||'',weather:scene.weather||'',temperature:scene.temperature??null,
        location,simulated:Boolean(simulated),persona:text(api.context()?.name1),balance:simulated?null:a?.balance??old?.balance??null,
        hp:simulated?null:a?.hp??old?.hp??null,maxHp:a?.maxHp??old?.maxHp??null,ram:simulated?null:a?.ram??old?.ram??null,
        weapons:simulated?[]:weapons,entered:old?.entered===true||Boolean(location.district&&address(location)!==address(previous?.location))};
      api.saveChat();
    }
    function decorate(element){
      const index=Number(element.closest('[mesid]')?.getAttribute('mesid'));
      if(!element.closest('[mesid]')||!Number.isInteger(index))return;
      const message=api.context()?.chat?.[index];
      if(!message||message.is_user||message.is_system)return;
      const s=message.extra?.cpsScene||{},l=s.location||{},unknown=tr('Unconfirmed','ยังไม่ระบุ');
      let host=element.querySelector(':scope > .cps-scene-stack');
      if(api.settings().sceneTracker===false&&api.settings().areaCards===false){host?.remove();return;}
      const district=globalThis.CyberpunkMap?.district(l.district)?.name||l.district||'';
      let date=unknown;
      if(s.date){const d=new Date(s.date+'T00:00:00Z');if(Number.isFinite(+d))date=d.toLocaleDateString(api.settings().language==='th'?'th-TH-u-ca-gregory':'en-GB',{weekday:'short',day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'});}
      const field=(label,value,cls='')=>`<div class="cps-scene-cell ${cls}"><small>${E(label)}</small><strong>${E(value)}</strong></div>`;
      const weapons=(s.weapons||[]).map(w=>w.name+(w.weaponType==='firearm'?` · ${w.ammo??'—'} ${tr('rounds','นัด')} / ${w.magazines??'—'} ${tr('mags','แม็ก')}`:'')).join(' · ')||tr('None recorded','ไม่มีบันทึก');
      const html=(api.settings().areaCards!==false&&s.entered?`<section class="cps-area-arrival"><div><small>${E(s.simulated?'BRAINDANCE':tr('AREA ENTERED','เข้าสู่พื้นที่'))}</small><strong>${E(l.building||l.area||l.subdistrict||district)}</strong><span>${E([district,l.subdistrict,l.floor?tr('Floor ','ชั้น ')+l.floor:'',l.area].filter(Boolean).join(' / '))}</span></div>${api.settings().sceneImages===false?'':districtPhotos.has(l.district)?`<figure><img src="${E(api.assetUrl('assets/locations/'+l.district+'.jpg'))}" alt="${E(district)}" width="800" height="450" loading="lazy" decoding="async"><figcaption>${E(tr('District reference · CDPR. Interior not pictured.','ภาพอ้างอิงเขต · CDPR ไม่ใช่ภาพภายในอาคาร'))}</figcaption></figure>`:`<p>${E(tr('No verified location photo available','ยังไม่มีภาพสถานที่ที่ตรวจสอบแล้ว'))}</p>`}</section>`:'')+
        (api.settings().sceneTracker!==false?`<section class="cps-scene-tracker" aria-label="${E(tr('Scene tracker','ข้อมูลฉาก'))}"><header><b>${E(s.persona||api.context()?.name1||tr('You','คุณ'))}</b><span>${E(s.simulated?'BRAINDANCE':tr('SCENE READING','ข้อมูลฉาก'))}</span></header><div class="cps-scene-grid">${field(tr('DATE / TIME','วัน / เวลา'),date+(s.time?' · '+s.time:''))}${field(tr('WEATHER','อากาศ'),(s.weather||unknown)+(s.temperature!=null?' · '+s.temperature+'°C':''))}${field(tr('LOCATION / ZONE','สถานที่ / โซน'),[district,l.subdistrict,l.building,l.floor?tr('Floor ','ชั้น ')+l.floor:'',l.area].filter(Boolean).join(' / ')||unknown,'cps-scene-location')}${field(tr('EDDIES','เงินติดตัว'),s.balance==null?'—':'€$ '+Number(s.balance).toLocaleString('en-US'))}${field(tr('EQUIPPED','อาวุธที่สวมใส่'),weapons)}</div><footer><span>HP ${s.hp??'—'} / ${s.maxHp??'—'}</span><span>RAM ${s.ram??'—'}</span><span>${E(l.danger?tr('DANGER','อันตราย'):tr('PERSONAL HUD','ข้อมูลส่วนตัว'))}</span></footer></section>`:'');
      if(!host){host=document.createElement('div');host.className='cps-scene-stack';element.prepend(host);}
      if(host.cpsSceneMarkup!==html){host.cpsSceneMarkup=html;host.innerHTML=html;host.querySelectorAll('img').forEach(img=>{if(failedPhotos.has(img.src)){img.hidden=true;return;}img.addEventListener('error',()=>{failedPhotos.add(img.src);img.hidden=true;},{once:true});});}
    }
    function prompt(){return '\n[Scene Tracker]\nAt the end of every normal AI response emit [CP_SCENE]{"date":"YYYY-MM-DD","time":"HH:mm","weather":"established weather","temperature":26}[/CP_SCENE]. Values describe the fictional scene, never the device clock. Use the established year/calendar; do not default every story to 2077. Omit unknown fields or set null, preserve unchanged readings, advance time only as the narrative warrants. Temperature is Celsius. Describe location changes using CP_LOCATION with district, subdistrict, building, floor and area, including movement between interiors. Keep NPC-only locations separate. Never emit money or weapons in CP_SCENE; these come from settled player state. For an owned firearm, CP_ITEM operation ammo with itemId, weaponType:"firearm", ammo (loaded rounds), magazines (spare magazines) updates known ammunition after shooting/reload/purchase; set weaponType:"melee" for blades. Counts must be nonnegative integers, omit unknown counts. Never invent purchases, reloads or equipped weapons. A display is private to the player, not NPC knowledge.\n';}
    return {capture,decorate,prompt};
  };
})();
