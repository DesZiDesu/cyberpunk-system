/* Deterministic, dependency-free role-play mechanics. Numeric tuning is configurable,
   inspired by 2077; cyberpsychosis chance is an extension rule, not a game formula. */
(() => {
  'use strict';
  const cap = (n, lo, hi) => Math.min(hi, Math.max(lo, Number(n) || 0));
  const text = (v, n = 2000) => String(v ?? '').trim().slice(0, n);
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
  const actor = () => ({ balance: 0, hp: 100, maxHp: 100, stamina: 100, maxStamina: 100, ram: 8, maxRam: 8, capacity: 100, stress: 0, cyberpsychosis: false, implantUnlocks: {skeleton:false,hands:false}, inventory: [], skills: [], relic: { unlocked: false, points: 0, abilities: [] }, blackwall: { unlocked: false, exposure: 0 }, ledger: [] });
  const item = value => ({ id: text(value.id || uid(), 160), name: text(value.name || value.id || 'Unknown', 180), category: ['cyberware','weapons','consumable','quickhack','clothing','mod','component','data','item'].includes(value.category) ? value.category : 'item', quantity: Math.round(cap(value.quantity ?? 1, 1, 9999)), equipped: value.equipped === true, slot: value.category==='cyberware'?implantSlot(value.slot||slotAliases[text(value.name,180).toLowerCase().replace(/[ _]+/g,'-')]||''):text(value.slot,80), capacity: cap(value.capacity ?? (value.category === 'cyberware' ? 10 : 0), 0, 300), effect: text(value.effect), power: cap(value.power ?? 20, 0, 1000), charges: Math.round(cap(value.charges ?? 1, 0, 99)), cooldown: Math.round(cap(value.cooldown ?? 2, 0, 30)), cooldownUntil: 0, catalogId: text(value.catalogId, 180), image: typeof value.image === 'string' && /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value.image) && value.image.length < 500000 ? value.image : '' });
  function hydrate(a) {
    if (!a || typeof a !== 'object') a = actor();
    const defaults = actor(); for (const [k,v] of Object.entries(defaults)) if (a[k] === undefined) a[k] = v;
    for (const k of ['inventory','skills','ledger']) if (!Array.isArray(a[k])) a[k] = [];
    for (const k of ['relic','blackwall','implantUnlocks']) { if (!a[k] || typeof a[k] !== 'object' || Array.isArray(a[k])) a[k] = defaults[k]; for (const [field,value] of Object.entries(defaults[k])) if (a[k][field] === undefined) a[k][field] = value; }
    for(const it of a.inventory)if(it.category==='cyberware')it.slot=implantSlot(it.slot||slotAliases[text(it.name,180).toLowerCase().replace(/[ _]+/g,'-')]||'');
    if (!Array.isArray(a.relic.abilities)) a.relic.abilities = [];
    for (const k of ['hp','maxHp','stamina','maxStamina','ram','maxRam','capacity','stress']) a[k] = cap(a[k], k.startsWith('max') || k === 'capacity' ? 1 : 0, k === 'stress' ? 100 : 1000);
    a.balance = Number.isSafeInteger(a.balance) && a.balance >= 0 ? Math.min(a.balance, 1e12) : 0;
    return a;
  }
  function patchActor(a, data) {
    const next = {};
    for (const key of ['maxHp','maxRam','maxStamina','capacity','hp','ram','stamina','stress']) {
      if (data[key] === undefined) continue;
      const value = Number(data[key]);
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
  function load(a) { return a.inventory.filter(x=>x.category==='cyberware'&&x.equipped).reduce((n,x)=>n+cap(x.capacity,0,300),0); }
  function risk(a, scale = 1) { const ratio=load(a)/Math.max(1,a.capacity); return cap((Math.max(0,ratio-.6)*20 + Math.max(0,ratio-1)*50 + cap(a.stress,0,100)*.15) * scale, 0, 95); }
  function equip(a, id) {
    const it=a.inventory.find(x=>x.id===id); if (!it) throw Error('Item missing');
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
    if (it.category==='consumable') { if(it.quantity<1)throw Error('Empty stack');it.quantity--;a.hp=cap(a.hp+it.power,0,a.maxHp);a.stress=cap(a.stress-10,0,100);if(!it.quantity)a.inventory=a.inventory.filter(x=>x!==it); }
    else if(it.category==='quickhack') {const cost=Math.max(1,Math.round(it.power/10));if(a.ram<cost)throw Error('Insufficient RAM');a.ram-=cost;}
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
    a[skill.resource]-=skill.cost;skill.readyTurn=turn+skill.cooldown;skill.xp+=Math.round(cap(data.xp??5,0,100));
    while(skill.xp>=100&&skill.level<60){skill.level++;skill.xp-=100;}return skill;
  }
  function tick(a, random = Math.random, scale = 1) {
    a.ram=cap(a.ram+1,0,a.maxRam); a.stamina=cap(a.stamina+3,0,a.maxStamina);
    const probability=risk(a,scale); if(!a.cyberpsychosis&&probability>0&&random()*100<probability)a.cyberpsychosis=true;
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
  globalThis.CyberpunkRpgCore = Object.freeze({cap,text,handle,money,uid,implantGroups,implantSlot,slotLimit,actor,item,hydrate,patchActor,transfer,load,risk,equip,use,addSkill,useSkill,tick,puzzle,remaining,pause,choose,finish});
})();
