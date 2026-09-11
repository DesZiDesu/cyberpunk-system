# Cyberpunk System

## V1 Official Release

A mobile-first Cyberpunk role-play system for **SillyTavern**. It adds an angular Night City interface, persistent character and world state, private communications, Cyberware management, netrunning, missions, economy, housing, vehicles and recovery tools without replacing the user's normal SillyTavern workflow.

> **Release naming:** “V1 Official Release” is the first public milestone of this project. The current internal runtime/build number remains **v3.14.0** so existing installations can update safely. “Official” refers only to this project's release status; this remains an unofficial fan-made extension and is not endorsed by CD PROJEKT RED or SillyTavern.

| Release information | Value |
| --- | --- |
| Public release | **V1 Official Release** |
| Runtime build | **v3.14.0** |
| Release channel | `main` |
| Platform | SillyTavern third-party extension |
| Interface languages | English / ไทย |
| Creator | **dioneaboveall** |
| Contact | Add **dioneaboveall** on Discord |

## Contents

- [What this extension does](#what-this-extension-does)
- [Installation and update guide](#installation-and-update-guide)
- [Quick start](#quick-start)
- [System guide](#system-guide)
- [AI generation and prompt behavior](#ai-generation-and-prompt-behavior)
- [Data storage, privacy and security](#data-storage-privacy-and-security)
- [Backups and campaign continuity](#backups-and-campaign-continuity)
- [Troubleshooting](#troubleshooting)
- [Project structure and development](#project-structure-and-development)
- [คู่มือภาษาไทย](#คู่มือภาษาไทย)
- [Creator and legal notice](#creator-and-legal-notice)

## What this extension does

Cyberpunk System turns structured role-play events from the active SillyTavern conversation into interactive, persistent UI. Ordinary narration remains in Main Chat, while compatible records can update status, contacts, equipment, locations, missions, calls, messages, mail, property, vehicles, shops and devices.

The extension is designed around five principles:

1. **User control** — purchases, upgrades, mission acceptance, restores and other consequential actions require explicit confirmation.
2. **Persistent role-play state** — saved information follows either the current chat or the selected character scope.
3. **No silent generation** — opening, paging, minimizing, animating or reading UI does not call the AI.
4. **Readable cyberpunk presentation** — square/angular panels, SVG controls, responsive mobile layouts, Decryption effects and reduced-motion support.
5. **Safe failure** — invalid or repeated records are rejected or logged instead of silently changing state twice.

This is a fictional role-play layer. Its prices, cooldowns, cyberpsychosis probability, recovery values and simplified mechanics are local extension rules—not exact Cyberpunk 2077 game formulas or real-world advice.

## Installation and update guide

### Requirements

- A working SillyTavern installation that allows third-party extensions.
- A modern browser. Desktop and mobile layouts are supported.
- A configured SillyTavern AI connection for features that generate replies.
- No npm install, build step or separate API key is required for normal use.

### New installation

1. Open **Extensions** in SillyTavern.
2. Select **Install extension**.
3. Paste this repository URL:

   ```text
   https://github.com/DesZiDesu/cyberpunk-system
   ```

4. Confirm the installation.
5. Reload SillyTavern once.
6. Open the extension drawer and confirm that **Cyberpunk System v3.14.0** appears.

### Updating an existing installation

1. Export an important campaign backup first.
2. Open SillyTavern's extension manager.
3. Update **Cyberpunk System** from `main`.
4. Reload the page once so the reorganized JavaScript, CSS and settings paths are loaded.
5. If an old interface remains cached, close SillyTavern, reopen it and reload the page again.

Existing chat state, contacts, inventory, balances, missions, homes and vehicles are not intentionally reset by this release.

## Quick start

1. Open a single-character chat in SillyTavern.
2. Open **Extensions → Cyberpunk System** or the Cyberpunk entry in the Wand menu.
3. Leave **Enable Cyberpunk System** on.
4. Open **Settings** and choose English or Thai, a palette, UI scale, motion, Decryption and sound preferences.
5. Open **Cyberware** to access the complete 16-section HUD.
6. Role-play normally. Compatible events are handled from the same Main Chat reply.

If the selected character has a blank greeting and the chat is empty, the Player Origin workbench can create the starting identity, attributes, possessions, home, vehicle and opening-scene preferences. Nothing is awarded or generated until the user reviews and confirms the setup.

## System guide

### Main HUD

| Section | Purpose |
| --- | --- |
| Status | Health, RAM, stamina, stress, cyberware load, progression and character details |
| Cyberware | Anatomical implant sockets, capacity review, install/uninstall previews and equipment inspection |
| Weapons | Owned weapon slots, equipment state and dossier comparison |
| Balance | Eddies, transfers, receipts and transaction history |
| Inventory | Items, consumables, components, data shards and artwork/dossier controls |
| Mailbox | Persistent documents, threads, offers, attachments, regeneration and lease notices |
| Quickhack Deck | Owned Quickhacks, deck slots, RAM costs, cooldowns and target upload controls |
| Skills / Hacking | Skill progression, ability cards, training and Breach entry points |
| Missions / Quests | Offers, objectives, hand-in state, rewards and archive history |
| Night City | Scene location, districts, subdistricts, interior detail, markers and exploration |
| Relic / Blackwall | Scenario-gated Relic abilities, neural exposure and recovery controls |
| House / Property | Estate Grid for owned or rented residences |
| Garage | Vehicles, condition, fuel, cargo, parking, repairs and service history |
| AI / Blackwall | Saved neural channels and decrypted AI dialogue |
| System / Recovery | Request monitor, failed records, checkpoints, backup import/export and recovery |
| Settings | Role-play preferences, notification behavior and per-chat system settings |

On small screens, the approved B / SHARD HUD uses a three-part thumb dock—Character, World and All systems—while preserving every section listed above. Document/Shard and Medical/Trauma Team keep their dedicated Field Ops presentation.

### Main Chat presentation

- Speaker headers, audible dialogue and private monologue render as separate readable blocks.
- Scene cards, skill headers, payments, mission offers, devices and data shards can appear directly under the relevant AI message.
- Cyberpsychosis uses three escalating Blackwall edge-effect stages around Main Chat.
- NPC dialogue receives a readable glitch treatment at higher cyberpsychosis stages; narration and user text remain intact.
- Re-rendered or streamed messages are replay-protected so the same event cannot settle twice.

### NPCs, calls and Personal Messages

- NPC dossiers support Character and Chat scopes, search, editable identity data, portraits and independent RPG state.
- Incoming and outgoing calls use the Private Signal interface with paginated speech, Previous/Next controls, optional timed advance and minimized-call restore.
- Call ambience wrapped in single asterisks or underscores is displayed as italic text.
- Personal Messages keep a separate thread for each contact.
- In Personal Messages, **Enter queues and displays the user's bubble without generating**. **Shift+Enter** inserts a new line. Press the adjacent SVG Send button to request the NPC reply.
- NPC message replies request 2–5 naturally paced bubbles; long fallback replies can be divided safely.
- Newly displayed user/NPC calls and messages can use the optional Decryption reveal effect.
- Notification sounds are optional. Use **Test sound** once if the browser requires a user gesture before audio playback.
- Minimizing keeps an in-page request attached to its original contact. iOS may still suspend browser work when the app is backgrounded or the device is locked.

### Cyberware, equipment and progression

- Track HP, stamina, RAM, stress, money, experience, levels and attributes per chat.
- Install implants into ten body groups with capacity and socket checks.
- Review the exact result before replacing a single-slot implant.
- Equip weapons, use consumables and inspect saved mechanics without inventing hidden bonuses.
- Browse curated RP item presets or the opt-in technical ID index.
- Assign owned/permitted PNG, JPEG or WebP artwork to supported dossiers. Original SVG symbols remain the fallback.
- Earn skill progress and XP from established story actions; duplicate event IDs cannot award twice.

### Netrunning, devices and Breach Protocol

- Nearby devices are grouped into one paginated Main Chat scanner.
- Device records retain network, security, access and supported-program information.
- Commands require the saved Quickhack, RAM and access state; observing a device never executes a command.
- Protected networks open a staged connection console and a real local Breach puzzle.
- Breach starts from the top row, alternates row/column selection and prevents cell reuse.
- Minimize pauses the local puzzle. Access is granted only after the required sequence is completed.
- A saved hacking/netrunning skill of at least LV.50 may use the documented story-data shortcut; it cannot bypass device security.

### Cyberpsychosis and medical systems

- Cyberware load, neural burden and stress feed a configurable local RP risk model.
- The risk multiplier can be reduced or set to `0` to disable random cyberpsychosis checks.
- Three visual stages intensify progressively without placing diagnostic text over Main Chat.
- Neural suppressants, recovery and medical records use explicit local values.
- Trauma Team packages, renewals, replacement, dispatch, arrival and extraction require visible confirmation.
- Coverage, prices and recovery rules are fictional extension mechanics, not medical or financial guidance.

### Missions, mail, economy and shops

- NPC mission offers appear with Accept, Decline and later Reconsider states.
- Accepted objectives and rewards are locked against silent rewriting.
- Completed objectives move to Ready; rewards settle only after explicit hand-in.
- Mail supports threads, replies, forwarding, editing history, attachments, offers and regeneration controls.
- Payments, trades and transfers move funds/items atomically and retain receipts.
- Shops preserve finite stock, prices, buyback values, business funds and visit state.
- Opening a shop or document does not itself call AI or charge the player.

### Estate Grid and vehicles

- Own or lease any number of houses, apartments, condos or rooms.
- Purchased properties are permanent. Rentals use story-turn terms, renewal prices and optional permanent buyout.
- Due or expired leases create one local Mailbox notice with a direct Renew action.
- New residences start at Home Level 0. The user explicitly initializes Level 1 before subsystem upgrades.
- Each residence retains Dossier, Stash, Workshop/Craft, Upgrades, Living, Garage, Rooms and Service Log.
- Property cards and dossiers use persistent 16:9 banners. Eight bundled presets are available after creation, and the main banner can use a supported image selected from the user's device.
- Paid room construction stores the room name, type, description and optional preset; an original SVG is used when no room image is selected.
- Vehicles retain condition, fuel, odometer, cargo, garage assignment, repairs and history.

### Braindance, Blackwall and scene tools

- Braindance recordings use a floating headset, sensory state and playback controls.
- Blackwall/AI channels remain separate from ordinary NPC profiles and respect hidden narrator information.
- Scene Tracker can show district, subdistrict, building, floor, room, danger and optional imagery.
- The map is an illustrative role-play atlas, not GPS or exact in-game navigation.

## AI generation and prompt behavior

Cyberpunk System uses the AI connection already configured in SillyTavern. It does not request or store a separate provider API key.

- Normal event tracking rides inside the ordinary Main Chat response and does not start a second request.
- Explicit buttons such as private reply, mail reply, NPC generation or neural-channel generation may start one additional request when pressed.
- Private channels include their saved transcript/dossier and relevant SillyTavern role-play context. Language and register follow the current role-play, not merely the extension display language.
- No automatic retry is performed after a failed private request.
- Opening UI, switching tabs, playing animations, paging, minimizing and restoring do not generate text.
- The selected model must follow the structured output contract. If it omits or breaks a record, use **System / Recovery** to inspect the failure.

Advanced users may see records such as `CP_HEADER`, `CP_DIALOGUE`, `CP_MONOLOGUE`, `CP_SIGNAL`, `CP_MESSAGE`, `CP_STATE`, `CP_SKILL`, `CP_BREACH`, `CP_DEVICE`, `CP_SHARD`, `CP_QUEST_OFFER`, `CP_MAIL`, `CP_TRADE`, `CP_PROPERTY` and `CP_VEHICLE`. These are consumed by the extension and should not normally remain visible in Main Chat.

## Data storage, privacy and security

### Privacy summary

**The creator does not collect, receive, sell or analyze your role-play data.** This repository contains no creator-operated account system, telemetry endpoint, analytics SDK, advertising tracker or background data-collection service.

To describe the behavior accurately:

- General extension preferences are saved through SillyTavern's extension settings.
- Chat-local world state is saved in the active SillyTavern chat metadata.
- Character-scoped NPCs/skills are saved under the current character or group key in extension settings.
- Portraits, custom item art and property banners selected by the user may be embedded in that saved SillyTavern data and in backups the user exports.
- When the user requests AI generation, relevant prompt/context is passed through SillyTavern to the AI provider configured by that user. It is **not** sent to the creator. The provider's own privacy/logging policy still applies.
- Installation and updates are downloaded from GitHub by SillyTavern.
- The interface currently requests Google Fonts, and the detailed Night City map requests public tiles from a pinned NC Zoning Board/GitHub source. Those hosts receive ordinary web-request metadata such as IP address and browser headers. Story text, NPC dossiers and quest data are not placed in the font or map-tile request URL.
- Clicking an external reference link opens that third-party website under its own privacy policy.

In short: there is **no data collection by dioneaboveall or a Cyberpunk System server**, but SillyTavern, the user's chosen AI provider, GitHub and optional external asset hosts operate independently and may process their own service traffic.

### Security guidance

- Install only from the repository URL shown in this README and review changes before updating if the installation contains local modifications.
- Never share API keys, passwords, recovery codes or real personal secrets in role-play prompts, imported files, screenshots or support reports.
- Backup and campaign JSON files can contain private story text, NPC data and embedded images. Store and share them carefully.
- Import only backup and icon-pack files you trust. The extension validates structure and size, but a file can still contain content you did not intend to merge into a role-play.
- User-selected images should be files the user owns or has permission to use.
- Cyberware, medical, money, hacking, device and property systems are simulations. The extension does not access real bank accounts, medical devices, GPS, game processes, cameras, networks or physical hardware.
- If reporting a bug, remove private chat text and never send a provider key or full private backup.

## Backups and campaign continuity

Open **System / Recovery** to create local checkpoints or export/import an extension backup. Recovery restores extension state, not SillyTavern's visible Main Chat transcript.

For a long campaign:

1. Open **Wand → Campaign save / Continue**.
2. Review and edit the continuity notes.
3. Export the campaign JSON and keep the original chat.
4. Open a new empty single-character chat using the same character/persona/lore setup.
5. Import and review the campaign file.
6. Confirm the import, then generate the new opening only when ready.

Campaign files carry extension world state such as player resources, NPCs, skills, inventory, missions, mail, property, vehicles, shops and devices. They do not copy the old SillyTavern transcript, provider credentials or the user's complete external configuration.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Old or missing UI after update | Update the entire extension and reload SillyTavern; the V1 repository layout uses new nested entry paths |
| Cyberpunk menu is missing | Confirm the extension is enabled and **Show Wand entry** is enabled in Config |
| Main Chat records appear as raw tags | Confirm prompt injection is enabled, then reload and inspect **System / Recovery** |
| A private reply will not generate | Confirm SillyTavern has an active AI connection and no other extension request is already running |
| Notification sound is blocked | Open Personal Messages and press **Test sound** during a user gesture; check volume/mute settings |
| A minimized request pauses on iPhone | Keep SillyTavern visible; iOS can suspend background tabs/apps and the extension has no server worker |
| Map detail does not load | Check internet access to the pinned public tile source; other core UI and saved state remain local to SillyTavern |
| State needs repair | Review failed records or restore a checkpoint/backup from **System / Recovery** |

When requesting support, include the runtime version, SillyTavern version, browser/device, exact reproduction steps and a redacted console error if available.

## Project structure and development

The repository root intentionally contains only project metadata and public documentation. Runtime files are grouped by responsibility:

| Directory | Contents |
| --- | --- |
| `src/` | SillyTavern entry point |
| `src/runtime/` | Communication, RPG, world, UI and persistence modules |
| `styles/` | Base, device, Breach and B / SHARD stylesheets |
| `ui/` | SillyTavern extension settings template |
| `assets/` | Bundled audio, location references and property presets |
| `docs/` | Sources, scope notes and iOS acceptance checklist |
| `scripts/` | Catalog/location maintenance utilities |
| `tests/` | Regression suites, helpers and browser preview fixture |
| `third-party/` | Required third-party notices and asset information |

`manifest.json` must remain at repository root because SillyTavern discovers the extension from that file. `package.json` and its lockfile remain at root for standard npm development tooling.

Development checks:

```bash
npm ci
npm run check
npm test
```

Runtime installation has no npm dependency. npm packages are used only for development tests. The V1 baseline contains 926 automated checks across 18 regression suites plus JavaScript syntax and stylesheet parsing. Tests simulate SillyTavern APIs and browser behavior; they do not prove live-provider compliance or native iPhone Safari behavior. See [docs/IOS-CHECKLIST.md](docs/IOS-CHECKLIST.md) for device acceptance and [docs/SOURCES.md](docs/SOURCES.md) for references, licensing scope and local-rule disclosures.

## คู่มือภาษาไทย

Cyberpunk System คือส่วนเสริมสำหรับ SillyTavern ที่เพิ่ม HUD, ระบบตัวละคร, Cyberware, อาวุธ, Inventory, Skill/Quickhack, ภารกิจ, เมล, ร้านค้า, แผนที่, บ้าน, รถ, การโทร, ข้อความส่วนตัว, Braindance, Blackwall และ Cyberpsychosis เข้าไปในโรล โดยข้อมูลแต่ละแชตยังแยกออกจากกัน

### วิธีติดตั้ง

1. เปิดเมนู **Extensions** ใน SillyTavern
2. กด **Install extension**
3. วางลิงก์ `https://github.com/DesZiDesu/cyberpunk-system`
4. ติดตั้งแล้ว Reload SillyTavern หนึ่งครั้ง
5. ตรวจว่าหน้าตั้งค่าแสดง **Cyberpunk System v3.14.0**

### วิธีเริ่มใช้งาน

1. ตั้งค่าการเชื่อมต่อ AI ใน SillyTavern ให้พร้อมก่อน
2. เปิดแชตตัวละคร แล้วเข้า **Extensions → Cyberpunk System**
3. เปิดระบบและเลือกภาษาไทยได้ใน **Settings / Config**
4. เข้า **Cyberware** เพื่อเปิด HUD หลักทั้งหมด 16 หมวด
5. โรลตามปกติ ระบบจะอ่านข้อความโครงสร้างจากคำตอบ Main Chat และอัปเดตสถานะให้
6. ก่อนเปลี่ยนแชตหรืออัปเดตครั้งใหญ่ แนะนำให้ Export ใน **System / Recovery**

### การโทรและข้อความ

- ข้อความส่วนตัว: กด **Enter** เพื่อส่งข้อความของผู้ใช้เข้าแชตและรอไว้ก่อน โดยยังไม่เจนคำตอบ
- กด **Shift+Enter** เพื่อขึ้นบรรทัดใหม่
- กดปุ่ม SVG ข้างช่องพิมพ์เมื่อต้องการเริ่มเจนคำตอบ NPC
- การโทรมีหน้าก่อนหน้า/ถัดไป ประวัติสนทนา การย่อหน้าต่าง และเอฟเฟกต์ Decryption
- หากไม่มีเสียงแจ้งเตือน ให้กด **ทดสอบเสียง / Test sound** หนึ่งครั้ง

### ระบบบ้าน

- ซื้อบ้านถาวรหรือเช่าเป็นจำนวนเทิร์นได้ และมีบ้านหลายหลังพร้อมกันได้
- สัญญาใกล้หมดจะมีเมลเตือน พร้อมปุ่มต่อสัญญา หรือเลือกซื้อขาดถาวร
- บ้านใหม่เริ่ม Level 0 ต้องกดเริ่มระบบบ้านเป็น Level 1 ก่อนอัปเกรดส่วนย่อย
- ระบบเดิมยังอยู่ครบ: Stash, Workshop/Craft, Upgrades, Living, Garage, Rooms และ Service Log
- ภาพ Banner 16:9 และตัวเลือก Preset ยังเปลี่ยนได้หลังสร้างบ้านแล้ว

### ความเป็นส่วนตัว

**ผู้สร้าง dioneaboveall ไม่มีระบบเก็บข้อมูลของผู้ใช้ ไม่มีเซิร์ฟเวอร์เก็บแชต ไม่มี Analytics และไม่มี Telemetry** ข้อมูลระบบจะถูกบันทึกผ่าน SillyTavern ใน settings/chat metadata ของผู้ใช้เอง

เมื่อผู้ใช้กดเจน ข้อมูลที่จำเป็นจะถูกส่งผ่านการเชื่อมต่อ AI ที่ผู้ใช้ตั้งไว้ใน SillyTavern ตามนโยบายของผู้ให้บริการนั้น ไม่ได้ส่งมาหาผู้สร้าง ส่วน Google Fonts, GitHub และแผนที่ภายนอกอาจเห็นข้อมูลการเชื่อมต่อเว็บทั่วไป แต่ไม่ได้รับเนื้อเรื่องหรือข้อมูล NPC จากส่วนเสริม

ไฟล์ Backup อาจมีเนื้อเรื่อง รูปตัวละคร และข้อมูลโลกของแชต ควรเก็บไว้เป็นส่วนตัว และไม่ควรส่ง API key หรือข้อมูลจริงที่เป็นความลับมาในรายงานปัญหา

## Creator and legal notice

- **Created by:** dioneaboveall
- **Discord:** add `dioneaboveall`
- **Repository:** [DesZiDesu/cyberpunk-system](https://github.com/DesZiDesu/cyberpunk-system)
- **Issues:** [GitHub Issues](https://github.com/DesZiDesu/cyberpunk-system/issues)

Cyberpunk System is an unofficial, non-commercial fan-made SillyTavern extension. Cyberpunk 2077, its setting, names and related marks belong to their respective rights holders. This project is not affiliated with or endorsed by CD PROJEKT RED, R. Talsorian Games or SillyTavern.

Source/reference scope is documented in [docs/SOURCES.md](docs/SOURCES.md). Third-party notices are retained in [third-party/ASSETS.md](third-party/ASSETS.md).
