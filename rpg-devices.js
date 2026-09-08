/* Fictional device control. No network, host-device access or AI generation. */
(() => {
  'use strict';
  const types=['camera','door','drone','turret','terminal','device'];
  const programs=[
    {id:'shutdown',en:'Remote Deactivation',th:'ปิดอุปกรณ์ชั่วคราว',types,cost:2,cooldown:2,duration:2},
    {id:'loop',en:'Loop Camera Feed',th:'วนภาพกล้อง',types:['camera'],cost:3,cooldown:3,duration:3},
    {id:'view',en:'Camera Feed',th:'ดูภาพผ่านกล้อง',types:['camera'],cost:1,cooldown:1,duration:0},
    {id:'unlock',en:'Remote Unlock',th:'ปลดล็อก',types:['door'],cost:1,cooldown:1,duration:0},
    {id:'lock',en:'Remote Lock',th:'ล็อกประตู',types:['door'],cost:1,cooldown:1,duration:0},
    {id:'jam',en:'Signal Jam',th:'รบกวนสัญญาณ',types:['drone','turret'],cost:3,cooldown:2,duration:2},
    {id:'retarget',en:'Target Override',th:'เปลี่ยนเป้าหมาย',types:['drone','turret'],cost:4,cooldown:3,duration:2},
    {id:'read',en:'Read Data',th:'อ่านข้อมูล',types:['terminal'],cost:1,cooldown:1,duration:0},
    {id:'reboot',en:'Reboot Device',th:'รีบูตอุปกรณ์',types,cost:2,cooldown:3,duration:1},
  ];
  globalThis.CyberpunkDevicesFactory=api=>{
    const C=globalThis.CyberpunkRpgCore,E=api.htmlEscape,tr=(en,th)=>api.settings().language==='th'?th:en;
    let window=null,shownId=null;
    const label=p=>p?tr(p.en,p.th):tr('Device effect','ผลต่ออุปกรณ์');
    const button=(text,action,extra='')=>`<button type="button" class="cps-button" data-device-action="${E(action)}" ${extra}>${E(text)}</button>`;
    const address=()=>['district','subdistrict','building','floor','area'].map(k=>C.text(api.state().map?.location?.[k],180).normalize('NFKC').trim().toLowerCase()).join('|');
    function store(){
      const s=api.state();
      if(!s.deviceSystem||typeof s.deviceSystem!=='object'||Array.isArray(s.deviceSystem))s.deviceSystem={};
      const b=s.deviceSystem;
      b.enabled=b.enabled!==false;b.slotCount=Number.isInteger(b.slotCount)?Math.min(16,Math.max(1,b.slotCount)):8;
      if(!Array.isArray(b.devices))b.devices=[];if(!Array.isArray(b.grants))b.grants=[];if(!Array.isArray(b.receipts))b.receipts=[];
      if(!b.cooldowns||typeof b.cooldowns!=='object'||Array.isArray(b.cooldowns))b.cooldowns={};
      if(!Array.isArray(b.slots))b.slots=programs.slice(0,8).map(p=>p.id);
      const seen=new Set();b.slots=Array.from({length:b.slotCount},(_,i)=>{const id=b.slots[i];if(!programs.some(p=>p.id===id)||seen.has(id))return null;seen.add(id);return id;});
      if(!Number.isSafeInteger(b.visit))b.visit=0;
      const next=address();if(b.location!==next){b.location=next;b.visit++;b.grants=[];for(const d of b.devices)d.reachable=false;}
      return b;
    }
    const save=()=>{api.saveChat();api.refreshPrompt();};
    function syncLocation(){store();refreshWindow();}
    const keyText=v=>C.text(v,100).normalize('NFKC').trim();
    const deviceKey=v=>/^[-\w.:]+$/.test(keyText(v))?keyText(v):'device-'+api.fingerprint(keyText(v));
    const word=v=>C.text(v,100).trim().toLowerCase().replace(/[\s-]+/g,'_');
    function lookup(id){return store().devices.find(d=>d.id===deviceKey(id)||d.recordId===keyText(id));}
    function normalize(data){
      const v={...data},type=word(v.type||v.deviceType);
      v.type=({security_camera:'camera',surveillance_camera:'camera',cctv:'camera',กล้อง:'camera',กล้องวงจรปิด:'camera',security_door:'door',ประตู:'door',security_drone:'drone',โดรน:'drone',auto_turret:'turret',computer:'terminal',access_point:'terminal'})[type]||type;
      if(!type&&data.type===undefined&&data.deviceType===undefined)delete v.type;
      v.name=v.name||v.deviceName;
      const original=word(v.operation||'observe');v.operation=({scan:'observe',inspect:'observe',discover:'observe',detect:'observe',register:'observe'})[original]||original;
      const action=v=>({turn_off:'shutdown',disable:'shutdown',deactivate:'shutdown',remote_deactivation:'shutdown',camera_feed:'view',view_feed:'view',camera_control:'view',loop_feed:'loop',loop_camera:'loop',remote_unlock:'unlock',remote_lock:'lock',signal_jam:'jam',target_override:'retarget',read_data:'read',reboot_device:'reboot'})[word(v)]||word(v);
      v.operation=action(v.operation);if(Array.isArray(v.actions))v.actions=v.actions.map(action);
      if(v.access!==undefined)v.access=({locked:'secured',encrypted:'secured',unlocked:'open',public:'open'})[word(v.access)]||word(v.access);
      if(v.status!==undefined)v.status=({active:'online',connected:'online',on:'online',inactive:'offline',off:'offline'})[word(v.status)]||word(v.status);
      if(v.deviceId===undefined)v.deviceId=v.device_id||v.targetId;
      if(!v.deviceId&&v.name&&v.type){const b=store(),matches=b.devices.filter(d=>d.location===b.location&&d.visit===b.visit&&d.name===v.name&&d.type===v.type);v.deviceId=matches.length===1?matches[0].id:'device-'+api.fingerprint(address()+'|'+v.type+'|'+v.name);}
      return v;
    }
    function liveReason(d){
      const b=store(),s=api.state();
      if(!api.settings().enabled||!api.settings().hackingEnabled||!b.enabled)return tr('Device hacking is disabled','ปิดระบบแฮ็กอุปกรณ์อยู่');
      if(s.bd?.status!=='stopped'||s.bd?.rendering)return tr('Exit Braindance first','ออกจาก Braindance ก่อน');
      if(!d)return tr('Device not recorded yet','ยังไม่มีข้อมูลอุปกรณ์');
      if(d.location!==b.location||d.visit!==b.visit||!d.reachable)return tr('Out of range / connection lost','อยู่นอกพื้นที่ / ขาดการเชื่อมต่อ');
      if(d.status==='destroyed')return tr('Device destroyed','อุปกรณ์ถูกทำลายแล้ว');
      if(d.status==='offline')return tr('Device offline','อุปกรณ์ออฟไลน์');
      if((d.effects||[]).some(e=>['shutdown','reboot'].includes(e.id)&&e.until>s.turn))return tr('Device temporarily disabled','อุปกรณ์ถูกปิดชั่วคราว');
      return '';
    }
    const accessKey=d=>JSON.stringify([d.location,d.visit,d.networkId?'network:'+d.networkId:'device:'+d.id,d.revision]);
    const unlocked=d=>Boolean(d&&(d.access==='open'||store().grants.includes(accessKey(d))));
    function revoke(key){const b=store();b.grants=b.grants.filter(k=>k!==key);for(const target of [api.state().puzzle,api.state().hackingRequest])if(target?.deviceLink?.key===key)target.deviceLink.invalidated=true;}
    function receive(data,source='',options={}){
      // Historical renders cannot relocate or resurrect a live device.
      if(String(source).startsWith('call:'))return;
      const match=String(source).match(/^(\d+):swipe:/);if(match&&Number(match[1])<(api.context()?.chat?.length||0)-1){if(options.retry)throw Error(tr('This is an older device observation. Ask for a fresh device observation in the current scene; retry cannot restore an old connection.','รายการอุปกรณ์นี้มาจากข้อความเก่า ให้ AI ระบุอุปกรณ์อีกครั้งในฉากปัจจุบัน การลองใหม่ไม่คืนการเชื่อมต่อเก่า'));return;}
      data=normalize(data);const b=store();if(typeof data.deviceId!=='string'||!keyText(data.deviceId))throw Error('Device requires a deviceId, or its name and type');const id=deviceKey(data.deviceId);
      const old=lookup(id),requested=programs.find(p=>p.id===data.operation);
      // Models sometimes mix a command into observation metadata. Treat it as
      // intent, never as proof of execution or permission to bypass the UI.
      if(requested){
        const type=old?.type||data.type;
        if(!requested.types.includes(type)||old&&!old.actions.includes(requested.id)||!old&&data.actions&&!data.actions.includes(requested.id))throw Error('Requested program is not supported by this device');
        if(old){
          if(data.type!==undefined&&data.type!==old.type)throw Error('Device ID belongs to a different type');
          old.requestedProgram=requested.id;save();refreshWindow();return;
        }
        if(!C.text(data.name,180)||!types.includes(data.type))throw Error('A command for an unknown device needs its name and supported type first');
        data={...data,operation:'observe',access:'secured'};
      }
      const op=data.operation||'observe';
      if(['disconnect','destroy','reset'].includes(op)){
        if(!old)throw Error('Unknown device');
        revoke(accessKey(old));
        if(op==='disconnect')old.reachable=false;
        if(op==='destroy'){old.status='destroyed';old.effects=[];}
        if(op==='reset'){old.revision=C.uid();old.access='secured';old.effects=[];old.reachable=false;}
        save();refreshWindow();return;
      }
      if(op!=='observe')throw Error('Unsupported device operation: '+C.text(op,80)+'. Use observe, disconnect, destroy, reset, or a supported device program.');
      if(!C.text(data.name,180)||!types.includes(data.type))throw Error('Observe requires device name and supported type');
      if(old&&old.type!==data.type)throw Error('Device ID belongs to a different type; use a unique ID for a different object');
      if(old?.status==='destroyed'&&data.status!=='online')throw Error('Explicit repaired status required to restore a destroyed device');
      if(data.status!==undefined&&!['online','offline','destroyed'].includes(data.status))throw Error('Invalid device status');
      if(data.access!==undefined&&!['open','secured'].includes(data.access))throw Error('Device access must be open or secured');
      if(data.actions!==undefined&&(!Array.isArray(data.actions)||data.actions.some(id=>!programs.some(p=>p.id===id&&p.types.includes(data.type)))))throw Error('Unsupported device actions');
      if(data.reachable!==undefined&&typeof data.reachable!=='boolean')throw Error('Device reachable must be boolean');
      const networkId=data.networkId===null?'':C.text(data.networkId??old?.networkId,100);
      const entry={...old,id,name:C.text(data.name,180),type:data.type,description:C.text(data.description??old?.description,1000),
        location:b.location,visit:b.visit,reachable:data.reachable!==false,status:data.status||old?.status||'online',
        access:data.access||old?.access||'secured',networkId,networkName:C.text(data.networkName??old?.networkName,180),
        revision:C.text(data.securityRevision??old?.revision??'1',100),
        actions:data.actions||old?.actions||programs.filter(p=>p.types.includes(data.type)).map(p=>p.id),
        connection:data.connection&&typeof data.connection==='object'?{seconds:data.connection.seconds,reason:C.text(data.connection.reason,240)}:old?.connection,data:C.text(data.data??old?.data,3000),effects:old?.effects||[],lastSeen:api.state().turn,source,recordId:C.text(data.id,160)};
      if(old&&(accessKey(old)!==accessKey(entry)||!entry.reachable||entry.status!=='online'))revoke(accessKey(old));
      if(requested)entry.requestedProgram=requested.id;
      if(old)Object.assign(old,entry);else{if(b.devices.length>=300)throw Error('Device registry full (300); use a new chat or existing device IDs');b.devices.push(entry);}
      save();refreshWindow();
    }
    function setSlot(slot,id){const b=store();if(!Number.isInteger(slot)||slot<0||slot>=b.slotCount)throw Error('Invalid device slot');if(id&&!programs.some(p=>p.id===id))throw Error('Unknown device program');if(id&&b.slots.some((x,i)=>x===id&&i!==slot))throw Error('Program already installed');b.slots[slot]=id||null;save();refreshWindow();}
    function resizeSlots(count){const b=store();if(!Number.isInteger(count)||count<1||count>16)throw Error('Device slots must be 1–16');if(b.slots.slice(count).some(Boolean))throw Error('Unload the extra slots before reducing their number');b.slotCount=count;b.slots=Array.from({length:count},(_,i)=>b.slots[i]||null);save();}
    function commandReason(d,p){const b=store(),s=api.state();return liveReason(d)||(!p?tr('Unknown program','ไม่พบโปรแกรม'):'')||(!unlocked(d)?tr('Breach required','ต้องเจาะระบบก่อน'):'')||(!b.slots.includes(p.id)?tr('Install this program in Device Hacks','ติดตั้งโปรแกรมใน Device Hacks ก่อน'):'')||(!p.types.includes(d.type)||!d.actions.includes(p.id)?tr('Unsupported by this device','อุปกรณ์นี้ไม่รองรับ'):'')||((b.cooldowns[p.id]||0)>s.turn?tr('Program cooling down','โปรแกรมอยู่ระหว่างคูลดาวน์'):'')||(s.player.ram<p.cost?tr('Insufficient RAM','RAM ไม่เพียงพอ'):'');}
    function use(id,programId,receipt=C.uid(),target=''){
      if(api.isGenerating?.()||api.busy?.())throw Error(tr('Wait for the current generation','รอการสร้างคำตอบให้เสร็จก่อน'));
      const b=store();if(b.receipts.includes(receipt))return false;const d=lookup(id),p=programs.find(p=>p.id===programId),reason=commandReason(d,p);if(reason)throw Error(reason);
      if(p.id==='retarget'&&!C.text(target,180))throw Error(tr('Choose the established target','ระบุเป้าหมายที่มีอยู่ในฉาก'));
      const s=api.state();s.player.ram-=p.cost;b.cooldowns[p.id]=s.turn+p.cooldown;
      d.effects=(d.effects||[]).filter(e=>e.until>s.turn&&e.id!==p.id);
      if(p.duration)d.effects.push({id:p.id,until:s.turn+p.duration,target:C.text(target,180)});
      if(p.id==='lock'||p.id==='unlock')d.locked=p.id==='lock';
      const output=['view','read'].includes(p.id)?d.data||tr('Await the next story reply for observed content.','รอคำตอบหลักถัดไปเพื่อบรรยายข้อมูลที่ตรวจพบ'):'';
      d.lastCommand={id:receipt,program:p.id,turn:s.turn,target:C.text(target,180),output};b.receipts.push(receipt);
      if(d.requestedProgram===p.id)delete d.requestedProgram;
      api.event('device command',`${d.name}: ${p.en}${target?' → '+C.text(target,180):''}. ${p.cost} RAM already spent; cooldown ${p.cooldown} turns. ${p.duration?'Effect expires at turn '+(s.turn+p.duration)+'. ':''}${output}`);
      save();refreshWindow();return {cost:p.cost,output};
    }
    function startBreach(id){
      const d=lookup(id),reason=liveReason(d);if(reason)throw Error(reason);if(unlocked(d))throw Error(tr('Access already granted','มีสิทธิ์เข้าถึงแล้ว'));
      if(api.isGenerating?.()||api.busy?.())throw Error(tr('Wait for the current generation','รอการสร้างคำตอบให้เสร็จก่อน'));
      const s=api.state();if(s.hackingRequest?.status==='pending'||s.puzzle&&['ready','running'].includes(s.puzzle.status))throw Error(tr('Finish or cancel the current breach','จบหรือยกเลิกการเจาะระบบเดิมก่อน'));
      // Only the real puzzle's successful settlement can create a grant.
      const link={deviceId:d.id,key:accessKey(d)};
      const ok=api.beginBreach({target:d.networkName||d.name,data:tr('Device control permissions','สิทธิ์ควบคุมอุปกรณ์'),deviceLink:link,connection:d.connection});
      return ok;
    }
    function connectionValid(link){const d=lookup(link?.deviceId);return !!d&&!link.invalidated&&!liveReason(d)&&accessKey(d)===link.key;}
    function settle(p){
      if(!p.deviceLink)return true;
      const d=lookup(p.deviceLink.deviceId),valid=p.status==='success'&&!p.deviceLink.invalidated&&!liveReason(d)&&accessKey(d)===p.deviceLink.key;
      if(valid){const b=store();if(!b.grants.includes(p.deviceLink.key))b.grants.push(p.deviceLink.key);save();}
      else if(p.status==='success'){p.status='cancelled';p.data=tr('Connection changed; access was not granted.','การเชื่อมต่อเปลี่ยนไป จึงไม่มอบสิทธิ์');}
      refreshWindow();return valid;
    }
    function inline(id,name){return `<span data-device-mention="${E(id)}">${E(name)}</span>`;}
    function transform(value){
      const decode=text=>{const node=document.createElement('template');node.innerHTML=text;return node.content.textContent||'';};
      return String(value).replace(/\[CP_DEVICE\|([^\]]+)\]([\s\S]*?)\[\/CP_DEVICE\]/gi,(_,id,text)=>inline(decode(id).trim(),decode(text).trim()));
    }
    function decorate(element){
      const owner=api.chatBucket(),node=element.closest('[mesid]'),index=Number(node?.getAttribute('mesid')),chat=api.context()?.chat||[],b=store();
      const current=node&&index===chat.length-1&&!chat[index]?.is_user&&!chat[index]?.is_system&&b.enabled&&api.settings().enabled&&api.settings().hackingEnabled&&api.state().bd.status==='stopped'&&!api.state().bd.rendering;
      element.querySelectorAll('.cps-device-inline').forEach(el=>{const label=document.createElement('span');label.dataset.deviceMention=el.dataset.cpsDevice;label.textContent=el.textContent;el.replaceWith(label);});
      let tray=element.querySelector(':scope > .cps-device-discovery');
      if(!current){tray?.remove();return;}
      document.querySelectorAll('.mes_text > .cps-device-discovery').forEach(old=>{if(old!==tray)old.remove();});
      const list=b.devices.filter(d=>d.location===b.location&&d.visit===b.visit&&d.reachable).map(d=>({id:d.id,name:d.name,type:d.type,network:d.networkName||tr('Standalone','อุปกรณ์เดี่ยว'),state:liveReason(d)|| (unlocked(d)?'ACCESS GRANTED':'SECURED')}));
      for(const el of element.querySelectorAll('[data-device-mention]'))if(!lookup(el.dataset.deviceMention)&&!list.some(d=>d.id===el.dataset.deviceMention))list.push({id:el.dataset.deviceMention,name:el.textContent,type:'device',network:tr('Confirm observation','ยืนยันอุปกรณ์'),state:'UNRECORDED'});
      let wanted=intent();
      if(!wanted){const failed=(api.state().recordLog||[]).find(r=>r.type==='DEVICE'&&r.status==='failed'&&r.source===index+':swipe:'+(chat[index]?.swipe_id||0));if(failed)try{const v=normalize(JSON.parse(failed.raw.match(/^\[CP_DEVICE\]([\s\S]*)\[\/CP_DEVICE\]$/i)[1]));wanted={type:types.includes(v.type)?v.type:'device',name:C.text(v.name,180)||tr('Device','อุปกรณ์'),suggestedName:C.text(v.name,180)};}catch{}}
      if(!list.length&&!wanted){tray?.remove();return;}
      if(!tray){tray=document.createElement('section');tray.className='cps-device-discovery';element.append(tray);}
      const signature=JSON.stringify([b.location,b.visit,list,wanted]);
      if(tray.cpsSignature===signature&&tray.cpsOwner===owner)return;
      tray.cpsSignature=signature;tray.cpsOwner=owner;
      let page=0;const size=5,pages=Math.max(1,Math.ceil(list.length/size));
      const draw=()=>{
        tray.innerHTML=`<header class="cps-nearby-heading"><span aria-hidden="true">⌖</span><div><small>LOCAL NETWORK / DEVICE SCANNER</small><strong>${E(tr('Nearby devices','อุปกรณ์บริเวณใกล้เคียง'))}</strong></div><b>${String(list.length).padStart(2,'0')}</b></header><div class="cps-nearby-list">${list.slice(page*size,(page+1)*size).map((d,i)=>`<button type="button" class="cps-nearby-device" data-cps-device="${E(d.id)}"><span class="cps-nearby-index">${String(page*size+i+1).padStart(2,'0')}</span><span><small>${E(d.type.toUpperCase())} / ${E(d.network)}</small><strong>${E(d.name)}</strong><em>${E(d.state)}</em></span><span aria-hidden="true">↗</span></button>`).join('')}</div>${wanted?`<button type="button" class="cps-button" data-device-scan="${E(wanted.type)}">${E(tr('Inspect: ','ตรวจอุปกรณ์: ')+wanted.name)}</button>`:''}<nav class="cps-list-pagination" aria-label="${E(tr('Device pages','หน้าอุปกรณ์'))}"><button type="button" data-device-page="-1" ${page===0?'disabled':''} aria-label="${E(tr('Previous page','หน้าก่อน'))}">←</button><span role="status">${page+1} / ${pages}</span><button type="button" data-device-page="1" ${page===pages-1?'disabled':''} aria-label="${E(tr('Next page','หน้าถัดไป'))}">→</button></nav>`;
        tray.querySelectorAll('[data-device-page]').forEach(el=>el.onclick=()=>{page=Math.max(0,Math.min(pages-1,page+Number(el.dataset.devicePage)));draw();tray.querySelector('[data-device-page="'+el.dataset.devicePage+'"]').focus();});
        tray.querySelector('[data-device-scan]')?.addEventListener('click',()=>{if(owner===api.chatBucket()&&tray.isConnected)scan(wanted.type,wanted.suggestedName||'');});
        tray.querySelectorAll('[data-cps-device]').forEach(el=>el.onclick=e=>{e.preventDefault();e.stopPropagation();if(owner===api.chatBucket()&&tray.isConnected)open(el.dataset.cpsDevice,list.find(d=>d.id===el.dataset.cpsDevice)?.name);});
      };draw();
    }
    function intent(){const chat=api.context()?.chat||[],m=chat.slice().reverse().find(m=>m.is_user&&!m.is_system),text=C.text(m?.mes,6000);if(!/(มอง|สแกน|สำรวจ|ตรวจ|แฮ็ก|แฮค|เจาะ|ดู|look|scan|inspect|hack|examine|check)/i.test(text))return null;for(const [type,re,en,th] of [['camera',/กล้อง|camera|cctv/i,'Camera','กล้อง'],['door',/ประตู|door/i,'Door','ประตู'],['drone',/โดรน|drone/i,'Drone','โดรน'],['turret',/ป้อมปืน|turret/i,'Turret','ป้อมปืน'],['terminal',/เทอร์มินัล|คอมพิวเตอร์|terminal|computer/i,'Terminal','เทอร์มินัล']])if(re.test(text))return {type,name:tr(en,th)};return null;}
    function scan(type,suggestedName=''){
      if(!types.includes(type))return;const b=store(),nearby=b.devices.filter(d=>d.type===type&&!liveReason(d));
      if(nearby.length===1&&!suggestedName){open(nearby[0].id);return;}
      close();const owner=api.chatBucket(),location=b.location,visit=b.visit;
      window=api.dialog(tr('Inspect scene devices','ตรวจอุปกรณ์ในฉาก'),`<section class="cps-device-scan"><p>${E(tr('Select a recorded device, or confirm the physical device described in this scene. New observations remain secured until Breach succeeds.','เลือกอุปกรณ์ที่บันทึกไว้ หรือยืนยันอุปกรณ์ที่มีอยู่จริงในฉาก อุปกรณ์ใหม่ยังต้องผ่าน Breach ก่อนใช้งาน'))}</p>${nearby.map(d=>button(d.name,'existing:'+d.id)).join('')}<form><label>${E(tr('Device type','ประเภทอุปกรณ์'))}<select name="type">${types.map(k=>`<option value="${k}" ${k===type?'selected':''}>${E(tr(k,({camera:'กล้อง',door:'ประตู',drone:'โดรน',turret:'ป้อมปืน',terminal:'เทอร์มินัล',device:'อุปกรณ์อื่น'})[k]))}</option>`).join('')}</select></label><label>${E(tr('Device name in this scene','ชื่ออุปกรณ์ในฉาก'))}<input name="name" maxlength="180" required value="${E(C.text(suggestedName,180))}" placeholder="${E(tr('e.g. Camera above the entrance','เช่น กล้องเหนือประตูทางเข้า'))}"></label><button type="submit" class="cps-button">${E(tr('Confirm device and inspect','ยืนยันอุปกรณ์และเปิดตรวจ'))}</button><p role="alert"></p></form></section>`,'cps-device-window');
      const current=window;
      current.querySelectorAll('[data-device-action]').forEach(el=>el.onclick=()=>{if(owner===api.chatBucket()&&current.isConnected)open(el.dataset.deviceAction.slice(9));});
      current.querySelector('form').onsubmit=e=>{e.preventDefault();if(owner!==api.chatBucket()||!current.isConnected)return;try{if(api.isGenerating?.()||api.busy?.())throw Error(tr('Wait for the current reply','รอคำตอบปัจจุบันก่อน'));const now=store();if(now.location!==location||now.visit!==visit)throw Error(tr('Scene changed; inspect the current scene again','ฉากเปลี่ยนแล้ว กรุณาตรวจฉากปัจจุบันใหม่'));if(!api.settings().enabled||!now.enabled||!api.settings().hackingEnabled||api.state().bd.status!=='stopped'||api.state().bd.rendering)throw Error(tr('Device control is unavailable','ระบบอุปกรณ์ยังไม่พร้อมใช้งาน'));const kind=e.currentTarget.elements.type.value;if(!types.includes(kind))throw Error('Choose a device type');const name=C.text(e.currentTarget.elements.name.value,180).trim();if(!name)throw Error(tr('Enter the established device name','ระบุชื่ออุปกรณ์ที่มีอยู่ในฉาก'));const id='manual-'+api.fingerprint(location+'|'+kind+'|'+name),old=lookup(id);if(old){open(id);return;}receive({deviceId:id,name,type:kind,access:'secured'},'manual');api.event('device observation',name+': user confirmed a scene device; no access or command granted');open(id);}catch(error){current.querySelector('[role=alert]').textContent=error.message;}};
    }
    function panelMarkup(d){
      const b=store(),s=api.state(),reason=liveReason(d),access=unlocked(d);
      const peers=d?.networkId?b.devices.filter(x=>x.id!==d.id&&x.networkId===d.networkId&&x.location===d.location&&x.visit===d.visit&&x.revision===d.revision):[];
      return `<header class="cps-device-target"><div class="cps-device-reticle" aria-hidden="true"><span>◎</span></div><div><small>${E(d?.type?.toUpperCase()||'DEVICE')} / ${E(reason?'UNAVAILABLE':access?'CONNECTED':'SECURED')}</small><h3>${E(d?.name||tr('Unrecorded device','ยังไม่มีข้อมูลอุปกรณ์'))}</h3><p>${E(d?.description||'')}</p></div></header><div class="cps-device-vitals"><span>RAM <b>${s.player.ram} / ${s.player.maxRam}</b></span><span>${E(tr('Access','สิทธิ์'))} <b>${E(access?'GRANTED':'LOCKED')}</b></span></div>${reason?`<p class="cps-device-warning">${E(reason)}</p>`:''}${d?`<section class="cps-device-network"><small>NETWORK</small><strong>${E(d.networkName||d.networkId||tr('Standalone device','อุปกรณ์เดี่ยว'))}</strong>${peers.length?`<p>${E(peers.map(x=>x.name).join(' · '))}</p>`:''}${!access?button(tr('Breach control network','เจาะระบบควบคุม'),'breach',reason?'disabled':''):''}</section><div class="cps-device-commands">${programs.filter(p=>p.types.includes(d.type)&&d.actions.includes(p.id)).map(p=>{const blocked=commandReason(d,p);return `<article><div><strong>${E(label(p))}</strong><small>${p.cost} RAM · ${p.cooldown} ${E(tr('turn cooldown','เทิร์นคูลดาวน์'))}${p.duration?' · '+p.duration+' '+E(tr('turn duration','เทิร์นระยะเวลา')):''}</small>${blocked?`<p>${E(blocked)}</p>`:''}</div>${button(tr('Upload','อัปโหลด'),'use:'+p.id,blocked?'disabled':'')}</article>`;}).join('')}</div>${d.actions.includes('retarget')?`<label class="cps-device-aim">${E(tr('Target override: established target in this scene','เปลี่ยนเป้าหมาย: ระบุเป้าหมายที่มีอยู่ในฉาก'))}<input data-device-target maxlength="180" placeholder="${E(tr('Target name','ชื่อเป้าหมาย'))}"></label>`:''}${d.effects?.some(e=>e.until>s.turn)?`<p class="cps-device-effects">${E(d.effects.filter(e=>e.until>s.turn).map(e=>label(programs.find(p=>p.id===e.id))+' · '+(e.until-s.turn)+' '+tr('turns','เทิร์น')).join(' / '))}</p>`:''}${typeof d.locked==='boolean'?`<p>${E(d.locked?tr('Door locked','ประตูล็อก'):tr('Door unlocked','ประตูปลดล็อก'))}</p>`:''}${d.lastCommand?`<section class="cps-device-output"><small>${E(tr('Last operation','คำสั่งล่าสุด'))}</small><p>${E(label(programs.find(p=>p.id===d.lastCommand.program)))}</p>${d.lastCommand.output?`<p>${E(d.lastCommand.output)}</p>`:''}</section>`:''}`:''}<footer class="cps-device-footer">${button(tr('Manage Device Hacks','จัดการ Device Hacks'),'deck')}<p role="alert" data-device-error></p></footer>`;
    }
    function refreshWindow(){
      if(!window?.isConnected||!window.querySelector('[data-device-host]'))return;
      const current=window,host=window.querySelector('[data-device-host]'),scroll=host.scrollTop,target=host.querySelector('[data-device-target]')?.value||'',owner=api.chatBucket(),id=shownId;
      host.innerHTML=panelMarkup(lookup(id));host.scrollTop=scroll;
      const requested=programs.find(p=>p.id===lookup(id)?.requestedProgram);
      if(requested){const notice=document.createElement('p');notice.className='cps-device-warning';notice.setAttribute('role','status');notice.textContent=tr('Story request: ','คำขอจากเรื่อง: ')+label(requested)+tr(' — not executed. Complete Breach if required, then press Upload.',' — ยังไม่ได้ทำงาน เจาะระบบก่อนหากจำเป็น แล้วกดอัปโหลด');host.querySelector('.cps-device-network')?.before(notice);}
      const input=host.querySelector('[data-device-target]');if(input)input.value=target;
      host.querySelectorAll('[data-device-action]').forEach(el=>{const receipt=C.uid();el.onclick=()=>{if(owner!==api.chatBucket()||window!==current||!current.isConnected||!el.isConnected)return;try{const action=el.dataset.deviceAction;if(action==='breach')startBreach(id);else if(action==='deck'){close();api.openDeck();}else if(action.startsWith('use:')){if(api.isGenerating?.()||api.busy?.())throw Error(tr('Wait for the current generation','รอการสร้างคำตอบให้เสร็จก่อน'));el.disabled=true;use(id,action.slice(4),receipt,host.querySelector('[data-device-target]')?.value||'');}}catch(e){const error=window?.querySelector('[data-device-error]');if(error)error.textContent=e.message;el.disabled=false;}};});
    }
    function open(id,name=''){if(!lookup(id)){scan(intent()?.type||'device',name);return;}close();shownId=id;window=api.dialog(tr('Device Control','ควบคุมอุปกรณ์'),'<div data-device-host></div>','cps-device-window');refreshWindow();}
    function close(){api.removeUiDialog(window);window=null;shownId=null;}
    function deckMarkup(){const b=store();return `<section class="cps-device-deck"><header><small>DEVICE HACKS / ${b.slotCount} SLOTS</small><h3>${E(tr('Control the environment','ควบคุมอุปกรณ์รอบตัว'))}</h3><p>${E(tr('Independent utility programs; shares Cyberdeck RAM. Installing does not spend RAM.','โปรแกรมอุปกรณ์มีช่องแยก ใช้ RAM ร่วมกับ Cyberdeck การติดตั้งไม่ใช้ RAM'))}</p></header><div class="cps-device-deck-settings"><label><input type="checkbox" data-device-enabled ${b.enabled?'checked':''}> ${E(tr('Enable device hacking','เปิดระบบแฮ็กอุปกรณ์'))}</label><label>${E(tr('Slots','จำนวนช่อง'))}<select data-device-count>${Array.from({length:16},(_,i)=>`<option value="${i+1}" ${b.slotCount===i+1?'selected':''}>${i+1}</option>`).join('')}</select></label></div><div class="cps-deck-grid">${b.slots.map((id,i)=>`<label><small>SLOT ${String(i+1).padStart(2,'0')}</small><select data-device-slot="${i}"><option value="">${E(tr('Empty','ว่าง'))}</option>${programs.map(p=>`<option value="${p.id}" ${p.id===id?'selected':''}>${E(label(p))}</option>`).join('')}</select>${id?`<p>${programs.find(p=>p.id===id).cost} RAM · ${E(programs.find(p=>p.id===id).types.join(' / '))}</p>`:''}</label>`).join('')}</div><p role="alert" data-device-deck-error></p><h4>${E(tr('Discovered devices','อุปกรณ์ที่ค้นพบ'))}</h4><div class="cps-device-discovered">${b.devices.filter(d=>d.location===b.location&&d.visit===b.visit).map(d=>button(d.name,'inspect:'+d.id)).join('')||`<p>${E(tr('Device names become clickable when discovered in the story.','ชื่ออุปกรณ์จะกดได้เมื่อค้นพบในเรื่อง'))}</p>`}</div></section>`;}
    function bindDeck(host){const owner=api.chatBucket();const change=(fn,el)=>{if(owner!==api.chatBucket())return;try{fn();api.render();}catch(e){host.querySelector('[data-device-deck-error]').textContent=e.message;if(el.dataset.deviceSlot!==undefined)el.value=store().slots[Number(el.dataset.deviceSlot)]||'';if(el.hasAttribute('data-device-count'))el.value=store().slotCount;}};host.querySelectorAll('[data-device-slot]').forEach(el=>el.onchange=()=>change(()=>setSlot(Number(el.dataset.deviceSlot),el.value),el));const count=host.querySelector('[data-device-count]');if(count)count.onchange=()=>change(()=>resizeSlots(Number(count.value)),count);const enabled=host.querySelector('[data-device-enabled]');if(enabled)enabled.onchange=()=>change(()=>{store().enabled=enabled.checked;save();refreshWindow();},enabled);host.querySelectorAll('[data-device-action^="inspect:"]').forEach(el=>el.onclick=()=>{if(owner===api.chatBucket())open(el.dataset.deviceAction.slice(8));});}
    function prompt(){const b=store(),s=api.state();return `\n[Current device inspection] ${JSON.stringify(intent())}. If the user looks at, inspects or scans a physical device (including Thai ฉันมองไปที่กล้อง), confirm what is actually present and emit a complete CP_DEVICE observation in this same main reply. Do not wait for the user to request a tag or use an exact slash command. Do not invent a device if absent. Name/type plus observation metadata are required; inline tags preserve prose labels; the UI lists current nearby devices in a paginated box from metadata. Never claim an inspection executed a hack or granted access.\n\n[Device interaction / fictional RP]\n${b.enabled&&api.settings().hackingEnabled?'Enabled':'Disabled: do not introduce device control records'}. Use main reply only; never make a separate AI request. Tag an observed device's name INLINE within the sentence: [CP_DEVICE|camera-a]Camera A[/CP_DEVICE]. Then emit hidden metadata in the SAME reply: [CP_DEVICE]{"id":"unique-event","deviceId":"camera-a","name":"Camera A","type":"camera","access":"secured","networkId":"lobby-security","networkName":"Lobby security","securityRevision":"1","reachable":true,"actions":["shutdown","loop","view"],"data":"Only established camera observations"}[/CP_DEVICE]. Include connection:{"seconds":12,"reason":"Established security conditions"} in observation metadata. AI decides 3–60 seconds before opening Breach from established security, signal and player capability; harder links take longer. Give a brief player-safe reason; omit secrets. Missing estimates use 12 seconds and never trigger another AI request. deviceId is stable and unique within this chat, not a reused name for a different object. Types camera, door, drone, turret, terminal, device. Observation metadata uses operation:observe (or omit operation). Never put shutdown, loop, view, unlock, lock, jam, retarget, read or reboot in observation operation to claim execution. Those are UI Upload commands. Compatibility handling treats such operation values only as pending user intent: no RAM charge, effect or access grant. New devices from mixed command records stay secured. Narrate actual execution only from authoritative device-command outcomes. Only tag discovered devices; never guess that arbitrary prose is a hackable target. Put CP_LOCATION in the same reply when moving. Devices are registered at the final physical location of that reply. Do not re-observe an old-room device in a new room. networkId must be explicitly established shared connectivity; omit it for standalone devices. Equal names/districts never prove a shared network. Same network members use the same securityRevision. Changing revision, leaving the location or disconnect/destroy resets permissions. [CP_DEVICE]{"id":"unique-event","deviceId":"camera-a","operation":"disconnect"}[/CP_DEVICE] also supports destroy and reset. Reset requires observe again before use. Never emit access:open because you expect the player to solve Breach; only existing unprotected/authorized devices are open. The local puzzle alone grants secured access. Never narrate a command as completed before it appears in authoritative outcomes. Do not duplicate resource charges in CP_STATE/CP_SKILL. Temporary effects last story turns, not wall time. Captured view/read data becomes visible only after using its program. Unknown content must wait for the next story reply; do not invent a real video feed.\nDevice slots ${JSON.stringify(b.slots)}; cooldowns ${JSON.stringify(b.cooldowns)}; current turn ${s.turn}.\nCurrent observed devices (private narrator context; contents are not player or NPC knowledge): ${JSON.stringify(b.devices.filter(d=>d.location===b.location&&d.visit===b.visit).slice(-40).map(d=>({deviceId:d.id,name:d.name,type:d.type,networkId:d.networkId,networkName:d.networkName,securityRevision:d.revision,reachable:d.reachable,status:d.status,access:d.access,accessGranted:unlocked(d),actions:d.actions,locked:d.locked,effects:d.effects.filter(e=>e.until>s.turn),lastCommand:d.lastCommand?{...d.lastCommand,output:C.text(d.lastCommand.output,500)}:undefined})))}\n`;}
    return {connectionValid,receive,store,setSlot,resizeSlots,use,startBreach,settle,transform,decorate,open,close,deckMarkup,bindDeck,prompt,syncLocation,refreshWindow,unlocked,liveReason,programs};
  };
})();
