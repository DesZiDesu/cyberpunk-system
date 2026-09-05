# Cyberpunk System

## v2.0.0 — Cyberware, Breach Protocol and connected world systems

Update the extension, then reload SillyTavern. The manifest and all runtime module URLs use `2.0.0`. Runtime modules have no npm dependency; npm is only for development tests.

- **Handles:** imported/saved/generated handles lose leading `@` characters. Identity, contact and call headers always show one prefix, including legacy call peers.
- **Wand → Cyberware:** player Status, Cyberware, Weapons, Balance, Inventory, Skills/Hacking, Missions/Quests, Night City, Relic/Blackwall and Settings. Each NPC contact card also has a Cyberware button for its own account and equipment. NPC identity retains Character/Chat scope; mutable RPG assets and player state are isolated per **chat**, preventing money or injuries leaking across story branches.
- **Starting state:** open Status → Edit starting status for initial funds/resources. Inventory → Browse catalog grants established equipment without spending money; custom items and editable costs are supported. Equip implants (exclusive named slots) and up to three weapons. Using equipment/skills consumes resources or stack quantities and respects turn cooldowns. Item data is fictional role-play state, not a shop connected to real money.
- **Cyberpsychosis:** equipped load and stress affect a per-story-turn probability. Settings → risk multiplier adjusts it; `0` disables it. Recovery spends a turn, restores RAM/stamina and lowers stress; reducing load and stress lets recovery clear an episode. These are local scenario rules, not the game's formula or a medical model.
- **Skill headers:** `[CP_SKILL]` JSON records show actual user or NPC ability use in main chat. Pipe form `[CP_SKILL|Actor|Ability]effect[/CP_SKILL]` also works. Manual activation adds a saved skill header to the current main-chat message. Ordinary narration is never guessed into a skill use; the AI prompt instructs the model to emit records for established actions.
- **Breach Protocol:** access-point/shard events open a transparent fullscreen HUD. Start in the top row; alternate column/row without reusing cells; match ACCESS before the buffer/time runs out. Finish upload once ACCESS is matched, or pursue the extra sequences. Drag the header vertically or use the slider. Minimize pauses and preserves the puzzle; Resume restores it; Cancel records denial. Hidden data becomes visible only after success, including during streamed generation. A training puzzle is available under Skills/Hacking.
- **Transfers:** Balance → Transfer, the call `€$` button, or `/cp transfer @lucy 500` in main chat/private composer. Thai command: `โอนเงิน 500 ให้ @lucy`. Exact stored names/handles and positive whole amounts are required. A successful transfer debits and credits both accounts atomically and saves receipts. AI NPCs can pay from their own funded accounts; AI records cannot debit the player. Replayed events cannot spend twice.
- **Call data:** send the current location, freeform data/mission/location cards, inventory information or mission details. NPCs can attach item/contact cards and end their own call after their final words. A contact card must contain name, handle, role, status, affiliation, age, gender, personality, appearance and notes; pressing Add contact stores the complete profile with its own supplied starting assets. Duplicate and incomplete contacts are rejected. Received cards are also retained in notification history.
- **Night City:** original district schematic, discovered/completed area state, and narrative district/subdistrict/building/floor/interior location. Undiscovered zones hide their details. This is **not** an official street map or GPS tracker. Location updates come from the story or manual setup; tapping a district does not teleport the player.
- **Immersion notifications:** dangerous-zone, mission, money and neural alerts disappear after a configurable 2–60 seconds. Hover/focus pauses dismissal; tap opens details. Status → Notification history retains recent information and received cards. Disable notices in Cyberware Settings.
- **Relic/Blackwall:** scenario-gated unlocks, earned/manual setup points, local Relic abilities, RAM cost, Blackwall exposure, health/stress consequences and disconnect recovery. No automatic main-story unlocks or forced spoilers. Numeric tuning and simplified effects are described in [SOURCES.md](SOURCES.md).
- **Equipment data:** 50 named item/family entries plus an opt-in searchable index of 3,420 factual game IDs. All have transparent square SVG fallbacks. **The index is not a verified complete catalog; technical labels and local stats are explicitly marked.** Provenance, source snapshot and regeneration instructions are in [SOURCES.md](SOURCES.md).

**AI integration:** regular events use the existing main response. The call AI button still makes one quiet request; NPC Generate still makes one request and optional vision reference. No background API polling is added. The prompt includes private narrator state plus precise JSON schemas; a model that ignores these schemas will not automatically trigger the new systems. Global Config → prompt injection/extension enable controls still apply. New events are idempotent across render notifications and repeated event IDs. Historical state is not automatically rolled back when editing/swiping/deleting old story messages; use status/equipment controls to reconcile an alternate outcome.

**Verification:** `npm run check` and `npm test` cover the original 41 DOM checks, 12 native-raster portrait/vision integration checks, and new RPG transaction, skill, call-card, map, puzzle, isolation and security checks. Browser events/ST APIs are simulated. Real iOS Safari rendering, keyboard, touch gestures, live AI compliance and model vision still require device testing. `tests/preview.html` has manager/call/Cyberware/Breach controls for manual review via an HTTP server.

## v1.2.0 — Connected identities and private signals

- Fixed replayed call signals when SillyTavern emits received, updated and rendered events for the same reply. Individual complete records are remembered in chat metadata; extending narration and reopening a chat cannot replay them. Identical speech in different turns remains allowed. Existing historical duplicates are retained rather than guessing which old messages to delete.
- Headers and consecutive same-speaker dialogue/monologue now share one continuous frame. Empty Markdown paragraphs and line breaks between these components are removed; intervening narration and different speakers stay separate.
- New call messages briefly scramble into readable text, including Thai grapheme clusters. Existing rows retain their DOM identity, scroll position and text when another message arrives. Ambient neural motion and signal animation have separate Config → Layout switches; Animation off and reduced-motion preferences are respected.
- NPC portraits support JPEG/PNG/WebP upload or clipboard paste (up to 20 MB), drag framing, two-finger pinch, a Zoom slider, keyboard arrows and reset. Images are compressed to at most 768 px on the long edge; the displayed portrait is a 384 × 384 JPEG. The source and crop remain editable in the selected Character/Chat scope. Portraits appear in headers, contacts and call identity panels with square corners.
- NPC **AI Generate** accepts a concept and optional portrait reference, then fills only empty fields, including personality/motivations. It preserves values typed while waiting. Review the draft and press Save. Invalid output, errors, double taps, closing the editor and changing chats do not overwrite the draft or leak records into another chat.
- Config → **Cyberpunk 2077 world data** has a master toggle (off by default) and 12 individually selectable entries. Selected summaries are used by normal replies, private-call generation and NPC generation. Entries cover Choom, Chrome, Eddies, Gonk, Preem, Delta/Flatline/Detes, fixers, ripperdocs, netrunners, districts, transport and corporate/gang influence. The knowledge policy separates public facts, expertise, rumors and secrets without assuming NPCs know private conversations, user money or future plot events.

**AI connection:** Normal tracking still uses the main response. Each explicit Call AI Send or NPC AI Generate uses one quiet request through the current SillyTavern connection. Image reference requires a vision-capable Chat Completion model with image sending enabled; the extension checks SillyTavern's own image-support API before sending. Unsupported connections show a message and let you disable the reference for text-only generation. No separate API key is needed.

**Update:** Update the extension and reload SillyTavern. The manifest versions both JavaScript and CSS URLs at `1.2.0`. New motion settings are in Config → Layout. Portrait and AI controls are in Add NPC/Edit.

### Reference sources

The extension contains original concise summaries and links, not copied game assets or sourcebooks. Examples of how to use terms and rules for what NPCs can know are role-play guidance, not additional canon.

- [CD PROJEKT RED's Night City visitor guide](https://www.nightcity.love/en/) — districts, public transit and corporate/gang presence. The guide is written as in-world tourism publicity; its safety claims are not treated as neutral truth.
- [R. Talsorian's Cyberpunk overview](https://rtalsoriangames.com/cyberpunk/) — chrome/cyberware terminology. RED is set in 2045; its rules are not imported into the 2077 reference.
- [CD PROJEKT RED Update 2.0](https://www.cyberpunk.net/en/news/49060/update-2-0) — ripperdocs and cyberware installation.
- [CD PROJEKT RED Netrunner build breakdown](https://www.cyberpunk.net/en/news/50026/hack-slash-netrunner-build-breakdown) — cyberdecks, RAM and quickhacks.
- [CD PROJEKT RED additional gigs](https://www.cyberpunk.net/en/dlc) — fixers and mercenary jobs.
- [Game8 street-talk glossary](https://game8.co/games/Cyberpunk-2077/archives/Slang-Explained-Street-Talk-Dictionary) and [community slang glossary](https://www.reddit.com/r/cyberpunkgame/comments/l0avwd/slang_megathread/) — secondary cross-checks of street vocabulary.


A mobile-first SillyTavern extension for cyberpunk character presentation, persistent Character/Chat NPC records, private calls, and hacking-skill progression.

## Features

- Cyberpunk Header, Dialogue, and Monologue blocks rendered in the main chat.
- Exactly two persistence scopes: **Character** and **Chat**. Chat records override matching Character records.
- Wand-menu interface with NPC dossiers, outgoing calls, hacking skills, and live configuration.
- Incoming call notification outside the main chat; Accept opens a translucent, blurred full-screen private-call interface.
- Press **Enter** or **Queue** in a call to queue a local message without generation. Press **Send to AI** to submit queued text and request one private response.
- Active calls may receive `[CP_SIGNAL]` content from the next normal main-chat AI reply, even while minimized.
- AI hacking updates ride inside the normal main reply and do not start a second request.
- English and Thai UI with Orbitron / Chakra Petch cyberpunk font stacks.
- Safe-area-aware vertical iPhone/Safari layout.

### v1.1.0 — Neural interface

- A shared component system for the manager, NPC/skill editors, main-chat presentation, incoming notifications, and private calls: dark surfaces, angular details, restrained accent colors, and local SVG icons.
- Searchable contact and skill directories with Character/Chat filters, expandable dossiers, scope badges, rank tiles, and segmented progress bars.
- Bottom tab navigation on portrait screens; desktop tabs include keyboard navigation and accessible panel labels.
- Config is organized into Appearance, Layout & motion, Core behavior, and AI protocol disclosures. Changes save immediately.
- Night City, Netrunner, and Afterlife color presets with a live preview. Existing saved colors are preserved; choose **Config → Cyberpunk appearance → Night City** to apply the new default palette.
- Adjustable spacing, UI scale, scanlines, motion, colors, and call backdrop. Orbitron headings and Chakra Petch body text support English and Thai; inputs stay at least 16px to avoid iOS focus zoom.
- Native dialogs track the visual viewport while the software keyboard is open. Editors retain visible close/save controls, and call drafts survive minimize/restore.
- Calls show message timestamps, queue/generation status, a mobile Queue button, and unread counts. Failed responses can be retried; a late reply cannot enter a different chat or a new call.

The extension settings drawer provides quick enable and open controls. All configuration lives in the same full interface opened from the Wand menu.

#### Design references

Component structure and behavior were informed by [Name That UI](https://namethatui.com/), especially [Tabs](https://namethatui.com/web/tabs), [Modal Dialog / Drawer / Sheet](https://namethatui.com/web/dialog-drawer-sheet), [Switch / Checkbox / Radio](https://namethatui.com/web/switch-checkbox-radio), and [Accordion](https://namethatui.com/web/accordion).

Visual direction was informed by Cyberpunk 2077 Senior UI Artist Vladimír Vilimovský’s [UI portfolio, Part 1](https://www.behance.net/gallery/118663901/Cyberpunk-2077User-Interface-%28Part-1%29) and [Part 2](https://www.behance.net/gallery/133185623/Cyberpunk-2077User-Interface-%28Part-2%29), plus the [official Cyberpunk 2077 website](https://www.cyberpunk.net/us/en/cyberpunk-2077). Components and icons are implemented locally; game artwork is not bundled.

| Component | Use in the extension |
| --- | --- |
| Tabs | Four peer views; selected indicator and arrow-key navigation |
| Card + disclosure | Contact identity, metadata, expandable dossier, and actions |
| Segmented controls | Directory scope filters |
| Switch / slider / color well | Immediate settings with visible state and value readouts |
| Native modal dialog | Manager, focused editing, and the full private-call window |
| Non-modal notification | Incoming signal and minimized call restore control |
| Progress bar / status | Hacking progress and call queue/generation feedback |

### v1.0.1 reliability fixes

- Reprocesses streamed and late-rendered SillyTavern messages so private call and hacking tags never remain visible in the main chat.
- Uses explicit left/right call rows for NPC and user messages.
- Moves the minimized-call control above the mobile composer and restores the call through a topmost interaction layer.
- Uses native full-screen dialogs for Create/Edit NPC and hacking-skill forms on mobile Safari.

### v1.0.2 UI isolation fixes

- Replaces oversized Config checkboxes and broken range inputs with scoped cyberpunk toggles, sliders, value readouts, and color swatches.
- Runs the active call inside a native viewport-level dialog so its layout cannot change when the SillyTavern Wand drawer is open.
- Closes the Wand drawer without allowing the extension-button click to bubble back into the host menu.

## Install

1. Open **Extensions** in SillyTavern.
2. Select **Install extension**.
3. Paste `https://github.com/DesZiDesu/cyberpunk-system`.
4. Reload SillyTavern.

For an existing installation, update the extension and reload the page. Versioned JS, CSS, and settings-template URLs request the new assets. The interface header should show **v1.1.0**.

## AI protocol

The extension injects a configurable output contract into the active chat. Presentation tags are consumed locally:

```text
[CP_MONOLOGUE|Rin]The trace is moving too quickly.[/CP_MONOLOGUE]
[CP_HEADER|Rin|Netrunner|Encrypted][/CP_HEADER]
[CP_DIALOGUE|Rin]Kill the uplink. Now.[/CP_DIALOGUE]

[CP_CALL_REQUEST|Rin|ghostwire]Need a private channel.[/CP_CALL_REQUEST]
[CP_SIGNAL|Rin]They are listening to the public feed.[/CP_SIGNAL]

[CP_HACK|Breach Protocol|Intrusion|8|100]Mapped a hardened subnet.[/CP_HACK]
```

Rules taught to the AI:

- Header identifies a speaker immediately before that speaker's visible dialogue; it is not narration.
- Dialogue contains only audible spoken words.
- Monologue contains only private thoughts; ordinary narration stays untagged.
- While a call is active, that participant speaks through Private Signal, never normal Dialogue.
- Call Request is emitted only when an NPC initiates a call.
- Hacking updates contain only changes earned in the scene and use a numeric delta.

## Storage

- Character scope is stored under the current character/group key in extension settings.
- Chat scope is stored in SillyTavern chat metadata.
- Call state and history are chat-local.
- No global scope is created or read.

## Version

`1.2.0`

## Development checks

Run `npm ci`, `npm run check`, and `npm test`. Development dependencies are used only by the tests; installation in SillyTavern needs no build or npm step.

The DOM regression suite covers record-level call replay prevention, world-data selection, empty-field NPC generation, navigation, search/filter state, saved settings, Thai translation, NPC edit/save, call queue/send/minimize/restore, failed generation, private-tag routing, and chat-switch isolation. Dialog and viewport APIs are simulated. These tests do not verify native browser rendering, touch behavior, or real iOS Safari keyboard behavior.

The portrait suite uses a native raster canvas to test real image downsampling, square JPEG export and framing. It simulates pointer/pinch events and the host vision API to check upload/paste integration, quota guards, crop persistence and chat isolation. It does not call an actual AI provider. `tests/preview.html` is a manual browser fixture with synthetic imagery and a simulated AI; serve the repository over HTTP to inspect it. Vision generation in that standalone fixture needs the host API or a test stub.

Validation for v1.2.0: JavaScript syntax and CSS parse checks, 41 DOM checks and 12 image/integration checks passed. Native browser visual review was blocked by the review environment's local-URL policy; real iOS Safari rendering, keyboard and touch behavior remain to be checked on-device.
