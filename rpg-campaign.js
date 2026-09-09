/* Campaign portability and blank-greeting registration. No server or credentials. */
(() => {
 'use strict';
 const clone=v=>JSON.parse(JSON.stringify(v));
 globalThis.CyberpunkCampaignFactory=api=>{
  const C=globalThis.CyberpunkRpgCore,E=api.htmlEscape,tr=(en,th)=>api.settings().language==='th'?th:en;
  let vault=null,card=null,cardOwner=null,step=0,epoch=0,working=false;
  const fields=[
   ['Identity','ตัวตน',[['name','Name / ชื่อ','text',180],['handle','Handle / ชื่อที่ใช้บนเครือข่าย','text',100],['age','Age / อายุ','number',1,150],['gender','Gender / เพศ','text',100],['pronouns','Pronouns / สรรพนาม','text',100],['appearance','Appearance / รูปลักษณ์','textarea',3000],['personality','Personality / บุคลิกและนิสัย','textarea',3000],['background','Biography / ประวัติชีวิต','textarea',8000]]],
   ['Lifepath','เส้นทางชีวิต',[['lifepath','Lifepath / เส้นทาง','select',['Corpo','Nomad','Street Kid','Other / กำหนดเอง']],['customPath','Custom path / เส้นทางอื่น','text',180],['occupation','Occupation / อาชีพ','text',180],['affiliation','Affiliation / สังกัด','text',180],['homeOrigin','Origin / ถิ่นกำเนิด','text',300],['motivation','Motivation / เป้าหมายและแรงจูงใจ','textarea',3000],['connections','Established contacts / คนรู้จักและความเกี่ยวข้อง','textarea',4000],['secret','Private history / ความลับที่ NPC ไม่รู้เอง','textarea',4000]]],
   ['Attributes','ค่าสถานะ',[['level','Level / เลเวล','number',1,60],['xp','XP ปัจจุบัน','number',0,1000000],['points','Attribute points / แต้มคงเหลือ','number',0,1000],['body','Body','number',3,20],['reflexes','Reflexes','number',3,20],['technical','Technical ability','number',3,20],['intelligence','Intelligence','number',3,20],['cool','Cool','number',3,20],['hp','Max HP','number',1,100000],['stamina','Max stamina','number',1,100000],['ram','Max RAM','number',0,1000],['capacity','Cyberware capacity','number',0,10000],['balance','Starting eddies / เงินเริ่มต้น','number',0,1000000000000]]],
   ['Starting assets','ทรัพย์สินเริ่มต้น',[['weapons','Weapons / อาวุธ · รายการละบรรทัด','textarea',3000],['clothing','Clothing / เสื้อผ้า · รายการละบรรทัด','textarea',3000],['consumables','Supplies / ของใช้ · รายการละบรรทัด','textarea',3000],['cyberware','Cyberware · รายการละบรรทัด','textarea',3000],['quickhacks','Quickhack software · รายการละบรรทัด','textarea',3000],['skills','Skills / ความสามารถที่มีแล้ว · รายการละบรรทัด','textarea',3000],['homes','Owned homes / บ้านที่เป็นเจ้าของ · รายการละบรรทัด','textarea',3000],['vehicles','Owned vehicles / รถที่เป็นเจ้าของ · รายการละบรรทัด','textarea',3000]]],
   ['Opening scene','ฉากเปิดเรื่อง',[['year','Year / ปีที่เริ่ม','text',100],['district','District / เขต','text',180],['building','Building / อาคารหรือสถานที่','text',180],['floor','Floor / ชั้น','text',100],['area','Area / จุดเริ่มต้น','text',180],['time','Time / เวลาและอากาศ','text',300],['situation','Opening situation / อยากเริ่มอย่างไร','textarea',8000],['tone','Tone / อารมณ์และแนวเรื่อง','textarea',2000],['pacing','Pacing / จังหวะเรื่อง','text',300],['perspective','Narration / มุมมองและภาษา','text',300],['boundaries','Boundaries / สิ่งที่ไม่ต้องการและข้อจำกัด','textarea',4000],['agency','Player agency / การบรรยายการกระทำของผู้เล่น','select',['Do not act or speak for me / ไม่ตัดสินใจหรือพูดแทน','Describe minor transitions only / บรรยายเฉพาะการเคลื่อนไหวเล็กน้อย']]]],
  ];
  const save=()=>{api.saveChat();api.refreshPrompt(true);};
  const session=()=>{const b=api.chatBucket();b.campaign??={phase:'draft',profile:null,draft:null};return b.campaign;};
  const ownerKey=()=>{const x=api.context();return [api.chatBucket(),x?.chat,x?.chatId??x?.getCurrentChatId?.(),x?.characterId,x?.groupId];};
  const same=k=>{const n=ownerKey();return k.every((v,i)=>v===n[i]);};
  const hasStory=()=> (api.context()?.chat||[]).some(m=>!m.is_system&&String(m.mes||'').trim());
  const emptyChat=()=>!hasStory()&&(api.context()?.chat||[]).filter(m=>!m.is_system).length<=1;
  function eligible(){
   const ctx=api.context(),character=ctx?.characters?.[ctx.characterId];
   if(!api.settings().enabled||ctx?.groupId||!character||!emptyChat())return false;
   const greeting=character.data?.first_mes??character.first_mes;
   return typeof greeting==='string'&&!greeting.trim()&&!['completed','imported','dismissed'].includes(session().phase);
  }
  function defaults(){return {name:api.context()?.name1||'',handle:'',age:21,gender:'',pronouns:'',appearance:'',personality:'',background:'',lifepath:'Street Kid',customPath:'',occupation:'',affiliation:'',homeOrigin:'',motivation:'',connections:'',secret:'',level:1,xp:0,points:0,body:3,reflexes:3,technical:3,intelligence:3,cool:3,hp:100,stamina:100,ram:8,capacity:100,balance:0,weapons:'',clothing:'',consumables:'',cyberware:'',quickhacks:'',skills:'',homes:'',vehicles:'',year:'2077',district:'watson',building:'',floor:'',area:'',time:'',situation:'',tone:'',pacing:'',perspective:api.settings().language==='th'?'ภาษาไทย':'English',boundaries:'',agency:fields[4][2].at(-1)[3][0]};}
  function validated(input){
   const out={};for(const [, ,list]of fields)for(const [key,,type,a,b]of list){const value=input[key]??defaults()[key];if(type==='number'){const n=Number(value);if(!Number.isSafeInteger(n)||n<a||n>b)throw Error(key+': '+a+'–'+b);out[key]=n;}else if(type==='select'){if(!a.includes(value))throw Error('Invalid '+key);out[key]=value;}else out[key]=C.text(value,a);}
   if(!out.name.trim())throw Error(tr('Enter a character name','กรุณาระบุชื่อตัวละคร'));
   if(!out.situation.trim())throw Error(tr('Describe your opening scene','กรุณาระบุว่าอยากเริ่มเรื่องอย่างไร'));
   if(out.lifepath.startsWith('Other')&&!out.customPath)throw Error(tr('Describe your custom lifepath','กรุณาระบุเส้นทางชีวิตที่กำหนดเอง'));
   for(const key of ['weapons','clothing','consumables','cyberware','quickhacks','skills','homes','vehicles'])if(lines(out[key]).length>30)throw Error(key+': maximum 30 entries');
   return out;
  }
  const lines=value=>String(value||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  function applyProfile(input){
   if(!emptyChat())throw Error(tr('This chat already contains a story','แชตนี้มีเนื้อเรื่องแล้ว'));
   const p=validated(input),s=api.state(),a=s.player;
   a.profile=clone(p);a.progression={level:p.level,xp:p.xp,points:p.points,attributes:Object.fromEntries(['body','reflexes','technical','intelligence','cool'].map(k=>[k,p[k]]))};
   a.balance=p.balance;a.hp=a.maxHp=p.hp;a.stamina=a.maxStamina=p.stamina;a.ram=a.maxRam=p.ram;a.capacity=p.capacity;
   a.inventory=[];for(const [key,category]of [['weapons','weapons'],['clothing','clothing'],['consumables','consumable'],['cyberware','cyberware'],['quickhacks','quickhack']])for(const name of lines(p[key])){
    const known=globalThis.CyberpunkCatalog.curated.find(x=>x.name.toLowerCase()===name.toLowerCase());
    a.inventory.push(C.item({...known,name,category,quantity:1,equipped:false,effect:known?.effect||tr('User-defined starting possession','ทรัพย์สินเริ่มต้นที่ผู้เล่นกำหนด')}));
   }
   a.quickhackSlots=Array(8).fill(null);a.skills=[];for(const name of lines(p.skills))C.addSkill(a,{name,description:'User-defined starting skill',cost:0,resource:'stamina'});
   s.properties=lines(p.homes).map(name=>({id:C.uid(),name,owner:'user',storage:[],upgrades:{},description:'User-defined starting property'}));
   s.vehicles=lines(p.vehicles).map(name=>({id:C.uid(),name,owner:'user',storage:[],upgrades:{},condition:100,fuel:100,odometer:0,description:'User-defined starting vehicle'}));
   s.map.location={district:p.district,subdistrict:'',building:p.building,floor:p.floor,area:p.area};
   if(p.district&&!s.map.discovered.includes(p.district))s.map.discovered.push(p.district);
   const c=session();c.profile=p;c.draft=clone(p);c.phase='prepared';save();return p;
  }
  function prompt(){
   const c=api.chatBucket().campaign;if(!c)return '';
   let output='';if(c.profile)output+='\n[User-confirmed player registration; private narrator context]\n'+JSON.stringify(c.profile)+'\nUse this registered name in narration without changing the host persona. Starting balances, inventory and assets are already applied: NEVER award them again. Private history is not automatic NPC knowledge. Honor player agency and boundaries.\n';
   if(c.continuity)output+='\n[Campaign continuation: previous-chat notes, not new events]\n'+C.text(c.continuity,16000)+'\nResume this campaign, do not restart character creation. Do not charge or award past transactions again. These notes are narrator context; preserve who knows each secret.\n';
   if(c.phase==='generating')output+='\n'+(c.imported?'Continue the existing story from the saved location and notes.':'Write the FIRST scene using the confirmed registration and opening preferences.')+' Generate a normal assistant story reply, not a registration form or summary. Leave the player’s next meaningful decision open.\n';
   return output;
  }
  async function generateOpening(useImport=false){
   if(working||api.busy()||api.isGenerating?.())throw Error(tr('Wait for the current generation','รอการเจนปัจจุบันก่อน'));
   if(!emptyChat())throw Error(tr('This chat already has text. Review it before generating an opening.','แชตมีข้อความแล้ว กรุณาตรวจข้อความก่อนเริ่ม'));
   const ctx=api.context(),key=ownerKey(),c=session();if(typeof ctx.generate!=='function')throw Error('This host does not expose main-chat generation. Update SillyTavern.');
   if(document.getElementById('send_textarea')?.value?.trim())throw Error(tr('Keep or send your composer draft first','กรุณาจัดการข้อความที่พิมพ์ค้างในช่องส่งก่อน'));
   if(ctx.groupId)throw Error(tr('Opening creation supports one character card, not groups','ระบบเปิดเรื่องรองรับการ์ดเดี่ยว ไม่ใช่กลุ่ม'));
   if(!useImport)applyProfile(c.draft||defaults());else if(!c.imported)throw Error('Import a campaign first');
   const ticket=++epoch;working=true;c.phase='generating';c.error='';save();drawCard();
   try{
    await ctx.saveChat?.();if(!same(key)||ticket!==epoch)throw Error('Chat changed before generation');
    await api.support.request('campaign-opening',()=>ctx.generate('normal',{automatic_trigger:true}));
    if(!same(key)||ticket!==epoch)return false;
    const reply=(ctx.chat||[]).find(m=>!m.is_user&&!m.is_system&&String(m.mes||'').trim());
    if(!reply)throw Error(tr('No opening message was produced. Check your connection and retry.','ยังไม่มีข้อความเปิดเรื่อง ตรวจการเชื่อมต่อแล้วลองใหม่'));
    c.phase='completed';c.error='';await ctx.saveChat?.();removeCard();save();refresh();return true;
   }catch(error){if(same(key)&&ticket===epoch){c.phase='failed';c.error=C.text(error.message,1000);save();drawCard();}return false;}
   finally{if(ticket===epoch){working=false;if(same(key)&&card)drawCard();}}
  }
  function cancel(){if(!working)return;epoch++;api.support.cancel('campaign-opening');working=false;const c=session();c.phase='failed';c.error=tr('Cancelled. Draft and configured state are kept.','ยกเลิกแล้ว เก็บแบบร่างและค่าสถานะไว้');save();drawCard();}
  function removeCard(){card?.remove();card=null;cardOwner=null;}
  function refresh(){
   if(cardOwner&&cardOwner!==api.chatBucket())removeCard();
   const c=api.chatBucket().campaign;
   if(c?.phase==='completed')for(const el of document.querySelectorAll('#chat .mes[mesid="0"]'))if(!String(api.context()?.chat?.[0]?.mes||'').trim())el.hidden=true;
   if(working)return;
   if(c?.phase==='generating'){c.phase='failed';c.error=tr('Opening generation was interrupted. Review the draft and retry.','การเจนเปิดเรื่องถูกขัดจังหวะ ตรวจแบบร่างแล้วลองใหม่');api.saveChat();}
   if(!eligible()&&!(c?.imported&&emptyChat()&&c.phase!=='completed')&&!(c?.phase==='failed'&&card)) {removeCard();return;}
   if(card?.isConnected)return;
   const host=document.querySelector('#chat');if(!host)return;
   card=document.createElement('section');card.className='cps-onboarding cps-ui';cardOwner=api.chatBucket();
   const greeting=api.context()?.chat?.[0],emptyNode=greeting&&!String(greeting.mes||'').trim()?host.querySelector('.mes[mesid="0"] .mes_text'):null;
   (emptyNode||host).append(card);drawCard();
  }
  function inputMarkup(f,p){const [key,label,type,a,b]=f,v=p[key]??'';return `<label><span>${E(label)}</span>${type==='textarea'?`<textarea name="${key}" rows="3" maxlength="${a}">${E(v)}</textarea>`:type==='select'?`<select name="${key}">${a.map(x=>`<option ${v===x?'selected':''}>${E(x)}</option>`).join('')}</select>`:`<input name="${key}" type="${type}" value="${E(v)}" ${type==='number'?`min="${a}" max="${b}" step="1"`:`maxlength="${a}"`} ${key==='name'?'required':''}>`}</label>`;}
  function drawCard(){
   if(!card||cardOwner!==api.chatBucket())return;const c=session();c.draft??=defaults();const p=c.draft;
   card.innerHTML=`<header class="cps-campaign-hero"><small>NEURAL REGISTRATION / ${c.imported?'CONTINUE CAMPAIGN':'NEW IDENTITY'}</small><h2>${E(c.imported?tr('Continue your story','เล่นเนื้อเรื่องต่อ'):tr('Build your beginning','สร้างจุดเริ่มต้นของคุณ'))}</h2><p>${E(tr('Chat-local registration. No API request until you confirm.','ข้อมูลเฉพาะแชตนี้ ยังไม่เรียก AI จนกว่าคุณจะยืนยัน'))}</p></header>`;
   if(!c.imported){
    const nav=document.createElement('nav');nav.className='cps-campaign-steps';nav.setAttribute('aria-label',tr('Registration steps','ขั้นตอนลงทะเบียน'));
    [...fields.map(f=>tr(f[0],f[1])),tr('Review','ตรวจทาน')].forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.className='cps-button';b.textContent=String(i+1).padStart(2,'0')+' / '+name;b.setAttribute('aria-current',i===step?'step':'false');b.disabled=working;b.onclick=()=>{step=i;drawCard();};nav.append(b);});card.append(nav);
    const form=document.createElement('form');form.className='cps-campaign-form';form.innerHTML=step<5?fields[step][2].map(f=>inputMarkup(f,p)).join(''):`<div class="cps-campaign-review"><h3>${E(p.name||tr('Unnamed','ยังไม่ระบุชื่อ'))}</h3><p>${E(p.lifepath)} · LV.${E(p.level)} · €$${E(p.balance)}</p><p>${E([p.district,p.building,p.area].filter(Boolean).join(' / '))}</p><p>${E(p.situation||tr('Opening scene required','กรุณาระบุฉากเปิดเรื่อง'))}</p><p>${E(tr('Custom starting assets are one unit per line and are not automatically equipped. Named connections are background notes, not newly invented NPC records. No stat budget is enforced in this custom RP setup.','ทรัพย์สินเริ่มต้นรายการละ 1 ชิ้น ไม่สวมใส่ให้อัตโนมัติ คนรู้จักเป็นบันทึกประวัติ ไม่สร้าง NPC เอง การตั้งค่า RP แบบกำหนดเองนี้ไม่บังคับงบแต้ม'))}</p></div>`;
    form.onsubmit=e=>e.preventDefault();form.oninput=e=>{if(e.target.name){c.draft[e.target.name]=e.target.value;api.saveChat();}};form.onchange=form.oninput;for(const el of form.querySelectorAll('input,select,textarea'))el.disabled=working;card.append(form);
   }else{const notes=document.createElement('p');notes.className='cps-campaign-review';notes.textContent=C.text(c.continuity,16000);card.append(notes);}
   const actions=document.createElement('div');actions.className='cps-rpg-actions';
   const add=(label,fn,disabled=false)=>{const b=document.createElement('button');b.type='button';b.className='cps-button';b.textContent=label;b.disabled=disabled;b.onclick=fn;actions.append(b);};
   if(working)add(tr('Cancel generation','ยกเลิกการเจน'),cancel);
   else{
    if(!c.imported&&step>0)add(tr('Back','ย้อนกลับ'),()=>{step--;drawCard();});
    if(!c.imported&&step<5)add(tr('Next','ถัดไป'),()=>{step++;drawCard();});
    else add(tr('Save and generate opening','บันทึกและเจนข้อความเปิดเรื่อง'),()=>generateOpening(!!c.imported).catch(e=>{c.error=e.message;drawCard();}),hasStory());
    add(tr('Import campaign','นำเข้าเซฟ'),openVault);
   }
   card.append(actions);const status=document.createElement('p');status.className='cps-campaign-status';status.setAttribute('role',c.error?'alert':'status');status.textContent=working?tr('Generating in main chat…','กำลังเจนใน Main Chat…'):c.error||tr('Draft saved with this chat.','เก็บแบบร่างไว้ในแชตนี้');card.append(status);
  }
  function recentNotes(){return (api.context()?.chat||[]).filter(m=>!m.is_system&&m.mes).slice(-6).map(m=>(m.is_user?'USER':'NARRATOR')+': '+C.text(m.mes,2000).replace(/\[CP_[\s\S]*?\[\/CP_[^\]]+\]/g,'')).join('\n\n').slice(-12000);}
  function exportCampaign(notes){
   if(api.busy()||api.isGenerating?.()||working)throw Error(tr('Finish or cancel generation first','จบหรือยกเลิกการเจนก่อนเซฟ'));
   notes=C.text(notes,16000);if(!notes)throw Error(tr('Add continuity notes first','กรุณาระบุสรุปเหตุการณ์สำหรับเล่นต่อ'));
   const backup=api.support.payload(),c=api.context();
   const lastScene=(c?.chat||[]).slice().reverse().find(m=>m.extra?.cpsScene&&!m.extra.cpsScene.simulated)?.extra.cpsScene;
   const scene=lastScene?Object.fromEntries(['date','time','weather','temperature'].map(k=>[k,lastScene[k]??null])):null;
   const value={format:'cyberpunk-campaign',schema:1,version:api.version,createdAt:new Date().toISOString(),source:{name:c?.name2||'',avatar:c?.characters?.[c.characterId]?.avatar||'',persona:c?.name1||''},continuity:notes,scene,backup};
   if(new Blob([JSON.stringify(value,null,2)]).size>25*1024*1024)throw Error('Campaign exceeds the 25 MB import limit. Reduce saved portrait sizes before exporting.');
   return value;
  }
  function validateCampaign(value){
   if(!value||value.format!=='cyberpunk-campaign'||value.schema!==1||typeof value.continuity!=='string'||!value.continuity.trim()||value.continuity.length>16000)throw Error('Unsupported campaign save or invalid continuity notes');
   if(new Blob([JSON.stringify(value)]).size>25*1024*1024)throw Error('Campaign exceeds 25 MB');
   return {...value,backup:api.support.validate(value.backup)};
  }
  function importCampaign(value){
   if(working||api.busy()||api.isGenerating?.())throw Error('Cancel generation before importing');
   if(!emptyChat())throw Error(tr('Import into a new empty chat only. Existing stories are never overwritten.','นำเข้าได้เฉพาะแชตใหม่ที่ว่าง ไม่เขียนทับแชตที่มีเนื้อเรื่อง'));
   const ctx=api.context();if(ctx.groupId)throw Error('Campaign continuation currently supports single-character chats');
   const valueSafe=validateCampaign(value),b=clone(valueSafe.backup.chat),r=b.rpg;
   // Move character-scoped records into chat-local overrides; never overwrite another card's settings.
   for(const kind of ['npcs','skills']){const entries=new Map();for(const x of [...valueSafe.backup.character?.[kind]||[],...b[kind]||[]])entries.set(String(x.name||x.id).toLowerCase(),x);b[kind]=[...entries.values()];}
   b.processedRecords=[];b.braindanceMessages=[];
   if(b.call){b.call.active=false;b.call.minimized=false;b.call.unread=0;for(const m of b.call.messages||[])delete m.pending;}
   r.processed=[];for(const row of r.recordLog||[]){row.source='previous-chat';if(row.status==='failed')row.status='archived';}r.failedReceipts=[];r.skillCards=[];r.hackingRequest=null;r.puzzle=null;
   if(r.bd){r.bd.status='stopped';r.bd.rendering=false;r.bd.enabled=false;}
   for(const row of r.requests||[])if(row.status==='running'){row.status='cancelled';row.ended=Date.now();row.error='Carried to a new chat';}
   for(const shop of r.market?.shops||[])shop.visit=null;
   if(r.deviceSystem){r.deviceSystem.grants=[];r.deviceSystem.visit++;for(const d of r.deviceSystem.devices){d.reachable=false;delete d.source;delete d.requestedProgram;}}
   // Persist economic receipts and narrative state; discard only source-message bindings.
   b.campaign={...b.campaign,phase:'imported',imported:true,profile:b.campaign?.profile||r.player.profile||null,continuity:valueSafe.continuity,source:valueSafe.source,lastScene:valueSafe.scene||null,importedAt:new Date().toISOString(),error:''};
   const verified=api.support.validate({...valueSafe.backup,chat:b,character:{}});
   api.support.restore(verified,false);removeCard();api.removeUiDialog(vault);vault=null;save();refresh();return true;
  }
  function openVault(){
   api.removeUiDialog(vault);const key=ownerKey();vault=api.dialog(tr('Campaign save / Continue','เซฟแคมเปญ / เล่นต่อ'),`<section class="cps-campaign-vault"><header class="cps-campaign-hero"><small>CAMPAIGN CONTINUITY / FULL WORLD</small><h2>${E(tr('Take your world with you','ย้ายโลกเดิมไปเล่นต่อ'))}</h2><p>${E(tr('Keeps player, NPCs, assets, quests, mailbox and economy. Old main-chat messages are not inserted into the new chat.','เก็บผู้เล่น NPC ทรัพย์สิน ภารกิจ เมลและเศรษฐกิจ ไม่ใส่ข้อความ Main Chat เก่ากลับเข้าแชตใหม่'))}</p></header><label>${E(tr('Continuity notes — review before exporting','สรุปเพื่อเล่นต่อ — ตรวจและเติมก่อนส่งออก'))}<textarea data-campaign-notes rows="10" maxlength="16000">${E(session().continuity||recentNotes())}</textarea></label><p>${E(tr('The automatic draft contains only the last six messages (up to 2,000 characters each). Add important older events, secrets, who knows what and the next scene. No AI summary is silently requested.','แบบร่างดึงเพียง 6 ข้อความท้าย ข้อความละไม่เกิน 2,000 ตัวอักษร เติมเหตุการณ์เก่า ความลับ ผู้ที่รู้ข้อมูล และฉากถัดไปให้ครบ ระบบไม่เรียก AI สรุปเอง'))}</p><button type="button" class="cps-button" data-campaign-export>${E(tr('Download full campaign save','ดาวน์โหลดเซฟทั้งแคมเปญ'))}</button><hr><label>${E(tr('Import in a new empty chat (JSON, max 25 MB)','นำเข้าในแชตใหม่ที่ว่าง (JSON สูงสุด 25 MB)'))}<input type="file" accept="application/json,.json" data-campaign-import></label><div data-campaign-review></div><p role="alert" data-campaign-error></p></section>`,'cps-campaign-window');
   const current=vault,err=e=>{if(current.isConnected&&same(key))current.querySelector('[data-campaign-error]').textContent=e.message;};
   current.querySelector('[data-campaign-notes]').oninput=e=>{if(same(key)){session().continuity=e.target.value;api.saveChat();}};
   current.querySelector('[data-campaign-export]').onclick=()=>{try{if(!same(key))return;const data=exportCampaign(current.querySelector('[data-campaign-notes]').value),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='cyberpunk-campaign-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);current.querySelector('[data-campaign-error]').textContent=tr('Save downloaded. Start a new empty chat and import this file.','ส่งไฟล์ให้ดาวน์โหลดแล้ว เปิดแชตใหม่ที่ว่างและนำเข้าไฟล์นี้');}catch(e){err(e);}};
   current.querySelector('[data-campaign-import]').onchange=async e=>{try{const file=e.target.files?.[0];if(!file)return;if(file.size>25*1024*1024)throw Error('Campaign exceeds 25 MB');const v=validateCampaign(JSON.parse(await file.text()));if(!same(key)||!current.isConnected)return;const host=current.querySelector('[data-campaign-review]'),p=v.backup.chat.rpg.player;host.innerHTML=`<article class="cps-campaign-review"><h3>${E(v.source?.name||'Campaign')}</h3><p>LV.${E(p.progression?.level||1)} · €$${E(p.balance)} · ${v.backup.chat.npcs?.length||0} NPC</p><p>${E(tr('Restores all extension world state to this empty chat. Does not import the old card, global settings, personas, lorebooks or main-chat transcript. Active calls, puzzles and temporary device access are stopped.','ย้ายสถานะโลกทั้งหมดของ extension เข้าแชตว่างนี้ ไม่ย้ายการ์ดเดิม การตั้งค่ารวม persona lorebook หรือประวัติ Main Chat สายที่ค้าง เกมเจาะระบบ และสิทธิ์อุปกรณ์ชั่วคราวจะหยุด'))}</p><button type="button" class="cps-button" data-confirm-campaign>${E(tr('Confirm import','ยืนยันนำเข้า'))}</button></article>`;host.querySelector('button').onclick=()=>{try{if(same(key)&&current.isConnected)importCampaign(v);}catch(error){err(error);}};}catch(error){err(error);}};
  }
  function onChatChanged(){epoch++;working=false;removeCard();api.removeUiDialog(vault);vault=null;step=0;}
  return {eligible,refresh,prompt,openVault,exportCampaign,validateCampaign,importCampaign,applyProfile,generateOpening,cancel,onChatChanged,busy:()=>working};
 };
})();
