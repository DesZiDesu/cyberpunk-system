/* Persistent, chat-local storefronts. Prices and stock are explicit RP terms. */
(() => {
'use strict';
globalThis.CyberpunkShopsFactory = api => {
  const C=globalThis.CyberpunkRpgCore, DB=globalThis.CyberpunkCatalog, E=api.htmlEscape;
  const copy=v=>JSON.parse(JSON.stringify(v));
  const tr=(en,th)=>api.settings().language==='th'?th:en;
  const categories=[
    ['clothing','Clothing','เสื้อผ้า'],['weapons','Weapons','ปืน / อาวุธ'],
    ['essentials','Everyday goods','ของใช้'],['medicine','Medicine','ยา'],
    ['equipment','Equipment','อุปกรณ์'],['cyberware','Cyberware','ไซเบอร์แวร์'],
    ['quickhack','Quickhacks','Quickhack'],['ammo','Ammunition','กระสุน'],
    ['other','Other goods','อื่น ๆ']
  ];
  const kinds=[['general','General store','ร้านทั่วไป'],['weapons','Weapons dealer','ร้านอาวุธ'],['clothing','Clothing store','ร้านเสื้อผ้า'],['medicine','Medical supplies','ร้านยา'],['cyberware','Ripperdoc','ริปเปอร์ด็อก'],['quickhack','Netrunning store','ร้านอุปกรณ์เน็ตรันเนอร์']];
  const coreCategory={clothing:'clothing',weapons:'weapons',essentials:'item',medicine:'consumable',equipment:'mod',cyberware:'cyberware',quickhack:'quickhack',ammo:'item',other:'item'};
  const label=key=>{const row=categories.find(x=>x[0]===key);return row?tr(row[1],row[2]):key;};
  const norm=v=>C.text(v,180).normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ').trim();
  const address=v=>['district','subdistrict','building','floor','area'].map(k=>norm(v?.[k])).join('|');
  const id=v=>{const x=C.text(v,140);if(!/^[a-zA-Z0-9_.:-]+$/.test(x)||['__proto__','prototype','constructor'].includes(x))throw Error('Use a stable shop/event ID');return x;};
  const integer=(v,max=9999)=>{const n=Number(v);if(!Number.isSafeInteger(n)||n<0||n>max)throw Error('Invalid stock or quantity');return n;};
  const store=()=>{const s=api.state();s.market??={shops:[],receipts:[]};return s.market;};
  const find=key=>store().shops.find(x=>x.id===key);
  const point=value=>{const p=globalThis.CyberpunkMap.normalizeLocation(value||{});if(!C.text(p.building)||!C.text(p.area))throw Error('Shop location needs a building and a specific shop/counter area');return p;};
  const catalog=()=>DB.curated.filter(x=>x.id!=='cps:erebus');
  const categoryFor=item=>({clothing:'clothing',weapons:'weapons',consumable:'medicine',cyberware:'cyberware',quickhack:'quickhack',mod:'equipment',component:'equipment',data:'other',braindance:'other'})[item.category]||'essentials';
  let windowNode=null,windowOwner=null,windowShop=null,windowVisit=null,mode='buy',filter='all',search='',selected=null,page=0,renderSignature='';
  const button=(action,title,extra='')=>'<button type="button" class="cps-button" data-shop="'+E(action)+'" '+extra+'>'+C.arrowLabel(title,E)+'</button>';

  function stockRow(value){
    const sku=id(value.sku),quantity=integer(value.quantity),price=C.money(value.price);
    if(price<1)throw Error('Unit sale price must be positive');
    const token=v=>norm(v).replace(/^cps[:_-]/,'').replace(/[\s_-]+/g,'');
    const named=C.text(value.item?.name||value.name,180);
    const template=value.origin==='story'?null:(catalog().find(x=>token(x.id)===token(value.catalogId))||catalog().find(x=>named&&token(x.name)===token(named)));
    if(value.catalogId&&!template&&value.origin!=='story'){const e=Error('Unrecognized catalog item: '+C.text(named||value.catalogId,180));e.code='CATALOG_UNRESOLVED';throw e;}
    let item,category;
    if(template){
      category=categoryFor(template);
      item=C.item({...template,id:sku,catalogId:template.id,equipped:false,quantity:1,...(template.category==='weapons'?{weaponType:['cps:katana','cps:kukri','cps:baseball-bat'].includes(template.id)?'melee':'firearm'}:{})});
    }else{
      if(value.origin!=='story'||!C.text(value.item?.name))throw Error('Custom goods require origin:story and an established item name');
      category=value.category;
      if(!categories.some(x=>x[0]===category))throw Error('Choose a shop category');
      item=C.item({...value.item,id:sku,category:coreCategory[category],equipped:false,quantity:1,power:value.item.power??0});
    }
    const buyPrice=C.money(value.buyPrice??Math.floor(price/2));
    if(buyPrice>price)throw Error('Buyback price must not exceed this row sale price');
    return {id:sku,quantity,price,buyPrice,category,item,origin:template?'catalog':'story'};
  }
  function rules(value={}){
    if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid buyback prices');
    const next={};for(const [key,price]of Object.entries(value)){
      if(!categories.some(x=>x[0]===key))throw Error('Unknown buyback category');
      next[key]=C.money(price);
    }return next;
  }
  function sourceMessage(visit){
    const m=api.context()?.chat?.[visit?.index];
    if(!m||m.is_user||m.is_system||(m.swipe_id??0)!==visit.swipe)return false;
    for(const match of String(m.mes||'').matchAll(/\[CP_SHOP\]([\s\S]*?)\[\/CP_SHOP\]/gi)){
      try{const v=JSON.parse(match[1]);if(v.id===visit.recordId&&v.operation==='open'&&v.shopId===visit.shopId)return true;}catch{}
    }return false;
  }
  function accessible(shop,visitId){
    const s=api.state(),v=shop?.visit;
    return !!(api.settings().enabled&&v?.active&&v.id===visitId&&sourceMessage(v)&&address(shop.location)===address(s.map.location)&&s.bd.status==='stopped'&&!s.bd.rendering);
  }
  function sync(){
    let changed=false;
    for(const shop of store().shops){
      if(shop.visit?.active&&(!sourceMessage(shop.visit)||address(shop.location)!==address(api.state().map.location))){
        shop.visit.active=false;shop.visit.reason=tr('You left this shop or the visit message changed.','คุณออกจากร้าน หรือข้อความเข้าเยี่ยมชมเปลี่ยนแล้ว');changed=true;
      }
    }
    if(changed)api.saveChat();
    refreshCards();
    if(windowNode?.isConnected&&windowOwner===api.chatBucket())draw(false);
  }
  function receive(data,key,options={}){
    const eventId=id(data.id),shopId=id(data.shopId),source=/^(\d+):swipe:(\d+)$/.exec(key);
    const chat=api.context()?.chat||[];
    // A historic rerender or a private call cannot open/restock a physical store.
    if(!source||chat[Number(source[1])]?.is_user||chat[Number(source[1])]?.is_system)return false;
    if(options.retry&&data.operation==='open'&&(address(data.location)!==address(api.state().map.location)||!sourceMessage({index:Number(source[1]),swipe:Number(source[2]),recordId:eventId,shopId})))throw Error(tr('Return to this counter with its original visit message before retrying.','กลับมาที่เคาน์เตอร์นี้และใช้ข้อความเข้าร้านเดิมก่อนลองใหม่'));
    if(Number(source[1])!==chat.length-1&&!(options.retry&&data.operation==='open'&&address(data.location)===address(api.state().map.location)&&sourceMessage({index:Number(source[1]),swipe:Number(source[2]),recordId:eventId,shopId})))return false;
    if(api.state().bd.status!=='stopped'||api.state().bd.rendering)return false;
    const market=store(),old=find(shopId);
    if(data.operation==='close'){
      if(old?.visit?.active){old.visit.active=false;old.visit.reason=C.text(data.reason||tr('Visit ended','สิ้นสุดการเยี่ยมชม'),300);}
      sync();return true;
    }
    if(data.operation==='open'){
      let shop=old;
      if(!shop){
        if(!C.text(data.name)||!Array.isArray(data.stock)||!data.stock.length||data.stock.length>80)throw Error('A new shop needs a name and 1–80 stock rows');
        const stock=[],pendingStock=[];if(new Set(data.stock.map(x=>id(x.sku))).size!==data.stock.length)throw Error('Duplicate shop SKU');
        for(const row of data.stock){try{stock.push(stockRow(row));}catch(e){if(e.code!=='CATALOG_UNRESOLVED')throw e;pendingStock.push({input:copy(row),reason:e.message});}}
        shop={id:shopId,name:C.text(data.name,180),merchant:C.text(data.merchant||data.name,180),kind:kinds.some(x=>x[0]===data.kind)?data.kind:'general',location:point(data.location),stock,pendingStock,funds:C.money(data.funds??0),buyPrices:rules(data.buyPrices),version:1,history:[]};
        if(market.shops.length>=200)throw Error('Shop limit reached');
        market.shops.push(shop);
      }
      for(const other of market.shops)if(other.visit?.active){other.visit.active=false;other.visit.reason=tr('Visit ended','สิ้นสุดการเยี่ยมชม');}
      shop.visit={id:'visit:'+eventId,recordId:eventId,shopId,index:Number(source[1]),swipe:Number(source[2]),active:address(shop.location)===address(api.state().map.location)};
      if(!shop.visit.active)shop.visit.reason=tr('Current scene is outside this shop.','ตำแหน่งฉากปัจจุบันอยู่นอกร้านนี้');
      // Re-entry deliberately ignores submitted stock, funds and prices.
      sync();return true;
    }
    if(data.operation==='restock'){
      if(!old)throw Error('Shop must be established before restocking');
      if(!C.text(data.reason))throw Error('Restock requires a story-confirmed delivery reason');
      const next=copy(old),rows=data.stock||[];if(!Array.isArray(rows)||rows.length>80)throw Error('Invalid delivery');
      const seen=new Set();
      for(const input of rows){
        const sku=id(input.sku);if(seen.has(sku))throw Error('Duplicate delivery SKU');seen.add(sku);
        const row=next.stock.find(x=>x.id===sku);
        if(row){row.quantity=integer(row.quantity+integer(input.quantity));}
        else{if(next.stock.length>=200)throw Error('Shop stock row limit reached');next.stock.push(stockRow(input));}
      }
      const funds=C.money(data.funds??0);if(!rows.length&&!funds)throw Error('Delivery must contain stock or shop funds');
      next.funds=C.money(next.funds+funds);next.version++;
      next.history.push({id:eventId,kind:'restock',reason:C.text(data.reason,500),at:Date.now()});next.history=next.history.slice(-100);
      Object.assign(old,next);sync();return true;
    }
    throw Error('Shop operation must be open, close or restock');
  }
  function guardAccess(shopId,visitId){
    sync();
    const shop=find(shopId);
    if(!accessible(shop,visitId))throw Error(tr('This visit is closed. Return to the shop for a new button.','การเยี่ยมชมนี้ปิดแล้ว กลับเข้าร้านเพื่อรับปุ่มใหม่'));
    if(api.isGenerating?.()||api.busy?.())throw Error(tr('Wait for generation to finish before trading.','รอการสร้างข้อความจบก่อนซื้อขาย'));
    return shop;
  }
  function sellOffer(shop,item){
    if(!item||item.equipped||item.questItem||item.quest||item.protected)return null;
    const category=item.shopCategory||categoryFor(item);
    const match=shop.stock.find(x=>(item.catalogId&&x.item.catalogId===item.catalogId)||(!item.catalogId&&norm(x.item.name)===norm(item.name)&&x.item.category===item.category));
    const unit=match?match.buyPrice:shop.buyPrices[category]||0;
    return unit>0?{category,unit,resale:match?.price||Math.max(1,unit*2)}:null;
  }
  function quote(shopId,visitId,operation,itemId,quantity){
    const shop=guardAccess(shopId,visitId),qty=integer(quantity);
    if(!qty)throw Error('Choose at least one item');
    let item,unit,max,category;
    if(operation==='buy'){
      const row=shop.stock.find(x=>x.id===itemId);if(!row)throw Error('Stock item missing');
      ({item,price:unit,quantity:max,category}=row);
    }else if(operation==='sell'){
      item=api.state().player.inventory.find(x=>x.id===itemId);
      const offer=sellOffer(shop,item);if(!offer)throw Error('Unequip this item or choose an item the shop buys');
      unit=offer.unit;category=offer.category;max=item.quantity;
    }else throw Error('Choose buy or sell');
    if(qty>max)throw Error('Not enough stock or owned items');
    const total=C.money(unit*qty),player=api.state().player;
    if(operation==='buy'&&player.balance<total)throw Error('Insufficient balance');
    if(operation==='sell'&&shop.funds<total)throw Error('Shop has insufficient buyback funds');
    return {id:'shop-tx:'+C.uid(),shopId,visitId,operation,itemId,quantity:qty,unit,total,category,name:item.name,version:shop.version,itemFingerprint:api.fingerprint(JSON.stringify(item))};
  }
  function checkout(value){
    const market=store();if(market.receipts.includes(value.id))return false;
    const shop=guardAccess(value.shopId,value.visitId);
    const current=quote(value.shopId,value.visitId,value.operation,value.itemId,value.quantity);
    if(current.version!==value.version||current.total!==value.total||current.itemFingerprint!==value.itemFingerprint)throw Error('Shop or item changed. Review a new quote.');
    const player=copy(api.state().player),next=copy(shop),till=C.actor();till.balance=next.funds;
    let row,original;
    if(value.operation==='buy')row=next.stock.find(x=>x.id===value.itemId);
    else original=player.inventory.find(x=>x.id===value.itemId);
    const offer=original?sellOffer(next,original):null;
    const result=C.trade(player,till,{operation:value.operation,amount:value.total,reason:shop.name+' / '+value.operation,items:row?[{...copy(row.item),id:value.id+':item',quantity:value.quantity,equipped:false}]:[{itemId:value.itemId,quantity:value.quantity}]},value.id);
    if(!result)throw Error('Transaction was already settled');
    if(row){
      row.quantity-=value.quantity;
      const purchased=player.inventory.find(x=>x.id===value.id+':item');
      Object.assign(purchased,copy(row.item),{id:value.id+':item',quantity:value.quantity,equipped:false,shopCategory:row.category});
    }else{
      // Keep sold copies separate: different levels, ammunition and cooldowns must survive resale.
      if(next.stock.length>=200)throw Error('Shop cannot accept another stock row');
      next.stock.push({id:value.id+':resale',item:{...copy(original),equipped:false,quantity:1},quantity:value.quantity,price:offer.resale,buyPrice:value.unit,category:offer.category,origin:'resale'});
    }
    C.syncDeck(player);next.funds=till.balance;next.version++;
    const receipt={id:value.id,kind:value.operation,name:value.name,quantity:value.quantity,unit:value.unit,total:value.total,at:Date.now()};
    next.history.push(receipt);next.history=next.history.slice(-100);
    Object.assign(api.state().player,player);Object.assign(shop,next);market.receipts.push(value.id);
    api.event('shop '+value.operation,shop.name+': '+value.name+' ×'+value.quantity+' / €$'+value.total+'. Money, inventory and shop stock ALREADY settled. Do not issue another TRADE, TRANSFER, LOOT, ITEM or PAYMENT for this transaction.');
    api.share({id:value.id,kind:'receipt',title:tr('SHOP RECEIPT','ใบเสร็จร้านค้า'),description:shop.name+' · '+value.name+' ×'+value.quantity,receipt:{shop:shop.name,action:value.operation,unit:'€$'+value.unit,quantity:value.quantity,total:'€$'+value.total,status:'Completed',date:new Date().toISOString()}},'user',api.context()?.name1||'USER');
    api.saveChat();api.refreshPrompt();sync();return receipt;
  }
  function updateShop(shopId,visitId,input){
    const shop=guardAccess(shopId,visitId),next=copy(shop);
    next.name=C.text(input.name,180);if(!next.name)throw Error('Shop name required');
    next.funds=C.money(input.funds);next.buyPrices=rules(input.buyPrices);
    if(!Array.isArray(input.stock)||input.stock.length>200)throw Error('Invalid stock list');
    const ids=new Set();
    next.stock=input.stock.map(v=>{
      const existing=shop.stock.find(x=>x.id===v.sku);
      let row=existing?copy(existing):stockRow(v);
      if(ids.has(row.id))throw Error('Duplicate SKU');ids.add(row.id);
      row.price=C.money(v.price);row.buyPrice=C.money(v.buyPrice??0);row.quantity=integer(v.quantity);
      if(!row.price||row.buyPrice>row.price)throw Error('Invalid sale/buyback prices');
      return row;
    });
    next.version++;next.history.push({id:C.uid(),kind:'manual setup',reason:'User revised stock, prices or store funds',at:Date.now()});next.history=next.history.slice(-100);
    Object.assign(shop,next);api.event('shop setup',shop.name+': user reviewed store terms; no player payment or item grant');api.saveChat();api.refreshPrompt();sync();
  }
  function decorate(element){
    const node=element.closest('[mesid]'),index=Number(node?.getAttribute('mesid'));
    if(!node||!Number.isInteger(index))return;
    element.querySelectorAll(':scope > .cps-shop-recovery').forEach(n=>n.remove());
    if(api.settings().enabled&&api.state().bd.status==='stopped'&&!api.state().bd.rendering)for(const row of api.state().recordLog||[]){
      if(row.type!=='SHOP'||row.status!=='failed'||!row.source?.startsWith(index+':swipe:'))continue;
      let v;try{v=JSON.parse(row.raw.match(/^\[CP_SHOP\]([\s\S]*)\[\/CP_SHOP\]$/i)[1]);}catch{continue;}
      if(v.operation!=='open'||find(v.shopId)||address(v.location)!==address(api.state().map.location)||!sourceMessage({index,swipe:Number(row.source.split(':').at(-1)),recordId:v.id,shopId:v.shopId}))continue;
      const recovery=document.createElement('section'),owner=api.chatBucket();recovery.className='cps-shop-recovery';recovery.innerHTML='<strong>'+E(v.name||tr('Shop','ร้านค้า'))+'</strong><p>'+E(tr('The earlier shop record needs another check. Unrecognized goods will remain unavailable for purchase.','ตรวจข้อมูลร้านเดิมอีกครั้ง สินค้าที่ระบบยังไม่รู้จักจะถูกแยกไว้ก่อน'))+'</p>'+button('retry',tr('Open shop / check goods','เปิดร้าน / ตรวจสินค้า'));
      recovery.querySelector('button').onclick=()=>{if(owner!==api.chatBucket()||!recovery.isConnected)return;try{api.retryRecord(row.key,row.raw);const shop=find(v.shopId);if(shop?.visit&&accessible(shop,shop.visit.id))open(shop.id,shop.visit.id);}catch(e){api.toast(e.message);}};element.append(recovery);
    }
    const candidates=api.settings().enabled?store().shops.filter(s=>s.visit?.index===index&&sourceMessage(s.visit)):[];
    const wanted=new Set(candidates.map(s=>s.visit.id));
    element.querySelectorAll(':scope > .cps-shop-card').forEach(n=>{if(!wanted.has(n.dataset.shopVisit))n.remove();});
    for(const shop of candidates){
      let card=[...element.querySelectorAll(':scope > .cps-shop-card')].find(n=>n.dataset.shopVisit===shop.visit.id);
      const enabled=accessible(shop,shop.visit.id),units=shop.stock.reduce((n,x)=>n+x.quantity,0);
      const html='<div class="cps-shop-card-mark" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 24 14 10h36l6 14v10H8Zm6 10v20h36V34M24 54V40h16v14M8 24h48M23 10l-3 14m21-14 3 14"/></svg><small>TRADE / 01</small></div><div class="cps-shop-card-copy"><small>LOCAL VENDOR / '+E(enabled?tr('IN RANGE','อยู่ในร้าน'):tr('VISIT CLOSED','อยู่นอกร้าน'))+'</small><strong>'+E(shop.name)+'</strong><span>'+E(shop.location.building+' / '+shop.location.area)+' · '+units+' '+E(tr('items in stock','ชิ้นคงเหลือ'))+'</span></div>'+button('open',enabled?tr('Enter shop ↗','เข้าร้านค้า ↗'):tr('Shop unavailable','เปิดร้านไม่ได้'),enabled?'':'disabled')+(!enabled?'<p class="cps-rpg-note">'+E(shop.visit.reason||tr('Current location differs from the shop record.','ตำแหน่งปัจจุบันไม่ตรงกับข้อมูลร้าน'))+'</p>'+button('review-location',tr('Review location · no AI','ตรวจตำแหน่ง · ไม่เรียก AI')):'');
      if(!card){card=document.createElement('section');card.className='cps-shop-card';card.dataset.shopVisit=shop.visit.id;element.append(card);}
      card.classList.toggle('unavailable',!enabled);
      if(card.cpsMarkup!==html||card.cpsOwner!==api.chatBucket()){const owner=api.chatBucket();card.cpsOwner=owner;card.cpsMarkup=html;card.innerHTML=html;card.querySelector('button').onclick=()=>{if(owner!==api.chatBucket()||!card.isConnected)return;try{open(shop.id,shop.visit.id);}catch(e){api.toast(e.message);}};card.querySelector('[data-shop=review-location]')?.addEventListener('click',()=>{if(owner===api.chatBucket()&&card.isConnected)reviewLocation(shop);});}
    }
  }
  function reviewLocation(shop){
    const owner=api.chatBucket(),visit=shop.visit,scene=address(api.state().map.location);
    const d=api.dialog(tr('Review shop location','ตรวจตำแหน่งร้าน'),'<section class="cps-support-section"><h3>'+E(shop.name)+'</h3><p>'+E(tr('No AI request. Confirm only if the current story places you at this counter. This corrects the shop address, not its stock or money.','ไม่เรียก AI ยืนยันเฉพาะเมื่อในเรื่องคุณอยู่ที่เคาน์เตอร์นี้จริง ระบบแก้ตำแหน่งร้าน ไม่เพิ่มสินค้าและไม่เปลี่ยนเงิน'))+'</p><p>'+E(tr('Player: ','ผู้เล่น: ')+address(api.state().map.location))+'</p><p>'+E(tr('Shop: ','ร้าน: ')+address(shop.location))+'</p>'+button('confirm-location',tr('I am at this counter — use current location','ฉันอยู่ที่เคาน์เตอร์นี้ — ใช้ตำแหน่งปัจจุบัน'))+'<p role="alert"></p></section>');
    d.querySelector('[data-shop=confirm-location]').onclick=()=>{try{
      if(owner!==api.chatBucket()||!d.isConnected||shop.visit!==visit||scene!==address(api.state().map.location))throw Error('Scene changed; review again');
      if(!api.settings().enabled||api.state().bd.status!=='stopped'||api.state().bd.rendering||api.isGenerating?.()||api.busy?.())throw Error('Wait until the real scene is idle');
      if(!sourceMessage(visit))throw Error('Original visit record is no longer available');
      const location=point(api.state().map.location);
      for(const other of store().shops)if(other.visit)other.visit.active=false;
      shop.location=location;visit.active=true;visit.reason='';shop.version++;
      api.event('manual shop location correction',shop.name+': player confirmed current counter; stock and funds unchanged');api.saveChat();api.refreshPrompt();api.removeUiDialog(d);sync();open(shop.id,visit.id);
    }catch(e){d.querySelector('[role=alert]').textContent=e.message;}};
  }
  function refreshCards(){document.querySelectorAll('.mes_text').forEach(decorate);}
  function open(shopId,visitId){
    const shop=guardAccess(shopId,visitId);
    api.removeUiDialog(windowNode);
    windowOwner=api.chatBucket();windowShop=shop.id;windowVisit=visitId;mode='buy';filter='all';search='';selected=null;page=0;renderSignature='';
    windowNode=api.dialog(shop.name,'<div class="cps-shop-terminal"></div>','cps-shop-window');draw();return windowNode;
  }
  function draw(force=true){
    if(!windowNode?.isConnected||windowOwner!==api.chatBucket())return;
    const shop=find(windowShop);if(!shop){close();return;}
    const enabled=accessible(shop,windowVisit),player=api.state().player,host=windowNode.querySelector('.cps-shop-terminal');
    const signature=api.fingerprint(JSON.stringify([shop,player.balance,player.inventory,mode,filter,search,selected,page,enabled,api.settings().language]));
    if(!force&&signature===renderSignature)return;renderSignature=signature;
    const stock=mode==='buy'?shop.stock.map(row=>({key:row.id,item:row.item,category:row.category,quantity:row.quantity,price:row.price,origin:row.origin})):player.inventory.map(item=>{const offer=sellOffer(shop,item);return {key:item.id,item,category:item.shopCategory||categoryFor(item),quantity:item.quantity,price:offer?.unit||0,origin:item.equipped?'equipped':'owned'};});
    const visible=stock.filter(row=>(filter==='all'||row.category===filter)&&norm(row.item.name+' '+row.item.effect).includes(norm(search)));
    page=Math.min(page,Math.max(0,Math.ceil(visible.length/24)-1));const shown=visible.slice(page*24,page*24+24);
    const pick=stock.find(x=>x.key===selected);
    host.innerHTML='<header class="cps-shop-hero"><div><small>NIGHT CITY / LOCAL COMMERCE</small><h2>'+E(shop.name)+'</h2><p>'+E(shop.merchant)+' · '+E(shop.location.area)+'</p></div><div class="cps-shop-wallet"><span>'+E(tr('YOUR EDDIES','เงินของคุณ'))+'</span><strong>€$'+player.balance.toLocaleString('en-US')+'</strong><small>'+E(tr('Shop buyback funds','เงินรับซื้อของร้าน'))+' €$'+shop.funds.toLocaleString('en-US')+'</small></div></header>'+
      (!enabled?'<p class="cps-shop-closed" role="status">'+E(tr('This visit is no longer available. Return in the story for a new shop button.','การเยี่ยมชมนี้ใช้ไม่ได้แล้ว กลับเข้าร้านในเนื้อเรื่องเพื่อรับปุ่มใหม่'))+'</p>':'')+
      '<nav class="cps-shop-modes" aria-label="Trade mode">'+button('mode:buy',tr('Buy','ซื้อ'),'aria-pressed="'+(mode==='buy')+'"')+button('mode:sell',tr('Sell','ขาย'),'aria-pressed="'+(mode==='sell')+'"')+button('history',tr('Receipts','ใบเสร็จ'))+button('edit',tr('Edit shop','แก้ไขร้าน'),enabled?'':'disabled')+'</nav>'+
      (shop.pendingStock?.length?'<details class="cps-shop-pending"><summary>'+E(tr('Goods awaiting identification','สินค้าที่รอตรวจสอบ'))+' ('+shop.pendingStock.length+')</summary><p>'+E(tr('These rows cannot be purchased. Use Edit shop to add the reviewed item and terms.','รายการเหล่านี้ยังซื้อไม่ได้ ใช้แก้ไขร้านเพื่อเพิ่มสินค้าที่ตรวจแล้วพร้อมราคา'))+'</p>'+shop.pendingStock.map(x=>'<p>'+E(x.input?.item?.name||x.input?.name||x.input?.catalogId||'—')+'</p>').join('')+'</details>':'')+
      '<div class="cps-shop-search"><label>'+E(tr('Search goods','ค้นหาสินค้า'))+'<input type="search" data-shop-search value="'+E(search)+'" placeholder="'+E(tr('Name or description…','ชื่อหรือรายละเอียด…'))+'"></label><select data-shop-category aria-label="'+E(tr('Category','หมวดหมู่'))+'"><option value="all">'+E(tr('All categories','ทุกหมวด'))+'</option>'+categories.map(([k,en,th])=>'<option value="'+k+'" '+(filter===k?'selected':'')+'>'+E(tr(en,th))+'</option>').join('')+'</select></div>'+
      '<p class="cps-shop-terms">'+E(tr('Prices, stock and buyback terms are saved RP offers. Buying cyberware adds it to inventory; installation uses Cyberware. Stock changes only through purchases, sales, confirmed story deliveries or your edits.','ราคา สต็อก และราคารับซื้อเป็นข้อเสนอ RP ที่บันทึกไว้ ซื้อไซเบอร์แวร์แล้วเข้าคลัง ติดตั้งจากหน้า Cyberware สต็อกเปลี่ยนเมื่อซื้อ ขาย เรื่องยืนยันการส่งของ หรือคุณแก้ไข'))+'</p>'+
      '<div class="cps-shop-layout"><div><div class="cps-shop-grid">'+(shown.map(row=>'<button type="button" class="cps-shop-product '+(!row.quantity||!row.price?'sold-out':'')+'" data-shop-item="'+E(row.key)+'" aria-pressed="'+(selected===row.key)+'"><span class="cps-shop-product-top">'+E(label(row.category))+'<b>×'+row.quantity+'</b></span><span class="cps-shop-product-icon" aria-hidden="true">'+api.icon(row.item.category)+'</span><strong>'+E(row.item.name)+'</strong><span>'+E(row.origin==='story'?tr('STORY ITEM','ไอเทมในโรล'):row.origin==='resale'?tr('RESALE','สินค้ารับซื้อคืน'):row.origin==='catalog'?tr('CATALOG NAME / RP STATS','ชื่อจากรายการ / ค่าสำหรับ RP'):row.origin==='equipped'?tr('UNEQUIP TO SELL','ถอดก่อนขาย'):tr('OWNED','เป็นเจ้าของ'))+'</span><footer><b>'+(row.price?'€$'+row.price.toLocaleString('en-US'):E(tr('No buyback offer','ร้านไม่รับซื้อ')))+'</b><small>'+E(row.quantity?tr('Select','เลือก'):tr('SOLD OUT','หมด'))+'</small></footer></button>').join('')||'<p class="cps-shop-empty">'+E(tr('No goods in this category.','ไม่มีสินค้าในหมวดนี้'))+'</p>')+'</div><nav class="cps-shop-pagination">'+button('prev','←',page?'':'disabled')+'<span>'+(page+1)+' / '+Math.max(1,Math.ceil(visible.length/24))+'</span>'+button('next','→',(page+1)*24<visible.length?'':'disabled')+'</nav></div><aside class="cps-shop-selection">'+(pick?'<small>'+E(mode==='buy'?tr('PURCHASE DETAILS','รายละเอียดการซื้อ'):tr('SELL TO SHOP','ขายให้ร้าน'))+'</small><h3>'+E(pick.item.name)+'</h3><p>'+E(pick.item.effect||tr('No additional effect specified.','ยังไม่มีรายละเอียดผลเพิ่มเติม'))+'</p><dl><dt>'+E(tr('Category','หมวด'))+'</dt><dd>'+E(label(pick.category))+'</dd><dt>'+E(tr('Available','จำนวนที่มี'))+'</dt><dd>'+pick.quantity+'</dd><dt>'+E(tr('Unit price','ราคาต่อชิ้น'))+'</dt><dd>€$'+pick.price+'</dd><dt>LV / RAM</dt><dd>'+E(pick.item.level||1)+' / '+E(pick.item.category==='quickhack'?pick.item.ramCost:'—')+'</dd></dl><form data-shop-order><label>'+E(tr('Quantity','จำนวน'))+'<input name="quantity" type="number" value="1" min="1" max="'+pick.quantity+'" step="1" required inputmode="numeric"></label><p data-shop-total></p><button class="cps-button primary" '+(!enabled||!pick.quantity||!pick.price?'disabled':'')+'>'+E(tr('Review transaction','ตรวจรายการก่อนยืนยัน'))+'</button></form>':'<div class="cps-shop-empty"><span aria-hidden="true">◇</span><h3>'+E(tr('Select an item','เลือกสินค้า'))+'</h3><p>'+E(tr('Inspect the offer and quantity before confirming.','ตรวจรายละเอียด ราคา และจำนวนก่อนยืนยัน'))+'</p></div>')+'<p data-shop-error role="alert"></p></aside></div>';
    host.querySelectorAll('[data-shop-item]').forEach(b=>b.onclick=()=>{selected=b.dataset.shopItem;draw();windowNode.querySelector('.cps-shop-selection')?.scrollIntoView?.({block:'nearest'});});
    host.querySelector('[data-shop-category]').onchange=e=>{filter=e.target.value;page=0;draw();};
    host.querySelector('[data-shop-search]').oninput=e=>{search=e.target.value;page=0;const start=e.target.selectionStart;draw();const input=host.querySelector('[data-shop-search]');input.focus({preventScroll:true});try{input.setSelectionRange(start,start);}catch{}};
    host.querySelectorAll('[data-shop]').forEach(b=>b.onclick=()=>{try{
      const [action,value]=b.dataset.shop.split(':');
      if(action==='mode'){mode=value;selected=null;page=0;draw();}
      if(action==='prev'){page--;draw();}if(action==='next'){page++;draw();}
      if(action==='edit')edit(shop);
      if(action==='history')showHistory(shop);
    }catch(e){host.querySelector('[data-shop-error]').textContent=e.message;}});
    const form=host.querySelector('[data-shop-order]');
    if(form){const total=()=>host.querySelector('[data-shop-total]').textContent=tr('Total','รวม')+' €$'+(pick.price*(Number(form.elements.quantity.value)||0)).toLocaleString('en-US');form.oninput=total;total();
      form.onsubmit=e=>{e.preventDefault();try{const q=quote(shop.id,windowVisit,mode,pick.key,form.elements.quantity.value);review(q);}catch(err){host.querySelector('[data-shop-error]').textContent=err.message;}};
    }
  }
  function review(q){
    const owner=api.chatBucket(),d=api.dialog(tr('Confirm transaction','ยืนยันรายการซื้อขาย'),'<section class="cps-shop-review"><small>'+E(q.operation==='buy'?tr('BUY','ซื้อ'):tr('SELL','ขาย'))+'</small><h3>'+E(q.name)+'</h3><p>'+q.quantity+' × €$'+q.unit+' = <strong>€$'+q.total+'</strong></p><p>'+E(tr('Player balance after confirmation','เงินของคุณหลังยืนยัน'))+': €$'+(api.state().player.balance+(q.operation==='buy'?-q.total:q.total))+'</p><p>'+E(tr('The displayed items and money move together only after confirmation.','เงินและไอเทมตามรายการจะย้ายพร้อมกันเมื่อยืนยัน'))+'</p>'+button('confirm',tr('Confirm & '+(q.operation==='buy'?'buy':'sell'),'ยืนยัน'+(q.operation==='buy'?'ซื้อ':'ขาย')))+'<p role="alert"></p></section>','cps-shop-confirm');
    d.querySelector('[data-shop=confirm]').onclick=e=>{if(owner!==api.chatBucket()||!d.isConnected)return;e.currentTarget.disabled=true;try{checkout(q);api.removeUiDialog(d);}catch(err){d.querySelector('[role=alert]').textContent=err.message;}};
  }
  function showHistory(shop){
    api.dialog(tr('Shop activity & receipts','รายการและใบเสร็จร้านค้า'),'<section class="cps-shop-history">'+shop.history.slice().reverse().map(r=>'<article><small>'+E(new Date(r.at).toLocaleString())+' / '+E(r.kind)+'</small><h3>'+E(r.name||r.reason||'')+'</h3>'+(r.total?'<p>'+E(r.quantity)+' × €$'+E(r.unit)+' = €$'+E(r.total)+'</p>':'')+'</article>').join('')+'</section>');
  }
  function edit(shop){
    const owner=api.chatBucket(),visitId=windowVisit,version=shop.version;
    const d=api.dialog(tr('Edit shop terms','แก้ไขร้านและข้อเสนอ'),'<form class="cps-shop-editor"><p>'+E(tr('Manual RP setup. Changes do not grant player items or spend player money.','ตั้งค่า RP ด้วยตนเอง การแก้ไขไม่แจกของหรือใช้เงินผู้เล่น'))+'</p><label>'+E(tr('Shop name','ชื่อร้าน'))+'<input name="name" value="'+E(shop.name)+'" required maxlength="180"></label><label>'+E(tr('Shop buyback funds','เงินรับซื้อของร้าน'))+'<input name="funds" type="number" min="0" max="1000000000000" value="'+shop.funds+'" required></label><h3>'+E(tr('Stock and unit prices','จำนวนสินค้าและราคาต่อชิ้น'))+'</h3><div class="cps-shop-stock-editor">'+shop.stock.map(row=>'<div data-stock-editor="'+E(row.id)+'"><strong>'+E(row.item.name)+'</strong><label>'+E(tr('Stock','คงเหลือ'))+'<input data-field="quantity" type="number" min="0" max="9999" value="'+row.quantity+'" required></label><label>'+E(tr('Sale price','ราคาขาย'))+'<input data-field="price" type="number" min="1" value="'+row.price+'" required></label><label>'+E(tr('Buyback price','ราคารับซื้อ'))+'<input data-field="buyPrice" type="number" min="0" value="'+row.buyPrice+'" required></label></div>').join('')+'</div><h3>'+E(tr('Other owned items: buyback per unit','ราคารับซื้อของอื่นต่อชิ้น'))+'</h3><p>'+E(tr('Zero means the shop does not buy this category. Matched stock rows use their own buyback price.','ศูนย์คือไม่รับซื้อหมวดนี้ ของที่ตรงกับสินค้าในร้านใช้ราคารับซื้อรายชิ้นด้านบน'))+'</p><div class="cps-shop-rule-grid">'+categories.map(([key,en,th])=>'<label>'+E(tr(en,th))+'<input type="number" data-buy-rule="'+key+'" min="0" value="'+(shop.buyPrices[key]||0)+'"></label>').join('')+'</div><button type="submit" class="cps-button primary">'+E(tr('Save reviewed terms','บันทึกข้อเสนอที่ตรวจแล้ว'))+'</button><p role="alert"></p></form>','cps-shop-editor-window');
    const editor=d.querySelector('form');
    editor.querySelector('button[type=submit]').insertAdjacentHTML('beforebegin','<fieldset class="cps-shop-add-stock"><legend>'+E(tr('Add one stock row (optional)','เพิ่มสินค้า (ไม่บังคับ)'))+'</legend><label>'+E(tr('Reviewed catalog name or story item','ชื่อจากรายการหรือไอเทมในโรล'))+'<select name="addCatalog"><option value="">'+E(tr('Do not add an item','ไม่เพิ่มสินค้า'))+'</option>'+catalog().map(x=>'<option value="'+E(x.id)+'">'+E(x.name)+'</option>').join('')+'<option value="story">'+E(tr('Custom STORY ITEM','กำหนดไอเทมในโรลเอง'))+'</option></select></label><div data-add-fields hidden><div data-add-story hidden><label>'+E(tr('Established item name','ชื่อไอเทมที่กำหนดในเรื่อง'))+'<input name="addName" maxlength="180"></label><label>'+E(tr('Category','หมวดหมู่'))+'<select name="addCategory">'+categories.map(([k,en,th])=>'<option value="'+k+'">'+E(tr(en,th))+'</option>').join('')+'</select></label><label>'+E(tr('Description / established effect','รายละเอียด / ผลที่กำหนดไว้'))+'<textarea name="addEffect" maxlength="1000"></textarea></label></div><div class="cps-shop-rule-grid"><label>'+E(tr('Stock','คงเหลือ'))+'<input name="addQuantity" type="number" min="0" max="9999" value="1"></label><label>'+E(tr('Sale price','ราคาขาย'))+'<input name="addPrice" type="number" min="1" inputmode="numeric"></label><label>'+E(tr('Buyback price','ราคารับซื้อ'))+'<input name="addBuyPrice" type="number" min="0" value="0"></label></div><p>'+E(tr('Catalog names use extension RP stats. Story items are labeled explicitly; no canonical price is assumed.','ชื่อในรายการใช้ค่าสำหรับ RP ไอเทมในโรลมีป้ายกำกับชัดเจน ต้องกำหนดราคาเอง'))+'</p></div></fieldset>');
    editor.elements.addCatalog.onchange=()=>{
      const value=editor.elements.addCatalog.value;
      editor.querySelector('[data-add-fields]').hidden=!value;editor.querySelector('[data-add-story]').hidden=value!=='story';
      for(const key of ['addQuantity','addPrice','addBuyPrice'])editor.elements[key].required=!!value;
      editor.elements.addName.required=value==='story';
    };
    editor.onsubmit=e=>{e.preventDefault();try{
      if(owner!==api.chatBucket()||!d.isConnected)throw Error('Chat changed');if(find(shop.id)?.version!==version)throw Error('Shop changed; reopen its editor');
      const form=e.currentTarget;
      const stock=[...form.querySelectorAll('[data-stock-editor]')].map(row=>({sku:row.dataset.stockEditor,...Object.fromEntries([...row.querySelectorAll('[data-field]')].map(i=>[i.dataset.field,Number(i.value)]))}));
      const addition=form.elements.addCatalog.value;
      if(addition)stock.push({sku:'manual:'+C.uid(),quantity:form.elements.addQuantity.value,price:form.elements.addPrice.value,buyPrice:form.elements.addBuyPrice.value,...(addition==='story'?{origin:'story',category:form.elements.addCategory.value,item:{name:form.elements.addName.value,effect:form.elements.addEffect.value,power:0}}:{catalogId:addition})});
      updateShop(shop.id,visitId,{name:form.elements.name.value,funds:Number(form.elements.funds.value),stock,buyPrices:Object.fromEntries([...form.querySelectorAll('[data-buy-rule]')].map(i=>[i.dataset.buyRule,Number(i.value)]))});api.removeUiDialog(d);
    }catch(err){d.querySelector('[role=alert]').textContent=err.message;}};
  }
  function prompt(){
    const shops=store().shops,active=shops.find(s=>accessible(s,s.visit?.id));
    return '\n[Persistent local shops]\nWhen the player actually enters a specific shop/counter, emit CP_LOCATION with the FULL district, subdistrict, building, floor and area, followed by [CP_SHOP]{"id":"unique-visit-event","operation":"open","shopId":"stable-shop-id","name":"established shop name","merchant":"seller name","kind":"weapons","location":{"district":"watson","subdistrict":"Little China","building":"shop building","floor":"G","area":"sales counter"},"funds":5000,"buyPrices":{"weapons":100},"stock":[{"sku":"unity-standard","catalogId":"cps:unity","quantity":3,"price":500,"buyPrice":250}]}[/CP_SHOP]. The example funds/prices are RP examples, not game prices. Never open a shop just because it is mentioned or called. Shop records are allowed only in current MAIN CHAT story replies, not calls/mail/neural channels/recordings.\nA shop button remains usable across turns at the same shop/counter. Emit complete CP_LOCATION for departures, even another room in the same building, or CP_SHOP operation:"close", shopId, id, reason. On returning use a NEW visit id with the SAME shopId and operation:"open"; do NOT recreate stock or funds. Previous buttons for that shop are removed. Unchanged turns need NO shop tag.\nStock, price and quantity must be saved once. Use realistic specialization, not every category at every vendor. Preferred curated name IDs: '+JSON.stringify((active?catalog().filter(x=>active.kind==='general'||categoryFor(x)===active.kind).slice(0,16):catalog().slice(0,8)).map(x=>({id:x.id,name:x.name,category:x.category})))+'. These names use existing extension RP stats, not exact current game stats. Do not sell iconic quest-only rewards casually. Unlisted technical Items.* identifiers are not verified display names. For established custom clothing, food, equipment or other goods use {"sku":"stable-row-id","origin":"story","category":"clothing/essentials/medicine/equipment/ammo/other","item":{"name":"established description","effect":"established effect only","power":0},"quantity":2,"price":100,"buyPrice":50}; these are clearly labeled STORY ITEM. Do not invent canonical branded items or exact game prices. Categories also include weapons, cyberware, quickhack. Modern game vendors do not sell crafting/quickhack components; no automatic component shop stock.\nFor an explicitly established delivered shipment only, emit [CP_SHOP]{"id":"unique-delivery-id","operation":"restock","shopId":"saved-id","reason":"confirmed delivery in this story","stock":[{"sku":"existing-row-id","quantity":2}],"funds":1000}[/CP_SHOP]. Quantities and funds are ADDED once. New rows need complete stock fields. Never restock due to reopening, elapsed real time, a generation, or a promise of future delivery. A proposed shipment is not a delivered shipment. Existing row prices are changed only by the user shop editor. Shop funds are its business till, not the NPC personal wallet.\nUI purchases/sales already move stock, owned items and money together and issue receipts. Narrate the result without repeating TRADE, PAYMENT, ITEM, LOOT or TRANSFER. Buying cyberware does not install it; installing remains a separate action. Sell only owned, unequipped items with a quoted buyback price and sufficient till funds. No relationship or reputation pricing.\nKnown shops: '+JSON.stringify(shops.map(s=>({shopId:s.id,name:s.name,location:s.location})))+'\nActive shop: '+JSON.stringify(active?{shopId:active.id,visitId:active.visit.id,funds:active.funds,stock:active.stock.map(x=>({sku:x.id,name:x.item.name,quantity:x.quantity,price:x.price,buyPrice:x.buyPrice})),buyPrices:active.buyPrices}:null)+'\n';
  }
  function close(){api.removeUiDialog(windowNode);windowNode=null;windowOwner=null;}
  return {receive,sync,decorate,refreshCards,accessible,quote,checkout,updateShop,stockRow,prompt,open,close,categories,store};
};
})();
