const CYBERPUNK_SYSTEM_VERSION = '1.0.1';
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
      accent: '#00f0ff',
      danger: '#ff2a6d',
      surface: '#071117',
      text: '#e8fbff',
      uiScale: 100,
      callOpacity: 60,
      callBlur: 10,
      animationSpeed: 'normal',
      customPrompt: '',
      characters: {},
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

    let manager = null;
    let managerTab = 'characters';
    let callOverlay = null;
    let minimizedCall = null;
    let incomingWindow = null;
    let pendingIncomingCall = null;
    let promptTimer = null;
    let settingsBound = false;
    let callGenerating = false;
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
      document.documentElement.lang ||= s.language;
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
      node.textContent = clean(message, 500);
      document.body.append(node);
      setTimeout(() => node.remove(), duration);
    }

    function closeHostWand() {
      const menu = document.getElementById('extensionsMenu');
      if (!menu) return;
      const toggle = document.querySelector('#extensionsMenuButton, [data-drawer-id="extensionsMenu"], [aria-controls="extensionsMenu"]');
      if (toggle instanceof HTMLElement && toggle.getAttribute('aria-expanded') === 'true') toggle.click();
      globalThis.jQuery?.(menu).stop(true, true).hide();
      menu.style.display = 'none';
      if (toggle instanceof HTMLElement) toggle.setAttribute('aria-expanded', 'false');
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
      button.addEventListener('click', () => { closeHostWand(); openManager(); });
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
      const displayRole = stripTags(role) || npc?.role || 'UNREGISTERED IDENTITY';
      const displayStatus = stripTags(status) || npc?.status || 'SIGNAL LINKED';
      const extra = [npc?.affiliation, npc?.handle ? `@${npc.handle}` : ''].filter(Boolean);
      return `<section class="cps-chat-block cps-chat-header" data-position="${htmlEscape(settings().headerPosition)}"><div><div class="cps-chat-name">${htmlEscape(displayName)}</div><div class="cps-chat-role">${htmlEscape(displayRole)}</div><div class="cps-chat-meta"><span>${htmlEscape(displayStatus)}</span>${extra.map(item => `<span>${htmlEscape(item)}</span>`).join('')}</div></div></section>`;
    }

    function speechHtml(kind, name, content) {
      const label = kind === 'monologue' ? 'PRIVATE THOUGHT // ความคิดส่วนตัว' : 'VOICE CHANNEL // ช่องเสียง';
      return `<section class="cps-chat-block cps-chat-${kind}"><div class="cps-chat-kicker">${htmlEscape(stripTags(name))} · ${label}</div><div class="cps-chat-copy">${content}</div></section>`;
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
      node.innerHTML = `<div class="cps-incoming-head">${htmlEscape(t('incoming'))}</div><div class="cps-incoming-body"><div class="cps-incoming-name">${htmlEscape(peer.name)}</div><div>${htmlEscape(peer.handle ? `@${peer.handle}` : t('encrypted'))}</div><div class="cps-incoming-reason">${htmlEscape(peer.reason || '')}</div></div><div class="cps-incoming-actions"><button class="cps-button danger" data-action="decline">${htmlEscape(t('decline'))}</button><button class="cps-button primary" data-action="accept">${htmlEscape(t('accept'))}</button></div>`;
      node.querySelector('[data-action="decline"]').addEventListener('click', () => { node.remove(); incomingWindow = null; pendingIncomingCall = null; });
      node.querySelector('[data-action="accept"]').addEventListener('click', () => {
        const accepted = pendingIncomingCall || { ...peer, signals: [] };
        node.remove(); incomingWindow = null; pendingIncomingCall = null;
        startCall(accepted, true);
        accepted.signals.forEach(signal => appendCallMessage('assistant', signal.name || accepted.name, signal.text));
      });
      document.body.append(node);
      incomingWindow = node;
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
      if (!call.minimized) showCallOverlay();
    }

    function endCall() {
      const call = chatBucket().call;
      if (call.active) appendCallMessage('system', 'SYSTEM', t('ended'));
      call.active = false;
      call.minimized = false;
      call.peer = null;
      call.unread = 0;
      saveChat();
      callOverlay?.remove(); callOverlay = null;
      minimizedCall?.remove(); minimizedCall = null;
      refreshPrompt();
      if (manager) renderManagerBody();
    }

    function minimizeCallWindow() {
      const call = chatBucket().call;
      if (!call.active) return;
      call.minimized = true;
      saveChat();
      callOverlay?.remove(); callOverlay = null;
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
      node.innerHTML = `<span class="cps-live-dot"></span><span>${htmlEscape(call.peer.name)}</span>${call.unread ? `<span class="cps-call-badge">${call.unread}</span>` : ''}`;
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
    }

    function renderCallLog() {
      const log = callOverlay?.querySelector('.cps-call-log');
      if (!log) return;
      log.replaceChildren();
      for (const item of chatBucket().call.messages) {
        const row = document.createElement('div');
        row.className = `cps-call-row ${item.role}`;
        const node = document.createElement('div');
        node.className = `cps-call-message ${item.role}${item.pending ? ' pending' : ''}`;
        const label = document.createElement('small');
        label.textContent = item.role === 'system' ? 'SYSTEM' : item.name;
        const copy = document.createElement('div');
        copy.textContent = item.text;
        node.append(label, copy);
        row.append(node);
        log.append(row);
      }
      requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; });
    }

    function queueCallInput() {
      const input = callOverlay?.querySelector('.cps-call-input');
      const value = clean(input?.value, 4000);
      if (!value) return;
      appendCallMessage('user', context()?.name1 || 'USER', value, true);
      input.value = '';
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
      pending.forEach(item => { item.pending = false; });
      saveChat(); renderCallLog();
      callGenerating = true;
      const send = callOverlay?.querySelector('.cps-call-send');
      if (send) { send.disabled = true; send.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; }
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
        const match = parseTagAttributes(result, 'CP_SIGNAL')[0];
        const reply = match ? clean(stripTags(match[6]), 4000) : clean(stripTags(result), 4000);
        if (reply) appendCallMessage('assistant', call.peer.name, reply);
      } catch (error) {
        console.warn('[Cyberpunk System] Private call generation failed', error);
        toast(t('callFailed'));
      } finally {
        callGenerating = false;
        const currentSend = callOverlay?.querySelector('.cps-call-send');
        if (currentSend) { currentSend.disabled = false; currentSend.innerHTML = '<i class="fa-solid fa-paper-plane"></i><span class="sr-only">AI</span>'; }
      }
    }

    function showCallOverlay() {
      const call = chatBucket().call;
      if (!call.active || !call.peer) return;
      call.minimized = false; call.unread = 0; saveChat();
      closeHostWand();
      minimizedCall?.remove(); minimizedCall = null;
      callOverlay?.remove();
      const node = document.createElement('section');
      node.className = 'cps-call-overlay cps-ui';
      node.innerHTML = `<header class="cps-call-header"><span class="cps-live-dot"></span><div class="cps-call-identity"><strong>${htmlEscape(call.peer.name)}</strong><small>${htmlEscape(call.peer.handle ? `@${call.peer.handle} · ${t('encrypted')}` : t('encrypted'))}</small></div><button class="cps-icon-button" type="button" data-call-action="minimize" aria-label="${htmlEscape(t('minimize'))}"><i class="fa-solid fa-window-minimize"></i></button></header><main class="cps-call-log" aria-live="polite"></main><footer class="cps-call-composer"><input class="cps-call-input" type="text" maxlength="4000" enterkeyhint="send" autocomplete="off" placeholder="${htmlEscape(t('inputPlaceholder'))}" aria-description="${htmlEscape(t('queueHint'))}"><button class="cps-button primary cps-call-send" type="button" aria-label="AI"><i class="fa-solid fa-paper-plane"></i><span class="sr-only">AI</span></button><button class="cps-button danger cps-end-call" type="button">${htmlEscape(t('endCall'))}</button></footer>`;
      node.querySelector('[data-call-action="minimize"]').addEventListener('click', minimizeCallWindow);
      node.querySelector('.cps-end-call').addEventListener('click', endCall);
      node.querySelector('.cps-call-send').addEventListener('click', requestCallResponse);
      node.querySelector('.cps-call-input').addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); queueCallInput(); }
      });
      document.body.append(node);
      callOverlay = node;
      renderCallLog();
      setTimeout(() => node.querySelector('.cps-call-input')?.focus({ preventScroll: true }), 50);
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
      const close = () => { try { modal.close(); } catch {} modal.remove(); };
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
      if (typeof modal.showModal === 'function') modal.showModal();
      else modal.setAttribute('open', '');
    }

    function openSkillEditor(record = null) {
      const source = record || { scope: settings().defaultScope, name: '', category: t('intrusion'), level: 0, max: 100, rank: 'E', notes: '' };
      const modal = document.createElement('dialog');
      modal.className = 'cps-modal cps-ui';
      modal.innerHTML = `<form class="cps-modal-card"><h2>${htmlEscape(record ? t('edit') : t('addSkill'))}</h2><div class="cps-form"><label><span>${htmlEscape(t('name'))}</span><input name="name" required maxlength="180" value="${htmlEscape(source.name)}"></label><label><span>${htmlEscape(t('category'))}</span><input name="category" maxlength="120" value="${htmlEscape(source.category || '')}"></label><label><span>${htmlEscape(t('level'))}</span><input name="level" type="number" min="0" max="100000" value="${htmlEscape(source.level)}"></label><label><span>${htmlEscape(t('maximum'))}</span><input name="max" type="number" min="1" max="100000" value="${htmlEscape(source.max)}"></label><label><span>${htmlEscape(t('rank'))}</span><input name="rank" maxlength="60" value="${htmlEscape(source.rank || '')}"></label><label><span>${htmlEscape(t('scope'))}</span><select name="scope"><option value="chat" ${source.scope === 'chat' ? 'selected' : ''}>${htmlEscape(t('chat'))}</option><option value="character" ${source.scope === 'character' ? 'selected' : ''}>${htmlEscape(t('character'))}</option></select></label><label class="wide"><span>${htmlEscape(t('notes'))}</span><textarea name="notes" maxlength="2000">${htmlEscape(source.notes || '')}</textarea></label></div><div class="cps-card-actions"><button type="button" class="cps-button" data-modal-cancel>${htmlEscape(t('cancel'))}</button><button type="submit" class="cps-button primary">${htmlEscape(t('save'))}</button></div></form>`;
      const close = () => { try { modal.close(); } catch {} modal.remove(); };
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
      if (typeof modal.showModal === 'function') modal.showModal();
      else modal.setAttribute('open', '');
    }

    function removeRecord(kind, record) {
      if (!globalThis.confirm(t('confirmRemove'))) return;
      const list = bucketFor(record.scope)[kind];
      const index = list.findIndex(item => item.id === record.id);
      if (index >= 0) list.splice(index, 1);
      saveScope(record.scope); refreshPrompt(); renderManagerBody();
    }

    function renderCharacters(body) {
      const records = effectiveRecords('npcs');
      body.innerHTML = `<div class="cps-toolbar"><button class="cps-button primary" data-action="add-npc"><i class="fa-solid fa-user-plus"></i> ${htmlEscape(t('addNpc'))}</button></div><div class="cps-card-grid"></div>`;
      body.querySelector('[data-action="add-npc"]').addEventListener('click', () => openNpcEditor());
      const grid = body.querySelector('.cps-card-grid');
      if (!records.length) { grid.innerHTML = `<div class="cps-empty">${htmlEscape(t('noNpcs'))}</div>`; return; }
      records.forEach(record => {
        const card = document.createElement('article');
        card.className = 'cps-card';
        card.innerHTML = `<span class="cps-scope">${htmlEscape(t(record.scope))}</span><h3>${htmlEscape(record.name)}</h3><p>${htmlEscape(record.handle ? `@${record.handle}` : record.role || 'UNREGISTERED')}</p><p>${htmlEscape([record.affiliation, record.status].filter(Boolean).join(' · '))}</p><div class="cps-card-actions"><button class="cps-button" data-action="call"><i class="fa-solid fa-phone"></i> ${htmlEscape(t('call'))}</button><button class="cps-button" data-action="edit">${htmlEscape(t('edit'))}</button><button class="cps-button danger" data-action="remove">${htmlEscape(t('remove'))}</button></div>`;
        card.querySelector('[data-action="call"]').addEventListener('click', () => { manager?.remove(); manager = null; startCall(record, false); });
        card.querySelector('[data-action="edit"]').addEventListener('click', () => openNpcEditor(record));
        card.querySelector('[data-action="remove"]').addEventListener('click', () => removeRecord('npcs', record));
        grid.append(card);
      });
    }

    function renderHacking(body) {
      const records = effectiveRecords('skills');
      body.innerHTML = `<div class="cps-toolbar"><button class="cps-button primary" data-action="add-skill"><i class="fa-solid fa-code"></i> ${htmlEscape(t('addSkill'))}</button></div><div class="cps-card-grid"></div>`;
      body.querySelector('[data-action="add-skill"]').addEventListener('click', () => openSkillEditor());
      const grid = body.querySelector('.cps-card-grid');
      if (!records.length) { grid.innerHTML = `<div class="cps-empty">${htmlEscape(t('noSkills'))}</div>`; return; }
      records.forEach(record => {
        const progress = clamp((Number(record.level) / Math.max(1, Number(record.max))) * 100, 0, 100);
        const card = document.createElement('article');
        card.className = 'cps-card';
        card.innerHTML = `<span class="cps-scope">${htmlEscape(t(record.scope))}</span><h3>${htmlEscape(record.name)}</h3><p>${htmlEscape(record.category || t('general'))} · ${htmlEscape(t('rank'))} ${htmlEscape(record.rank || 'E')}</p><div class="cps-progress" style="--cps-progress:${progress}%"><i></i></div><p>${htmlEscape(record.level)} / ${htmlEscape(record.max)}</p><p>${htmlEscape(record.notes || '')}</p><div class="cps-card-actions"><button class="cps-button" data-action="edit">${htmlEscape(t('edit'))}</button><button class="cps-button danger" data-action="remove">${htmlEscape(t('remove'))}</button></div>`;
        card.querySelector('[data-action="edit"]').addEventListener('click', () => openSkillEditor(record));
        card.querySelector('[data-action="remove"]').addEventListener('click', () => removeRecord('skills', record));
        grid.append(card);
      });
    }

    function renderCalls(body) {
      const call = chatBucket().call;
      body.innerHTML = `<div class="cps-toolbar">${call.active ? `<button class="cps-button primary" data-action="restore-call"><i class="fa-solid fa-phone-volume"></i> ${htmlEscape(t('restore'))}</button><button class="cps-button danger" data-action="end-call">${htmlEscape(t('endCall'))}</button>` : ''}</div><h3>${htmlEscape(t('currentCall'))}</h3><div class="cps-card">${call.active && call.peer ? `<span class="cps-scope">${htmlEscape(t('active'))}</span><h3>${htmlEscape(call.peer.name)}</h3><p>${htmlEscape(call.peer.handle ? `@${call.peer.handle}` : t('encrypted'))}</p>` : `<p>${htmlEscape(t('noActiveCall'))}</p>`}</div><h3>${htmlEscape(t('history'))}</h3><div class="cps-card-grid" data-call-history></div>`;
      body.querySelector('[data-action="restore-call"]')?.addEventListener('click', () => { manager?.remove(); manager = null; showCallOverlay(); });
      body.querySelector('[data-action="end-call"]')?.addEventListener('click', endCall);
      const history = body.querySelector('[data-call-history]');
      if (!call.messages.length) { history.innerHTML = `<div class="cps-empty">${htmlEscape(t('noCalls'))}</div>`; return; }
      call.messages.slice().reverse().forEach(item => {
        const card = document.createElement('article'); card.className = 'cps-card';
        card.innerHTML = `<span class="cps-scope">${htmlEscape(item.role)}</span><h3>${htmlEscape(item.name)}</h3><p>${htmlEscape(item.text)}</p>`;
        history.append(card);
      });
    }

    function configField(label, control) { return `<label><span>${htmlEscape(label)}</span>${control}</label>`; }

    function renderConfig(body) {
      const s = settings();
      const checked = value => value ? 'checked' : '';
      body.innerHTML = `<p>${htmlEscape(t('customize'))}</p><form class="cps-form" data-config-form>
        <label><span>${htmlEscape(t('enableSystem'))}</span><input name="enabled" type="checkbox" ${checked(s.enabled)}></label>
        <label><span>${htmlEscape(t('showWand'))}</span><input name="showWand" type="checkbox" ${checked(s.showWand)}></label>
        <label><span>${htmlEscape(t('teachAi'))}</span><input name="injectPrompt" type="checkbox" ${checked(s.injectPrompt)}></label>
        <label><span>${htmlEscape(t('autoProfiles'))}</span><input name="autoProfiles" type="checkbox" ${checked(s.autoProfiles)}></label>
        <label><span>${htmlEscape(t('hackingTracking'))}</span><input name="hackingEnabled" type="checkbox" ${checked(s.hackingEnabled)}></label>
        <label><span>${htmlEscape(t('callSignals'))}</span><input name="callMainSignals" type="checkbox" ${checked(s.callMainSignals)}></label>
        ${configField(t('language'), `<select name="language"><option value="en" ${s.language === 'en' ? 'selected' : ''}>English</option><option value="th" ${s.language === 'th' ? 'selected' : ''}>ไทย</option></select>`)}
        ${configField(t('defaultScope'), `<select name="defaultScope"><option value="chat" ${s.defaultScope === 'chat' ? 'selected' : ''}>${htmlEscape(t('chat'))}</option><option value="character" ${s.defaultScope === 'character' ? 'selected' : ''}>${htmlEscape(t('character'))}</option></select>`)}
        ${configField(t('headerPosition'), `<select name="headerPosition"><option value="left" ${s.headerPosition === 'left' ? 'selected' : ''}>Left</option><option value="center" ${s.headerPosition === 'center' ? 'selected' : ''}>Center</option><option value="right" ${s.headerPosition === 'right' ? 'selected' : ''}>Right</option></select>`)}
        ${configField(t('callHistory'), `<input name="callHistoryLimit" type="number" min="20" max="300" step="10" value="${htmlEscape(s.callHistoryLimit)}">`)}
        ${configField(t('accent'), `<input name="accent" type="color" value="${htmlEscape(s.accent)}">`)}
        ${configField(t('danger'), `<input name="danger" type="color" value="${htmlEscape(s.danger)}">`)}
        ${configField(t('surface'), `<input name="surface" type="color" value="${htmlEscape(s.surface)}">`)}
        ${configField(t('textColor'), `<input name="text" type="color" value="${htmlEscape(s.text)}">`)}
        ${configField(t('uiScale'), `<input name="uiScale" type="range" min="80" max="120" step="2" value="${htmlEscape(s.uiScale)}">`)}
        ${configField(t('callOpacity'), `<input name="callOpacity" type="range" min="20" max="90" step="5" value="${htmlEscape(s.callOpacity)}">`)}
        ${configField(t('callBlur'), `<input name="callBlur" type="range" min="0" max="24" value="${htmlEscape(s.callBlur)}">`)}
        ${configField(t('animationSpeed'), `<select name="animationSpeed"><option value="off" ${s.animationSpeed === 'off' ? 'selected' : ''}>Off</option><option value="slow" ${s.animationSpeed === 'slow' ? 'selected' : ''}>Slow</option><option value="normal" ${s.animationSpeed === 'normal' ? 'selected' : ''}>Normal</option><option value="fast" ${s.animationSpeed === 'fast' ? 'selected' : ''}>Fast</option></select>`)}
        <label class="wide"><span>${htmlEscape(t('customInstructions'))}</span><textarea name="customPrompt" maxlength="6000">${htmlEscape(s.customPrompt)}</textarea></label>
      </form>`;
      const form = body.querySelector('[data-config-form]');
      form.addEventListener('input', event => {
        const target = event.target;
        if (!target.name) return;
        s[target.name] = target.type === 'checkbox' ? target.checked : ['uiScale', 'callOpacity', 'callBlur', 'callHistoryLimit'].includes(target.name) ? Number(target.value) : target.value;
        saveSettings(); applyTheme(); ensureWandButton(); refreshPrompt();
        if (target.name === 'language') { renderManager(); bindSettingsValues(); }
      });
    }

    function renderManagerBody() {
      const body = manager?.querySelector('.cps-panel-body');
      if (!body) return;
      if (managerTab === 'characters') renderCharacters(body);
      else if (managerTab === 'hacking') renderHacking(body);
      else if (managerTab === 'calls') renderCalls(body);
      else renderConfig(body);
    }

    function renderManager() {
      if (!manager) return;
      manager.innerHTML = `<section class="cps-panel"><header class="cps-panel-header"><i class="fa-solid fa-satellite-dish"></i><div class="cps-panel-title"><strong>${htmlEscape(t('appName'))}</strong><small>${htmlEscape(t('network'))} · v${CYBERPUNK_SYSTEM_VERSION}</small></div><button class="cps-icon-button" type="button" data-action="close-manager" aria-label="${htmlEscape(t('close'))}"><i class="fa-solid fa-xmark"></i></button></header><nav class="cps-tabs" role="tablist">${[['characters','fa-address-card'],['hacking','fa-code'],['calls','fa-phone'],['config','fa-sliders']].map(([tab, icon]) => `<button class="cps-tab" role="tab" aria-selected="${managerTab === tab}" data-tab="${tab}"><i class="fa-solid ${icon}"></i> ${htmlEscape(t(tab))}</button>`).join('')}</nav><main class="cps-panel-body"></main></section>`;
      manager.querySelector('[data-action="close-manager"]').addEventListener('click', () => { manager.remove(); manager = null; });
      manager.querySelectorAll('[data-tab]').forEach(tab => tab.addEventListener('click', () => { managerTab = tab.dataset.tab; renderManager(); }));
      renderManagerBody();
    }

    function openManager() {
      manager?.remove();
      const node = document.createElement('div');
      node.className = 'cps-overlay cps-ui';
      node.addEventListener('click', event => { if (event.target === node) { node.remove(); manager = null; } });
      document.body.append(node); manager = node; renderManager();
    }

    function bindSettingsValues() {
      const root = document.getElementById('cyberpunk-system-settings');
      if (!root) return;
      const s = settings();
      const controls = {
        'cps-enabled': ['enabled', 'checked'], 'cps-show-wand': ['showWand', 'checked'], 'cps-inject-prompt': ['injectPrompt', 'checked'], 'cps-auto-profiles': ['autoProfiles', 'checked'], 'cps-hacking-enabled': ['hackingEnabled', 'checked'], 'cps-call-main-signals': ['callMainSignals', 'checked'],
        'cps-language': ['language', 'value'], 'cps-default-scope': ['defaultScope', 'value'], 'cps-header-position': ['headerPosition', 'value'], 'cps-call-history-limit': ['callHistoryLimit', 'value'], 'cps-accent': ['accent', 'value'], 'cps-danger': ['danger', 'value'], 'cps-surface': ['surface', 'value'], 'cps-text': ['text', 'value'], 'cps-ui-scale': ['uiScale', 'value'], 'cps-call-opacity': ['callOpacity', 'value'], 'cps-call-blur': ['callBlur', 'value'], 'cps-animation-speed': ['animationSpeed', 'value'], 'cps-custom-prompt': ['customPrompt', 'value'],
      };
      for (const [elementId, [key, property]] of Object.entries(controls)) {
        const node = document.getElementById(elementId); if (!node) continue; node[property] = s[key];
      }
      const scale = document.getElementById('cps-ui-scale-output'); if (scale) scale.textContent = `${s.uiScale}%`;
      const opacity = document.getElementById('cps-call-opacity-output'); if (opacity) opacity.textContent = `${s.callOpacity}%`;
      const blur = document.getElementById('cps-call-blur-output'); if (blur) blur.textContent = `${s.callBlur}px`;
      translate(root);
    }

    function bindSettings() {
      const root = document.getElementById('cyberpunk-system-settings');
      if (!root || settingsBound) return;
      settingsBound = true;
      const mapping = {
        'cps-enabled': ['enabled', 'checked'], 'cps-show-wand': ['showWand', 'checked'], 'cps-inject-prompt': ['injectPrompt', 'checked'], 'cps-auto-profiles': ['autoProfiles', 'checked'], 'cps-hacking-enabled': ['hackingEnabled', 'checked'], 'cps-call-main-signals': ['callMainSignals', 'checked'],
        'cps-language': ['language', 'value'], 'cps-default-scope': ['defaultScope', 'value'], 'cps-header-position': ['headerPosition', 'value'], 'cps-call-history-limit': ['callHistoryLimit', 'number'], 'cps-accent': ['accent', 'value'], 'cps-danger': ['danger', 'value'], 'cps-surface': ['surface', 'value'], 'cps-text': ['text', 'value'], 'cps-ui-scale': ['uiScale', 'number'], 'cps-call-opacity': ['callOpacity', 'number'], 'cps-call-blur': ['callBlur', 'number'], 'cps-animation-speed': ['animationSpeed', 'value'], 'cps-custom-prompt': ['customPrompt', 'value'],
      };
      for (const [elementId, [key, mode]] of Object.entries(mapping)) {
        document.getElementById(elementId)?.addEventListener('input', event => {
          settings()[key] = mode === 'checked' ? event.target.checked : mode === 'number' ? Number(event.target.value) : event.target.value;
          saveSettings(); applyTheme(); ensureWandButton(); refreshPrompt(); bindSettingsValues();
        });
      }
      document.getElementById('cps-open-manager')?.addEventListener('click', openManager);
      document.getElementById('cps-reset-appearance')?.addEventListener('click', () => {
        const s = settings(); for (const key of ['accent','danger','surface','text','uiScale','callOpacity','callBlur','animationSpeed']) s[key] = DEFAULTS[key];
        saveSettings(); applyTheme(); bindSettingsValues();
      });
      bindSettingsValues();
    }

    async function injectSettings() {
      if (document.getElementById('cyberpunk-system-settings')) { bindSettings(); return; }
      const host = document.getElementById('extensions_settings2');
      if (!host) return;
      try {
        const response = await fetch(new URL('./settings.html', import.meta.url));
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
      listen('CHAT_CHANGED', () => { processedMessages.clear(); refreshPrompt(); renderVisibleMessages(); renderMinimizedCall(); if (manager) renderManager(); });
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
