const CYBERPUNK_SYSTEM_VERSION = '1.1.0';
const CYBERPUNK_SYSTEM_KEY = 'cyberpunk_system';
const CYBERPUNK_PROMPT_KEY = 'zzzz_cyberpunk_system_protocol_v100';

if (!globalThis.CyberpunkSystemRuntimePromise) {
  globalThis.CyberpunkSystemRuntimePromise = (async () => {
    'use strict';

    const DEFAULTS = Object.freeze({
      enabled: true,
      showWand: true,
      injectPrompt: true,
      autoProfiles: true,
      hackingEnabled: true,
      callMainSignals: true,
      language: 'en',
      defaultScope: 'chat',
      headerPosition: 'left',
      callHistoryLimit: 100,
      accent: '#fcee0a',
      danger: '#ff5b66',
      surface: '#101116',
      text: '#e6edf3',
      uiScale: 100,
      callOpacity: 60,
      callBlur: 10,
      animationSpeed: 'normal',
      density: 'comfortable',
      scanlines: true,
      customPrompt: '',
      characters: {},
    });

    const PALETTES = Object.freeze({
      nightcity: { name: 'Night City', accent: '#fcee0a', danger: '#ff5b66', surface: '#101116', text: '#e6edf3' },
      netrunner: { name: 'Netrunner', accent: '#62f5ed', danger: '#ff5b66', surface: '#0b151c', text: '#e0f7fa' },
      afterlife: { name: 'Afterlife', accent: '#a6ff82', danger: '#d6a2ff', surface: '#111713', text: '#eef5eb' },
    });

    const I18N = {
      en: {
        appName: 'Cyberpunk System', openInterface: 'Open interface', settingsIntro: 'Character presentation, private calls, and hacking progression for the active role-play.',
        coreBehavior: 'Core behavior', enableSystem: 'Enable Cyberpunk System', showWand: 'Show in Wand menu', teachAi: 'Teach the AI when to use each Cyberpunk UI', autoProfiles: 'Create sparse NPC records from tagged speakers', hackingTracking: 'Enable hacking-skill tracking', callSignals: 'Receive active-call signals from normal AI replies',
        language: 'Language / ภาษา', defaultScope: 'Default save scope', headerPosition: 'Header position', callHistory: 'Call history limit', appearance: 'Cyberpunk appearance', accent: 'Primary neon', danger: 'Alert neon', surface: 'Panel surface', textColor: 'Text color', uiScale: 'UI scale', callOpacity: 'Call backdrop opacity', callBlur: 'Call backdrop blur', animationSpeed: 'Animation speed', aiProtocol: 'AI protocol', customInstructions: 'Additional instructions', quotaNote: 'Normal tracking uses the main AI reply. Only the call window AI-send button starts an additional request.', tagReference: 'Tag reference', resetAppearance: 'Reset appearance',
        network: 'Neural Network', characters: 'Characters', hacking: 'Hacking', calls: 'Calls', config: 'Config', close: 'Close', addNpc: 'Add NPC', addSkill: 'Add skill', noNpcs: 'No linked identities in Character or Chat scope.', noSkills: 'No hacking skills stored for this character or chat.', noCalls: 'No private signal history in this chat.', edit: 'Edit', remove: 'Remove', call: 'Call', character: 'Character', chat: 'Chat', name: 'Name', handle: 'Handle', role: 'Role', status: 'Signal status', affiliation: 'Affiliation', age: 'Age', gender: 'Gender', appearanceField: 'Appearance', notes: 'Notes', scope: 'Scope', save: 'Save', cancel: 'Cancel', category: 'Category', level: 'Progress', maximum: 'Maximum', rank: 'Rank',
        incoming: 'Incoming private signal', accept: 'Accept', decline: 'Decline', encrypted: 'Encrypted channel', connected: 'Signal connected', ended: 'Signal terminated', minimize: 'Minimize', endCall: 'End call', inputPlaceholder: 'Type private signal…', queueHint: 'Enter queues locally · AI button requests response', generating: 'Tracing signal…', callFailed: 'Private response failed', queued: 'Message queued without AI generation.', unread: 'unread', active: 'Active', restore: 'Restore', settingsSaved: 'Configuration saved.', profileSaved: 'Identity saved.', skillSaved: 'Skill saved.', confirmRemove: 'Remove this record?', promptUnavailable: 'SillyTavern generation is unavailable.',
        general: 'General', stealth: 'Stealth', intrusion: 'Intrusion', hardware: 'Hardware', social: 'Social Engineering', combat: 'Combat Hacking', currentCall: 'Current signal', history: 'Signal history', noActiveCall: 'No active private signal.', customize: 'Every visible value and behavior below is saved immediately.',
      },
      th: {
        appName: 'ระบบไซเบอร์พังก์', openInterface: 'เปิดอินเทอร์เฟซ', settingsIntro: 'การนำเสนอตัวละคร สายส่วนตัว และความก้าวหน้าทักษะแฮ็กสำหรับโรลเพลย์ปัจจุบัน',
        coreBehavior: 'การทำงานหลัก', enableSystem: 'เปิดใช้ระบบไซเบอร์พังก์', showWand: 'แสดงในเมนูไม้กายสิทธิ์', teachAi: 'สอน AI ว่าควรใช้ UI แต่ละแบบเมื่อใด', autoProfiles: 'สร้างข้อมูล NPC แบบย่อจากแท็กผู้พูด', hackingTracking: 'เปิดการติดตามทักษะแฮ็ก', callSignals: 'รับสัญญาณสายที่กำลังใช้งานจากคำตอบ AI ปกติ',
        language: 'ภาษา / Language', defaultScope: 'ขอบเขตบันทึกเริ่มต้น', headerPosition: 'ตำแหน่งส่วนหัว', callHistory: 'จำนวนประวัติสาย', appearance: 'รูปลักษณ์ไซเบอร์พังก์', accent: 'สีนีออนหลัก', danger: 'สีนีออนแจ้งเตือน', surface: 'สีพื้นแผง', textColor: 'สีตัวอักษร', uiScale: 'ขนาด UI', callOpacity: 'ความทึบพื้นหลังสาย', callBlur: 'ความเบลอพื้นหลังสาย', animationSpeed: 'ความเร็วแอนิเมชัน', aiProtocol: 'โปรโตคอล AI', customInstructions: 'คำสั่งเพิ่มเติม', quotaNote: 'การติดตามปกติใช้คำตอบ AI หลัก เฉพาะปุ่มส่งหา AI ในหน้าสายเท่านั้นที่สร้างคำขอเพิ่ม', tagReference: 'รายการแท็ก', resetAppearance: 'รีเซ็ตรูปลักษณ์',
        network: 'โครงข่ายประสาท', characters: 'ตัวละคร', hacking: 'การแฮ็ก', calls: 'สาย', config: 'ตั้งค่า', close: 'ปิด', addNpc: 'เพิ่ม NPC', addSkill: 'เพิ่มทักษะ', noNpcs: 'ยังไม่มีตัวตนที่เชื่อมในขอบเขตตัวละครหรือแชต', noSkills: 'ยังไม่มีทักษะแฮ็กสำหรับตัวละครหรือแชตนี้', noCalls: 'ยังไม่มีประวัติสัญญาณส่วนตัวในแชตนี้', edit: 'แก้ไข', remove: 'ลบ', call: 'โทร', character: 'ตัวละคร', chat: 'แชต', name: 'ชื่อ', handle: 'ชื่อในเครือข่าย', role: 'บทบาท', status: 'สถานะสัญญาณ', affiliation: 'สังกัด', age: 'อายุ', gender: 'เพศ', appearanceField: 'รูปลักษณ์', notes: 'หมายเหตุ', scope: 'ขอบเขต', save: 'บันทึก', cancel: 'ยกเลิก', category: 'หมวดหมู่', level: 'ความก้าวหน้า', maximum: 'ค่าสูงสุด', rank: 'แรงก์',
        incoming: 'สัญญาณส่วนตัวเข้า', accept: 'รับสาย', decline: 'ปฏิเสธ', encrypted: 'ช่องสัญญาณเข้ารหัส', connected: 'เชื่อมต่อสัญญาณแล้ว', ended: 'ตัดสัญญาณแล้ว', minimize: 'ย่อ', endCall: 'วางสาย', inputPlaceholder: 'พิมพ์สัญญาณส่วนตัว…', queueHint: 'Enter เก็บข้อความ · ปุ่ม AI ขอคำตอบ', generating: 'กำลังติดตามสัญญาณ…', callFailed: 'รับคำตอบส่วนตัวไม่สำเร็จ', queued: 'เก็บข้อความแล้วโดยไม่เรียก AI', unread: 'ยังไม่อ่าน', active: 'กำลังใช้งาน', restore: 'เปิดกลับ', settingsSaved: 'บันทึกการตั้งค่าแล้ว', profileSaved: 'บันทึกตัวตนแล้ว', skillSaved: 'บันทึกทักษะแล้ว', confirmRemove: 'ลบข้อมูลนี้หรือไม่?', promptUnavailable: 'ไม่พบระบบสร้างข้อความของ SillyTavern',
        general: 'ทั่วไป', stealth: 'ลอบเร้น', intrusion: 'บุกรุก', hardware: 'ฮาร์ดแวร์', social: 'วิศวกรรมสังคม', combat: 'แฮ็กต่อสู้', currentCall: 'สัญญาณปัจจุบัน', history: 'ประวัติสัญญาณ', noActiveCall: 'ไม่มีสัญญาณส่วนตัวที่กำลังใช้งาน', customize: 'ค่าที่มองเห็นและพฤติกรรมทั้งหมดด้านล่างจะบันทึกทันที',
      },
    };

    Object.assign(I18N.en, {
      contactsTitle: 'Contact directory', contactsHint: 'Your connections across the city. Open a dossier or establish a private line.',
      skillsTitle: 'Netrunner deck', skillsHint: 'Track your craft. Progress updates with the story.', callsTitle: 'Private signals', callsHint: 'One secure line. A conversation of its own.', configTitle: 'Interface tuning',
      identities: 'Identities', protocols: 'Skills', searchContacts: 'Search name, handle, or affiliation', searchSkills: 'Search skills or categories', allScopes: 'All', noResults: 'No matches on this frequency', clearFilters: 'Clear filters',
      dossier: 'Dossier', unregistered: 'Unregistered identity', noRole: 'Role not set', scopeHint: 'Chat records override matching Character records.', mastery: 'Deck progress', details: 'Details',
      incomingHint: 'A private line is waiting.', privateLine: 'Private line', sendAi: 'Send to AI', queueMessage: 'Queue', queuedShort: 'Queued', signalReady: 'Channel ready', userLabel: 'You', systemLabel: 'System', npcLabel: 'Contact',
      palette: 'Color preset', layout: 'Layout & motion', density: 'Spacing', comfortable: 'Comfortable', compact: 'Compact', scanlines: 'Subtle scanlines', livePreview: 'Live preview', previewLine: 'The city is listening. Keep this channel open.',
      on: 'On', off: 'Off', slow: 'Slow', normal: 'Normal', fast: 'Fast', left: 'Left', center: 'Center', right: 'Right', saved: 'Saved automatically',
      localChat: 'Chat-local history', browseContacts: 'Browse contacts', signalCount: 'Messages', viewDossier: 'View dossier', openConfig: 'Open settings',
      emptyContactHint: 'Add a contact, or let a tagged speaker join the directory during your story.', emptySkillHint: 'Add a skill, or earn progress through the story to start your deck.', emptyCallHint: 'Choose a contact to begin a private call.',
      appearanceHint: 'Colors, spacing, and motion update immediately.', behaviorHint: 'Choose what runs in this character and chat.', protocolHint: 'Control how the AI uses headers, speech, thoughts, and private calls.',
      voiceChannel: 'Voice channel', privateThought: 'Private thought', identity: 'Identity', signal: 'Signal',
    });
    Object.assign(I18N.th, {
      contactsTitle: 'ทะเบียนผู้ติดต่อ', contactsHint: 'เครือข่ายของคุณทั่วเมือง เปิดแฟ้มข้อมูลหรือเริ่มสายส่วนตัว',
      skillsTitle: 'เด็คเน็ตรันเนอร์', skillsHint: 'ติดตามฝีมือการแฮ็ก ความก้าวหน้าอัปเดตไปกับเรื่องราว', callsTitle: 'สัญญาณส่วนตัว', callsHint: 'ช่องทางเฉพาะสำหรับบทสนทนาระหว่างสาย', configTitle: 'ปรับแต่งอินเทอร์เฟซ',
      identities: 'ผู้ติดต่อ', protocols: 'ทักษะ', searchContacts: 'ค้นหาชื่อ แฮนเดิล หรือสังกัด', searchSkills: 'ค้นหาทักษะหรือหมวดหมู่', allScopes: 'ทั้งหมด', noResults: 'ไม่พบข้อมูลที่ตรงกัน', clearFilters: 'ล้างตัวกรอง',
      dossier: 'แฟ้มข้อมูล', unregistered: 'ตัวตนที่ยังไม่ลงทะเบียน', noRole: 'ยังไม่ระบุบทบาท', scopeHint: 'ข้อมูลในแชตจะใช้แทนข้อมูลตัวละครที่มีชื่อเดียวกัน', mastery: 'ความก้าวหน้ารวม', details: 'รายละเอียด',
      incomingHint: 'มีสายส่วนตัวรอการตอบรับ', privateLine: 'สายส่วนตัว', sendAi: 'ส่งหา AI', queueMessage: 'เก็บข้อความ', queuedShort: 'รอส่ง', signalReady: 'ช่องสัญญาณพร้อม', userLabel: 'คุณ', systemLabel: 'ระบบ', npcLabel: 'ผู้ติดต่อ',
      palette: 'ชุดสี', layout: 'การจัดวางและแอนิเมชัน', density: 'ระยะห่าง', comfortable: 'โปร่ง', compact: 'กระชับ', scanlines: 'เส้นสแกนแบบบาง', livePreview: 'ตัวอย่างทันที', previewLine: 'เมืองกำลังฟังอยู่ เปิดช่องสัญญาณนี้ไว้',
      on: 'เปิด', off: 'ปิด', slow: 'ช้า', normal: 'ปกติ', fast: 'เร็ว', left: 'ซ้าย', center: 'กลาง', right: 'ขวา', saved: 'บันทึกอัตโนมัติ',
      localChat: 'ประวัติเฉพาะแชตนี้', browseContacts: 'เลือกผู้ติดต่อ', signalCount: 'ข้อความ', viewDossier: 'เปิดแฟ้มข้อมูล', openConfig: 'เปิดการตั้งค่า',
      emptyContactHint: 'เพิ่มผู้ติดต่อ หรือให้ผู้พูดที่มีแท็กเข้าร่วมทะเบียนระหว่างเรื่องราว', emptySkillHint: 'เพิ่มทักษะ หรือพัฒนาฝีมือในเรื่องราวเพื่อเริ่มเด็คของคุณ', emptyCallHint: 'เลือกผู้ติดต่อเพื่อเริ่มสายส่วนตัว',
      appearanceHint: 'สี ระยะห่าง และแอนิเมชันเปลี่ยนทันที', behaviorHint: 'เลือกการทำงานสำหรับตัวละครและแชตนี้', protocolHint: 'กำหนดวิธีที่ AI ใช้ส่วนหัว คำพูด ความคิด และสายส่วนตัว',
      voiceChannel: 'ช่องเสียง', privateThought: 'ความคิดส่วนตัว', identity: 'ตัวตน', signal: 'สัญญาณ',
    });

    let manager = null;
    let managerTab = 'characters';
    let callOverlay = null;
    let minimizedCall = null;
    let incomingWindow = null;
    let pendingIncomingCall = null;
    let promptTimer = null;
    let settingsBound = false;
    let callGenerating = false;
    let managerTrigger = null;
    let callDraft = '';
    const viewState = { characters: { query: '', scope: 'all' }, hacking: { query: '', scope: 'all' } };
    const configSections = new Set(['appearance']);
    const processedMessages = new Set();

    const context = () => {
      try { return globalThis.SillyTavern?.getContext?.() || null; }
      catch (error) { console.warn('[Cyberpunk System] Context unavailable', error); return null; }
    };

    const clean = (value, max = 2000) => String(value ?? '').trim().slice(0, max);
    const htmlEscape = value => String(value ?? '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
    const stripTags = value => {
      const node = document.createElement('div');
      node.innerHTML = String(value ?? '');
      return clean(node.textContent || '', 8000);
    };
    const id = prefix => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const clone = value => globalThis.structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));
    const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

    function settings() {
      const ctx = context();
      if (!ctx) return clone(DEFAULTS);
      if (!ctx.extensionSettings || typeof ctx.extensionSettings !== 'object') ctx.extensionSettings = {};
      const current = ctx.extensionSettings[CYBERPUNK_SYSTEM_KEY];
      if (!current || typeof current !== 'object') ctx.extensionSettings[CYBERPUNK_SYSTEM_KEY] = clone(DEFAULTS);
      const root = ctx.extensionSettings[CYBERPUNK_SYSTEM_KEY];
      for (const [key, value] of Object.entries(DEFAULTS)) {
        if (root[key] === undefined) root[key] = clone(value);
      }
      if (!root.characters || typeof root.characters !== 'object') root.characters = {};
      return root;
    }

    function characterKey() {
      const ctx = context();
      const groupId = ctx?.groupId ?? ctx?.group?.id;
      if (groupId !== undefined && groupId !== null && groupId !== '') return `group:${groupId}`;
      const charId = ctx?.characterId ?? ctx?.character?.id;
      const character = ctx?.character || (Array.isArray(ctx?.characters) ? ctx.characters[charId] : null);
      return `character:${clean(character?.avatar || charId || ctx?.name2 || character?.name || 'unknown', 180)}`;
    }

    function blankBucket() { return { npcs: [], skills: [] }; }

    function characterBucket() {
      const root = settings();
      const key = characterKey();
      if (!root.characters[key] || typeof root.characters[key] !== 'object') root.characters[key] = blankBucket();
      const bucket = root.characters[key];
      if (!Array.isArray(bucket.npcs)) bucket.npcs = [];
      if (!Array.isArray(bucket.skills)) bucket.skills = [];
      return bucket;
    }

    function chatBucket() {
      const ctx = context();
      if (!ctx) return { ...blankBucket(), call: { active: false, minimized: false, peer: null, messages: [], unread: 0 } };
      if (!ctx.chatMetadata || typeof ctx.chatMetadata !== 'object') ctx.chatMetadata = {};
      if (!ctx.chatMetadata[CYBERPUNK_SYSTEM_KEY] || typeof ctx.chatMetadata[CYBERPUNK_SYSTEM_KEY] !== 'object') {
        ctx.chatMetadata[CYBERPUNK_SYSTEM_KEY] = { ...blankBucket(), call: { active: false, minimized: false, peer: null, messages: [], unread: 0 } };
      }
      const bucket = ctx.chatMetadata[CYBERPUNK_SYSTEM_KEY];
      if (!Array.isArray(bucket.npcs)) bucket.npcs = [];
      if (!Array.isArray(bucket.skills)) bucket.skills = [];
      if (!bucket.call || typeof bucket.call !== 'object') bucket.call = { active: false, minimized: false, peer: null, messages: [], unread: 0 };
      if (!Array.isArray(bucket.call.messages)) bucket.call.messages = [];
      return bucket;
    }

    const bucketFor = scope => scope === 'character' ? characterBucket() : chatBucket();
    const saveSettings = () => context()?.saveSettingsDebounced?.();
    const saveChat = () => context()?.saveMetadataDebounced?.();
    const saveScope = scope => scope === 'character' ? saveSettings() : saveChat();

    function effectiveRecords(kind) {
      const map = new Map();
      for (const [scope, list] of [['character', characterBucket()[kind]], ['chat', chatBucket()[kind]]]) {
        for (const record of list) {
          const key = clean(record.name, 180).toLocaleLowerCase() || record.id;
          if (key) map.set(key, { ...record, scope });
        }
      }
      return [...map.values()];
    }

    const findEffectiveNpc = name => effectiveRecords('npcs').find(item => {
      const needle = clean(name, 180).toLocaleLowerCase();
      return clean(item.name, 180).toLocaleLowerCase() === needle || clean(item.handle, 180).toLocaleLowerCase() === needle;
    }) || null;

    function t(key) {
      const lang = settings().language === 'th' ? 'th' : 'en';
      return I18N[lang][key] || I18N.en[key] || key;
    }

    // Small, local SVGs keep component icons independent of the host's icon font.
    function uiIcon(name) {
      const paths = {
        chip: '<rect x="6" y="6" width="12" height="12"/><path d="M9 9h6v6H9zM9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>',
        characters: '<rect x="3" y="4" width="18" height="16"/><circle cx="9" cy="10" r="2"/><path d="M5 17c0-4 8-4 8 0m2-8h3m-3 4h3"/>',
        hacking: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',
        calls: '<path d="m7 3 3 5-3 3c1 3 3 5 6 6l3-3 5 3v3c-9 4-22-9-18-18h4Z"/>',
        config: '<path d="M4 5h16M4 12h16M4 19h16"/><path d="M8 2v6m8 1v6m-6 1v6"/>',
        search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
        plus: '<path d="M12 4v16M4 12h16"/>',
        edit: '<path d="m15 4 5 5M4 20l1-6L16 3l5 5-11 11-6 1Z"/>',
        trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
        close: '<path d="m5 5 14 14M19 5 5 19"/>',
        minimize: '<path d="M4 16h16m-4-8 4-4m-4 0h4v4"/>',
        send: '<path d="m3 3 18 9-18 9 4-9-4-9Zm4 9h14"/>',
        end: '<path d="M3 17v-5c5-5 13-5 18 0v5h-5v-4H8v4H3Z"/>',
        chevron: '<path d="m9 5 7 7-7 7"/>',
        check: '<path d="m4 12 5 5L20 6"/>',
        shield: '<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z"/><path d="m8 12 3 3 5-6"/>',
        signal: '<path d="M4 20v-4m5 4v-8m6 8V8m5 12V4"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        thought: '<path d="M5 17c-6-9 4-18 12-11 7 7-1 15-9 12l-5 3 2-4Z"/><path d="M8 11h8m-8 3h5"/>',
        voice: '<path d="M4 9v6m4-9v12m4-15v18m4-15v12m4-9v6"/>',
      };
      return `<svg class="cps-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false">${paths[name] || paths.chip}</svg>`;
    }

    function avatarMarkup(name, large = false) {
      const initials = clean(name).split(/\s+/).slice(0, 2).map(word => Array.from(word)[0] || '').join('').toLocaleUpperCase();
      return `<span class="cps-avatar${large ? ' large' : ''}" aria-hidden="true"><span>${htmlEscape(initials || '?')}</span></span>`;
    }

    function scopeBadge(scope) {
      return `<span class="cps-scope" data-scope="${scope === 'character' ? 'character' : 'chat'}">${htmlEscape(t(scope))}</span>`;
    }

    function sectionHeading(number, title, hint, stat = '') {
      return `<header class="cps-section-heading"><div><span class="cps-eyebrow">${number} / ${htmlEscape(t('network'))}</span><h2>${htmlEscape(t(title))}</h2><p>${htmlEscape(t(hint))}</p></div>${stat}</header>`;
    }

    function metric(value, label) {
      return `<div class="cps-metric"><strong>${htmlEscape(value)}</strong><span>${htmlEscape(t(label))}</span></div>`;
    }

    function emptyState(icon, title, hint) {
      return `<section class="cps-empty">${uiIcon(icon)}<h3>${htmlEscape(t(title))}</h3><p>${htmlEscape(t(hint))}</p></section>`;
    }

    function timeMarkup(at) {
      const date = new Date(at);
      if (!Number.isFinite(date.getTime())) return '';
      return `<time datetime="${date.toISOString()}">${htmlEscape(date.toLocaleTimeString(settings().language === 'th' ? 'th-TH' : 'en-GB', { hour: '2-digit', minute: '2-digit' }))}</time>`;
    }

    // Bind only while an overlay is open; visualViewport follows the iOS keyboard.
    function showUiDialog(node) {
      const viewport = globalThis.visualViewport;
      let frame = 0;
      const measure = () => {
        frame = 0;
        if (!node.isConnected) return;
        if (viewport && viewport.scale === 1) {
          node.style.setProperty('--cps-viewport-height', `${viewport.height}px`);
          node.style.setProperty('--cps-viewport-top', `${viewport.offsetTop}px`);
        } else {
          node.style.removeProperty('--cps-viewport-height');
          node.style.removeProperty('--cps-viewport-top');
        }
      };
      const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
      node.cpsCleanup = () => {
        cancelAnimationFrame(frame);
        viewport?.removeEventListener('resize', schedule);
        viewport?.removeEventListener('scroll', schedule);
        globalThis.removeEventListener('resize', schedule);
      };
      viewport?.addEventListener('resize', schedule);
      viewport?.addEventListener('scroll', schedule);
      globalThis.addEventListener('resize', schedule);
      node.addEventListener('close', node.cpsCleanup, { once: true });
      node.addEventListener('click', event => event.stopPropagation());
      node.addEventListener('keydown', event => event.stopPropagation());
      node.lang = settings().language;
      measure();
      if (typeof node.showModal === 'function') node.showModal();
      else node.setAttribute('open', '');
    }

    function removeUiDialog(node) {
      if (!node) return;
      node.cpsCleanup?.();
      try { node.close?.(); } catch {}
      node.remove();
    }

    function applyTheme() {
      const s = settings();
      const root = document.documentElement;
      root.style.setProperty('--cps-accent', s.accent);
      root.style.setProperty('--cps-danger', s.danger);
      root.style.setProperty('--cps-surface', s.surface);
      root.style.setProperty('--cps-text', s.text);
      root.style.setProperty('--cps-scale', String(clamp(s.uiScale, 80, 120) / 100));
      root.style.setProperty('--cps-call-opacity', String(clamp(s.callOpacity, 20, 90) / 100));
      root.style.setProperty('--cps-call-blur', `${clamp(s.callBlur, 0, 24)}px`);
      root.style.setProperty('--cps-motion', ({ off: 0, slow: 1.7, normal: 1, fast: .58 })[s.animationSpeed] ?? 1);
      root.style.setProperty('--cps-space', s.density === 'compact' ? '12px' : '18px');
      root.style.setProperty('--cps-scan-opacity', s.scanlines ? '.035' : '0');
      document.querySelectorAll('.cps-ui, .cps-settings').forEach(node => { node.lang = s.language; });
    }

    function translate(root = document) {
      root.querySelectorAll?.('[data-cps-i18n]').forEach(node => {
        const value = t(node.dataset.cpsI18n);
        if (value) node.textContent = value;
      });
    }

    function toast(message, duration = 2600) {
      document.querySelector('.cps-toast')?.remove();
      const node = document.createElement('div');
      node.className = 'cps-toast';
      node.setAttribute('role', 'status');
      node.textContent = clean(message, 500);
      (document.querySelector('dialog.cps-ui[open]:last-of-type') || document.body).append(node);
      setTimeout(() => node.remove(), duration);
    }

    function closeHostWand() {
      const menu = document.getElementById('extensionsMenu');
      const toggles = [...document.querySelectorAll('#extensionsMenuButton, [data-drawer-id="extensionsMenu"], [aria-controls="extensionsMenu"]')];
      toggles.forEach(toggle => {
        if (!(toggle instanceof HTMLElement)) return;
        if (toggle.getAttribute('aria-expanded') === 'true') toggle.click();
        toggle.setAttribute('aria-expanded', 'false');
      });
      try { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true })); } catch {}
      if (!menu) return;
      const hide = () => {
        globalThis.jQuery?.(menu).stop(true, true).hide();
        menu.style.display = 'none';
        menu.setAttribute('aria-hidden', 'true');
        for (const selector of ['.drawer-content', '[role="dialog"]', '.popup', '.options-content']) {
          const shell = menu.closest(selector);
          if (!shell || shell === document.body || shell.classList.contains('cps-ui')) continue;
          shell.classList.remove('open', 'show', 'visible', 'openDrawer');
          shell.setAttribute('aria-hidden', 'true');
        }
      };
      hide(); requestAnimationFrame(hide); setTimeout(hide, 90);
    }

    function ensureWandButton() {
      const menu = document.getElementById('extensionsMenu');
      const existing = document.getElementById('cyberpunk-system-wand');
      if (!settings().showWand) { existing?.remove(); return; }
      if (!menu || existing) return;
      const button = document.createElement('div');
      button.id = 'cyberpunk-system-wand';
      button.className = 'list-group-item flex-container flexGap5 interactable';
      button.tabIndex = 0;
      button.setAttribute('role', 'button');
      button.innerHTML = '<i class="fa-solid fa-satellite-dish fa-fw"></i><span>Cyberpunk System</span>';
      button.addEventListener('click', event => {
        event.preventDefault(); event.stopPropagation();
        closeHostWand();
        requestAnimationFrame(openManager);
      });
      button.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') button.click(); });
      menu.append(button);
    }

    function aiProtocol() {
      const s = settings();
      if (!s.enabled || !s.injectPrompt) return '';
      const npcs = effectiveRecords('npcs').slice(0, 28).map(npc => `${npc.name}${npc.handle ? ` (@${npc.handle})` : ''}${npc.role ? ` — ${npc.role}` : ''}`).join('; ');
      const skills = effectiveRecords('skills').slice(0, 20).map(skill => `${skill.name} ${skill.level}/${skill.max}`).join('; ');
      const call = chatBucket().call;
      const callTranscript = call.active ? call.messages.slice(-14).map(item => `${item.role === 'user' ? 'USER' : item.role === 'assistant' ? call.peer?.name || item.name : 'SYSTEM'}${item.pending ? ' (new/awaiting response)' : ''}: ${clean(item.text, 600)}`).join('\n') : '';
      const activeCall = call.active && call.peer ? `ACTIVE PRIVATE CALL: ${call.peer.name}${call.peer.handle ? ` (@${call.peer.handle})` : ''}. Any audible words from this participant must use CP_SIGNAL, never CP_DIALOGUE, until the call ends. If the transcript contains a USER message marked new/awaiting response, answer it in this normal reply with CP_SIGNAL. Otherwise do not invent a redundant call response unless the scene naturally requires the caller to speak.\nRecent private-call transcript:\n${callTranscript || '(connected; no speech yet)'}` : 'No private call is active.';
      return `[Cyberpunk System output protocol — presentation only; do not explain these rules]
Use tags only when their semantic condition is true. Keep ordinary narration outside every tag.
1. HEADER identifies the NPC who is about to speak. Use once immediately before that NPC's visible spoken turn: [CP_HEADER|Name|role|signal status][/CP_HEADER]. Do not put prose in Header.
2. DIALOGUE contains only audible spoken NPC words: [CP_DIALOGUE|Name]words[/CP_DIALOGUE]. Never wrap narration, actions, descriptions, or the user's words.
3. MONOLOGUE contains only an NPC's truly private thoughts that the user cannot hear: [CP_MONOLOGUE|Name]thought[/CP_MONOLOGUE]. Do not use it for narration.
4. CALL REQUEST is only for an NPC initiating a remote private call: [CP_CALL_REQUEST|Name|network handle]short reason[/CP_CALL_REQUEST]. It creates a separate incoming-call window, so do not repeat it as main-chat dialogue.
5. PRIVATE SIGNAL is speech inside an active call: [CP_SIGNAL|Name]private call words[/CP_SIGNAL]. It is removed from the main chat and delivered to the call UI. A participant in an active call must use CP_SIGNAL instead of CP_DIALOGUE.
6. HACK UPDATE is only for hacking progress actually earned or lost in this scene: [CP_HACK|Skill name|category|numeric delta|max]short reason[/CP_HACK]. Delta may be negative. Omit it when nothing changed.
7. Close every tag exactly. Use stable NPC names. Never place the user/persona's own speech in NPC presentation tags.
${activeCall}
Known NPCs: ${npcs || 'none stored'}
Known hacking skills: ${skills || 'none stored'}
${clean(s.customPrompt, 6000)}`.trim();
    }

    function refreshPrompt(immediate = false) {
      clearTimeout(promptTimer);
      const apply = () => {
        const ctx = context();
        if (typeof ctx?.setExtensionPrompt !== 'function') return;
        try { ctx.setExtensionPrompt(CYBERPUNK_PROMPT_KEY, aiProtocol(), 1, 0, false, 0); }
        catch (error) { console.warn('[Cyberpunk System] Prompt update failed', error); }
      };
      if (immediate) apply();
      else promptTimer = setTimeout(apply, 20);
    }

    function createSparseNpc(name, role = '', status = '', handle = '') {
      if (!settings().autoProfiles || !clean(name, 180) || findEffectiveNpc(name)) return;
      const scope = settings().defaultScope === 'character' ? 'character' : 'chat';
      bucketFor(scope).npcs.push({ id: id('npc'), name: clean(name, 180), handle: clean(handle, 180), role: clean(role, 240), status: clean(status, 240), affiliation: '', age: '', gender: '', appearance: '', notes: '', createdAt: new Date().toISOString() });
      saveScope(scope);
      refreshPrompt();
    }

    function parseTagAttributes(source, tag) {
      const regex = new RegExp(`\\[${tag}\\|([^\\]|]+)(?:\\|([^\\]|]*))?(?:\\|([^\\]|]*))?(?:\\|([^\\]|]*))?(?:\\|([^\\]]*))?\\]([\\s\\S]*?)\\[\\/${tag}\\]`, 'gi');
      return [...String(source || '').matchAll(regex)];
    }

    function updateHackingSkill(match) {
      if (!settings().hackingEnabled) return;
      const name = clean(match[1], 180);
      const category = clean(match[2], 120) || t('general');
      const delta = Number(clean(match[3], 30));
      const declaredMax = clamp(clean(match[4], 30) || 100, 1, 100000);
      const reason = clean(stripTags(match[6]), 500);
      if (!name || !Number.isFinite(delta)) return;
      let skill = effectiveRecords('skills').find(item => item.name.toLocaleLowerCase() === name.toLocaleLowerCase());
      let scope = skill?.scope || (settings().defaultScope === 'character' ? 'character' : 'chat');
      let list = bucketFor(scope).skills;
      let stored = skill ? list.find(item => item.id === skill.id) : null;
      if (!stored) {
        stored = { id: id('hack'), name, category, level: 0, max: declaredMax, rank: 'E', notes: '', updatedAt: '' };
        list.push(stored);
      }
      stored.category = category || stored.category;
      stored.max = declaredMax || stored.max;
      stored.level = clamp(Number(stored.level) + delta, 0, stored.max);
      stored.updatedAt = new Date().toISOString();
      if (reason) stored.notes = reason;
      saveScope(scope);
      toast(`${name} ${delta >= 0 ? '+' : ''}${delta} · ${stored.level}/${stored.max}`);
      refreshPrompt();
      if (manager && managerTab === 'hacking') renderManagerBody();
    }

    function processMachineRecords(raw, messageKey = '') {
      if (!settings().enabled || !raw) return;
      const fingerprint = `${messageKey}:${String(raw).length}:${String(raw).slice(-80)}`;
      if (messageKey && processedMessages.has(fingerprint)) return;
      if (messageKey) {
        processedMessages.add(fingerprint);
        if (processedMessages.size > 300) processedMessages.delete(processedMessages.values().next().value);
      }
      for (const match of parseTagAttributes(raw, 'CP_HEADER')) createSparseNpc(match[1], match[2], match[3]);
      for (const tag of ['CP_DIALOGUE', 'CP_MONOLOGUE']) for (const match of parseTagAttributes(raw, tag)) createSparseNpc(match[1]);
      for (const match of parseTagAttributes(raw, 'CP_CALL_REQUEST')) {
        createSparseNpc(match[1], '', '', match[2]);
        showIncomingCall({ name: clean(match[1], 180), handle: clean(match[2], 180), reason: clean(stripTags(match[6]), 800) });
      }
      for (const match of parseTagAttributes(raw, 'CP_SIGNAL')) {
        createSparseNpc(match[1]);
        if (settings().callMainSignals) receiveCallSignal(clean(match[1], 180), clean(stripTags(match[6]), 4000));
      }
      for (const match of parseTagAttributes(raw, 'CP_HACK')) updateHackingSkill(match);
    }

    function headerHtml(name, role, status) {
      const npc = findEffectiveNpc(stripTags(name));
      const displayName = stripTags(name) || npc?.name || 'UNKNOWN';
      const displayRole = stripTags(role) || npc?.role || t('unregistered');
      const displayStatus = stripTags(status) || npc?.status || t('signalReady');
      const extra = [npc?.affiliation, npc?.handle ? `@${npc.handle}` : ''].filter(Boolean);
      return `<section class="cps-chat-block cps-chat-header" data-position="${htmlEscape(settings().headerPosition)}"><div><span class="cps-chat-overline">${uiIcon('characters')}${htmlEscape(t('identity'))}</span><div class="cps-chat-name">${htmlEscape(displayName)}</div><div class="cps-chat-role">${htmlEscape(displayRole)}</div><div class="cps-chat-meta"><span>${htmlEscape(displayStatus)}</span>${extra.map(item => `<span>${htmlEscape(item)}</span>`).join('')}</div></div></section>`;
    }

    function speechHtml(kind, name, content) {
      const label = t(kind === 'monologue' ? 'privateThought' : 'voiceChannel');
      return `<section class="cps-chat-block cps-chat-${kind}"><div class="cps-chat-kicker">${uiIcon(kind === 'monologue' ? 'thought' : 'voice')}<span>${htmlEscape(stripTags(name))}</span><small>${htmlEscape(label)}</small></div><div class="cps-chat-copy">${content}</div></section>`;
    }

    function markupFingerprint(value) {
      const source = String(value || '');
      let hash = 2166136261;
      for (let index = 0; index < source.length; index += 1) {
        hash ^= source.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return `${source.length}:${(hash >>> 0).toString(36)}`;
    }

    function transformProtocolMarkup(source) {
      let output = String(source || '');
      output = output.replace(/\[CP_HEADER\|([^\]|]+)(?:\|([^\]|]*))?(?:\|([^\]]*))?\]\s*\[\/CP_HEADER\]/gi, (_, name, role = '', status = '') => headerHtml(name, role, status));
      output = output.replace(/\[CP_DIALOGUE\|([^\]]+)\]([\s\S]*?)\[\/CP_DIALOGUE\]/gi, (_, name, content) => speechHtml('dialogue', name, content));
      output = output.replace(/\[CP_MONOLOGUE\|([^\]]+)\]([\s\S]*?)\[\/CP_MONOLOGUE\]/gi, (_, name, content) => speechHtml('monologue', name, content));
      for (const tag of ['CALL_REQUEST', 'SIGNAL', 'HACK']) {
        output = output.replace(new RegExp(`\\[CP_${tag}\\|[^\\]]+\\][\\s\\S]*?\\[\\/CP_${tag}\\]`, 'gi'), '');
      }
      return output;
    }

    function transformPlainProtocolText(source) {
      let output = htmlEscape(source);
      output = output.replace(/\[CP_HEADER\|([^\]|]+)(?:\|([^\]|]*))?(?:\|([^\]]*))?\]\s*\[\/CP_HEADER\]/gi, (_, name, role = '', status = '') => headerHtml(name, role, status));
      output = output.replace(/\[CP_DIALOGUE\|([^\]]+)\]([\s\S]*?)\[\/CP_DIALOGUE\]/gi, (_, name, content) => speechHtml('dialogue', name, content));
      output = output.replace(/\[CP_MONOLOGUE\|([^\]]+)\]([\s\S]*?)\[\/CP_MONOLOGUE\]/gi, (_, name, content) => speechHtml('monologue', name, content));
      for (const tag of ['CALL_REQUEST', 'SIGNAL', 'HACK']) {
        output = output.replace(new RegExp(`\\[CP_${tag}\\|[^\\]]+\\][\\s\\S]*?\\[\\/CP_${tag}\\]`, 'gi'), '');
      }
      return output.replace(/\r?\n/g, '<br>');
    }

    function renderMessageElement(element, force = false) {
      if (!(element instanceof HTMLElement) || !settings().enabled) return;
      const source = element.innerHTML;
      const fingerprint = markupFingerprint(source);
      if (!force && element.dataset.cpsRenderFingerprint === fingerprint) return;
      if (!/\[CP_(?:HEADER|DIALOGUE|MONOLOGUE|CALL_REQUEST|SIGNAL|HACK)\|/i.test(source)) {
        element.dataset.cpsRenderFingerprint = fingerprint;
        return;
      }
      let output = transformProtocolMarkup(source);
      if (/\[\/?CP_(?:HEADER|DIALOGUE|MONOLOGUE|CALL_REQUEST|SIGNAL|HACK)(?:\||\])/i.test(stripTags(output))) {
        output = transformPlainProtocolText(element.textContent || '');
      }
      element.innerHTML = output;
      element.dataset.cpsRenderFingerprint = markupFingerprint(element.innerHTML);
    }

    function renderVisibleMessages() {
      document.querySelectorAll('.mes_text').forEach(renderMessageElement);
    }

    function rawMessageById(messageId) {
      const chat = context()?.chat;
      if (!Array.isArray(chat)) return null;
      const index = Number(messageId);
      if (Number.isInteger(index) && chat[index]) return chat[index];
      return chat.at(-1) || null;
    }

    function onAssistantMessage(messageId) {
      const message = rawMessageById(messageId);
      if (!message || message.is_user) return;
      processMachineRecords(message.mes || '', String(messageId ?? context()?.chat?.length ?? 'latest'));
      const renderPass = () => {
        const safeId = String(messageId ?? '').replace(/["\\]/g, '\\$&');
        const target = Number.isInteger(Number(messageId)) ? document.querySelector(`.mes[mesid="${safeId}"] .mes_text`) : null;
        if (target) renderMessageElement(target, true);
        else renderVisibleMessages();
      };
      [0, 80, 240, 700, 1500].forEach(delay => setTimeout(renderPass, delay));
      refreshPrompt();
    }

    function showIncomingCall(peer) {
      if (!peer?.name) return;
      incomingWindow?.remove();
      pendingIncomingCall = { ...peer, signals: [] };
      const node = document.createElement('section');
      node.className = 'cps-incoming cps-ui';
      node.setAttribute('role', 'region');
      node.setAttribute('aria-label', t('incoming'));
      node.lang = settings().language;
      node.innerHTML = `<div class="cps-incoming-head">${uiIcon('calls')}<span>${htmlEscape(t('incoming'))}</span><span class="cps-signal-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></div><div class="cps-incoming-body"><div class="cps-contact-identity">${avatarMarkup(peer.name)}<div><div class="cps-incoming-name">${htmlEscape(peer.name)}</div><span class="cps-muted">${htmlEscape(peer.handle ? `@${peer.handle}` : t('encrypted'))}</span></div></div><p class="cps-incoming-reason">${htmlEscape(peer.reason || t('incomingHint'))}</p></div><div class="cps-incoming-actions"><button type="button" class="cps-button danger" data-action="decline">${uiIcon('end')}${htmlEscape(t('decline'))}</button><button type="button" class="cps-button primary" data-action="accept">${uiIcon('calls')}${htmlEscape(t('accept'))}</button></div>`;
      node.querySelector('[data-action="decline"]').addEventListener('click', () => { node.remove(); incomingWindow = null; pendingIncomingCall = null; });
      node.querySelector('[data-action="accept"]').addEventListener('click', () => {
        const accepted = pendingIncomingCall || { ...peer, signals: [] };
        node.remove(); incomingWindow = null; pendingIncomingCall = null;
        startCall(accepted, true);
        accepted.signals.forEach(signal => appendCallMessage('assistant', signal.name || accepted.name, signal.text));
      });
      document.body.append(node);
      incomingWindow = node;
      if (typeof node.showPopover === 'function') { node.setAttribute('popover', 'manual'); try { node.showPopover(); } catch {} }
    }

    function appendCallMessage(role, name, text, pending = false) {
      const value = clean(text, 4000);
      if (!value) return null;
      const call = chatBucket().call;
      const message = { id: id('signal'), role, name: clean(name, 180), text: value, pending: Boolean(pending), at: new Date().toISOString() };
      call.messages.push(message);
      const limit = clamp(settings().callHistoryLimit, 20, 300);
      call.messages = call.messages.slice(-limit);
      if (role === 'assistant' && call.minimized) call.unread = clamp(Number(call.unread) + 1, 0, 999);
      saveChat();
      refreshPrompt(true);
      renderCallLog();
      renderMinimizedCall();
      return message;
    }

    function startCall(peer, incoming = false) {
      const call = chatBucket().call;
      removeCallOverlay();
      callDraft = '';
      call.id = id('call');
      call.active = true;
      call.minimized = false;
      call.unread = 0;
      call.peer = { name: clean(peer.name, 180), handle: clean(peer.handle, 180) };
      appendCallMessage('system', 'SYSTEM', t('connected'));
      if (incoming && peer.reason) appendCallMessage('assistant', peer.name, peer.reason);
      saveChat();
      refreshPrompt();
      showCallOverlay();
      if (manager) renderManagerBody();
    }

    function receiveCallSignal(name, text) {
      const call = chatBucket().call;
      if (!text) return;
      if (!call.active || !call.peer) {
        if (pendingIncomingCall) pendingIncomingCall.signals.push({ name: clean(name, 180), text: clean(text, 4000) });
        return;
      }
      const peerName = clean(call.peer.name, 180).toLocaleLowerCase();
      const sender = clean(name, 180).toLocaleLowerCase();
      if (sender && peerName && sender !== peerName && clean(call.peer.handle, 180).toLocaleLowerCase() !== sender) return;
      call.messages.forEach(item => { if (item.role === 'user' && item.pending) item.pending = false; });
      appendCallMessage('assistant', call.peer.name, text);
      if (!call.minimized && !callOverlay) showCallOverlay();
    }

    function removeCallOverlay() {
      if (!callOverlay) return;
      callDraft = callOverlay.querySelector('.cps-call-input')?.value || '';
      removeUiDialog(callOverlay);
      callOverlay = null;
    }

    function endCall() {
      const call = chatBucket().call;
      if (call.active) appendCallMessage('system', 'SYSTEM', t('ended'));
      call.active = false;
      call.minimized = false;
      call.peer = null;
      call.unread = 0;
      saveChat();
      removeCallOverlay(); callDraft = '';
      minimizedCall?.remove(); minimizedCall = null;
      refreshPrompt();
      if (manager) renderManagerBody();
    }

    function minimizeCallWindow() {
      const call = chatBucket().call;
      if (!call.active) return;
      call.minimized = true;
      saveChat();
      removeCallOverlay();
      renderMinimizedCall();
    }

    function renderMinimizedCall() {
      minimizedCall?.remove(); minimizedCall = null;
      const call = chatBucket().call;
      if (!call.active || !call.minimized || !call.peer) return;
      const node = document.createElement('button');
      node.type = 'button';
      node.className = 'cps-call-minimized cps-ui';
      node.setAttribute('aria-label', `${t('restore')} ${call.peer.name}`);
      node.innerHTML = `${uiIcon('calls')}<span class="cps-mini-identity"><small><span class="cps-live-dot"></span>${htmlEscape(t('privateLine'))}</small><strong>${htmlEscape(call.peer.name)}</strong></span>${call.unread ? `<span class="cps-call-badge" aria-label="${htmlEscape(`${call.unread} ${t('unread')}`)}">${call.unread}</span>` : ''}${uiIcon('chevron')}`;
      let restoring = false;
      const restore = event => {
        event?.preventDefault?.(); event?.stopPropagation?.();
        if (restoring) return;
        restoring = true;
        call.minimized = false; call.unread = 0; saveChat();
        closeHostWand();
        node.remove(); minimizedCall = null;
        requestAnimationFrame(showCallOverlay);
      };
      node.addEventListener('pointerup', restore);
      node.addEventListener('click', restore);
      document.body.append(node);
      minimizedCall = node;
      if (typeof node.showPopover === 'function') { node.setAttribute('popover', 'manual'); try { node.showPopover(); } catch {} }
    }

    function updateCallComposer() {
      if (!callOverlay) return;
      const hasDraft = Boolean(clean(callOverlay.querySelector('.cps-call-input')?.value));
      const pending = chatBucket().call.messages.filter(item => item.role === 'user' && item.pending).length;
      const send = callOverlay.querySelector('.cps-call-send');
      send.disabled = callGenerating || (!hasDraft && !pending);
      send.innerHTML = `${uiIcon(callGenerating ? 'signal' : 'send')}<span>${htmlEscape(t('sendAi'))}</span>`;
      send.setAttribute('aria-busy', String(callGenerating));
      callOverlay.querySelector('[data-call-action="queue"]').disabled = !hasDraft;
      callOverlay.querySelector('.cps-call-status').textContent = callGenerating ? t('generating') : pending ? `${pending} · ${t('queuedShort')}` : t('signalReady');
    }

    function renderCallLog() {
      const log = callOverlay?.querySelector('.cps-call-log');
      if (!log) return;
      const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 60;
      const scroll = log.scrollTop;
      log.replaceChildren();
      for (const item of chatBucket().call.messages) {
        const role = ['user', 'assistant', 'system'].includes(item.role) ? item.role : 'system';
        const row = document.createElement('div');
        row.className = `cps-call-row ${role}`;
        const node = document.createElement('div');
        node.className = `cps-call-message ${role}${item.pending ? ' pending' : ''}`;
        const label = document.createElement('header');
        label.innerHTML = `<small>${htmlEscape(role === 'system' ? t('systemLabel') : role === 'user' ? t('userLabel') : item.name)}</small>${timeMarkup(item.at)}`;
        const copy = document.createElement('div'); copy.className = 'cps-signal-copy';
        copy.textContent = item.text;
        node.append(label, copy);
        if (item.pending) {
          const status = document.createElement('span'); status.className = 'cps-pending-label'; status.textContent = t('queuedShort'); node.append(status);
        }
        row.append(node); log.append(row);
      }
      requestAnimationFrame(() => { log.scrollTop = atBottom ? log.scrollHeight : scroll; });
      updateCallComposer();
    }

    function queueCallInput() {
      const input = callOverlay?.querySelector('.cps-call-input');
      const value = clean(input?.value, 4000);
      if (!value) return;
      appendCallMessage('user', context()?.name1 || 'USER', value, true);
      input.value = ''; callDraft = '';
      updateCallComposer();
      refreshPrompt(true);
      toast(t('queued'), 1700);
    }

    function recentMainChat() {
      const chat = context()?.chat;
      if (!Array.isArray(chat)) return '';
      return chat.slice(-8).map(item => `${item.is_user ? 'USER' : 'MAIN AI'}: ${clean(stripTags(item.mes), 900)}`).join('\n');
    }

    async function requestCallResponse() {
      if (callGenerating) return;
      const call = chatBucket().call;
      if (!call.active || !call.peer) return;
      const input = callOverlay?.querySelector('.cps-call-input');
      if (clean(input?.value, 4000)) queueCallInput();
      const pending = call.messages.filter(item => item.role === 'user' && item.pending);
      if (!pending.length) return;
      const generator = context()?.generateQuietPrompt;
      if (typeof generator !== 'function') { toast(t('promptUnavailable')); return; }
      const callId = call.id;
      const peer = call.peer;
      const sameCall = () => chatBucket().call === call && call.active && call.id === callId && call.peer === peer;
      pending.forEach(item => { item.pending = false; });
      saveChat(); renderCallLog();
      callGenerating = true;
      updateCallComposer();
      const profile = findEffectiveNpc(call.peer.name);
      const transcript = call.messages.slice(-30).map(item => `${item.role === 'user' ? 'USER' : item.role === 'assistant' ? call.peer.name : 'SYSTEM'}: ${item.text}`).join('\n');
      const prompt = `You are continuing a private cyberpunk call as ${call.peer.name}${call.peer.handle ? `, network handle @${call.peer.handle}` : ''}.
NPC dossier: ${profile ? JSON.stringify({ role: profile.role, status: profile.status, affiliation: profile.affiliation, appearance: profile.appearance, notes: profile.notes }) : 'Use the established main-chat characterization.'}
Recent main-chat context (context only; do not continue it as public dialogue):
${recentMainChat()}
Private call transcript:
${transcript}
Respond only as ${call.peer.name} through the private call. Return exactly one [CP_SIGNAL|${call.peer.name}]...[/CP_SIGNAL] record. No narration, no markdown fences, no public dialogue, and never write the user's reply.`;
      try {
        const result = await generator.call(context(), prompt, false, false);
        if (!sameCall()) return;
        const match = parseTagAttributes(result, 'CP_SIGNAL')[0];
        const reply = match ? clean(stripTags(match[6]), 4000) : clean(stripTags(result), 4000);
        if (!reply) throw new Error('Empty private response');
        appendCallMessage('assistant', peer.name, reply);
      } catch (error) {
        console.warn('[Cyberpunk System] Private call generation failed', error);
        if (sameCall()) {
          pending.forEach(item => { item.pending = true; }); saveChat(); renderCallLog();
          toast(t('callFailed'));
        }
      } finally {
        callGenerating = false;
        updateCallComposer();
      }
    }

    function showCallOverlay() {
      const call = chatBucket().call;
      if (!call.active || !call.peer) return;
      call.minimized = false; call.unread = 0; saveChat();
      removeCallOverlay();
      if (manager) closeManager();
      closeHostWand();
      minimizedCall?.remove(); minimizedCall = null;
      const node = document.createElement('dialog');
      node.className = 'cps-call-overlay cps-ui';
      node.setAttribute('aria-labelledby', 'cps-call-peer');
      node.innerHTML = `<header class="cps-call-header"><div class="cps-call-channel"><span class="cps-eyebrow"><span class="cps-live-dot"></span>${htmlEscape(t('privateLine'))}</span><span>${uiIcon('shield')}${htmlEscape(t('encrypted'))}</span></div>${avatarMarkup(call.peer.name)}<div class="cps-call-identity"><strong id="cps-call-peer">${htmlEscape(call.peer.name)}</strong><small>${htmlEscape(call.peer.handle ? `@${call.peer.handle}` : t('signalReady'))}</small></div><button class="cps-icon-button" type="button" data-call-action="minimize" aria-label="${htmlEscape(t('minimize'))}">${uiIcon('minimize')}</button></header><main class="cps-call-log" role="log" aria-label="${htmlEscape(t('privateLine'))}" aria-live="polite" tabindex="0"></main><footer class="cps-call-composer"><div class="cps-composer-state"><span class="cps-call-status" role="status"></span>${uiIcon('signal')}</div><textarea class="cps-call-input" rows="2" maxlength="4000" enterkeyhint="send" autocomplete="off" placeholder="${htmlEscape(t('inputPlaceholder'))}" aria-label="${htmlEscape(t('inputPlaceholder'))}" aria-describedby="cps-call-hint"></textarea><div class="cps-call-actions"><button class="cps-button danger cps-end-call" type="button">${uiIcon('end')}<span>${htmlEscape(t('endCall'))}</span></button><button class="cps-button" type="button" data-call-action="queue">${uiIcon('plus')}<span>${htmlEscape(t('queueMessage'))}</span></button><button class="cps-button primary cps-call-send" type="button" aria-label="${htmlEscape(t('sendAi'))}"></button></div><p class="cps-composer-hint" id="cps-call-hint">${htmlEscape(t('queueHint'))}</p></footer>`;
      node.querySelector('[data-call-action="minimize"]').addEventListener('click', minimizeCallWindow);
      node.querySelector('.cps-end-call').addEventListener('click', endCall);
      node.querySelector('.cps-call-send').addEventListener('click', requestCallResponse);
      node.querySelector('[data-call-action="queue"]').addEventListener('click', queueCallInput);
      const input = node.querySelector('.cps-call-input');
      input.value = callDraft;
      input.addEventListener('input', () => { callDraft = input.value; updateCallComposer(); });
      input.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); event.stopPropagation(); queueCallInput(); }
      });
      node.addEventListener('cancel', event => { event.preventDefault(); minimizeCallWindow(); });
      document.body.append(node); callOverlay = node; showUiDialog(node); renderCallLog();
      requestAnimationFrame(() => { const log = node.querySelector('.cps-call-log'); log.scrollTop = log.scrollHeight; });
      node.querySelector('[data-call-action="minimize"]').focus({ preventScroll: true });
    }

    function recordLocation(record) {
      const scope = record.scope === 'character' ? 'character' : 'chat';
      const list = bucketFor(scope)[record.kind];
      return { scope, list, index: list.findIndex(item => item.id === record.id) };
    }

    function openNpcEditor(record = null) {
      const source = record || { scope: settings().defaultScope, name: '', handle: '', role: '', status: '', affiliation: '', age: '', gender: '', appearance: '', notes: '' };
      const modal = document.createElement('dialog');
      modal.className = 'cps-modal cps-ui';
      modal.innerHTML = `<form class="cps-modal-card"><h2>${htmlEscape(record ? t('edit') : t('addNpc'))}</h2><div class="cps-form"><label><span>${htmlEscape(t('name'))}</span><input name="name" required maxlength="180" value="${htmlEscape(source.name)}"></label><label><span>${htmlEscape(t('handle'))}</span><input name="handle" maxlength="180" value="${htmlEscape(source.handle || '')}"></label><label><span>${htmlEscape(t('role'))}</span><input name="role" maxlength="240" value="${htmlEscape(source.role || '')}"></label><label><span>${htmlEscape(t('status'))}</span><input name="status" maxlength="240" value="${htmlEscape(source.status || '')}"></label><label><span>${htmlEscape(t('affiliation'))}</span><input name="affiliation" maxlength="240" value="${htmlEscape(source.affiliation || '')}"></label><label><span>${htmlEscape(t('scope'))}</span><select name="scope"><option value="chat" ${source.scope === 'chat' ? 'selected' : ''}>${htmlEscape(t('chat'))}</option><option value="character" ${source.scope === 'character' ? 'selected' : ''}>${htmlEscape(t('character'))}</option></select></label><label><span>${htmlEscape(t('age'))}</span><input name="age" maxlength="80" value="${htmlEscape(source.age || '')}"></label><label><span>${htmlEscape(t('gender'))}</span><input name="gender" maxlength="120" value="${htmlEscape(source.gender || '')}"></label><label class="wide"><span>${htmlEscape(t('appearanceField'))}</span><textarea name="appearance" maxlength="2000">${htmlEscape(source.appearance || '')}</textarea></label><label class="wide"><span>${htmlEscape(t('notes'))}</span><textarea name="notes" maxlength="3000">${htmlEscape(source.notes || '')}</textarea></label></div><div class="cps-card-actions"><button type="button" class="cps-button" data-modal-cancel>${htmlEscape(t('cancel'))}</button><button type="submit" class="cps-button primary">${htmlEscape(t('save'))}</button></div></form>`;
      const trigger = document.activeElement;
      const close = () => { removeUiDialog(modal); if (trigger?.isConnected) trigger.focus({ preventScroll: true }); };
      const heading = modal.querySelector('h2');
      const headingId = id('editor-title'); heading.id = headingId;
      const header = document.createElement('header'); header.className = 'cps-editor-header';
      heading.before(header); header.append(heading);
      const closeButton = document.createElement('button'); closeButton.type = 'button'; closeButton.className = 'cps-icon-button';
      closeButton.setAttribute('aria-label', t('close')); closeButton.innerHTML = uiIcon('close');
      closeButton.addEventListener('click', close); header.append(closeButton); modal.setAttribute('aria-labelledby', headingId);
      modal.querySelector('[data-modal-cancel]').addEventListener('click', close);
      modal.addEventListener('cancel', event => { event.preventDefault(); close(); });
      modal.addEventListener('click', event => { if (event.target === modal) close(); });
      modal.querySelector('form').addEventListener('submit', event => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget).entries());
        const scope = data.scope === 'character' ? 'character' : 'chat';
        const saved = { id: record?.id || id('npc'), name: clean(data.name, 180), handle: clean(data.handle, 180), role: clean(data.role, 240), status: clean(data.status, 240), affiliation: clean(data.affiliation, 240), age: clean(data.age, 80), gender: clean(data.gender, 120), appearance: clean(data.appearance, 2000), notes: clean(data.notes, 3000), createdAt: record?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
        if (record) {
          const oldList = bucketFor(record.scope).npcs;
          const oldIndex = oldList.findIndex(item => item.id === record.id);
          if (oldIndex >= 0) oldList.splice(oldIndex, 1);
          saveScope(record.scope);
        }
        bucketFor(scope).npcs.push(saved); saveScope(scope); refreshPrompt(); close(); renderManagerBody(); toast(t('profileSaved'));
      });
      document.body.append(modal);
      showUiDialog(modal);
      closeButton.focus({ preventScroll: true });
    }

    function openSkillEditor(record = null) {
      const source = record || { scope: settings().defaultScope, name: '', category: t('intrusion'), level: 0, max: 100, rank: 'E', notes: '' };
      const modal = document.createElement('dialog');
      modal.className = 'cps-modal cps-ui';
      modal.innerHTML = `<form class="cps-modal-card"><h2>${htmlEscape(record ? t('edit') : t('addSkill'))}</h2><div class="cps-form"><label><span>${htmlEscape(t('name'))}</span><input name="name" required maxlength="180" value="${htmlEscape(source.name)}"></label><label><span>${htmlEscape(t('category'))}</span><input name="category" maxlength="120" value="${htmlEscape(source.category || '')}"></label><label><span>${htmlEscape(t('level'))}</span><input name="level" type="number" min="0" max="100000" value="${htmlEscape(source.level)}"></label><label><span>${htmlEscape(t('maximum'))}</span><input name="max" type="number" min="1" max="100000" value="${htmlEscape(source.max)}"></label><label><span>${htmlEscape(t('rank'))}</span><input name="rank" maxlength="60" value="${htmlEscape(source.rank || '')}"></label><label><span>${htmlEscape(t('scope'))}</span><select name="scope"><option value="chat" ${source.scope === 'chat' ? 'selected' : ''}>${htmlEscape(t('chat'))}</option><option value="character" ${source.scope === 'character' ? 'selected' : ''}>${htmlEscape(t('character'))}</option></select></label><label class="wide"><span>${htmlEscape(t('notes'))}</span><textarea name="notes" maxlength="2000">${htmlEscape(source.notes || '')}</textarea></label></div><div class="cps-card-actions"><button type="button" class="cps-button" data-modal-cancel>${htmlEscape(t('cancel'))}</button><button type="submit" class="cps-button primary">${htmlEscape(t('save'))}</button></div></form>`;
      const trigger = document.activeElement;
      const close = () => { removeUiDialog(modal); if (trigger?.isConnected) trigger.focus({ preventScroll: true }); };
      const heading = modal.querySelector('h2');
      const headingId = id('editor-title'); heading.id = headingId;
      const header = document.createElement('header'); header.className = 'cps-editor-header';
      heading.before(header); header.append(heading);
      const closeButton = document.createElement('button'); closeButton.type = 'button'; closeButton.className = 'cps-icon-button';
      closeButton.setAttribute('aria-label', t('close')); closeButton.innerHTML = uiIcon('close');
      closeButton.addEventListener('click', close); header.append(closeButton); modal.setAttribute('aria-labelledby', headingId);
      modal.querySelector('[data-modal-cancel]').addEventListener('click', close);
      modal.addEventListener('cancel', event => { event.preventDefault(); close(); });
      modal.addEventListener('click', event => { if (event.target === modal) close(); });
      modal.querySelector('form').addEventListener('submit', event => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget).entries());
        const scope = data.scope === 'character' ? 'character' : 'chat';
        const max = clamp(data.max, 1, 100000);
        const saved = { id: record?.id || id('hack'), name: clean(data.name, 180), category: clean(data.category, 120), level: clamp(data.level, 0, max), max, rank: clean(data.rank, 60), notes: clean(data.notes, 2000), updatedAt: new Date().toISOString() };
        if (record) {
          const oldList = bucketFor(record.scope).skills;
          const oldIndex = oldList.findIndex(item => item.id === record.id);
          if (oldIndex >= 0) oldList.splice(oldIndex, 1);
          saveScope(record.scope);
        }
        bucketFor(scope).skills.push(saved); saveScope(scope); refreshPrompt(); close(); renderManagerBody(); toast(t('skillSaved'));
      });
      document.body.append(modal);
      showUiDialog(modal);
      closeButton.focus({ preventScroll: true });
    }

    function removeRecord(kind, record) {
      if (!globalThis.confirm(t('confirmRemove'))) return;
      const list = bucketFor(record.scope)[kind];
      const index = list.findIndex(item => item.id === record.id);
      if (index >= 0) list.splice(index, 1);
      saveScope(record.scope); refreshPrompt(); renderManagerBody();
    }

    function recordToolbar(kind, addLabel, searchLabel) {
      const state = viewState[kind];
      return `<div class="cps-toolbar"><label class="cps-search">${uiIcon('search')}<input type="search" value="${htmlEscape(state.query)}" placeholder="${htmlEscape(t(searchLabel))}" aria-label="${htmlEscape(t(searchLabel))}" autocomplete="off" data-record-search></label><button class="cps-button primary" type="button" data-record-add>${uiIcon('plus')}<span>${htmlEscape(t(addLabel))}</span></button><div class="cps-segments" role="group" aria-label="${htmlEscape(t('scope'))}">${['all', 'character', 'chat'].map(scope => `<button type="button" data-filter-scope="${scope}" aria-pressed="${state.scope === scope}">${htmlEscape(t(scope === 'all' ? 'allScopes' : scope))}</button>`).join('')}</div><span class="cps-filter-count" role="status" data-filter-count></span></div>`;
    }

    function bindRecordFilters(body, kind, add) {
      const state = viewState[kind];
      const cards = [...body.querySelectorAll('[data-record-card]')];
      const apply = () => {
        const query = state.query.trim().toLocaleLowerCase();
        let visible = 0;
        cards.forEach(card => {
          card.hidden = !((state.scope === 'all' || state.scope === card.dataset.recordScope) && (!query || card.dataset.search.includes(query)));
          if (!card.hidden) visible++;
        });
        body.querySelectorAll('[data-filter-scope]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filterScope === state.scope)));
        body.querySelector('[data-filter-count]').textContent = `${visible} / ${cards.length}`;
        const noResults = body.querySelector('[data-no-results]');
        if (noResults) noResults.hidden = visible > 0 || cards.length === 0;
      };
      body.querySelector('[data-record-add]').addEventListener('click', add);
      body.querySelector('[data-record-search]').addEventListener('input', event => { state.query = event.target.value; apply(); });
      body.querySelectorAll('[data-filter-scope]').forEach(button => button.addEventListener('click', () => { state.scope = button.dataset.filterScope; apply(); }));
      body.querySelector('[data-clear-filters]')?.addEventListener('click', () => {
        state.query = ''; state.scope = 'all'; body.querySelector('[data-record-search]').value = ''; apply();
      });
      apply();
    }

    function noResultsMarkup() {
      return `<div class="cps-no-results" data-no-results hidden><p>${htmlEscape(t('noResults'))}</p><button class="cps-button" type="button" data-clear-filters>${htmlEscape(t('clearFilters'))}</button></div>`;
    }

    function renderCharacters(body) {
      const records = effectiveRecords('npcs');
      body.innerHTML = `${sectionHeading('01', 'contactsTitle', 'contactsHint', metric(records.length.toString().padStart(2, '0'), 'identities'))}${recordToolbar('characters', 'addNpc', 'searchContacts')}<div class="cps-card-grid"></div>${noResultsMarkup()}<p class="cps-footnote">${uiIcon('shield')}${htmlEscape(t('scopeHint'))}</p>`;
      const grid = body.querySelector('.cps-card-grid');
      if (!records.length) grid.innerHTML = emptyState('characters', 'noNpcs', 'emptyContactHint');
      records.forEach(record => {
        const card = document.createElement('article');
        card.className = 'cps-card cps-contact-card';
        card.dataset.recordCard = '';
        card.dataset.recordScope = record.scope;
        card.dataset.search = [record.name, record.handle, record.role, record.affiliation].join(' ').toLocaleLowerCase();
        const facts = [['age', record.age], ['gender', record.gender]].filter(([, value]) => value);
        card.innerHTML = `<div class="cps-card-topline">${scopeBadge(record.scope)}<span class="cps-card-id">${htmlEscape(record.handle ? `@${record.handle}` : t('identity'))}</span></div><div class="cps-contact-identity">${avatarMarkup(record.name)}<div><h3>${htmlEscape(record.name)}</h3><p>${htmlEscape(record.role || t('noRole'))}</p></div></div><div class="cps-chips">${[record.affiliation, record.status].filter(Boolean).map(value => `<span>${htmlEscape(value)}</span>`).join('')}</div>${facts.length ? `<dl class="cps-facts">${facts.map(([label, value]) => `<div><dt>${htmlEscape(t(label))}</dt><dd>${htmlEscape(value)}</dd></div>`).join('')}</dl>` : ''}${record.appearance || record.notes ? `<details class="cps-dossier"><summary>${htmlEscape(t('viewDossier'))}${uiIcon('chevron')}</summary>${record.appearance ? `<p><strong>${htmlEscape(t('appearanceField'))}</strong>${htmlEscape(record.appearance)}</p>` : ''}${record.notes ? `<p><strong>${htmlEscape(t('notes'))}</strong>${htmlEscape(record.notes)}</p>` : ''}</details>` : ''}<footer class="cps-card-actions"><button class="cps-button primary" type="button" data-action="call">${uiIcon('calls')}<span>${htmlEscape(t('call'))}</span></button><button class="cps-button" type="button" data-action="edit">${uiIcon('edit')}<span>${htmlEscape(t('edit'))}</span></button><button class="cps-icon-button danger" type="button" data-action="remove" aria-label="${htmlEscape(`${t('remove')} ${record.name}`)}">${uiIcon('trash')}</button></footer>`;
        card.querySelector('[data-action="call"]').addEventListener('click', () => { closeManager(); startCall(record, false); });
        card.querySelector('[data-action="edit"]').addEventListener('click', () => openNpcEditor(record));
        card.querySelector('[data-action="remove"]').addEventListener('click', () => removeRecord('npcs', record));
        grid.append(card);
      });
      bindRecordFilters(body, 'characters', () => openNpcEditor());
    }

    function renderHacking(body) {
      const records = effectiveRecords('skills');
      const average = records.length ? Math.round(records.reduce((sum, record) => sum + clamp(Number(record.level) / Math.max(1, Number(record.max)) * 100, 0, 100), 0) / records.length) : 0;
      body.innerHTML = `${sectionHeading('02', 'skillsTitle', 'skillsHint', metric(records.length.toString().padStart(2, '0'), 'protocols'))}<div class="cps-deck-summary">${uiIcon('chip')}<span>${htmlEscape(t('mastery'))}</span><strong>${average}%</strong><div class="cps-progress" style="--cps-progress:${average}%" aria-hidden="true"><i></i></div></div>${recordToolbar('hacking', 'addSkill', 'searchSkills')}<div class="cps-card-grid"></div>${noResultsMarkup()}`;
      const grid = body.querySelector('.cps-card-grid');
      if (!records.length) grid.innerHTML = emptyState('hacking', 'noSkills', 'emptySkillHint');
      records.forEach(record => {
        const progress = clamp((Number(record.level) / Math.max(1, Number(record.max))) * 100, 0, 100);
        const card = document.createElement('article');
        card.className = 'cps-card cps-skill-card';
        card.dataset.recordCard = '';
        card.dataset.recordScope = record.scope;
        card.dataset.search = [record.name, record.category, record.rank, record.notes].join(' ').toLocaleLowerCase();
        card.innerHTML = `<div class="cps-card-topline">${scopeBadge(record.scope)}<span class="cps-card-id">${htmlEscape(record.category || t('general'))}</span></div><div class="cps-skill-identity"><span class="cps-skill-glyph">${uiIcon('hacking')}</span><div><h3>${htmlEscape(record.name)}</h3><span class="cps-muted">${htmlEscape(t('level'))}</span></div><span class="cps-rank"><small>${htmlEscape(t('rank'))}</small><strong>${htmlEscape(record.rank || 'E')}</strong></span></div><div class="cps-skill-values"><strong>${htmlEscape(record.level)} <small>/ ${htmlEscape(record.max)}</small></strong><span>${Math.round(progress)}%</span></div><div class="cps-progress" style="--cps-progress:${progress}%" role="progressbar" aria-label="${htmlEscape(record.name)}" aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100"><i></i></div>${record.notes ? `<p class="cps-skill-note">${htmlEscape(record.notes)}</p>` : ''}<footer class="cps-card-actions"><button class="cps-button" type="button" data-action="edit">${uiIcon('edit')}<span>${htmlEscape(t('edit'))}</span></button><button class="cps-icon-button danger" type="button" data-action="remove" aria-label="${htmlEscape(`${t('remove')} ${record.name}`)}">${uiIcon('trash')}</button></footer>`;
        card.querySelector('[data-action="edit"]').addEventListener('click', () => openSkillEditor(record));
        card.querySelector('[data-action="remove"]').addEventListener('click', () => removeRecord('skills', record));
        grid.append(card);
      });
      bindRecordFilters(body, 'hacking', () => openSkillEditor());
    }

    function renderCalls(body) {
      const call = chatBucket().call;
      body.innerHTML = `${sectionHeading('03', 'callsTitle', 'callsHint', metric(call.messages.length, 'signalCount'))}<section class="cps-active-signal">${call.active && call.peer ? `<div class="cps-contact-identity">${avatarMarkup(call.peer.name)}<div><span class="cps-eyebrow"><span class="cps-live-dot"></span>${htmlEscape(t('active'))}</span><h3>${htmlEscape(call.peer.name)}</h3><p>${htmlEscape(call.peer.handle ? `@${call.peer.handle}` : t('encrypted'))}</p></div></div><div class="cps-card-actions"><button class="cps-button primary" type="button" data-action="restore-call">${uiIcon('calls')}${htmlEscape(t('restore'))}</button><button class="cps-button danger" type="button" data-action="end-call">${uiIcon('end')}${htmlEscape(t('endCall'))}</button></div>` : `${emptyState('calls', 'noActiveCall', 'emptyCallHint')}<button class="cps-button primary" type="button" data-action="browse-contacts">${uiIcon('characters')}${htmlEscape(t('browseContacts'))}</button>`}</section><div class="cps-list-heading"><h3>${htmlEscape(t('history'))}</h3><span>${htmlEscape(t('localChat'))}</span></div><div class="cps-timeline" data-call-history></div>`;
      body.querySelector('[data-action="restore-call"]')?.addEventListener('click', () => { closeManager(); showCallOverlay(); });
      body.querySelector('[data-action="end-call"]')?.addEventListener('click', endCall);
      body.querySelector('[data-action="browse-contacts"]')?.addEventListener('click', () => selectManagerTab('characters'));
      const history = body.querySelector('[data-call-history]');
      if (!call.messages.length) { history.innerHTML = `<p class="cps-muted">${htmlEscape(t('noCalls'))}</p>`; return; }
      call.messages.slice().reverse().forEach(item => {
        const role = ['user', 'assistant', 'system'].includes(item.role) ? item.role : 'system';
        const card = document.createElement('article'); card.className = `cps-history-item ${role}`;
        card.innerHTML = `<header><span>${htmlEscape(role === 'system' ? t('systemLabel') : item.name)}</span>${timeMarkup(item.at)}</header><p>${htmlEscape(item.text)}</p>`;
        history.append(card);
      });
    }

    function configField(label, control, className = '') { return `<label class="cps-config-field ${className}"><span>${htmlEscape(label)}</span>${control}</label>`; }
    function configToggle(label, name, value) {
      return `<label class="cps-config-toggle"><span>${htmlEscape(label)}</span><input name="${name}" type="checkbox" role="switch" ${value ? 'checked' : ''}><i aria-hidden="true"></i><small data-switch-state="${name}">${htmlEscape(t(value ? 'on' : 'off'))}</small></label>`;
    }
    function configRange(label, name, min, max, step, value, suffix) {
      const progress = clamp((value - min) / (max - min) * 100, 0, 100);
      return `<label class="cps-config-field cps-config-range"><span>${htmlEscape(label)} <output data-config-output="${name}">${htmlEscape(value)}${suffix}</output></span><input name="${name}" type="range" min="${min}" max="${max}" step="${step}" value="${htmlEscape(value)}" style="--cps-range:${progress}%"></label>`;
    }
    function configSelect(name, value, options) {
      return `<select name="${name}">${options.map(([key, label]) => `<option value="${key}" ${value === key ? 'selected' : ''}>${htmlEscape(label)}</option>`).join('')}</select>`;
    }
    function configGroup(key, title, hint, icon, content) {
      return `<details class="cps-config-group" data-config-section="${key}" ${configSections.has(key) ? 'open' : ''}><summary>${uiIcon(icon)}<span><strong>${htmlEscape(t(title))}</strong><small>${htmlEscape(t(hint))}</small></span>${uiIcon('chevron')}</summary><div class="cps-form">${content}</div></details>`;
    }

    function renderConfig(body) {
      const s = settings();
      const colorKeys = ['accent', 'danger', 'surface', 'text'];
      const paletteMarkup = Object.entries(PALETTES).map(([key, palette]) => `<button class="cps-palette" type="button" data-palette="${key}" aria-pressed="${colorKeys.every(color => s[color] === palette[color])}"><span class="cps-palette-swatches" aria-hidden="true">${[palette.surface, palette.accent, palette.danger].map(color => `<i style="background:${color}"></i>`).join('')}</span><span>${palette.name}</span>${uiIcon('check')}</button>`).join('');
      const colors = colorKeys.map(key => configField(t(key === 'text' ? 'textColor' : key), `<span class="cps-color-control"><input name="${key}" type="color" value="${htmlEscape(s[key])}"><output data-color-output="${key}">${htmlEscape(s[key])}</output></span>`, 'cps-config-color')).join('');
      const appearance = `<fieldset class="cps-palette-field wide"><legend>${htmlEscape(t('palette'))}</legend><div class="cps-palette-grid">${paletteMarkup}</div></fieldset><div class="cps-theme-preview wide"><span class="cps-eyebrow">${htmlEscape(t('livePreview'))}</span><div class="cps-preview-identity">${uiIcon('signal')}<strong>NEURAL LINK</strong><span class="cps-status-tag">${htmlEscape(t('signalReady'))}</span></div><p>${htmlEscape(t('previewLine'))}</p></div>${colors}<div class="wide"><button class="cps-button" type="button" data-reset-appearance>${htmlEscape(t('resetAppearance'))}</button></div>`;
      const layout = `${configRange(t('uiScale'), 'uiScale', 80, 120, 2, s.uiScale, '%')}${configField(t('density'), configSelect('density', s.density, ['comfortable','compact'].map(key => [key, t(key)])))}${configRange(t('callOpacity'), 'callOpacity', 20, 90, 5, s.callOpacity, '%')}${configRange(t('callBlur'), 'callBlur', 0, 24, 1, s.callBlur, 'px')}${configField(t('animationSpeed'), configSelect('animationSpeed', s.animationSpeed, ['off','slow','normal','fast'].map(key => [key, t(key)])))}${configField(t('headerPosition'), configSelect('headerPosition', s.headerPosition, ['left','center','right'].map(key => [key, t(key)])))}${configToggle(t('scanlines'), 'scanlines', s.scanlines)}`;
      const behavior = `${[['enableSystem','enabled'],['showWand','showWand'],['autoProfiles','autoProfiles'],['hackingTracking','hackingEnabled']].map(([label,key]) => configToggle(t(label), key, s[key])).join('')}${configField(t('language'), configSelect('language', s.language, [['en','English'],['th','ไทย']]))}${configField(t('defaultScope'), configSelect('defaultScope', s.defaultScope, ['chat','character'].map(key => [key,t(key)])))}${configField(t('callHistory'), `<input name="callHistoryLimit" type="number" min="20" max="300" step="10" inputmode="numeric" value="${htmlEscape(s.callHistoryLimit)}">`)}`;
      const protocol = `${configToggle(t('teachAi'), 'injectPrompt', s.injectPrompt)}${configToggle(t('callSignals'), 'callMainSignals', s.callMainSignals)}<p class="cps-inline-note wide">${uiIcon('shield')}${htmlEscape(t('quotaNote'))}</p><label class="cps-config-field wide"><span>${htmlEscape(t('customInstructions'))}</span><textarea name="customPrompt" rows="5" maxlength="6000">${htmlEscape(s.customPrompt)}</textarea></label><details class="cps-tag-reference wide"><summary>${htmlEscape(t('tagReference'))}</summary><pre>[CP_HEADER|Name|role|status][/CP_HEADER]
[CP_DIALOGUE|Name]Spoken words[/CP_DIALOGUE]
[CP_MONOLOGUE|Name]Private thoughts[/CP_MONOLOGUE]
[CP_CALL_REQUEST|Name|handle]Reason[/CP_CALL_REQUEST]
[CP_SIGNAL|Name]Private call speech[/CP_SIGNAL]
[CP_HACK|Skill|category|delta|max]Update[/CP_HACK]</pre></details>`;
      body.innerHTML = `${sectionHeading('04', 'configTitle', 'customize')}<div class="cps-save-status" role="status">${uiIcon('check')}${htmlEscape(t('saved'))}</div><form class="cps-config-form" data-config-form>${configGroup('appearance','appearance','appearanceHint','config',appearance)}${configGroup('layout','layout','appearanceHint','chip',layout)}${configGroup('behavior','coreBehavior','behaviorHint','signal',behavior)}${configGroup('protocol','aiProtocol','protocolHint','shield',protocol)}</form>`;
      const form = body.querySelector('[data-config-form]');
      form.addEventListener('submit', event => event.preventDefault());
      form.querySelectorAll('[data-config-section]').forEach(section => section.addEventListener('toggle', () => {
        if (section.open) configSections.add(section.dataset.configSection);
        else configSections.delete(section.dataset.configSection);
      }));
      const save = () => { saveSettings(); applyTheme(); ensureWandButton(); refreshPrompt(); bindSettingsValues(); };
      const updatePalettes = () => form.querySelectorAll('[data-palette]').forEach(button => {
        button.setAttribute('aria-pressed', String(colorKeys.every(key => s[key] === PALETTES[button.dataset.palette][key])));
      });
      form.querySelectorAll('[data-palette]').forEach(button => button.addEventListener('click', () => {
        const palette = PALETTES[button.dataset.palette];
        for (const key of colorKeys) {
          s[key] = palette[key]; form.elements[key].value = s[key];
          form.querySelector(`[data-color-output="${key}"]`).textContent = s[key];
        }
        save(); updatePalettes();
      }));
      form.querySelector('[data-reset-appearance]').addEventListener('click', () => {
        for (const key of [...colorKeys,'uiScale','callOpacity','callBlur','animationSpeed','density','scanlines']) s[key] = DEFAULTS[key];
        save(); renderConfig(body);
      });
      form.addEventListener('input', event => {
        const target = event.target;
        if (!target.name || !Object.hasOwn(DEFAULTS, target.name)) return;
        const numeric = ['uiScale', 'callOpacity', 'callBlur', 'callHistoryLimit'].includes(target.name);
        if (numeric && !target.validity.valid) return;
        s[target.name] = target.type === 'checkbox' ? target.checked : numeric ? Number(target.value) : target.value;
        const output = form.querySelector(`[data-config-output="${target.name}"]`);
        if (output) output.textContent = `${target.value}${target.name === 'callBlur' ? 'px' : '%'}`;
        if (target.type === 'range') target.style.setProperty('--cps-range', `${clamp((target.value - target.min) / (target.max - target.min) * 100, 0, 100)}%`);
        const colorOutput = form.querySelector(`[data-color-output="${target.name}"]`);
        if (colorOutput) { colorOutput.textContent = target.value; updatePalettes(); }
        const switchState = form.querySelector(`[data-switch-state="${target.name}"]`);
        if (switchState) switchState.textContent = t(target.checked ? 'on' : 'off');
        save();
        if (target.name === 'language') {
          const scroll = body.scrollTop;
          renderManager();
          manager.querySelector('.cps-panel-body').scrollTop = scroll;
          manager.querySelector('[name="language"]')?.focus({ preventScroll: true });
        }
      });
    }

    function renderManagerBody() {
      const body = manager?.querySelector('.cps-panel-body');
      if (!body) return;
      const scroll = body.scrollTop;
      body.setAttribute('aria-labelledby', `cps-tab-${managerTab}`);
      if (managerTab === 'characters') renderCharacters(body);
      else if (managerTab === 'hacking') renderHacking(body);
      else if (managerTab === 'calls') renderCalls(body);
      else renderConfig(body);
      body.scrollTop = scroll;
    }

    function selectManagerTab(tab) {
      managerTab = tab;
      manager.querySelectorAll('[data-tab]').forEach(button => {
        const selected = button.dataset.tab === tab;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      manager.querySelector('.cps-panel-body').scrollTop = 0;
      renderManagerBody();
    }

    function renderManager() {
      if (!manager) return;
      manager.lang = settings().language;
      manager.innerHTML = `<section class="cps-panel"><header class="cps-panel-header"><span class="cps-brand-mark">${uiIcon('chip')}</span><div class="cps-panel-title"><span class="cps-eyebrow">NEURAL INTERFACE <span class="cps-version">v${CYBERPUNK_SYSTEM_VERSION}</span></span><strong id="cps-manager-title">${htmlEscape(t('appName'))}</strong></div><button class="cps-icon-button" type="button" data-action="close-manager" aria-label="${htmlEscape(t('close'))}">${uiIcon('close')}</button></header><nav class="cps-tabs" role="tablist" aria-label="${htmlEscape(t('appName'))}">${['characters','hacking','calls','config'].map((tab,index) => `<button class="cps-tab" type="button" id="cps-tab-${tab}" role="tab" aria-controls="cps-manager-content" aria-selected="${managerTab === tab}" tabindex="${managerTab === tab ? 0 : -1}" data-tab="${tab}"><span class="cps-tab-number" aria-hidden="true">0${index + 1}</span>${uiIcon(tab)}<span>${htmlEscape(t(tab))}</span></button>`).join('')}</nav><main class="cps-panel-body" id="cps-manager-content" role="tabpanel" tabindex="0"></main></section>`;
      manager.querySelector('[data-action="close-manager"]').addEventListener('click', closeManager);
      const tabs = [...manager.querySelectorAll('[data-tab]')];
      tabs.forEach((button, index) => {
        button.addEventListener('click', () => selectManagerTab(button.dataset.tab));
        button.addEventListener('keydown', event => {
          const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
          if (next === null) return;
          event.preventDefault(); selectManagerTab(tabs[next].dataset.tab); tabs[next].focus();
        });
      });
      renderManagerBody();
    }

    function closeManager() {
      removeUiDialog(manager); manager = null;
      if (managerTrigger?.isConnected) managerTrigger.focus({ preventScroll: true });
    }

    function openManager() {
      if (manager?.open) return;
      managerTrigger = document.activeElement;
      if (callOverlay) minimizeCallWindow();
      closeHostWand();
      removeUiDialog(manager);
      const node = document.createElement('dialog');
      node.className = 'cps-overlay cps-ui';
      node.setAttribute('aria-labelledby', 'cps-manager-title');
      node.addEventListener('click', event => { if (event.target === node) closeManager(); });
      node.addEventListener('cancel', event => { event.preventDefault(); closeManager(); });
      document.body.append(node); manager = node; renderManager(); showUiDialog(node);
      node.querySelector('[data-action="close-manager"]').focus({ preventScroll: true });
    }

    function bindSettingsValues() {
      const root = document.getElementById('cyberpunk-system-settings');
      if (!root) return;
      root.lang = settings().language;
      const enabled = root.querySelector('#cps-enabled');
      if (enabled) enabled.checked = settings().enabled;
      translate(root);
    }

    function bindSettings() {
      const root = document.getElementById('cyberpunk-system-settings');
      if (!root || settingsBound) return;
      settingsBound = true;
      root.querySelector('#cps-enabled')?.addEventListener('input', event => {
        settings().enabled = event.target.checked; saveSettings(); refreshPrompt();
      });
      root.querySelector('#cps-open-manager')?.addEventListener('click', openManager);
      root.querySelector('#cps-open-config')?.addEventListener('click', () => { managerTab = 'config'; openManager(); });
      bindSettingsValues();
    }

    async function injectSettings() {
      if (document.getElementById('cyberpunk-system-settings')) { bindSettings(); return; }
      const host = document.getElementById('extensions_settings2');
      if (!host) return;
      try {
        const response = await fetch(new URL(`./settings.html?v=${CYBERPUNK_SYSTEM_VERSION}`, import.meta.url));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        host.insertAdjacentHTML('beforeend', await response.text());
        bindSettings();
      } catch (error) { console.warn('[Cyberpunk System] Settings template unavailable', error); }
    }

    function bindEvents() {
      const ctx = context();
      const source = ctx?.eventSource;
      const types = ctx?.event_types;
      if (!source?.on || !types) return;
      const listen = (name, handler) => { if (types[name] !== undefined) source.on(types[name], handler); };
      listen('MESSAGE_RECEIVED', onAssistantMessage);
      listen('MESSAGE_UPDATED', onAssistantMessage);
      listen('CHAT_CHANGED', () => { removeCallOverlay(); callDraft = ''; incomingWindow?.remove(); incomingWindow = null; pendingIncomingCall = null; processedMessages.clear(); refreshPrompt(); renderVisibleMessages(); renderMinimizedCall(); if (manager) renderManager(); });
      listen('CHARACTER_MESSAGE_RENDERED', onAssistantMessage);
      listen('GENERATION_STARTED', () => refreshPrompt(true));
      listen('MESSAGE_SENT', () => refreshPrompt(true));
    }

    function exposeApi() {
      globalThis.CyberpunkSystem = Object.freeze({
        version: CYBERPUNK_SYSTEM_VERSION,
        open: openManager,
        startCall: (name, handle = '') => startCall({ name, handle }, false),
        receiveCall: (name, handle = '', reason = '') => showIncomingCall({ name, handle, reason }),
        endCall,
        getNpcs: () => clone(effectiveRecords('npcs')),
        getHackingSkills: () => clone(effectiveRecords('skills')),
        refreshPrompt,
      });
    }

    async function initialize() {
      settings(); applyTheme(); exposeApi(); bindEvents(); refreshPrompt();
      await injectSettings(); ensureWandButton(); renderVisibleMessages(); renderMinimizedCall();
      const dirtyMessages = new Set();
      let renderFrame = 0;
      const scheduleMessageRender = node => {
        const element = node?.nodeType === Node.TEXT_NODE ? node.parentElement?.closest?.('.mes_text') : node instanceof HTMLElement ? (node.matches?.('.mes_text') ? node : node.closest?.('.mes_text')) : null;
        if (!element) return;
        dirtyMessages.add(element);
        if (renderFrame) return;
        renderFrame = requestAnimationFrame(() => {
          renderFrame = 0;
          const batch = [...dirtyMessages]; dirtyMessages.clear();
          batch.forEach(message => renderMessageElement(message));
        });
      };
      const observer = new MutationObserver(mutations => {
        let shouldCheckWand = false;
        for (const mutation of mutations) {
          if (mutation.type === 'characterData') {
            scheduleMessageRender(mutation.target);
            continue;
          }
          if (mutation.type !== 'childList') continue;
          shouldCheckWand = true;
          scheduleMessageRender(mutation.target);
          mutation.addedNodes.forEach(node => {
            scheduleMessageRender(node);
            if (node instanceof HTMLElement) node.querySelectorAll?.('.mes_text').forEach(scheduleMessageRender);
          });
        }
        if (shouldCheckWand) ensureWandButton();
      });
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      setTimeout(() => { injectSettings(); ensureWandButton(); }, 1200);
      console.info(`[Cyberpunk System] v${CYBERPUNK_SYSTEM_VERSION} initialized`);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
    else await initialize();
  })();
}

await globalThis.CyberpunkSystemRuntimePromise;
