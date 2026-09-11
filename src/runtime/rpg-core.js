/* Deterministic, dependency-free role-play mechanics. Numeric tuning is configurable,
   inspired by 2077; cyberpsychosis chance is an extension rule, not a game formula. */
(() => {
  'use strict';
  const cap = (n, lo, hi) => Math.min(hi, Math.max(lo, Number(n) || 0));
  const text = (v, n = 2000) => String(v ?? '').trim().slice(0, n);
  const arrow = direction => {
    const paths = {minimize:'M5 18h14',play:'m8 5 11 7-11 7Z',left:'M19 12H5m6-6-6 6 6 6',right:'M5 12h14m-6-6 6 6-6 6','up-right':'M6 18 18 6M6 6h12v12'};
    return `<svg class="cps-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false"><path d="${paths[direction]||paths.right}"/></svg>`;
  };
  const arrowLabel = (value, escape) => escape(value).replace(/[↗←→▶]\uFE0F?/gu, glyph => arrow(glyph[0]==='↗'?'up-right':glyph[0]==='←'?'left':glyph[0]==='▶'?'play':'right'));
  const handle = v => text(v, 180).replace(/^[@＠\s]+/u, '');
  const money = v => { const n = Number(v); if (!Number.isSafeInteger(n) || n < 0 || n > 1e12) throw Error('Invalid amount'); return n; };
  const uid = () => `rpg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  const implantGroups = Object.freeze([
    {id:'frontal-cortex',en:'Frontal cortex',th:'สมองส่วนหน้า',slots:3,x:120,y:38},
    {id:'face',en:'Face / optics',th:'ใบหน้า / ดวงตา',slots:1,x:120,y:56},
    {id:'operating-system',en:'Operating system',th:'ระบบปฏิบัติการ',slots:1,x:120,y:94},
    {id:'arms',en:'Arms',th:'แขน',slots:1,x:72,y:150},
    {id:'hands',en:'Hands',th:'มือ',slots:1,x:53,y:228},
    {id:'skeleton',en:'Skeleton',th:'โครงกระดูก',slots:2,x:120,y:200},
    {id:'nervous-system',en:'Nervous system',th:'ระบบประสาท',slots:3,x:120,y:156},
    {id:'circulatory-system',en:'Circulatory system',th:'ระบบไหลเวียน',slots:3,x:137,y:119},
    {id:'integumentary-system',en:'Integumentary system',th:'ผิวหนัง',slots:3,x:98,y:133},
    {id:'legs',en:'Legs',th:'ขา',slots:1,x:103,y:309}
  ].map(Object.freeze));
  const slotAliases={'gorilla-arms':'arms','mantis-blades':'arms',monowire:'arms','projectile-launch-system':'arms','reinforced-tendons':'legs','fortified-ankles':'legs','ex-disk':'frontal-cortex','memory-boost':'frontal-cortex',kerenzikov:'nervous-system',neofiber:'nervous-system','bionic-joints':'skeleton','titanium-bones':'skeleton','smart-link':'hands','ballistic-coprocessor':'hands',ocular:'face','ocular-system':'face',eyes:'face',optics:'face','kiroshi-optics':'face',os:'operating-system',cyberdeck:'operating-system',sandevistan:'operating-system',berserk:'operating-system',arm:'arms',leg:'legs',hand:'hands',circulatory:'circulatory-system',biomonitor:'circulatory-system','blood-pump':'circulatory-system','second-heart':'circulatory-system',integumentary:'integumentary-system',skin:'integumentary-system','subdermal-armor':'integumentary-system','optical-camo':'integumentary-system',nervous:'nervous-system',cortex:'frontal-cortex'};
  const implantSlot=value=>{const key=text(value,80).toLowerCase().replace(/[ _]+/g,'-');return slotAliases[key]||key;};
  const slotLimit=(a,slot)=>(implantGroups.find(g=>g.id===implantSlot(slot))?.slots||1)+(['skeleton','hands'].includes(implantSlot(slot))&&a.implantUnlocks?.[implantSlot(slot)]===true?1:0);
  const actor = () => ({ progression: {level:1,xp:0,points:0,attributes:{body:3,reflexes:3,technical:3,intelligence:3,cool:3}}, awards: [], balance: 0, hp: 100, maxHp: 100, stamina: 100, maxStamina: 100, ram: 8, maxRam: 8, capacity: 100, stress: 0, cyberpsychosis: false, implantUnlocks: {skeleton:false,hands:false}, inventory: [], quickhackSlots: Array(8).fill(null), skills: [], relic: { unlocked: false, points: 0, abilities: [] }, blackwall: { unlocked: false, exposure: 0 }, ledger: [] });
  function itemCategory(value) {
    const category=text(value.category,80).toLowerCase().replace(/[ _-]+/g,'');
    if (['quickhack','quickhacks','quickhackprogram','quickhacksoftware'].includes(category)) return 'quickhack';
    if (!category || ['item','data','software','program'].includes(category)) {
      const name=text(value.name,180).toLowerCase();
      const catalog=globalThis.CyberpunkCatalog?.curated||[];
      if (catalog.some(it=>it.category==='quickhack' && (it.name.toLowerCase()===name || it.id===value.catalogId))) return 'quickhack';
      if (/\bquick[ -]?hack\b/i.test(name) && !/component|crafting|recipe|blueprint|schematic/i.test(name)) return 'quickhack';
    }
    return ['braindance','cyberware','weapons','consumable','clothing','mod','component','data','item'].includes(category)?category:'item';
  }
  function syncDeck(a) {
    const seen=new Set();
    a.quickhackSlots=Array.from({length:8},(_,i)=>{const id=a.quickhackSlots?.[i];if(typeof id!=='string'||seen.has(id)||!a.inventory.some(it=>it.id===id&&it.category==='quickhack'&&it.quantity>0))return null;seen.add(id);return id;});
    a.inventory.forEach(it=>{if(it.category==='quickhack')it.equipped=seen.has(it.id);});
  }
  function setQuickhackSlot(a, slot, id) {
    if(!Number.isInteger(slot)||slot<0||slot>=8)throw Error('Invalid quickhack slot');
    if(id&&!a.inventory.some(it=>it.id===id&&it.category==='quickhack'&&it.quantity>0))throw Error('Only owned quickhacks can be loaded');
    syncDeck(a);
    if(id&&a.quickhackSlots.some((value,i)=>value===id&&i!==slot))throw Error('Quickhack already loaded');
    a.quickhackSlots[slot]=id||null;syncDeck(a);
  }
  const normalizeItem = value => ({ details:itemDetails(value.details), iconKey:text(value.iconKey,180), imageCredit:text(value.imageCredit,500), id: text(value.id || uid(), 160), shardId: text(value.shardId,160), weaponType: ['firearm','melee'].includes(value.weaponType)?value.weaponType:'', ammo:Number.isSafeInteger(value.ammo)&&value.ammo>=0&&value.ammo<=99999?value.ammo:null, magazines:Number.isSafeInteger(value.magazines)&&value.magazines>=0&&value.magazines<=99999?value.magazines:null, name: text(value.name || value.id || 'Unknown', 180), braindance: value.braindance&&typeof value.braindance==='object'?Object.fromEntries(['info','level','rating','genres','type','creator','scenario'].map(k=>[k,text(value.braindance[k],k==='scenario'?12000:2000)])):null, level: Math.round(cap(value.level??1,1,60)), ramCost: Math.round(cap(value.ramCost??2,0,100)), category: itemCategory(value), quantity: Math.round(cap(value.quantity ?? 1, 1, 9999)), equipped: value.equipped === true, slot: value.category==='cyberware'?implantSlot(value.slot||slotAliases[text(value.name,180).toLowerCase().replace(/[ _]+/g,'-')]||''):text(value.slot,80), capacity: cap(value.capacity ?? (value.category === 'cyberware' ? 10 : 0), 0, 300), effect: text(value.effect), power: cap(value.power ?? 20, 0, 1000), charges: Math.round(cap(value.charges ?? 1, 0, 99)), cooldown: Math.round(cap(value.cooldown ?? 2, 0, 30)), cooldownUntil: 0, catalogId: text(value.catalogId, 180), image: typeof value.image === 'string' && /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value.image) && value.image.length < 500000 ? value.image : '' });
  function item(value={}) {
    const preset=globalThis.CyberpunkItemGuide?.lookup(value);
    return normalizeItem(preset?{...preset,...value,catalogId:value.catalogId||preset.id}:value);
  }
  function itemDetails(value) {
    const d=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    return Object.fromEntries(['summary','strengths','limitations','usage','acquiredFrom','model','tier'].map(k=>[k,text(Array.isArray(d[k])?d[k].slice(0,8).join('\n'):d[k],k==='summary'?2000:1200)]));
  }
  function capacityHistory(a) {
    if(!a.capacityRecord||!Number.isFinite(a.capacityRecord.baseline)||!Array.isArray(a.capacityRecord.entries)||a.capacityRecord.entries.some(e=>!e||!Number.isFinite(e.delta)))a.capacityRecord={baseline:a.capacity,entries:[]};
    const r=a.capacityRecord,total=r.baseline+r.entries.reduce((n,e)=>n+(Number(e.delta)||0),0);
    // Imported or older saves may have changed the total without recording its source.
    if(Math.abs(total-a.capacity)>.001)r.baseline+=a.capacity-total;
    return r;
  }
  function setCapacity(a,value,kind='manual',reason='',turn=null) {
    if(typeof value!=='number'||!Number.isFinite(value)||value<1||value>1000)throw Error('Capacity must be a number from 1 to 1000');
    const r=capacityHistory(a),before=a.capacity;if(value===before)return null;
    const entry={id:uid(),before,after:value,delta:value-before,kind:['manual','training','story'].includes(kind)?kind:'manual',reason:text(reason||'No source supplied',500),turn,at:new Date().toISOString()};
    r.entries.push(entry);while(r.entries.length>100)r.baseline+=r.entries.shift().delta;a.capacity=value;return entry;
  }
  function hydrate(a) {
    if (!a || typeof a !== 'object') a = actor();
    const defaults = actor(); for (const [k,v] of Object.entries(defaults)) if (a[k] === undefined) a[k] = v;
    for (const k of ['inventory','skills','ledger','awards']) if (!Array.isArray(a[k])) a[k] = [];
    for (const k of ['relic','blackwall','implantUnlocks','progression']) { if (!a[k] || typeof a[k] !== 'object' || Array.isArray(a[k])) a[k] = defaults[k]; for (const [field,value] of Object.entries(defaults[k])) if (a[k][field] === undefined) a[k][field] = value; }
    for(const it of a.inventory)if(it.category==='cyberware')it.slot=implantSlot(it.slot||slotAliases[text(it.name,180).toLowerCase().replace(/[ _]+/g,'-')]||'');
    a.inventory.forEach(it=>{it.category=itemCategory(it);});
    syncDeck(a);
    if (!Array.isArray(a.relic.abilities)) a.relic.abilities = [];
    for (const k of ['hp','maxHp','stamina','maxStamina','ram','maxRam','capacity','stress']) a[k] = cap(a[k], k.startsWith('max') || k === 'capacity' ? 1 : 0, k === 'stress' ? 100 : 1000);
    a.progression.attributes={...defaults.progression.attributes,...a.progression.attributes};
    for(const k of Object.keys(defaults.progression.attributes))a.progression.attributes[k]=Math.round(cap(a.progression.attributes[k],3,20));
    a.progression.level=Math.round(cap(a.progression.level,1,60));a.progression.xp=Math.round(cap(a.progression.xp,0,1000000));a.progression.points=Math.round(cap(a.progression.points,0,1000));
    a.balance = Number.isSafeInteger(a.balance) && a.balance >= 0 ? Math.min(a.balance, 1e12) : 0;
    return a;
  }
  function patchActor(a, data) {
    const next = {};
    if(data.delta!==undefined){
      if(!data.delta||typeof data.delta!=='object'||Array.isArray(data.delta))throw Error('Invalid resource delta');
      for(const [key,value] of Object.entries(data.delta)){
        if(!['hp','ram','stamina','stress'].includes(key)||typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>1000||data[key]!==undefined)throw Error('Invalid or conflicting delta: '+key);
        next[key]=cap(a[key]+value,0,key==='stress'?100:a[{hp:'maxHp',ram:'maxRam',stamina:'maxStamina'}[key]]);
      }
    }
    for (const key of ['maxHp','maxRam','maxStamina','capacity','hp','ram','stamina','stress']) {
      if (data[key] === undefined) continue;
      const value = Number(data[key]);
      // Compatibility: a negative resource cannot be an absolute remaining value.
      // Treat legacy AI shorthand as a loss, but never reinterpret maxima/capacity
      // or positive values. Explicit delta conflicts were rejected above.
      if (['hp','ram','stamina','stress'].includes(key) && Number.isFinite(value) && value < 0 && value >= -1000) {
        next[key] = Math.max(0, a[key] + value);
        continue;
      }
      if (!Number.isFinite(value) || value < 0 || value > 1000 || ((key.startsWith('max') || key === 'capacity') && value < 1)) throw Error('Invalid state value: ' + key);
      next[key] = value;
    }
    for (const [key, maximum] of [['hp','maxHp'],['ram','maxRam'],['stamina','maxStamina']]) next[key] = cap(next[key] ?? a[key], 0, next[maximum] ?? a[maximum]);
    if (next.stress !== undefined) next.stress = cap(next.stress, 0, 100);
    if(data.implantUnlocks!==undefined){
      if(!data.implantUnlocks||typeof data.implantUnlocks!=='object'||Array.isArray(data.implantUnlocks))throw Error('Invalid implant unlocks');
      const unlocks={...a.implantUnlocks};
      for(const [slot,value] of Object.entries(data.implantUnlocks)){
        if(!['hands','skeleton'].includes(slot)||typeof value!=='boolean')throw Error('Invalid implant unlock');
        if(!value&&a.inventory.filter(it=>it.equipped&&it.category==='cyberware'&&implantSlot(it.slot)===slot).length>slotLimit({...a,implantUnlocks:{}},slot))throw Error('Unequip the extra implant before locking its socket');
        unlocks[slot]=value;
      }
      next.implantUnlocks=unlocks;
    }
    if(next.capacity!==undefined)setCapacity(a,next.capacity,'story',data.reason);
    Object.assign(a, next); return a;
  }
  function transfer(from, to, amount, reason, transactionId = uid()) {
    amount = money(amount); if (amount < 1 || from === to) throw Error('Invalid transfer');
    hydrate(from); hydrate(to);
    if (from.ledger.some(e=>e.id===transactionId) || to.ledger.some(e=>e.id===transactionId)) return false;
    if (from.balance < amount) throw Error('Insufficient balance');
    money(to.balance + amount);
    from.balance -= amount; to.balance += amount;
    const receipt = { id: transactionId, amount, reason: text(reason, 500), at: new Date().toISOString() };
    from.ledger.push({ ...receipt, delta: -amount }); to.ledger.push({ ...receipt, delta: amount });
    from.ledger = from.ledger.slice(-300); to.ledger = to.ledger.slice(-300); return true;
  }
  const xpGoal = level => 100+(level-1)*25;
  function award(a,data,id=uid()){
    hydrate(a);if(a.awards.includes(id))return false;
    const next=JSON.parse(JSON.stringify(a)),amount=money(data.amount??0),xp=Number(data.xp??0);
    if(!Number.isSafeInteger(xp)||xp<0||xp>10000)throw Error('Invalid XP award');
    next.balance=money(next.balance+amount);
    if(data.items!==undefined&&(!Array.isArray(data.items)||data.items.length>50))throw Error('Invalid loot batch');
    const added=(data.items||[]).map((v,i)=>{
      if(!v||!text(v.name)||!Number.isInteger(Number(v.quantity??1))||Number(v.quantity??1)<1||Number(v.quantity??1)>9999)throw Error('Invalid loot item');
      const it=item({...v,id:v.id||id+':item:'+i,equipped:false});
      if(next.inventory.some(x=>x.id===it.id))throw Error('Loot ID already stored');
      next.inventory.push(it);return it;
    });
    const p=next.progression;p.xp+=xp;
    while(p.level<60&&p.xp>=xpGoal(p.level)){p.xp-=xpGoal(p.level);p.level++;p.points++;}
    if(p.level===60)p.xp=0;
    if(amount)next.ledger.push({id,delta:amount,amount,reason:text(data.reason||data.source||'Story reward',500),source:text(data.source,180),at:new Date().toISOString()});
    next.ledger=next.ledger.slice(-300);next.awards.push(id);
    Object.assign(a,next);return {amount,xp,items:added};
  }
  function train(a,key){
    hydrate(a);const p=a.progression;
    if(!Object.hasOwn(p.attributes,key)||p.points<1||p.attributes[key]>=20)throw Error('No attribute point available or attribute capped');
    p.points--;p.attributes[key]++;
    // Local RP bonuses: increase maxima only, never heal or refill on level-up.
    if(key==='body')a.maxHp=Math.min(1000,a.maxHp+5);
    if(key==='reflexes')a.maxStamina=Math.min(1000,a.maxStamina+5);
    if(key==='technical')setCapacity(a,Math.min(1000,a.capacity+3),'training','Technical attribute '+p.attributes.technical);
    if(key==='intelligence')a.maxRam=Math.min(1000,a.maxRam+1);
    if(key==='cool')a.stress=Math.max(0,a.stress-3);
  }
  function trade(player,merchant,data,id=uid()){
    hydrate(player);if(player.awards.includes(id))return false;
    if(merchant===player)throw Error('Cannot trade with yourself');
    const a=JSON.parse(JSON.stringify(player)),b=merchant?JSON.parse(JSON.stringify(hydrate(merchant))):null;
    const amount=money(data.amount);if(amount<1||!text(data.reason)||!['buy','sell'].includes(data.operation))throw Error('Trade requires operation, positive total price and completed-action reason');
    let goods=[];
    if(data.operation==='buy'){
      if(a.balance<amount)throw Error('Insufficient balance');
      if(!Array.isArray(data.items)||!data.items.length||data.items.length>50)throw Error('Purchased items missing');
      award(a,{items:data.items},id);
      goods=a.inventory.slice(-data.items.length);
      for(let i=0;i<goods.length;i++)if(data.items[i].equipped===true)equip(a,goods[i].id);
      a.balance-=amount;if(b)b.balance=money(b.balance+amount);
    }else{
      if(!Array.isArray(data.items)||!data.items.length||data.items.length>50)throw Error('Sold items missing');
      for(const row of data.items){
        const it=resolveItem(a,row),qty=Number(row.quantity??1);
        if(!it||!Number.isInteger(qty)||qty<1||qty>it.quantity)throw Error('Invalid sold item or quantity');
        goods.push({...it,quantity:qty});it.quantity-=qty;
      }
      a.inventory=a.inventory.filter(x=>x.quantity>0);
      if(b){if(b.balance<amount)throw Error('Merchant has insufficient balance');b.balance-=amount;}
      a.balance=money(a.balance+amount);a.awards.push(id);
    }
    const receipt={id,amount,reason:text(data.reason,500),at:new Date().toISOString(),delta:data.operation==='buy'?-amount:amount};
    a.ledger.push(receipt);a.ledger=a.ledger.slice(-300);
    if(b){b.ledger.push({...receipt,delta:-receipt.delta});b.ledger=b.ledger.slice(-300);}
    Object.assign(player,a);if(b)Object.assign(merchant,b);return {amount,items:goods};
  }
  function blackwallFeedback(a) {
    a.blackwall.exposure=cap(a.blackwall.exposure+20,0,100);a.stress=cap(a.stress+10,0,100);
    if(a.blackwall.exposure>=60)a.hp=cap(a.hp-15,0,a.maxHp);
  }
  function resolveItem(a, data) {
    const id=text(data.itemId,180), name=text(data.name||data.item?.name||id,180).normalize('NFKC').toLocaleLowerCase().trim();
    const exact=a.inventory.filter(x=>id&&(x.id===id||x.catalogId===id));
    const matches=exact.length?exact:a.inventory.filter(x=>name&&text(x.name).normalize('NFKC').toLocaleLowerCase().trim()===name);
    if(matches.length>1)throw Error('Multiple matching items; use the inventory itemId');
    return matches[0];
  }
  function unlockBlackwall(a) {
    a.blackwall.unlocked=true;
    if(a.blackwall.granted)return false;
    let program=a.inventory.find(x=>x.name==='Blackwall Gateway'&&x.category==='quickhack');
    if(!program){program=item({name:'Blackwall Gateway',category:'quickhack',ramCost:4,cooldown:3,effect:'Breach the selected hostile neural link. Local RP ability; consequences resolve in the next story reply.'});a.inventory.push(program);}
    syncDeck(a);const slot=a.quickhackSlots.indexOf(null);if(slot>=0&&!a.quickhackSlots.includes(program.id))setQuickhackSlot(a,slot,program.id);
    for(const skill of [{name:'Blackwall Interface',cost:4,cooldown:2,description:'Establish a restricted neural link with an AI.'},{name:'Blackwall Containment',cost:2,cooldown:3,description:'Isolate a compromised local neural connection; does not grant omniscience.'}])if(!a.skills.some(x=>x.name===skill.name))addSkill(a,{...skill,resource:'ram'});
    a.blackwall.granted=true;return true;
  }
  function load(a) { return a.inventory.filter(x=>x.category==='cyberware'&&x.equipped).reduce((n,x)=>n+cap(x.capacity,0,300),0); }
  function risk(a, scale = 1) { const ratio=load(a)/Math.max(1,a.capacity); return cap((Math.max(0,ratio-.6)*20 + Math.max(0,ratio-1)*50 + cap(a.stress,0,100)*.15) * scale, 0, 95); }
  function equip(a, id) {
    const it=a.inventory.find(x=>x.id===id); if (!it) throw Error('Item missing');
    if (it.category==='quickhack') { syncDeck(a); const loaded=a.quickhackSlots.indexOf(id); const slot=loaded>=0?loaded:a.quickhackSlots.indexOf(null); if(slot<0)throw Error('All eight quickhack slots are full. Unload one first.'); setQuickhackSlot(a,slot,loaded>=0?null:id); return it; }
    if (!['cyberware','weapons','clothing'].includes(it.category)) throw Error('Cannot equip');
    if (it.equipped) { it.equipped=false; return it; }
    if (it.category==='cyberware' && it.slot) {
      const slot=implantSlot(it.slot),linked=a.inventory.filter(x=>x.category==='cyberware'&&x.equipped&&implantSlot(x.slot)===slot),limit=slotLimit(a,slot);
      if(limit===1)linked.forEach(x=>{x.equipped=false;});
      else if(linked.length>=limit)throw Error('Implant sockets full: '+slot+' ('+limit+'). Unequip one first.');
      it.slot=slot;
    }
    if (it.category==='weapons' && a.inventory.filter(x=>x.category==='weapons'&&x.equipped).length>=3) throw Error('Three weapon slots are full');
    it.equipped=true; return it;
  }
  function use(a, id, turn) {
    const it=a.inventory.find(x=>x.id===id);if(!it)throw Error('Item missing');
    if (Number(it.cooldownUntil)>turn) throw Error('Recharging');
    if(medical.medicine(it))return medical.dose(a,id,turn);
    if (it.category==='consumable') { if(it.quantity<1)throw Error('Empty stack');it.quantity--;a.hp=cap(a.hp+it.power,0,a.maxHp);a.stress=cap(a.stress-10,0,100);if(!it.quantity)a.inventory=a.inventory.filter(x=>x!==it); }
    else if(it.category==='quickhack') {if(it.quantity<1||!a.quickhackSlots?.includes(id))throw Error('Load this quickhack into the deck first');const cost=Math.max(0,Math.round(it.ramCost??it.power/10));if(a.ram<cost)throw Error('Insufficient RAM');a.ram-=cost;}
    else if (!it.equipped) throw Error('Equip first');
    it.cooldownUntil=turn+Math.max(1,it.cooldown); return it;
  }
  function addSkill(a, data) {
    const name=text(data.name,180);if(!name)throw Error('Skill name missing');
    let skill=a.skills.find(x=>x.name.toLowerCase()===name.toLowerCase());
    if(!skill) {skill={id:text(data.id||uid(),160),name,level:1,xp:0,cost:cap(data.cost,0,100),resource:data.resource==='ram'?'ram':'stamina',cooldown:Math.round(cap(data.cooldown??1,0,30)),readyTurn:0,description:text(data.description)};a.skills.push(skill);}
    return skill;
  }
  function useSkill(a, data, turn) {
    const skill=addSkill(a,data);if(skill.readyTurn>turn)throw Error('Skill cooling down');
    if(a[skill.resource]<skill.cost)throw Error('Insufficient resource');
    a[skill.resource]-=skill.cost;if(skill.name==='Blackwall Interface')blackwallFeedback(a);if(skill.name==='Blackwall Containment')a.blackwall.exposure=cap(a.blackwall.exposure-15,0,100);skill.readyTurn=turn+skill.cooldown;skill.xp+=Math.round(cap(data.xp??5,0,100));
    while(skill.xp>=100&&skill.level<60){skill.level++;skill.xp-=100;}return skill;
  }
  function tick(a, random = Math.random, scale = 1) {
    a.ram=cap(a.ram+1,0,a.maxRam); a.stamina=cap(a.stamina+3,0,a.maxStamina);
    const probability=risk(a,scale);
    if(load(a)<=a.capacity)a.stress=cap(a.stress-1,0,100);
    return probability;
  }
  function puzzle({ target='Access point', difficulty=2, buffer=8, seconds=45, data='', id=uid() }={}, random=Math.random) {
    const size=Math.round(cap(difficulty+3,4,6)); buffer=Math.round(cap(buffer,6,12));
    const codes=['1C','55','BD','E9','7A'];const grid=Array.from({length:size},()=>Array.from({length:size},()=>codes[Math.floor(random()*codes.length)]));
    const path=[];let row=0,col=0,axis='row';
    while(path.length<6){const choices=[];for(let i=0;i<size;i++){const r=axis==='row'?row:i,c=axis==='row'?i:col;if(!path.some(p=>p[0]===r&&p[1]===c))choices.push([r,c]);}if(!choices.length)break;[row,col]=choices[Math.floor(random()*choices.length)];path.push([row,col]);axis=axis==='row'?'column':'row';}
    const values=path.map(([r,c])=>grid[r][c]);
    return {id:text(id,160),target:text(target,180),grid,buffer,seconds:cap(seconds,15,180),remaining:cap(seconds,15,180)*1000,startedAt:null,selected:[],sequence:[],axis:'row',row:0,col:0,daemons:[{name:'ACCESS',codes:values.slice(0,3),done:false},{name:'DATAMINE',codes:values.slice(2,5),done:false},{name:'BONUS',codes:values.slice(3,6),done:false}],status:'ready',minimized:false,offset:0,data:text(data,6000),revealed:false};
  }
  function remaining(p,now=Date.now()){return Math.max(0,p.remaining-(p.startedAt===null?0:now-p.startedAt));}
  function pause(p,now=Date.now()){p.remaining=remaining(p,now);p.startedAt=null;p.minimized=true;}
  function choose(p,row,col,now=Date.now()) {
    if(!['ready','running'].includes(p.status))return false;
    if(remaining(p,now)<=0){p.status='failed';p.startedAt=null;return false;}
    if(!Number.isInteger(row)||!Number.isInteger(col)||!p.grid[row]?.[col]||p.selected.some(v=>v[0]===row&&v[1]===col))return false;
    if((p.axis==='row'&&row!==p.row)||(p.axis==='column'&&col!==p.col))return false;
    if(p.startedAt===null)p.startedAt=now;p.status='running';p.selected.push([row,col]);p.sequence.push(p.grid[row][col]);
    p.row=row;p.col=col;p.axis=p.axis==='row'?'column':'row';
    for(const d of p.daemons)d.done=p.sequence.some((_,i)=>d.codes.every((v,k)=>p.sequence[i+k]===v));
    if(p.daemons.every(x=>x.done)||p.sequence.length>=p.buffer){p.status=p.daemons[0].done?'success':'failed';pause(p,now);p.minimized=false;}
    return true;
  }
  function finish(p,now=Date.now()){if(!['running','ready'].includes(p.status))return;p.status=p.daemons[0].done&&remaining(p,now)>0?'success':'failed';pause(p,now);p.minimized=false;}
  // Medical tuning is extension-original RP balance, not a real medical model or 2077 price table.
  const medical=(()=>{
    const medicines=Object.freeze({
      'neural-suppressant-tablet':Object.freeze({name:'Neural Suppressant / Oral',route:'oral',potency:22,duration:6,cooldown:3,toxicity:12,price:120}),
      'neural-suppressant-injector':Object.freeze({name:'Neural Suppressant / Injector',route:'inject',potency:35,duration:4,cooldown:3,toxicity:24,price:240})
    });
    const plans=Object.freeze({
      silver:Object.freeze({name:'Silver',price:500,term:60,eta:3,copay:250,danger:false}),
      executive:Object.freeze({name:'Executive',price:1000,term:60,eta:2,copay:100,danger:true}),
      platinum:Object.freeze({name:'Platinum',price:2500,term:60,eta:1,copay:0,danger:true})
    });
    function neural(a){
      if(!a.neural||typeof a.neural!=='object'||Array.isArray(a.neural))a.neural={burden:a.cyberpsychosis?25:0};
      const n=a.neural;for(const k of ['burden','toxicity','until','potency','readyTurn'])n[k]=cap(n[k],0,k==='until'||k==='readyTurn'?1e9:100);
      return n;
    }
    function store(s){
      if(!s.medical||typeof s.medical!=='object'||Array.isArray(s.medical))s.medical={};const m=s.medical;
      for(const k of ['requests','receipts','history'])if(!Array.isArray(m[k]))m[k]=[];
      m.debt=cap(m.debt,0,1e12);m.autoDispatch=m.autoDispatch===true;m.biochip=m.biochip!==false;
      if(!['full','reduced','off'].includes(m.effects))m.effects='reduced';
      if(!Number.isInteger(m.lastTurn))m.lastTurn=s.turn||0;
      return m;
    }
    function assess(a,turn=0,scale=1){
      const n=neural(a),base=cap(load(a)/Math.max(1,a.capacity)*70+n.burden,0,130),stress=cap(a.stress,0,100)*.35;
      const suppression=n.until>turn?n.potency:0,effective=scale<=0?0:cap((base+stress+n.toxicity*.15)*scale-suppression,0,150);
      return {base:Math.round(base),stress:Math.round(stress),toxicity:n.toxicity,suppression,remaining:Math.max(0,n.until-turn),effective:Math.round(effective),level:effective>=100?'episode':effective>=90?'critical':effective>=70?'near':'normal'};
    }
    const medicine=it=>it?.category==='consumable'&&Object.hasOwn(medicines,it.catalogId)?medicines[it.catalogId]:null;
    function dose(a,id,turn){
      const it=a.inventory.find(x=>x.id===id),drug=medicine(it),n=neural(a);
      if(!drug||it.quantity<1)throw Error('Owned suppressant required');
      if(n.readyTurn>turn||Number(it.cooldownUntil)>turn)throw Error('Suppressant cooldown: '+Math.max(n.readyTurn,Number(it.cooldownUntil)||0)+' RP turn');
      if(n.toxicity+drug.toxicity>75)throw Error('Toxicity limit: recover or seek treatment first');
      const potency=Math.round(drug.potency*(1-n.toxicity/150));
      it.quantity--;a.inventory=a.inventory.filter(x=>x.quantity>0);
      Object.assign(n,{potency,until:turn+drug.duration,readyTurn:turn+drug.cooldown,toxicity:n.toxicity+drug.toxicity});
      a.stamina=cap(a.stamina-5,0,a.maxStamina);return it;
    }
    function debit(s,amount,reason){
      amount=money(amount);if(s.player.balance<amount)throw Error('Insufficient eddies');s.player.balance-=amount;
      s.player.ledger.push({id:uid(),turn:s.turn,amount,delta:-amount,reason,at:new Date().toISOString()});s.player.ledger=s.player.ledger.slice(-300);
    }
    function receipt(s,title,body){
      const m=store(s),id='medical:'+uid(),doc={id,title,from:'Trauma Team / Medical Network',preview:'Contract / receipt · RP rules',content:body,sections:[],read:false,acquired:true};
      s.shards??=[];s.shards.push(doc);s.player.inventory.push(item({id,shardId:id,name:title,category:'data'}));
      m.history.push({id,title,turn:s.turn});m.history=m.history.slice(-60);return doc;
    }
    function purchase(s,kind){
      const d=Object.hasOwn(medicines,kind)?medicines[kind]:null;if(!d)throw Error('Unknown medicine');debit(s,d.price,d.name);
      const it=item({catalogId:kind,name:d.name,category:'consumable',power:0,cooldown:d.cooldown,effect:`${d.potency} suppression / ${d.duration} RP turns / toxicity +${d.toxicity}`});s.player.inventory.push(it);return it;
    }
    function subscribe(s,key,{replace=false}={}){
      const p=Object.hasOwn(plans,key)?plans[key]:null,m=store(s);if(!p)throw Error('Unknown plan');
      if(m.incident&&!['closed','cancelled'].includes(m.incident.phase))throw Error('Resolve active dispatch before changing plan');
      if(m.contract&&m.contract.expires>s.turn&&m.contract.plan!==key&&!replace)throw Error('Wait for expiry or explicitly confirm replacement before switching plans');
      const renewal=m.contract?.plan===key;
      debit(s,p.price,'Trauma Team '+p.name);m.contract={id:uid(),plan:key,holder:text(s.player.profile?.name||'Player',180),expires:Math.max(s.turn,renewal?m.contract.expires:0)+p.term};
      receipt(s,'Trauma Team / '+p.name+' policy',`${p.name} · Extension RP preset, not canon pricing.\nPremium €$${p.price} / ${p.term} story turns. Expires at turn ${m.contract.expires}.\nETA ${p.eta} turns. Incident copay €$${p.copay}.\nCoverage: known Night City districts${p.danger?', including marked danger zones':', excluding marked danger zones'}. Biochip signal required for automatic dispatch.\nStabilization and extraction only; no combat assistance or automatic resurrection. Hospital follow-up and upgrades excluded. No automatic renewal.`);
      return m.contract;
    }
    function eligibility(s){
      const m=store(s),c=m.contract,p=Object.hasOwn(plans,c?.plan)?plans[c.plan]:null;if(!p||c.expires<=s.turn)return 'No active contract';
      if(!s.map?.location?.district)return 'Set an established location first';
      if(!['watson','westbrook','city-center','heywood','santo-domingo','pacifica','dogtown'].includes(s.map.location.district))return 'Outside Night City service coverage';
      if(s.map.location.danger&&!p.danger)return 'Danger zone excluded by this plan';
      if(s.player.hp<=0)return 'No automatic resurrection; resolve survival in the story';
      return '';
    }
    function cashEligibility(s){
      if(s.player.hp<=0)return 'Resolve survival in the story; extraction cannot resurrect';
      if(!['watson','westbrook','city-center','heywood','santo-domingo','pacifica','dogtown'].includes(s.map?.location?.district))return 'Move to an established Night City service district in the story';
      if(s.map.location.danger)return 'Establish a safe pickup location in the story first';
      if(s.player.balance<1500)return 'Prepaid extraction requires €$1500; earn funds, request story assistance, or visit a clinic';
      return '';
    }
    function dispatch(s,options={}){
      const m=store(s);if(m.incident&&!['closed','cancelled'].includes(m.incident.phase))return m.incident;
      if(options.cash===true){const block=cashEligibility(s);if(block)throw Error(block);debit(s,1500,'Prepaid medical extraction');m.incident={id:uid(),phase:'dispatch',next:s.turn+4,eta:4,copay:0,plan:'cash',prepaid:1500,location:JSON.parse(JSON.stringify(s.map.location)),started:s.turn};return m.incident;}
      const reason=eligibility(s);if(reason)throw Error(reason);if(m.debt>0)throw Error('Settle the outstanding medical bill first');
      const p=plans[m.contract.plan];m.incident={id:uid(),phase:'dispatch',next:s.turn+p.eta,eta:p.eta,copay:p.copay,plan:m.contract.plan,location:JSON.parse(JSON.stringify(s.map.location)),started:s.turn};return m.incident;
    }
    function advance(s){
      const m=store(s),elapsed=Math.max(0,s.turn-m.lastTurn);m.lastTurn=s.turn;
      for(const a of [s.player,...Object.values(s.actors||{})]){const n=neural(a);n.toxicity=cap(n.toxicity-elapsed*3,0,100);a.cyberpsychosis=assess(a,s.turn,s.settings?.riskScale??1).level==='episode';}
      const i=m.incident;
      if(i&&s.turn>=i.next&&i.phase==='dispatch'){i.phase='arrival';i.next=s.turn+1;}
      if(m.autoDispatch&&m.biochip&&s.player.hp>0&&s.player.hp<=s.player.maxHp*.2&&!eligibility(s)&&!m.debt){
        // A completed rescue cannot repeatedly dispatch against the same critical-health episode.
        if(!m.criticalLatch){dispatch(s);m.criticalLatch=true;}
      }
      if(s.player.hp>s.player.maxHp*.2)m.criticalLatch=false;
    }
    function rescue(s){
      const m=store(s),i=m.incident;if(!i||i.phase!=='arrival')throw Error('Wait for team arrival');
      if(s.player.hp<=0)throw Error('Resolve survival in the story; rescue cannot resurrect');
      if(s.map.location.district!==i.location.district||s.map.location.danger&&!plans[i.plan]?.danger)throw Error('Location or coverage changed; cancel and request a new dispatch');
      i.phase='closed';i.finished=s.turn;m.debt+=i.copay;s.player.hp=Math.max(s.player.hp,Math.round(s.player.maxHp*.35));
      s.player.stress=cap(s.player.stress-15,0,100);neural(s.player).burden=cap(neural(s.player).burden-10,0,100);
      const network=i.plan==='cash'?'Medical Network':'Trauma Team';s.map.location={district:i.location.district,building:network+' receiving clinic',area:'Recovery ward',danger:false};
      receipt(s,network+' / extraction report',`Dispatch ${i.id}. Player consented to stabilization and extraction at turn ${s.turn}.\nTransferred to receiving clinic in ${i.location.district}. Minimum stabilized health 35%; not full healing.\nCopay €$${i.copay}. Outstanding bill €$${m.debt}. Cyberware load remains; follow-up treatment is separate.`);return i;
    }
    function settle(s,amount=store(s).debt){const m=store(s);if(!m.debt)throw Error('No outstanding bill');amount=money(amount);if(amount<1||amount>m.debt)throw Error('Payment must be between €$1 and the outstanding bill');debit(s,amount,'Medical bill');m.debt-=amount;receipt(s,'Medical / bill payment',`Paid €$${amount}. Outstanding balance €$${m.debt}.`);}
    function therapy(s){debit(s,300,'Neural recovery session');s.turn+=1;const n=neural(s.player);n.burden=cap(n.burden-15,0,100);n.toxicity=cap(n.toxicity-20,0,100);s.player.stress=cap(s.player.stress-20,0,100);advance(s);receipt(s,'Neural recovery / session receipt','€$300 · one RP turn. Stress −20, legacy burden −15, toxicity −20. Implant load unchanged. Fictional treatment rules.');}
    function request(s,data,id){
      const m=store(s);if(!text(id,160))throw Error('Medical request ID required');if(m.requests.some(r=>r.id===id))return;
      if(!['use','call'].includes(data.operation))throw Error('Medical requests allow use or call only');
      const it=data.operation==='use'?resolveItem(s.player,data):null;
      if(data.operation==='use'&&!medicine(it))throw Error('Owned suppressant required; no medicine created from narration');
      m.requests.push({id,operation:data.operation,itemId:it?.id,status:'pending',turn:s.turn});
    }
    return Object.freeze({medicines,plans,neural,store,assess,medicine,dose,purchase,subscribe,eligibility,cashEligibility,dispatch,advance,rescue,settle,therapy,request});
  })();
  globalThis.CyberpunkRpgCore = Object.freeze({medical,arrow,arrowLabel,cap,text,handle,money,uid,implantGroups,implantSlot,slotLimit,actor,item,itemDetails,capacityHistory,setCapacity,itemCategory,syncDeck,setQuickhackSlot,resolveItem,unlockBlackwall,blackwallFeedback,hydrate,patchActor,transfer,xpGoal,award,train,trade,load,risk,equip,use,addSkill,useSkill,tick,puzzle,remaining,pause,choose,finish});
})();
