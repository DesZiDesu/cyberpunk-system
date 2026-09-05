const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const repo = path.resolve(__dirname, '..');
// Host APIs are simulated, but resizing, JPEG encoding and cropping use a real raster canvas.
const source = fs.readFileSync(path.join(repo, 'index.js'), 'utf8')
 .replace("await import(new URL('../../../openai.js', import.meta.url).href)", '({ isImageInliningSupported: () => window.fixtureVision })')
 .replaceAll('import.meta.url', JSON.stringify('https://fixture.test/scripts/extensions/third-party/cyberpunk-system/index.js'));
const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom = new JSDOM('<!doctype html><html><body><div id="extensions_settings2">'+fs.readFileSync(path.join(repo,'settings.html'),'utf8')+'</div><div id="chat"></div></body></html>', {url:'https://fixture.test',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
const w=dom.window,d=w.document;
w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
const nativeCanvases=new WeakMap();
function raster(el) { let c=nativeCanvases.get(el); if(!c || c.width!==el.width || c.height!==el.height){c=createCanvas(el.width,el.height);nativeCanvases.set(el,c);}return c; }
w.HTMLCanvasElement.prototype.getContext=function(type){return raster(this).getContext(type);};
w.HTMLCanvasElement.prototype.toDataURL=function(type,quality){return raster(this).toDataURL(type,quality);};
const blobs=new Map();w.URL.createObjectURL=file=>{const key='blob:fixture:'+blobs.size;blobs.set(key,file);return key;};w.URL.revokeObjectURL=key=>blobs.delete(key);
// Native Image is supplied through the DOM constructor; decode the bytes, not a mocked rectangle.
w.Image=function(){const proxy={onload:null,onerror:null};Object.defineProperty(proxy,'src',{set(value){const input=blobs.get(value)?.bytes || value;loadImage(input).then(img=>{Object.defineProperty(img,'naturalWidth',{value:img.width});Object.defineProperty(img,'naturalHeight',{value:img.height});Object.assign(proxy,{naturalWidth:img.width,naturalHeight:img.height,_native:img});proxy.onload?.();},e=>proxy.onerror?.(e));}});return proxy;};
const originalGet=w.HTMLCanvasElement.prototype.getContext;w.HTMLCanvasElement.prototype.getContext=function(type){const pen=originalGet.call(this,type);return new Proxy(pen,{get(target,key){if(key==='drawImage')return (img,...args)=>target.drawImage(img._native||img,...args);const value=target[key];return typeof value==='function'?value.bind(target):value;},set(target,key,value){target[key]=value;return true;}});};
let resolveReply,requests=0,args=[];const events=new Map();const ctx={name1:'User',name2:'Fixture',characterId:0,characters:[{avatar:'fixture.png'}],mainApi:'openai',extensionSettings:{},chatMetadata:{},chat:[],event_types:{CHAT_CHANGED:'changed'},eventSource:{on:(key,fn)=>events.set(key,fn)},saveSettingsDebounced(){},saveMetadataDebounced(){},setExtensionPrompt(){},generateQuietPrompt(...values){requests++;args=values;return new Promise(resolve=>{resolveReply=resolve;});}};
w.SillyTavern={getContext:()=>ctx};
const q=s=>{const el=d.querySelector(s);assert.ok(el,'missing '+s);return el;};const click=s=>q(s).click();const input=(s,value)=>{q(s).value=value;q(s).dispatchEvent(new w.Event('input',{bubbles:true}));};
const wait=async predicate=>{for(let i=0;i<100;i++){if(predicate())return;await new Promise(r=>setTimeout(r,15));}throw new Error('Timed out waiting for fixture state');};
const pointer=(type,id,x,y)=>{const event=new w.Event(type,{bubbles:true,cancelable:true});Object.assign(event,{pointerId:id,clientX:x,clientY:y});q('canvas').dispatchEvent(event);};
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS '+name);};
(async()=>{
 await w.eval('(async()=>{'+source+'\n})()');w.CyberpunkSystem.open();click('[data-record-add]');
 const testImage=createCanvas(1600,800);const pen=testImage.getContext('2d');pen.fillStyle='#ff0000';pen.fillRect(0,0,800,800);pen.fillStyle='#0000ff';pen.fillRect(800,0,800,800);const bytes=testImage.toBuffer('image/png');
 const paste=new w.Event('paste',{bubbles:true,cancelable:true});Object.assign(paste,{clipboardData:{items:[{type:'image/png',getAsFile:()=>({type:'image/png',size:bytes.length,bytes})}]}});q('.cps-modal').dispatchEvent(paste);
 await wait(()=>q('canvas').dataset.hasImage==='true'&&!q('[data-npc-generate]').disabled);
 test('Pasted portrait decodes, releases its blob URL and enables a square crop',()=>{assert.equal(blobs.size,0);assert.equal(q('canvas').width,384);assert.equal(q('canvas').height,384);});
 input('[name="name"]','Fixture NPC');input('[name="notes"]','Keep me');
 pointer('pointerdown',1,80,80);pointer('pointermove',1,700,80);pointer('pointerup',1,700,80);
 test('Drag clamps crop at image edges with no blank strip',()=>{const pixel=q('canvas').getContext('2d').getImageData(190,190,1,1).data;assert.ok(pixel[0]>200);assert.ok(pixel[2]<30);});
 pointer('pointerdown',1,10,10);pointer('pointerdown',2,110,10);pointer('pointermove',2,210,10);pointer('pointerup',1,10,10);pointer('pointerup',2,210,10);
 test('Two-finger pinch changes zoom without exceeding bounds',()=>assert.equal(Number(q('[data-portrait-zoom]').value),2));
 input('[data-portrait-zoom]','1.5');
 w.fixtureVision=false;click('[data-npc-generate]');await wait(()=>!q('[data-npc-generate]').disabled);
 test('Unsupported image connection gives a visible error without using quota',()=>{assert.equal(requests,0);assert.ok(q('.cps-studio-status').textContent.includes('vision-capable'));});
 w.fixtureVision=true;click('[data-npc-generate]');click('[data-npc-generate]');await wait(()=>requests===1);
 test('Vision reference uses one request with compressed image bytes',()=>{assert.ok(args[3].startsWith('data:image/jpeg;base64,'));assert.ok(args[3].length<50000);assert.equal(requests,1);});
 resolveReply('{"appearance":"Red and blue clothing","personality":"Curious","name":"Must not overwrite"}');await wait(()=>!q('[data-npc-generate]').disabled);
 q('form.cps-modal-card').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 const npc=w.CyberpunkSystem.getNpcs()[0];const encoded=await loadImage(npc.portrait);const original=await loadImage(npc.portraitSource);
 test('Save stores a 384 square portrait, 768 source and crop in the selected scope',()=>{assert.equal(encoded.width,384);assert.equal(encoded.height,384);assert.equal(original.width,768);assert.equal(original.height,384);assert.equal(npc.portraitCrop.zoom,1.5);assert.equal(npc.scope,'chat');assert.equal(npc.notes,'Keep me');assert.equal(npc.name,'Fixture NPC');});
 const message=d.createElement('div');message.className='mes_text';message.textContent='[CP_HEADER|Fixture NPC|Tech|Stable][/CP_HEADER][CP_DIALOGUE|Fixture NPC]Hello[/CP_DIALOGUE]';q('#chat').append(message);await wait(()=>!!message.querySelector('img'));
 test('Stored portrait appears in the connected character header',()=>{assert.equal(message.querySelector('img').src,npc.portrait);assert.equal(message.querySelector('img').width,384);assert.equal(message.querySelector('.cps-chat-thread').children.length,2);});
 click('[data-action="edit"]');await wait(()=>q('canvas').dataset.hasImage==='true'&&!q('[data-npc-generate]').disabled);
 test('Reopening editor restores the crop and source',()=>assert.equal(Number(q('[data-portrait-zoom]').value),1.5));
 click('[data-portrait-reset]');test('Reset returns to centered 1x framing',()=>assert.equal(Number(q('[data-portrait-zoom]').value),1));
 click('[data-portrait-remove]');q('form.cps-modal-card').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 test('Removing a portrait clears both image fields and existing header display',()=>{assert.equal(w.CyberpunkSystem.getNpcs()[0].portrait,'');assert.equal(w.CyberpunkSystem.getNpcs()[0].portraitSource,'');assert.equal(message.querySelector('img'),null);});
 click('[data-action="edit"]');click('[data-npc-generate]');await wait(()=>requests===2);ctx.chatMetadata={};events.get('changed')();resolveReply('{"role":"Wrong chat result"}');await wait(()=>!q('[data-npc-generate]').disabled);
 test('Late NPC generation cannot modify or save into a new chat',()=>{assert.equal(q('[name="role"]').value,'');q('form.cps-modal-card').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(w.CyberpunkSystem.getNpcs().length,0);});
 test('No unhandled DOM errors',()=>assert.deepEqual(errors,[]));
 console.log(`\n${passed} portrait and vision integration checks passed. Pointer events and host vision API are simulated; real Safari and model vision are not emulated.`);dom.window.close();
})().catch(e=>{console.error(e);dom.window.close();process.exitCode=1;});
