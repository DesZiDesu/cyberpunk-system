const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM,VirtualConsole}=require('jsdom');const repo=path.resolve(__dirname,'..');
const box={};vm.createContext(box);vm.runInContext(fs.readFileSync(path.join(repo,'rpg-core.js'),'utf8'),box);
const C=box.CyberpunkRpgCore,M=C.medical;let count=0;
const test=(name,fn)=>{fn();count++;console.log('PASS '+name);};
const fresh=()=>({player:C.actor(),actors:{},turn:0,settings:{riskScale:1},map:{location:{district:'watson',danger:false}},shards:[]});
const fund=s=>{s.player.balance=10000;return s;};
test('Old actor migration preserves legacy episode burden, not forced actions',()=>{const s=fresh();s.player.cyberpsychosis=true;assert.equal(M.neural(s.player).burden,25);assert.equal(M.neural(s.player).burden,25);});
test('Empty state has no episode and reduced effects by default',()=>{const s=fresh();assert.equal(M.assess(s.player).level,'normal');assert.equal(M.store(s).effects,'reduced');assert.equal(M.store(s).autoDispatch,false);});
for(const capacity of [50,100,200])for(const load of [0,50,100,150,200])for(const stress of [0,50,100]){
  test(`Neural assessment is deterministic, bounded and disableable: ${capacity}/${load}/${stress}`,()=>{
    const a=C.actor();a.capacity=capacity;a.stress=stress;a.inventory.push(C.item({category:'cyberware',capacity:load,equipped:true}));
    const n=M.assess(a,0);assert.ok(n.effective>=0&&n.effective<=150);assert.equal(JSON.stringify(n),JSON.stringify(M.assess(a,0)));assert.equal(M.assess(a,0,0).level,'normal');
  });
}
for(const key of Object.keys(M.medicines)){
  test(key+' purchase spends exact amount and preserves catalog identity',()=>{const s=fund(fresh()),it=M.purchase(s,key);assert.equal(s.player.balance,10000-M.medicines[key].price);assert.equal(M.medicine(C.item(it)).name,it.name);});
  test(key+' consumes one and suppresses without healing or removing load',()=>{const s=fund(fresh()),it=M.purchase(s,key);s.player.hp=30;s.player.stress=100;const before=M.assess(s.player);C.use(s.player,it.id,0);const n=M.assess(s.player,0);assert.equal(s.player.hp,30);assert.equal(n.base,before.base);assert.equal(n.suppression,M.medicines[key].potency);assert.equal(s.player.inventory.some(x=>x.id===it.id),false);assert.equal(s.player.stamina,95);});
  test(key+' expires on RP turns, not elapsed wall time',()=>{const s=fund(fresh()),it=M.purchase(s,key);M.dose(s.player,it.id,0);assert.ok(M.assess(s.player,M.medicines[key].duration-1).suppression);assert.equal(M.assess(s.player,M.medicines[key].duration).suppression,0);});
}
test('Cooldown applies across distinct stacks and routes with no failed consumption',()=>{const s=fund(fresh()),a=M.purchase(s,'neural-suppressant-injector'),b=M.purchase(s,'neural-suppressant-tablet');M.dose(s.player,a.id,0);assert.throws(()=>M.dose(s.player,b.id,1),/cooldown/);assert.equal(b.quantity,1);});
test('Dose cannot be forged with a matching name or prototype property',()=>{const s=fresh();s.player.inventory.push(C.item({id:'fake',name:'Neural Suppressant / Injector',category:'consumable',catalogId:'toString'}));assert.equal(M.medicine(s.player.inventory[0]),null);assert.throws(()=>M.dose(s.player,'fake',0),/Owned/);});
test('High toxicity blocks dosing without inventory loss',()=>{const s=fund(fresh()),it=M.purchase(s,'neural-suppressant-injector');M.neural(s.player).toxicity=70;assert.throws(()=>M.dose(s.player,it.id,0),/Toxicity/);assert.equal(it.quantity,1);});
test('Repeated eligible dose replaces rather than stacks potency',()=>{const s=fund(fresh()),a=M.purchase(s,'neural-suppressant-injector'),b=M.purchase(s,'neural-suppressant-injector');M.dose(s.player,a.id,0);M.dose(s.player,b.id,3);assert.ok(M.neural(s.player).potency<35);assert.equal(M.neural(s.player).until,7);});
test('Advance removes toxicity once per turn and survives JSON reload',()=>{const s=fund(fresh());M.store(s);M.neural(s.player).toxicity=30;s.turn=2;M.advance(s);assert.equal(M.neural(s.player).toxicity,24);M.advance(s);assert.equal(M.neural(s.player).toxicity,24);const copy=JSON.parse(JSON.stringify(s));M.advance(copy);assert.equal(copy.player.neural.toxicity,24);});
test('No background random episode from core tick',()=>{const a=C.actor();a.stress=100;C.tick(a,()=>0);assert.equal(a.cyberpsychosis,false);});
test('Purchase failure is money- and inventory-atomic',()=>{const s=fresh();assert.throws(()=>M.purchase(s,'neural-suppressant-injector'),/Insufficient/);assert.equal(s.player.inventory.length,0);assert.equal(s.player.balance,0);});
for(const key of Object.keys(M.plans)){
  test(key+' subscription saves policy as one readable inventory shard',()=>{const s=fund(fresh());M.subscribe(s,key);assert.equal(s.shards.length,1);assert.equal(s.player.inventory[0].shardId,s.shards[0].id);assert.ok(s.shards[0].content.includes('not canon'));assert.equal(s.player.balance,10000-M.plans[key].price);});
  test(key+' dispatch waits ETA, needs consent, and bills once',()=>{const s=fund(fresh());M.subscribe(s,key);s.player.hp=10;const i=M.dispatch(s);assert.equal(M.dispatch(s).id,i.id);assert.throws(()=>M.rescue(s),/arrival/);s.turn=M.plans[key].eta;M.advance(s);assert.equal(i.phase,'arrival');assert.equal(s.player.hp,10);M.rescue(s);assert.equal(s.player.hp,35);assert.equal(M.store(s).debt,M.plans[key].copay);assert.equal(s.map.location.building,'Trauma Team receiving clinic');assert.throws(()=>M.rescue(s),/arrival/);assert.equal(s.shards.length,2);});
}
test('Active plan cannot be silently switched or overwritten',()=>{const s=fund(fresh());M.subscribe(s,'silver');const balance=s.player.balance;assert.throws(()=>M.subscribe(s,'executive'),/expiry/);assert.equal(s.player.balance,balance);assert.equal(M.store(s).contract.plan,'silver');});
test('Renewal extends remaining term instead of discarding it',()=>{const s=fund(fresh());M.subscribe(s,'silver');s.turn=10;M.subscribe(s,'silver');assert.equal(M.store(s).contract.expires,120);});
test('Explicit replacement charges full premium and starts a fresh term without rollover',()=>{const s=fund(fresh());M.subscribe(s,'platinum');s.turn=10;M.subscribe(s,'silver',{replace:true});assert.equal(s.medical.contract.plan,'silver');assert.equal(s.medical.contract.expires,70);assert.equal(s.player.balance,7000);assert.equal(s.shards.length,2);});
test('Replacement still rejects insufficient money and an active dispatch without mutation',()=>{const s=fund(fresh());M.subscribe(s,'silver');s.player.balance=0;const before=JSON.stringify(s.medical.contract);assert.throws(()=>M.subscribe(s,'platinum',{replace:true}));assert.equal(JSON.stringify(s.medical.contract),before);s.player.balance=10000;s.player.hp=10;M.dispatch(s);assert.throws(()=>M.subscribe(s,'platinum',{replace:true}),/dispatch/);assert.equal(s.player.balance,10000);assert.equal(JSON.stringify(s.medical.contract),before);});
test('Expired contract rejects dispatch without spending',()=>{const s=fund(fresh());M.subscribe(s,'silver');s.turn=60;assert.throws(()=>M.dispatch(s),/active contract/);assert.equal(M.store(s).incident,undefined);});
test('No coverage for unknown location or Badlands',()=>{const s=fund(fresh());M.subscribe(s,'platinum');s.map.location.district='';assert.match(M.eligibility(s),/location/);s.map.location.district='badlands';assert.match(M.eligibility(s),/Outside/);});
test('Silver rejects danger zones; Executive covers them',()=>{for(const plan of ['silver','executive']){const s=fund(fresh());M.subscribe(s,plan);s.map.location.danger=true;assert.equal(!!M.eligibility(s),plan==='silver');}});
test('Automatic rescue requires opt-in, biochip and critical HP',()=>{const s=fund(fresh());M.subscribe(s,'platinum');s.player.hp=10;M.advance(s);assert.equal(s.medical.incident,undefined);s.medical.autoDispatch=true;s.medical.biochip=false;M.advance(s);assert.equal(s.medical.incident,undefined);s.medical.biochip=true;M.advance(s);assert.equal(s.medical.incident.phase,'dispatch');});
test('Suppression alone never calls Trauma Team or changes HP',()=>{const s=fund(fresh());M.subscribe(s,'platinum');s.medical.autoDispatch=true;s.player.stress=100;M.neural(s.player).burden=100;M.advance(s);assert.equal(s.player.cyberpsychosis,true);assert.equal(s.medical.incident,undefined);});
test('Closed or declined critical episode cannot endlessly redispatch',()=>{const s=fund(fresh());M.subscribe(s,'platinum');s.medical.autoDispatch=true;s.player.hp=10;M.advance(s);s.medical.incident.phase='cancelled';const id=s.medical.incident.id;M.advance(s);assert.equal(s.medical.incident.id,id);s.player.hp=50;M.advance(s);s.player.hp=10;M.advance(s);assert.notEqual(s.medical.incident.id,id);});
test('No automatic resurrection at dispatch or extraction',()=>{const s=fund(fresh());M.subscribe(s,'platinum');s.player.hp=0;assert.throws(()=>M.dispatch(s),/resurrection/);s.player.hp=10;M.dispatch(s);s.turn=1;M.advance(s);s.player.hp=0;assert.throws(()=>M.rescue(s),/resurrect/);assert.equal(s.player.hp,0);});
test('Moving to another district invalidates extraction until a new call',()=>{const s=fund(fresh());M.subscribe(s,'platinum');M.dispatch(s);s.turn=1;M.advance(s);s.map.location.district='heywood';assert.throws(()=>M.rescue(s),/Location/);assert.equal(s.medical.incident.phase,'arrival');});
test('Bill settlement uses existing balance once and archives receipt',()=>{const s=fund(fresh());M.store(s).debt=250;M.settle(s);assert.equal(s.player.balance,9750);assert.equal(s.medical.debt,0);assert.equal(s.shards.length,1);assert.throws(()=>M.settle(s),/No outstanding/);});
test('Unpaid bill is preserved on insufficient funds',()=>{const s=fresh();M.store(s).debt=250;assert.throws(()=>M.settle(s),/Insufficient/);assert.equal(s.medical.debt,250);});
test('Therapy costs money and one turn but leaves installed cyberware unchanged',()=>{const s=fund(fresh());s.player.inventory.push(C.item({category:'cyberware',capacity:100,equipped:true}));s.player.stress=80;M.neural(s.player).burden=25;M.therapy(s);assert.equal(C.load(s.player),100);assert.equal(s.player.stress,60);assert.equal(s.player.neural.burden,10);assert.equal(s.turn,1);assert.equal(s.player.balance,9700);});
test('RP request only queues, deduplicates and requires owned medication',()=>{const s=fund(fresh()),it=M.purchase(s,'neural-suppressant-injector');M.request(s,{operation:'use',itemId:it.id},'evt-1');M.request(s,{operation:'use',itemId:it.id},'evt-1');assert.equal(s.medical.requests.length,1);assert.equal(it.quantity,1);assert.equal(M.assess(s.player).suppression,0);assert.throws(()=>M.request(s,{operation:'use',itemId:'missing'},'evt-2'),/Owned/);assert.throws(()=>M.request(s,{operation:'heal'},'evt-3'),/use or call/);});

(async()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM('<body><div id="extensionsMenu"></div><div id="extensions_settings2"></div><div id="chat"></div></body>',{url:'https://fixture.test/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window,d=w.document,events=new Map();let requests=0,prompt='';
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 const ctx={name1:'V',name2:'Lucy',characterId:0,characters:[{avatar:'lucy.png'}],extensionSettings:{},chatMetadata:{},chat:[],event_types:{MESSAGE_RECEIVED:'received',MESSAGE_UPDATED:'updated',CHARACTER_MESSAGE_RENDERED:'rendered',MESSAGE_SENT:'sent',CHAT_CHANGED:'changed',GENERATION_ENDED:'ended',GENERATION_STARTED:'started'},eventSource:{on:(k,f)=>events.set(k,f)},saveMetadataDebounced(){},saveSettingsDebounced(){},setExtensionPrompt(k,p){prompt=p;},async generateQuietPrompt(){requests++;return '';}};
 w.SillyTavern={getContext:()=>ctx};
 for(const f of ['rpg-core.js','rpg-catalog.js','rpg-item-data.js','rpg-map-data.js','rpg-map.js','rpg-scene.js','rpg-assets.js','rpg-support.js','rpg-mail.js','rpg-devices.js','rpg-shops.js','rpg-campaign.js','rpg-ui.js'])w.eval(fs.readFileSync(path.join(repo,f),'utf8'));
 await w.eval('(async()=>{'+fs.readFileSync(path.join(repo,'index.js'),'utf8').replaceAll('import.meta.url',JSON.stringify('https://fixture.test/index.js'))+'\n})()');
 const wait=()=>new Promise(r=>setTimeout(r,40));await wait();
 const q=s=>{const el=d.querySelector(s);assert.ok(el,'Missing '+s);return el;};const click=s=>q(s).click();const s=()=>ctx.chatMetadata.cyberpunk_system.rpg;
 async function message(raw){const i=ctx.chat.push({mes:raw,is_user:false})-1,el=d.createElement('div');el.className='mes';el.setAttribute('mesid',i);el.innerHTML='<div class="mes_text"></div>';el.firstChild.textContent=raw;d.querySelector('#chat').append(el);events.get('received')(i);await wait();return {i,el};}
 w.CyberpunkSystem.openCyberware();
 test('Medical Link is reachable directly in Cyberware Status',()=>{click('[data-rpg=medical]');assert.ok(q('.cps-medical-window'));assert.equal(d.querySelectorAll('.cps-medical-plans article').length,3);});
 test('Field Ops package selection starts without a contract or charge',()=>{assert.equal(q('[data-med-choice=silver]').getAttribute('aria-pressed'),'true');assert.equal(s().player.balance,0);assert.ok(!s().medical.contract);});
 for(const key of ['silver','executive','platinum']){
  test(key+' selection updates exact quote and benefits without subscribing',()=>{click('[data-med-choice='+key+']');assert.equal(q('[data-med-choice='+key+']').getAttribute('aria-pressed'),'true');assert.equal(q('.cps-plan-total .cps-plan-price').textContent,'€$'+M.plans[key].price.toLocaleString());assert.ok(q('.cps-plan-benefits').textContent.includes('60'));assert.equal(s().player.balance,0);assert.ok(!s().medical.contract);});
  test(key+' review displays the selected price and cancellation is mutation-free',()=>{click('[data-rpg="med-plan:'+key+'"]');assert.equal(q('.cps-field-confirm .cps-plan-price').textContent,'€$'+M.plans[key].price.toLocaleString());assert.ok(q('.cps-field-confirm .cps-plan-benefits').textContent.includes(String(M.plans[key].copay)));click('[data-rpg=medical-cancel]');assert.ok(!s().medical.contract);assert.equal(s().player.balance,0);});
 }
 click('[data-med-choice=silver]');
 test('Price CSS explicitly sets readable text and WebKit text fill even on strong elements',()=>{const ast=require('postcss').parse(fs.readFileSync(path.join(repo,'style.css'),'utf8'));let found=false;ast.walkRules('.cps-ui .cps-plan-price',r=>{const rules=Object.fromEntries(r.nodes.filter(x=>x.type==='decl').map(x=>[x.prop,x]));assert.equal(rules.color.value,'var(--cps-text)');assert.equal(rules.color.important,true);assert.equal(rules['-webkit-text-fill-color'].value,'var(--cps-text)');assert.equal(rules['-webkit-text-fill-color'].important,true);found=true;});assert.ok(found);});
 s().player.balance=10000;
 click('[data-rpg="med-buy:neural-suppressant-injector"]');
 test('Purchase confirmation does not mutate inventory before acceptance',()=>{assert.equal(s().player.inventory.length,0);assert.equal(s().player.balance,10000);});
 click('[data-rpg=medical-confirm]');
 test('Confirmed medicine purchase redraws owned inventory and debits once',()=>{assert.equal(s().player.balance,9760);assert.ok(q('[data-rpg^="med-use:"]'));});
 test('Medical debit uses the existing Balance ledger schema',()=>{const entry=s().player.ledger.at(-1);assert.equal(entry.delta,-240);assert.ok(Number.isFinite(new Date(entry.at).getTime()));});
 click('.cps-medical-window [data-rpg=close]');click('.cps-rpg-main [data-rpg="tab:balance"]');
 test('Balance page renders after medical purchase without missing delta errors',()=>{assert.ok(q('.cps-rpg-ledger').textContent.includes('-240'));});
 click('.cps-rpg-main [data-rpg="tab:status"]');click('[data-rpg=medical]');
 const it=s().player.inventory[0];
 const record=await message('[CP_MEDICAL]'+JSON.stringify({id:'dose-request',operation:'use',itemId:it.id})+'[/CP_MEDICAL]');
 test('RP medical tag renders a clickable card without raw JSON or consumption',()=>{assert.ok(record.el.querySelector('[data-medical-open]'));assert.ok(!record.el.textContent.includes('CP_MEDICAL'));assert.equal(it.quantity,1);assert.equal(s().medical.requests.length,1);});
 events.get('updated')(record.i);await wait();
 test('Message rerender does not duplicate request or RP turn',()=>{assert.equal(s().medical.requests.length,1);assert.equal(s().turn,1);});
 click('[data-medical-open]');click('[data-rpg^="med-review:"]');click('[data-rpg=medical-cancel]');
 test('Cancelling a dose confirmation preserves medicine and pending request',()=>{assert.equal(it.quantity,1);assert.equal(s().medical.requests[0].status,'pending');});
 click('[data-rpg^="med-review:"]');click('[data-rpg=medical-confirm]');
 test('Confirming RP use consumes one dose and resolves request',()=>{assert.equal(s().player.inventory.length,0);assert.equal(s().medical.requests[0].status,'accepted');assert.ok(s().player.neural.until>s().turn);});
 test('Medical prompt forbids forced player control and duplicate costs',()=>{assert.ok(prompt.includes('Never control the player'));assert.ok(prompt.includes('do not declare a rescue completed'));});
 test('Effects are scoped to chat and default to reduced motion',()=>{const fx=q('#cps-neural-fx');assert.equal(fx.dataset.motion,'reduced');assert.equal(fx.getAttribute('aria-hidden'),'true');});
 test('Original edge layers remain but no side-screen text or redesigned holo layer is mounted',()=>{const fx=q('#cps-neural-fx');assert.equal(fx.textContent,'');assert.equal(fx.querySelectorAll('.cps-nfx-corner').length,4);assert.equal(fx.querySelectorAll('.cps-nfx-tear').length,3);assert.ok(fx.querySelector('.cps-nfx-edge'));assert.equal(fx.querySelector('.cps-nfx-code,.cps-nfx-holo'),null);});
 const selector=q('[data-med-effects]');selector.value='off';selector.dispatchEvent(new w.Event('change'));
 test('Disabling effects removes overlay but preserves suppression',()=>{assert.equal(d.querySelector('#cps-neural-fx'),null);assert.ok(s().player.neural.potency>0);});
 click('[data-rpg="med-plan:silver"]');const stale=q('[data-rpg=medical-confirm]'),oldBalance=s().player.balance;
 ctx.chatMetadata={};events.get('changed')();await wait();stale.click();
 test('Switching chat closes medical dialogs and invalidates stale confirmation',()=>{assert.equal(d.querySelector('.cps-medical-window'),null);assert.equal(d.querySelector('#cps-neural-fx'),null);assert.equal(s().player.balance,0);assert.equal(oldBalance,9760);});
 w.CyberpunkSystem.openCyberware();click('[data-rpg=medical]');s().player.balance=10000;
 click('[data-med-choice=executive]');click('[data-rpg="med-plan:executive"]');const confirmOnce=q('[data-rpg=medical-confirm]');confirmOnce.click();confirmOnce.click();
 test('Field Ops confirmation buys once, archives one policy and selects the active plan',()=>{assert.equal(s().player.balance,9000);assert.equal(s().medical.contract.plan,'executive');assert.equal(s().shards.length,1);assert.equal(q('[data-med-choice=executive]').getAttribute('aria-pressed'),'true');});
 test('Active coverage allows comparison without changing the contract or charging',()=>{assert.equal(q('[data-med-choice=silver]').disabled,false);click('[data-med-choice=silver]');assert.equal(q('[data-med-choice=silver]').getAttribute('aria-pressed'),'true');assert.equal(s().medical.contract.plan,'executive');assert.equal(s().player.balance,9000);click('[data-rpg="med-plan:silver"]');assert.ok(q('.cps-field-confirm').textContent.includes('not refunded'));click('[data-rpg=medical-cancel]');assert.equal(s().medical.contract.plan,'executive');click('[data-med-choice=executive]');});
 click('[data-rpg="med-plan:executive"]');click('[data-rpg=medical-confirm]');
 test('New renewal layout preserves existing term and charges the original premium',()=>{assert.equal(s().medical.contract.expires,120);assert.equal(s().player.balance,8000);assert.equal(s().shards.length,2);});
 click('[data-med-choice=platinum]');click('[data-rpg="med-plan:platinum"]');click('[data-rpg=medical-confirm]');
 test('Confirmed package change replaces coverage once without carrying the old term',()=>{assert.equal(s().medical.contract.plan,'platinum');assert.equal(s().medical.contract.expires,60);assert.equal(s().player.balance,5500);assert.equal(s().shards.length,3);});
 test('Mobile review overrides the narrow desktop max-width and Field Ops uses its reference fonts',()=>{const ast=require('postcss').parse(fs.readFileSync(path.join(repo,'style.css'),'utf8'));let full=false,fonts=false;ast.walkRules(r=>{if(r.selector==='dialog.cps-ui.cps-field-confirm,dialog.cps-ui.cps-field-document')full=r.nodes.some(n=>n.prop==='max-width'&&n.value==='100%');if(r.selector.includes('.cps-ui.cps-field-document')&&r.nodes.some(n=>n.prop==='--cps-font-en'&&n.value.includes('Rajdhani')))fonts=true;});assert.ok(full&&fonts);});
 test('No live AI calls or browser errors during medical interactions',()=>{assert.equal(requests,0);assert.deepEqual(errors,[]);});
 dom.window.close();console.log(`${count} medical integration checks passed. No live AI calls.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
