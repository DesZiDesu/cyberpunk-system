# Cyberpunk System

## v3.9.0 — Neural suppression, Trauma Team and medical packages

Open **Cyberware → Cyberpsycho / Medical Link** from Status or Cyberware. The player always controls their character. The old random episode roll is replaced by deterministic effective neural load: installed capacity load + stress + legacy episode burden + toxicity contribution, scaled by the chat preference, minus active suppression. Thresholds are 70 (near limit), 90 (critical) and 100 (episode); these are extension-original fictional rules. Existing episode saves migrate to a recoverable burden once. No forced dialogue, violence, personality changes or Crisis Choice interruption.

The redesigned medical window has an angular biomonitor header, segmented load scale, base/stress/suppression/toxicity breakdown, medication inventory, package comparison, dispatch status and pending RP requests. Decorative chromatic edge separation, signal fragments and corner diagnostics are confined to the Main Chat rectangle. They never capture taps or keyboard input. Effects default to reduced/static; select **Full motion**, **Reduced** or **Off** inside Medical Link. OS reduced-motion and the extension animation-off setting are respected. Braindance and disabled extension states remove the overlay.

### Suppression and recovery

Purchase oral suppressants (€$120, strength 22, six story turns) or injectors (€$240, strength 35, four story turns) in Medical Link, or acquire items with the exact `catalogId` `neural-suppressant-tablet` / `neural-suppressant-injector` and category `consumable` in the story. UI use and RP use both require an owned item and explicit confirmation. One dose consumes one item; all suppressants share a three-turn cooldown. Repeated doses replace rather than stack and lose potency with accumulated toxicity. The toxicity cap blocks unsafe fictional dosing; each dose costs five stamina, does not heal HP and does not remove installed load. Toxicity decreases by three per story turn.

`[CP_MEDICAL]{"id":"dose-event-1","operation":"use","itemId":"owned-inventory-id"}[/CP_MEDICAL]` queues a request and renders a clickable Medical Link card. `operation:"call"` requests a Trauma Team call. The player reviews or declines in Medical Link. Existing `CP_ITEM operation:"use"` requests for player suppressants take the same confirmation path. AI narration cannot grant suppression merely by saying it happened. The ordinary reply carries the protocol; medical actions make **zero extra AI requests**.

Durations advance with distinct non-Braindance story replies or explicit recovery turns. Rendering, retries, regenerations of the same message and real-world time do not consume additional turns. Rest lowers stress; a confirmed €$300 recovery session costs one turn, reduces stress by 20, toxicity by 20 and legacy burden by 15. Persistent implant overload requires unequipping implants or legitimately increasing capacity.

### Trauma Team and packages

All prices and durations below are extension campaign presets, **not a canon 2077 price table**. Each term is 60 RP turns. Renewals are explicit, use the existing balance/ledger, and preserve the remaining term; no real-time or automatic billing.

| Plan | Premium | Arrival estimate | Copay | Coverage |
| --- | ---: | ---: | ---: | --- |
| Silver | €$500 | 3 RP turns | €$250 | Known Night City districts outside marked danger zones |
| Executive | €$1,000 | 2 RP turns | €$100 | Known Night City districts including marked danger zones |
| Platinum | €$2,500 | 1 RP turn | €$0 | Known Night City districts including marked danger zones |

Manual calls verify the active contract, established district, danger coverage and outstanding bills. Auto-dispatch requires explicit opt-in, an online biochip and HP at or below 20%. Cyberpsychosis alone does not trigger it. Dispatch progresses to arrival on story turns; the team waits for the player's explicit stabilization/extraction consent. Consent transfers the player to a receiving clinic, stabilizes health to at least 35% and records the copay as a bill. No automatic resurrection, full healing or combat companion. Changed district/coverage requires a new dispatch. Cancellation preserves player health and location. A latch prevents repeated auto-dispatch for one critical-health episode.

Policy documents, extraction reports and paid bills are readable inventory Shards. Unpaid bills remain until payment succeeds. Confirmations are bound to the current chat, reject stale actions, and cannot double-spend after confirmation. State is saved per chat and uses the existing campaign snapshot/recovery mechanisms.

### Design references and verification

- [Vladimír Vilimovský — Cyberpunk 2077 UI portfolio](https://www.behance.net/gallery/133185623/Cyberpunk-2077User-Interface-%28Part-2%29): angular hierarchy, technical labeling and restrained color accents; no portfolio assets copied.
- [Zach Bohn — Cyberpunk 2077 UI design](https://zachgamedev.com/cyberpunk-2077/): clarity and consistent hierarchy guide the medical controls.
- [CDPR — Trauma Team](https://www.cyberpunk.net/en/news/22136/cyberpunk-2077-e3-2018-trailer-frame-by-frame-ep12-trauma-team): biochip alert, stabilization and extraction inform the service flow.
- [W3C — Pause, Stop, Hide](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html): reduced/off controls and nonblocking decoration.

Run `npm run check` and `npm test` for the entire regression suite, including `tests/medical-regression.cjs`. The medical fixture covers migration, load boundaries, drug inventory/cooldowns/duration, bills, package expiry/renewal, coverage, consent, replay, overlay cleanup and chat switching. `tests/preview.html` includes a **Cyberpsycho / Medical** fixture button. Automated DOM checks are not a physical iPhone Safari acceptance test; use the iOS checklist for that final device check.

## v3.8.0 — Complete NPC dossiers, readable shards and role-play mission offers

New NPCs are no longer saved from Header/Dialogue labels alone. A new recurring speaker must arrive with a complete `CP_NPC_PROFILE` record containing a personal name or established alias plus handle, role, status, affiliation, age, gender, personality, appearance and notes. Generic labels such as “Clouds Receptionist” can still appear in narration/UI but are rejected as contact names. Existing contacts are never overwritten by the profile record, and fleeting unnamed extras do not pollute the NPC list.

Readable shards now use `CP_SHARD`. A received shard renders as a compact clickable box in Main Chat, opens a neural-link window, shows a staged 0–100% connection/decryption sequence, and reveals the complete plain-text document and sections only after connection. Closing after reading archives exactly one data item in Inventory; archived shards reopen without reconnecting. Shards with missing content are rejected instead of producing an empty reader. Protected access points still use Breach Protocol rather than this document flow.

Face-to-face, holo, call and ordinary Main Chat mission offers now use `CP_QUEST_OFFER`; Mail is no longer the only acceptance path. The extension opens a decision window and keeps the same controls in the message/Journals. Accept creates one active quest with locked objectives/rewards. Decline creates no quest and retains a Reconsider option while the issuer keeps the offer available; a later event can withdraw it. The AI protocol is explicitly forbidden from treating an offer as accepted or paying rewards before the user's UI decision.

Validation adds coverage for role-label rejection, complete profile creation, shard connection/reveal/archive/reopen, role-play offer decline and later acceptance, replay protection and existing systems. Automated fixtures simulate SillyTavern/DOM; native iPhone Safari still needs device acceptance.

## v3.7.2 — Character registration presets and opening wait controls

All six registration pages use the same full-width shell. Themed, keyboard-accessible option cards cover identity, biography, lifepath, attributes, starting possessions and opening preferences. Each preset field has a **Preset / Custom input** switch; typed custom values are retained when switching back. Asset cards toggle multiple starting items, one unit each; **None** clears that field. Suggestions are optional RP starting choices, not enforced game balance. Existing drafts are not replaced just by opening a page. Clothing/home/vehicle suggestions are generic custom possessions; equipment suggestions use the existing curated catalog. No suggestion calls AI, charges currency, or awards possessions before confirmation.

The opening scene previously inherited the extension's 120-second request deadline. It now has its own **5-minute default / optional 10-minute** wait limit on Review, with visible generation status and cancellation. Other channels keep their existing timeout setting. Timeout diagnostics report the actual request deadline. There is still only one main-chat generation per confirmation and **no automatic retry**. Longer waits do not fix provider/network errors or guarantee completion, and cancellation cannot refund already processed tokens. Drafts remain after failure; review any partial main-chat response before retrying.

Validation includes preset/custom round trips, a unique custom lifepath editor, multi-item selection without AI/state mutation, custom agency validation, equal-width CSS, both opening budgets and accurate timeout diagnostics. Native iPhone layout and live provider responses still need device acceptance; tests use simulated host/DOM and no paid API.

## v3.7.1 — Bounded private AI requests and local interaction repair

Private text channels (calls, mail, neural AI and NPC text creation) now prefer SillyTavern's `generateRaw`: only their explicit task/history/dossier is supplied, without automatically assembling the whole main chat. The extension's registered main prompt is temporarily suppressed during private generation and restored on success, error or cancellation. No second request or fallback is attempted after a transport failure. Hosts without `generateRaw`, and NPC vision requests, use labeled **quiet compatibility** with `skipWIAN` and an explicit response limit; that path may still include host chat/card context. Other extensions can also modify host requests. This is not a guarantee of a particular provider bill.

Default private response limits: **call 768, mail 1,024, NPC 1,200, neural 768 tokens**, adjustable per channel from **System / Recovery**, 128–4,096. Main-story response settings are not changed. Long/reasoning-heavy responses may need a higher limit. The request monitor displays transport, supplied prompt character count, output limit and recent request count. Character counts are **not tokens**, and the monitor does not claim to know provider usage or prices. Cancellation requests a stop; already processed work may still be billable.

Main context retains the event protocol, but shop name hints are bounded (8 normally / 16 for an active vendor), NPC asset snapshots are limited to 6 with recent mentions/caller prioritized, and mail context contains the latest 6 non-archived excerpts of 800 characters. Private thread excerpts are bounded too. Stored world state is not deleted or reduced. Off-context details may need to be brought into the current story; this release does not silently summarize or spend a second AI request to retrieve them.

**Device repair:** mixed action lists retain supported commands and visibly report ignored unsupported suggestions; wholly unsupported lists still require local correction rather than inventing capabilities. Exact current-name matches no longer add a redundant UNRECORDED row, and confirming the same named/type device reuses it. Confirmation is local and does not call AI. Reopening Breach for the same network resumes its pending console/puzzle. A different pending target offers **Resume existing** or explicit **Cancel existing and connect here**. Permissions still require the actual puzzle; no access or RAM is granted/spent by switching.

**Shop repair:** disabled storefronts show the closure reason and **Review location · no AI**. If the story really places you at that counter, explicitly confirm the current location as its corrected address. This preserves stock/funds and rechecks the scene, original visit record, generation state and ownership before applying. It never automatically reopens a store after departure. Old incorrect records may need this one local correction; no new story generation is required. Keep the source visit message; deleted/swiped-away records cannot be revived through this control.

Validation: syntax checks and **622 automated checks** pass, including 15 dedicated zero-live-API regressions for pending Breach resume/switch, duplicate device rows, mixed actions, shop location repair, bounded private transport, cancellation and prompt restoration. The prior synthetic prompt scenario (20 minimal NPCs, 18 mail excerpts and 16,000 continuation characters) falls from 88,747 to 50,753 characters; this is not a token or billing benchmark. Native Safari/provider acceptance remains pending in [the checklist](tests/IOS-CHECKLIST.md).

## v3.7.0 — Full-world campaign saves and first-scene registration

**Continue an existing campaign without its long transcript:** open **Wand → Campaign save / Continue**, review the continuity notes, and download the campaign JSON. Start a **new empty single-character chat**, open the same menu, select the file, review and confirm import, then press **Save and generate opening** to continue. If the card inserts a greeting, remove that greeting in the new chat first; the extension will not erase existing messages. Keep the old chat and downloaded file until the continuation is verified.

The save carries all extension chat state: player progression/resources/inventory/equipment, NPC records and portraits, NPC actor state, skills and Quickhacks, quests, mail and offers, payments and transaction receipts, properties and storage, vehicles, map discoveries, shop stock and history, device configuration, and activity archives. Character-scoped NPC/skill records are imported as chat-local overrides without modifying global card settings. Source-message trackers are reset; completed economic receipts remain to prevent duplicate rewards. Active calls, AI jobs, Breach puzzles, prepared connections and temporary device permissions stop. Shops and devices require fresh in-story availability. Recovery checkpoints are not recursively included.

**Continuity is not unlimited AI memory.** The file does not copy SillyTavern's old transcript, card, persona, lorebooks, API settings or credentials. Use the same card/persona/lorebooks for the closest continuation. The editable notes draft contains only the last six messages, capped at 2,000 characters each. Add older important events, secrets and who knows them, unresolved threads and the intended next scene. Notes allow up to 16,000 characters; no hidden AI summarization request is made. JSON imports are limited to 25 MB. Downloaded saves contain private story text and portraits: keep them private.

**Blank-greeting character creation:** a known single-character card with an empty first message and an empty chat receives a themed registration panel directly in Main Chat. Existing greetings/stories and group chats are left alone. Six steps cover identity/appearance/biography, lifepath and private history, level/attributes/resources, starting possessions/software/homes/vehicles, opening scene/tone/language/boundaries, and review. Custom starting assets are one unit per line, not auto-equipped; connections remain background notes rather than invented NPC records. This is customizable RP setup, not a game-rule stat-budget validator. Registered identity appears in the status panel and scene HUD without changing the host persona.

Drafts persist in chat metadata. Confirming saves the configured state, then uses SillyTavern's normal main-chat generation with visible status and cancellation. No first message is fabricated by the extension. Empty results/errors retain the draft; duplicate requests, nonempty composer drafts, existing stories and changed-chat completions are guarded. Registration disappears after an actual assistant story reply is produced. Imported saves bypass creation and preserve the existing player. A host that does not expose normal generation shows an error rather than claiming success. Native Safari and provider-specific streaming/cancellation still require the manual checks below.

Navigation/entrance arrows now use original inline SVG instead of emoji-prone glyphs. The existing Device Hacking/security and finite-stock shop workflows are preserved.

Validation: `npm run check` and all **607 automated checks** pass, including 35 campaign/registration/SVG checks. Automated fixtures simulate host generation and DOM behavior, not a native iPhone. See [iOS acceptance checklist](tests/IOS-CHECKLIST.md).

## v3.6.0 — AI-paced neural links, nearby devices and bounded portrait lists

AI can now assess connection time **before the connection window opens**. Add `connection: {"seconds": 20, "reason": "Hardened corporate security over a weak local signal"}` to the normal `CP_BREACH` or `CP_DEVICE` observation. The prompt asks for a story-grounded estimate based on established security, connectivity and player capability. Values are bounded to **3–60 seconds**. The window displays that estimate and its reason; missing/invalid values show a clearly labeled **12-second default**. Existing observations need a fresh story observation to acquire an AI estimate. No additional AI request is made, and connection time does not change the puzzle's own countdown.

Device network Breach now uses this connection console too. Cancelling does not spend RAM or grant access. Disconnects, security resets, location/visit changes and active generation are checked before continuing. Reconnecting cannot revive an invalidated link. Device permissions still require a successful real puzzle; the existing learned-skill shortcut for story data cannot bypass device security.

The console uses an original segmented ICE schematic, a progress arc, circuit geometry, restrained rotation, a staged terminal stream and visible AI assessment. Motion stops when paused/ready and honors motion preferences and Reduce Motion. The prepared log stays readable until you continue. Shop cards have an original storefront glyph and a stronger angular entrance button while preserving range, inventory, recovery and purchase/sale behavior. All new surfaces use the configured theme colors.

Main-chat devices now appear in **one Nearby devices box on the latest AI message**, five rows per page, showing type, network and access state. Inline device labels remain ordinary prose. Known devices stay discoverable across replies in the same visit; leaving removes the old list. Manual confirmation and failed-record inspection remain available. Opening a row rechecks current device state; listing a device never uploads a command.

NPC contacts filter before rendering and mount **at most 12 cards per page**, retaining search, scope, toggle, edit and portrait behavior. Passing the current record directly to its avatar avoids repeated full-list searches. Image upload reads a bounded file header before image decoding, rejecting unreadable headers, images above 24 megapixels or dimensions over 8192 pixels. JPEG/PNG/WebP are supported; unusually large image headers may require re-exporting. Existing saved portraits are preserved. Uploads still compress to a 768-pixel source and 384-pixel square crop, release temporary object URLs, and now release the closed crop canvas backing store.

**Performance limits:** pagination reduces DOM/image decoding pressure, not total saved-chat size. Portrait strings and edit sources remain in chat metadata, and a long main chat may retain already-loaded portraits. Mobile memory pressure can still cause lag or reloads; this release does not promise crash-free Safari. No native iPhone rendering or memory benchmark was available in the authoring environment. Browser preview access was blocked; native visual/touch checks remain on the checklist.

Validation: `npm run check` and all **572 automated checks** pass, including bounded 500-contact rendering, oversized-image rejection before decoder allocation, per-target timing and device pagination/invalidation. Host APIs/DOM/timers are simulated; portrait resizing uses a real raster canvas. Update and reload to **3.6.0**.

## v3.5.2 — Readable Breach connection and reliable interaction entries

The pre-Breach connection now uses a three-stage neural console: synchronize, map ICE, and prepare the buffer. The default sequence takes **12 seconds**, with **8 / 12 / 20 seconds** selectable in the window and remembered per chat. Twelve code lines arrive gradually from the start; completed lines remain readable. Preparation pauses while the page is hidden, and delayed timer callbacks cannot rush the whole log through. Once ready, the log stays open until **Enter Breach** (or the existing learned LV.50+ data access) is pressed. Closing or cancelling releases the timer. Reopening a prepared connection restores its log. This preparation never grants puzzle success or reveals protected contents. Decorative motion respects the theme's motion switch and Reduce Motion.

Shop opening no longer fails solely because one catalog ID is unknown. Exact reviewed names and simple ID formatting are recognized; unmatched goods remain in **Goods awaiting identification**, outside purchasable stock. The shop button and recognized goods stay usable. Explicitly marked story goods retain their story label. No unknown item is silently sold as a canonical item. Existing failed shop openings expose **Open shop / check goods** in their original main-chat message when the source still matches and the player is at that counter; retry retains the original event ID and a recovery checkpoint. Review unmatched goods with Edit shop. Stock, prices, receipts and wallet settlement keep their existing safeguards.

Device observation metadata now creates a clickable entry even if the AI omits the inline name tag. Common camera/type/action field aliases are normalized, and non-ASCII device identifiers receive stable internal keys. Missing device IDs can resolve from the named observation. Compatible programs still require the normal deck, RAM and security checks. Rejected device records retain an inspection entry; an orphan inline label opens a confirmation form instead of a dead end.

Natural inspection such as **ฉันมองไปที่กล้อง** or **I look at the camera** is included in the normal AI prompt. If the response omits device metadata entirely, a main-chat **Inspect device** entry remains available. One confirmed nearby device opens directly; otherwise the user can choose a recorded device or confirm its name/type in the current scene. A mention alone never invents a physical device, grants network access, executes a command or spends RAM. Newly user-confirmed devices are standalone and secured. No extra AI generation is added.

Validation: syntax checks and all **558 automated checks** passed, including 28 connection/reported-interaction cases. Host APIs, timing and DOM interactions are simulated.

Update and reload to **3.5.2**. `tests/preview.html` → **Story connection** demonstrates the new console. Browser preview access was blocked in the authoring environment; native iPhone Safari appearance and touch behavior remain unverified.

## v3.5.1 — Device command-record hotfix

Fixes the misleading `Observe requires device name and supported type` rejection when the AI emits valid device metadata with `operation:"shutdown"` (or another supported Upload program). Mixed records now register a new secured device or retain the existing device and show a **pending request** in Device Control. They never execute a program, charge RAM, revive a disconnected device or grant Breach access automatically. Complete Breach if needed and press Upload; successful execution clears the request and remains protected against replay. The narrator prompt now distinguishes observation operations from UI commands explicitly.

After updating and reloading to **3.5.1**, use **System / Recovery → Review & retry** for the failed current-message record; its `shutdown` value no longer needs to be changed manually. If the record belongs to an older message, request a fresh observation of the device in the current scene instead. Historical retries now explain this restriction rather than silently claiming recovery. Shops and the existing Device Hacking controls remain intact. Native Safari is still not emulated by the automated tests.

## v3.5.0 — Persistent local shops, buying and selling

Built on the **v3.4.0 Device Hacking release**. Inline device controls, separate Device Hacks slots, shared-network Breach and saved device data are retained. Shops and devices can appear in the same main-chat reply and use the same final scene location. No relationship or reputation system/pricing is added.

### Using a shop

1. Enter an established shop/counter in the story. The AI supplies a full `CP_LOCATION` and a `CP_SHOP` opening record; **Open shop** appears below that main-chat message.
2. The button remains usable across subsequent messages while you stay at that exact shop/counter. It does not require a fresh button every turn.
3. Open **Buy** or **Sell**, search/filter a category, inspect an item, choose quantity and review the total. Nothing moves until **Confirm**. Back cancels the review and returns to the shop.
4. Purchases transfer money, inventory and stock together. Sales remove the selected owned quantity, pay from the shop's finite till and add the actual sold copy to resale stock. Receipts are retained under **Receipts** and the existing data archive; the AI receives an already-settled outcome for the next story reply.

| Scene event | Main-chat button | Saved inventory |
| --- | --- | --- |
| Continue talking at the same counter | Original button stays active | No automatic changes |
| Leave the counter, including another room in the building | Old card becomes muted and cannot open the shop | Remaining stock is retained |
| Return without a new visit record | Old visit remains closed | No refill |
| Return with the same shop ID and a new visit ID | Fresh card on the new message; the older card for that shop is removed | Same remaining stock, prices and till |
| Confirmed delivery in the story | Current visit rules still apply | Delivered quantities/funds are added once |

Opening a window, a new AI generation, the real-world clock and revisiting **never automatically restock**. A promise of a future shipment is not a delivery. A shop outside your current scene cannot be opened remotely, including from an old confirmation window. Braindance temporarily blocks physical commerce.

### Categories and editable offers

Clothing, weapons, everyday goods, medicine, equipment, cyberware, Quickhacks, ammunition and other goods have separate filters. A specialized vendor should stock relevant categories, not every item in the game.

- Initial AI offers prefer the existing curated named equipment entries. Technical `Items.*` identifiers are not presented as verified names. Unlisted established goods are explicitly labeled **STORY ITEM**.
- **Edit shop** changes stock counts, unit prices, buyback prices, shop name and till funds. It can add a reviewed catalog entry or an explicitly named story item. Setup does not charge or grant anything to the player. Set stock to zero to stop selling a row.
- Owned goods matching stock use that row's buyback price. Other owned goods use the category buyback price; zero means the shop does not buy them. Equipped/loaded or explicitly protected goods cannot be sold. Insufficient player money, stock or shop funds rejects the whole transaction.
- Bought cyberware enters inventory; installation remains a separate Cyberware action. Bought Quickhacks can be loaded through the existing deck. Device programs remain in their independent utility slots.
- Prices, stock, item stats and shop funds are **editable RP terms**, not exact current Cyberpunk 2077 economic data. Resold owned items keep their level, ammunition and cooldown metadata. The catalog is not exhaustive.

### Story protocol and recovery

Use a stable `shopId` across visits and unique event IDs. A new shop requires its name, an explicit building/counter location and 1–80 stock rows. Example (prices are illustrative RP terms):

```text
[CP_LOCATION]{"id":"market-arrival-1","district":"watson","subdistrict":"Kabuki","building":"Market arcade","floor":"G","area":"Mara counter"}[/CP_LOCATION]
[CP_SHOP]{"id":"mara-visit-1","operation":"open","shopId":"mara-market","name":"Mara Supplies","merchant":"Mara","kind":"weapons","location":{"district":"watson","subdistrict":"Kabuki","building":"Market arcade","floor":"G","area":"Mara counter"},"funds":2000,"buyPrices":{"weapons":100},"stock":[{"sku":"unity","catalogId":"cps:unity","quantity":3,"price":500,"buyPrice":200}]}[/CP_SHOP]
```

A later visit needs only a new event `id`, `operation:"open"` and the same `shopId`, at the established location. Repeated opening fields cannot reset existing stock/funds. Departure uses full `CP_LOCATION` or `CP_SHOP` with `operation:"close"`, `shopId`, `id` and `reason`.

Delivered stock uses `operation:"restock"`, a unique event `id`, `shopId`, a story-confirmed `reason`, and `stock:[{"sku":"unity","quantity":2}]`. Optional `funds` adds to the business till, not the NPC's personal wallet. New delivered rows need all initial stock fields. Existing row prices are changed through the user editor.

The model must emit these structured records; ordinary prose alone cannot reliably establish stock or a departure. Malformed complete records appear in **System / Recovery → Review & retry**. Historical/private-channel callbacks cannot open or restock physical shops. Changing/removing the visit's source record or switching its swipe closes that access. Success receipts prevent rerendering or duplicate confirmation from settling twice; this is not an automatic rollback of completed purchases when editing old prose.

Shop data is isolated per chat and included in validated backups. Restoring keeps the saved stock/receipts but closes transient visits, so re-enter in the story for a new button. Stock supports up to 200 rows per shop, with 24 products per page and the latest 100 activity entries displayed; settlement IDs remain retained separately.

### Update and verification

Update the extension from `main`, reload SillyTavern and confirm **3.5.0** in the settings and new windows. Existing Device Hacking data is preserved; dependency versions are unchanged. Syntax validation and all **521 automated checks** passed: the prior 468 checks plus 53 shop/location/transaction integration checks. See `tests/IOS-CHECKLIST.md` for the remaining real-device checks. The browser preview is blocked in the authoring environment; native iPhone Safari layout/touch is not yet verified. A model-free demo is available in `tests/preview.html` using **Shop scene / return**, **Stay in shop**, **Leave counter** and **Delivered restock**.

## v3.4.0 — Main-chat devices and shared-network Breach

Discovered device names are now inline buttons with the same font and line spacing as the surrounding narration. Tap a camera, door, drone, turret or terminal to inspect its **Device Control** panel. Inspection is free. Supported commands show their RAM cost, cooldown and any reason they are unavailable. Unsupported commands are omitted. Narrative names are never guessed into devices; the AI must emit the device protocol below in its ordinary response.

**Wand → Quickhack Deck → Device Hacks** manages an independent utility loadout beside the original Quickhacks tab. Eight built-in utilities are preloaded for immediate use; Reboot is also available to install. These are extension utilities, separate from owned NPC Quickhack inventory. Both decks share the player's RAM. Device slots are configurable from 1–16; unload the excess slots before shrinking. Duplicate installations are rejected. The Device Hacks switch disables control without deleting observations or programs.

| Utility | Targets | RAM | Cooldown / duration in story turns |
| --- | --- | --- | --- |
| Remote Deactivation | All supported devices | 2 | 2 / 2 |
| Loop Camera Feed | Camera | 3 | 3 / 3 |
| Camera Feed | Camera | 1 | 1 / immediate reading |
| Remote Unlock / Remote Lock | Door | 1 | 1 / persistent lock state |
| Signal Jam | Drone, turret | 3 | 2 / 2 |
| Target Override | Drone, turret | 4 | 3 / 2 |
| Read Data | Terminal | 1 | 1 / immediate reading |
| Reboot Device | All supported devices | 2 | 3 / 1 |

Only a loaded, compatible program can execute. RAM and cooldown settle once when Upload succeeds. A repeated action cannot charge again; cooldowns apply across devices for the same program. Target Override requires the player to name an established target. Camera/data commands show only supplied fictional observations; when content is unknown, the next normal story response must describe it. This is not a live video feed. Temporary shutdown/reboot blocks device access until it expires. Other temporary effects are recorded for the narrator; they do not render a 3D world simulation.

**Secured devices require the real Breach puzzle.** Successful ACCESS grants control to observed devices sharing the same explicitly supplied network ID, location visit and security revision. Matching names, types or districts never establish connectivity. Standalone devices unlock individually. Failure, cancellation, leaving the location during Breach, or security changes cannot grant access. Existing general-purpose Breach behavior remains available separately.

Moving to a different district/subdistrict/building/floor/interior area invalidates device reachability and clears grants. Returning requires explicit rediscovery; it never automatically restores previous rights. Story events can also disconnect, destroy or reset a device. Historical inline names remain inspectable but cannot operate an unavailable target. Devices retain stable IDs across messages and are isolated per chat. Observations in Braindance or private calls cannot create physically reachable targets. Backups include the registry, loadout, cooldowns and receipts, with validation on restore.

### Device protocol

Use this inline, within narration:

```text
เหนือประตูมี [CP_DEVICE|lobby-camera-a]กล้องวงจรปิด A[/CP_DEVICE] หันเข้าหาลิฟต์
```

Include hidden metadata in the same reply:

```text
[CP_DEVICE]{"id":"discovery-001","deviceId":"lobby-camera-a","name":"กล้องวงจรปิด A","type":"camera","access":"secured","networkId":"lobby-security","networkName":"ระบบรักษาความปลอดภัยโถง","securityRevision":"1","reachable":true,"actions":["shutdown","loop","view"],"data":"ยามสองคนยืนข้างลิฟต์"}[/CP_DEVICE]
```

Use a unique event `id` and stable `deviceId` (letters/numbers/underscore/dash/dot/colon). Additional confirmed cameras can share `networkId` and `securityRevision`; omit `networkId` for a standalone device. Add CP_LOCATION when the player moves: device observations are applied at that reply's final physical location. Do not register old-room devices in a new room. `type` supports camera, door, drone, turret, terminal and device. `actions` can restrict the default compatible commands. `access:"open"` means already unprotected/authorized, never assumed future puzzle success.

For established world changes, use `operation:"disconnect"`, `"destroy"` or `"reset"` with an existing `deviceId`. Reset requires rediscovery before use. Change `securityRevision` when a known network changes security. Do not duplicate locally settled commands with CP_STATE/CP_SKILL resource charges. Device metadata and partial machine records are hidden from narration. Unknown/invalid records remain reviewable in System / Recovery.

The registry retains up to 300 devices per chat and injects summaries for up to 40 devices at the current location. All updates use the normal response; no polling or additional AI generation is added. Archived prose is not retrospectively scanned for equipment or devices. `tests/preview.html` includes a **Device scene** control with two connected cameras and an independent drone.

Update and reload; confirm **3.4.0**. JavaScript and the device stylesheet use versioned URLs. Syntax validation and all **468 automated checks** passed, including 50 device checks for commands, network isolation, stale mentions, puzzle settlement, receipts and backup validation. Disconnect/reconnect and a peer security reset during an active Breach cannot revive its old permission grant. Native iPhone Safari visuals, touch targets and keyboard behavior still require device verification.

## v3.3.0 — Connected assets, recovery and interface polish

This release connects the existing systems without adding relationship or reputation mechanics. Update the extension, reload SillyTavern and confirm **3.3.0**. Existing saved NPCs, portraits, mail, inventories, themes and assets are retained. New fields initialize when needed; no chat history is scanned for invented retroactive rewards.

### Where to find the new controls

| Workspace | Entry | What is connected |
| --- | --- | --- |
| System / Recovery | Wand → System / Recovery, or Cyberware section selector | Record inspector, request monitor, local checkpoints, JSON export/import |
| Home dossier | Cyberware → Properties → Open dossier | Stash, workshop, living recovery, private notes and service log |
| Vehicle dossier | Cyberware → Vehicles → Open dossier | Cargo, fuel, condition, odometer, engine/armor upgrades and home garage |
| Mail recovery | Mailbox → Trash; any message → Version history | Restore deleted text, confirm permanent deletion, restore previous text versions |

### Story records and AI requests

- A rejected complete `CP_` record retains its raw text, error, original event ID and attempt count in the **Story record inspector**. A failure rolls back that record's RPG changes, including partially created actor accounts. Other successful records in the same response stay applied.
- Open **Review & retry**, correct the failed payload and confirm. The type and event ID cannot change, a checkpoint is saved first, and retry does not advance the story turn. Successful records cannot be replayed. Persistent success/failure receipts remain separate from the short render cache and the latest 500 detailed inspection entries. Failures recorded by older extension versions cannot be reconstructed automatically.
- Calls, Mailbox replies, NPC creation and private neural AI share a request lifecycle with explicit cancellation, a default **120-second timeout**, and no automatic retry. Set 15–600 seconds in System / Recovery. The monitor retains the latest 50 transport request statuses and durations, not prompts, model output or credentials. The originating interface displays response-validation errors and retains its draft or old message when a response cannot be applied.
- The NPC creator now has its own Cancel generation button. Closing its editor cancels a pending request. Cancellation and chat changes reject late results even if the host/provider cannot stop its network transport immediately. Provider billing cannot be undone by this extension. Braindance continues to use the normal main-chat generation lifecycle, not the private-request watchdog.

### Homes: storage, workshop and recovery

**Actions** retains purchase, enter, upgrade and agreed-price resale controls. **Open dossier** contains details, Stash, Workshop and Service log. Names, descriptions and private notes can be edited without another purchase. Service actions enter the story context as already settled so the narrator is instructed not to charge or grant them again.

- **Stash:** 20 item stacks plus 20 per Stash level. Deposit and withdraw an exact quantity; loadout equipment must first be unequipped/unloaded. Transfers preserve item stats and cooldowns. Copies whose stats changed while separated remain separate instead of overwriting one another. Empty the stash before selling the home.
- **Workshop:** requires Workshop level 1. Three starter recipes use carried, unequipped `component` items: Field medkit (3 components + €$50), Ping (5 + €$150), Short Circuit (8 + €$250). Medkits restore 25 HP through the existing consumable system; quickhacks enter inventory unloaded and use the existing deck. These are explicit local RP recipes, not the game's crafting catalog.
- **Equipment upgrade:** an owned weapon or quickhack gains one level. Cost is current level × €$100 plus `2 + floor(level / 5)` components. Maximum level is `min(60, Workshop level × 10)`. Weapons gain 1 power, capped at 100; quickhack RAM costs do not automatically decrease. Insufficient money or materials changes neither account nor inventory.
- **Living:** enter the home first and install Living level 1+. Rest once per story turn across all homes. Each level restores 10 HP, 20 stamina and 1 RAM, and removes 5 stress, within existing resource caps. No automatic time skip or continuous healing loop. Security upgrades remain narrative amenities; there is no hidden theft simulation.
- **Garage:** each home accommodates one vehicle plus one per Garage level. Assigned vehicles must be reassigned before selling the home. Its dossier shows used/available allocations.

### Vehicles: usable telemetry and cargo

New and existing vehicles default to a full fuel tank until a trip is recorded. Cargo holds 4 stacks plus 4 per Cargo level. Deposit/withdraw follows the same item-preservation rules as the home stash. Engine, Armor and Cargo upgrades have five levels; the next upgrade costs `€$1000 × next level`.

Summon a working vehicle using **Actions**, then enter the distance of an established trip in **Vehicle systems**. This explicitly applies `ceil(km / (5 + Engine level))` fuel and `ceil(km / (20 + 5 × Armor level))` condition wear. The odometer records distance. Refilling costs €$2 per missing fuel point. Insufficient fuel rejects the trip; reaching zero condition marks the vehicle destroyed and clears the active vehicle until repaired. Repair retains the existing explicit agreed-price workflow. No GPS, autonomous travel, physical driving simulation or automatic real-time fuel drain is added.

### Mail recovery and backups

Delete message and Clear all read now move the selected text to **Trash**. Restore returns its original thread identity and flags. Permanent deletion asks for confirmation and removes the trashed text; offer, transfer and replay receipts remain so settlement cannot repeat. A reply can still inherit the thread of a trashed parent. This is recoverability, not a financial undo operation.

Editing and successful NPC regeneration save the previous subject/body automatically. **Version history** restores text only and first saves the current version. Retention is 20 versions per message. User-authored text remains manually editable; NPC-authored text can be regenerated. Original messages and replies use the same controls.

**Recovery vault** keeps up to five local checkpoints within an approximately 12 MB serialized UTF-16 budget, removing the oldest points first. Checkpoints exclude the recovery subtree to avoid recursive growth. Oversized local checkpoints are rejected; download important backups. Exported JSON includes the current extension chat state and character-scoped NPC/skill data, so treat it as private chat data. It does not include provider credentials or global theme settings.

Import validates format and unsafe keys, then displays a review before replacement. Restore is blocked during generation and makes a pre-restore checkpoint; a current state too large for that checkpoint cannot be restored over through this workflow. Restoring character-scoped data is a separate, unchecked option because it affects other chats for the same character. Restore closes stale workspaces and returns call/Braindance/request playback states to idle. **SillyTavern messages and historical scene HUD snapshots are not rewound.** Only the current extension timeline is restored; subsequent story updates continue from it.

### Polish and verification

Asset dossiers now use original home/vehicle line drawings, clear status metrics, themed terminal panels, compact information hierarchy, sticky detail tabs and short entrance transitions. New controls use 44px touch targets, readable inputs, keyboard focus states and responsive layouts. All new colors derive from the saved palette; reduced-motion and animation-off settings remain respected. Research references and RP-rule distinctions are in [SOURCES.md](SOURCES.md).

JavaScript syntax, CSS parsing and **418 simulated regression checks** cover the existing features plus 67 new recovery/asset/request/dependency checks. Corrupted dependency version strings from earlier release-number edits were restored to their original lockfile identities, with a regression guard comparing installed package metadata. A clean offline install could not complete because the environment lacks cached package archives; existing installed dependencies were used for the tests. No live model or native iPhone Safari test was performed. The browser preview was blocked by this environment, so rendered layout, keyboard behavior and photo-picker stability still need device validation using [the release checklist](tests/IOS-CHECKLIST.md).

## v3.2.1 — Holographic AI / Blackwall terminal

Cyberware → AI / Blackwall now opens a two-sided neural conversation: AI messages on the left and user messages on the right. A CSS holographic sphere with orbital rings sits above the conversation. Blackwall uses a dark core and red energy; other AIs inherit the saved accent and surface colors. The signal bars respond to pending generation.

The docked composer keeps Send reachable while the transcript scrolls. Its header contracts on short viewports, including keyboard-sized windows. Enter inserts a line break; Ctrl/Cmd+Enter sends. The input is temporarily read-only during generation, protecting drafts from being overwritten by a completed response. Cancel and closing the terminal discard late answers; chat isolation and existing transcripts are retained. Ambient motion, animation-off and reduced-motion settings are respected. This is a fictional neural-link visual, not end-to-end encryption or voice chat.

Validation: automated regression coverage includes message sides, hologram structure, theme/Blackwall separation, thinking/cancel states and close-during-generation. Native Safari appearance and keyboard behavior still require device verification.

## v3.2.0 — Blackwall neural channels, property and garage

- **Cyberware → AI / Blackwall:** open the unlocked Blackwall channel or name another established fictional AI. Send to AI makes one quiet request. Cancel discards late responses; switching chats closes the channel and isolates history. Main-chat `CP_AI` records render a dedicated neural header and decrypted dialogue, and are retained in the corresponding thread. Private channel replies cannot execute transactions.
- **Blackwall unlock:** immediately grants one Blackwall Gateway quickhack and the Blackwall Interface / Containment skills. An empty deck slot is used when available; a full deck retains all existing programs and keeps Gateway in inventory. Existing unlocked saves migrate once. Interface/Gateway add exposure and stress, with health feedback at high exposure; Containment lowers exposure. These are local RP abilities and balance rules, not a claim that the game grants this package.
- **NPC presentation:** header names and dialogue decrypt using the existing call effect, preserving rich text and Thai grapheme clusters. Existing motion-off, signal-decryption and reduced-motion settings apply.
- **Item resolution:** operations accept the saved ID, catalog ID, or unique exact name (case-insensitive). Ambiguous names require an ID. Removing more than the owned quantity is rejected without destroying the remaining stack. No item is invented to hide a missing-item error.
- **Payments:** named shops and service providers no longer need an NPC profile. Invoices still await Accept & pay, check funds and preserve receipts. External merchant accounts are chat-local and do not create placeholder NPCs.
- **House / Property:** buy a preset or custom home, enter it, upgrade security/stash/garage/workshop/living areas up to level 5, and sell at an agreed price. Upgrades are persistent role-play records, not automatic game-engine room construction or inventory-capacity changes. Purchases and upgrades debit the player; sales credit once. Existing property invoices remain visible.
- **Garage:** buy a preset or custom vehicle, summon it to the scene, park, record damage, repair and sell. A destroyed vehicle cannot be summoned. Repairs require payment; active-vehicle state clears on destruction, parking or sale. Only one summoned vehicle is active.
- All new asset state, receipts and AI threads are isolated per chat. Story updates use the normal response through `CP_PROPERTY` and `CP_VEHICLE`; no background generation is added. Do not emit an asset purchase and a separate payment record for the same transaction.

**Catalog scope:** four apartment presets and 24 vehicle presets, plus custom entries. Preset prices are editable RP defaults, not verified current game prices. This release does **not** bundle photographs of every Cyberpunk vehicle; asset cards use a neutral local schematic fallback. It is not a complete vehicle/image archive.

**Update:** update the extension and reload SillyTavern. Confirm **3.2.0**; runtime and stylesheet URLs are versioned.

**Validation:** 345 simulated checks across UI, portraits, RPG, map, mailbox, scenes and expansion regressions, plus JavaScript syntax and CSS parsing. Cloud Browser rejected the local preview with `ERR_BLOCKED_BY_CLIENT`; native Safari visuals, keyboard/touch behavior and live AI model compliance remain unverified. Test dependencies were installed without changing the project dependency declarations; a temporary tokenizer version was used after the lockfile tarball returned 404.


## v3.1.1 — Consistent Back controls and independent scene display switches

Shared window headers place text-only Back beside Close. The Mailbox reader no longer adds a second Back row: header Back returns to the mailbox before exiting to its parent. Draft preservation and Cyberware section history remain intact.

Config → Layout provides independent Scene Tracker, Area arrival cards and Scene images switches. Disabling images retains arrival text; disabling arrival cards retains the tracker. Changes apply immediately to visible messages without deleting saved scene readings or changing RPG state.

## v3.1.0 — Scene readings, area arrivals and compact workspace navigation

Every normal AI reply now has a compact two-column mobile Scene Tracker: fictional Gregorian date/weekday/time, weather and Celsius temperature, location/zone/interior/floor, persona, settled eddies, equipped weapons, loaded rounds/spare magazines for confirmed firearms, HP and RAM. Unconfirmed fields stay unconfirmed. Blade names do not get ammunition counters. Use Config → layout to toggle the tracker and area arrivals independently. CP_SCENE supplies fictional environment readings in the same response; no additional AI call is made. Wallet/equipment readings come from real extension state, not arbitrary scene payloads. CP_ITEM operation ammo updates an owned weapon with validated nonnegative counts; repeated event IDs do not spend anything again.

Readings are saved per message in its extra.cpsScene metadata, so newer money/equipment values cannot rewrite historical HUDs. Existing history without a saved reading displays unknown values instead of fabricating past state. Braindance scene readings are marked and separated from physical location/equipment. Location changes, including changes of floor or interior area, show a compact arrival card. Six original CDPR district photographs are bundled locally with attribution and actual dimensions in assets/locations/coverage.json. They are 960×540 district references, **not a complete HD/interior archive**; captions explicitly distinguish the district photograph from an interior. Dogtown and unknown locations use a text fallback. No false room photograph is substituted.

Cyberware and other standard workspace headers now share a compact Back/Close row. Section history returns to the preceding section; Back from a directly opened Cyberware root returns to main chat. Mailbox keeps its existing parent/draft behavior. Optional world references add separately switchable gangs, corporate/security groups, Relic and cultural guidance. Individual voice, formality, relationships and professional knowledge determine slang; choom is not a universal greeting. Lore remains optional and does not grant NPCs private player knowledge.

Validation: 317 simulated regression checks, including scene chronology, unknown dates, escaped text, ammunition validation, stable historical readings, no duplicate HUDs, zero additional generation, Braindance isolation and mobile section navigation. Native iPhone Safari rendering is not emulated by these tests.

## v3.0.6 — Compact Mailbox navigation and generation lock recovery

Mailbox Back is now a text-only 44px touch target beside Close, removing the extra header row while retaining existing navigation and draft cleanup. Request NPC reply ignores SillyTavern prompt-preview dry runs and consults the host's live single/group generation state to recover unmatched start events (such as offline or command exits). Older hosts retain lifecycle-event locking. Private call, NPC creator and mail request locks remain independent; quiet mail generation still shows its cancellable status in the thread and main chat, without impersonating the main-chat Send button.

Validation: 300 simulated regression checks, including dry-run recovery, live-generation rejection, legacy event fallback, compact header structure, and pending-mail cancellation. Native iPhone Safari still requires device verification.

## v3.0.5 — Edit, delete and regenerate individual mail messages

Every retained original and reply has Edit text and Delete message controls. Edit updates subject/body only; Delete requires confirmation and leaves the other thread messages intact. NPC-authored messages also have Regenerate, which replaces that selected message in place only after a valid response succeeds. User-written messages remain manually editable, not AI-regenerated. Cancellation, failure, a concurrent edit, deletion or switching chats cannot overwrite the old text with a late result.

These are correspondence controls, not transaction undo: attached transfers, offer terms, acceptance decisions, quest rewards and replay protection are preserved. A regenerated response cannot create another offer or deliver more rewards. Validation: 295 simulated regression checks, including original/user edits, targeted regeneration, cancellation, concurrent edits and deletion of the original while retaining replies. Native Safari remains unverified.

## v3.0.4 — Read mail as a continuous conversation

Opening a document displays all retained messages in its thread, with user and NPC replies appended below the original. Each message retains its own reply, forward and offer actions. Replies carrying replyTo inherit the original thread. Forwarding still starts a separate conversation and does not copy offer rights. Existing mail is not deleted or merged destructively.

Request NPC reply starts the existing quiet AI mail request immediately, shows a generating status and Cancel generation button inside the thread, and scrolls to the latest activity. The main-chat status remains available too. Cancelling stops the host request where supported and always ignores late results. Validation: 290 simulated checks including user/NPC thread rendering, reply targeting and in-thread cancellation. Native Safari remains unverified.

## v3.0.3 — Back navigation between workspaces

Standard system dialog headers now have a 44px Back control. Nested details and Mailbox return to their still-open parent; direct Wand entries return to the Cyberpunk menu. Cyberware section changes retain a backward history, including the mobile section selector. Replacing a Cyberware workspace retains its preceding actor/section route. Back uses each dialog's close cleanup and does not discard saved mail drafts; the existing × button remains a close action. Validation: 287 simulated checks including section history, nested mailbox return, draft retention and direct-entry return. Native Safari navigation still needs device verification.

## v3.0.2 — Mailbox follows the saved theme

Mailbox now inherits the configured accent, alert, surface and text colors instead of a fixed red/cyan/yellow palette. Derived panel, border and muted colors follow the same theme. This covers folders, documents, offers, receipts, compose fields, swipe controls, unread badges and the mail-generation status bar. Theme changes apply through CSS variables without clearing mail or resetting preferences. Validation: 284 simulated regression checks, including a guard against fixed mailbox palette colors; native Safari rendering remains unverified.

## v3.0.1 — Notification scope and mail generation visibility

- Opening a new notification shows only that notification, not the entire saved archive. Older notifications remain available through Cyberware → Activity & notifications → Browse notifications.
- Skills / Hack now contains abilities and Breach Protocol, with a shortcut to Quickhack Deck. The eight loadout slots appear only in the dedicated deck workspace.
- Request NPC reply remains a separate, quiet mail request, not a main-chat story response. A main-chat status bar now names the NPC while mail is generating and provides Cancel. It disappears on completion, failure, cancellation or chat change; the reply arrives in Mailbox.
- Version 3.0.1: 283 simulated regression checks plus syntax/CSS checks. Native Safari and live model responses still require device verification.

## v3.0.0 — Document mail, offers and fixer gigs

Open **Cyberpunk System → Mail**, **Wand → Mailbox**, or **Cyberware → Mailbox**. This is fictional, chat-local correspondence with NPCs; it does not send external email.

- **Write and receive:** choose an enabled NPC, write a subject and message, then Send. NPC mail arrives from the next story response through `CP_MAIL`. **Request NPC reply** makes one AI request immediately; **Cancel generation** discards late results. Mail does not start a call. Model output must follow the protocol to create a document.
- **Threads:** Reply retains the conversation; **Forward / ส่งต่อ** copies the document into a new draft for another recipient. Forwarding does not copy offer acceptance rights or transfer rewards. Drafts survive closing and reopening the mailbox.
- **Offers:** gifts, dealer trades and fixer gigs have explicit **Accept / Refuse** buttons. Opening or reading an offer does not settle it. Any price is charged on acceptance; currency, XP and items under **Receive on acceptance** are delivered then. **Receive after completing the gig** is paid only after all accepted objectives are complete and the mission is marked Completed in the Journal. The story can update progress through `CP_QUEST`, or you can mark objectives and change status in the Journal. Accepted reward terms and objective identities cannot be rewritten by later updates.
- **Outgoing transfers:** expand **Attach a currency / item transfer** in the composer. Attached player currency and owned items move to the NPC immediately on Send; insufficient funds or quantity leave both accounts unchanged. Forwarded documents start with no attachments. Incoming offer rewards use fictional external sender/contract funding; a tracked NPC wallet is credited when you pay its offer, but incoming contract rewards do not debit that wallet.
- **Organize:** Inbox, Unread, Sent, Archive and Pinned folders; search; unread count; pinned documents sort first. On PC, press **Edit** for selection and delete/read/archive/pin controls. On mobile, swipe **rightward** to reveal Read/Delete and **leftward** to reveal Archive/Pin. Swipes reveal controls; they do not execute the action automatically. Unread mail can be deleted. **Clear all read** deletes read incoming documents, including archived/pinned ones, while preserving unread and sent documents. Deleting mail retains accepted gigs and settlement history so rewards cannot repeat.
- **Hacking tab:** the older progress tracker shown as “Netrunner deck” is now **Hacking proficiency**, with a direct **Quickhack Deck** button. Proficiency records track story progress; owned programs are loaded and used in Quickhack Deck.
- **Presentation:** an original red/cyan document terminal with a split inbox/reader on desktop, full-width reading on mobile, envelope metadata, contract reward panels, transfer receipts, subtle scan motion and reduced-motion support. Design research and attribution are in [SOURCES.md](SOURCES.md).

Update the extension and reload SillyTavern; confirm **3.0.0**. Existing chat, inventory and NPC data are retained. Validation: **281 checks** (58 UI, 16 portrait, 158 RPG, 15 map, 34 mailbox), JavaScript syntax and CSS parsing. Tests simulate the host, AI and touch events; native iPhone Safari and live model behavior still require device testing.

### Mail protocol example

```text
[CP_MAIL]{"id":"fixer-shard-001","from":"Lucy","to":"user","subject":"A quiet job in Kabuki","body":"Recover the encrypted shard and bring it back intact.","offer":{"kind":"gig","title":"Recover the shard","onAccept":{"amount":100},"onComplete":{"amount":500,"xp":25,"items":[{"name":"Ping","category":"quickhack"}]},"objectives":["Recover the shard","Deliver it to Lucy"]}}[/CP_MAIL]
```

Use a stable unique mail ID. After acceptance, this example creates quest ID `mail-gig:fixer-shard-001`; objective IDs are `"0"` and `"1"` in the accepted order. Reply mail uses the original `threadId` and the document's `replyTo` ID. Hidden mail records are removed from visible narration without leaving their paragraph/break stacks. The prompt provides the schema automatically.

## v2.9.0 — Compact dialogue and connected Quickhack Deck

- **Chat spacing:** remove empty paragraphs and break stacks created by hidden machine records. Standalone dialogue and connected speaker frames use a compact 6 px margin. Narration, media and unrelated prose/code formatting are retained.
- **Find the deck:** open **Wand → Quickhack Deck**, or **Cyberware → Quickhack Deck** (on mobile, use the Section dropdown). The deck explains acquisition, loading and targeting and shows owned programs with eight loadout slots.
- **Loot and loading:** quickhack category aliases and exact known catalog names stored as generic items/data are recognized without recreating items. Collected programs retain their level, RAM cost and cooldown. Inventory cards have **Load into deck / Unload from deck**; main-chat equip/unequip records use the same slots. Removing the last copy clears its slot. A full deck rejects another load without replacing programs or losing the item. Loading does not spend RAM.
- **Use:** tap an enabled NPC's header in the main chat, select a loaded quickhack, and press **Upload**. Upload spends the displayed RAM and applies cooldown once; the next story reply resolves its effect. Acquire → load → target → upload are distinct steps.
- **Missing older loot:** the AI must emit a loot record to save acquisition; prose alone cannot reliably establish an inventory change. The prompt now gives an explicit quickhack loot example and equip instructions. If previously collected loot was never saved, use **Add missing quickhack** in the deck and enter its established name/effect/cost. This adds one owned program; it does not replay old chat rewards or invent loot from narrative text.

Update and reload SillyTavern; the version should read **2.9.0**. Validation: **247 checks** (58 UI, 16 portrait, 158 RPG, 15 map), JavaScript syntax and CSS parsing. Tests simulate the host and AI records; live model compliance and native iPhone Safari layout still require on-device verification.


## v2.8.0 — NPC switches, call controls and live Braindance

- **NPC List:** each saved NPC has an Enabled/Disabled switch. Disabled profiles remain editable and retain their data, but are excluded from active NPC context, calls and contact selectors. Tagged AI mentions do not recreate them. Switches follow the displayed Character/Chat scope; a Chat record overrides a same-name Character record.
- **Calls:** Cancel generation stops the host request and discards late results; cancelled user turns remain queued for retry. Regenerate replaces the selected AI reply in its original position and keeps the old reply on failure/cancellation. Edit user text inline, or delete either participant's messages. These transcript controls do not undo or replay already-applied payments, inventory changes or attachments. Regeneration does not execute new game actions.
- **Braindance:** the launcher is now 48 × 48 px, with bounded dragging. The standby screen has an animated waveform, scan sweep and pulsing indicators; playback pause freezes monitor motion. Reduced-motion preferences and the extension's Animation speed → Off still stop animations.
- **Call-end parsing:** both JSON and `[CP_CALL_END|NPC name]reason[/CP_CALL_END]` are supported. Completed and partial machine records stay out of narration. Only the named active caller can disconnect; processed events cannot end later calls.

Update the extension and reload SillyTavern; the version should read **2.8.0**. Existing portraits and other saved data are retained.

Validation: **232 automated checks** (55 UI, 16 portrait, 146 RPG, 15 map), JavaScript syntax and CSS parsing passed. Browser preview was blocked by the environment's local-page policy; native iOS Safari rendering, motion and photo-picker behavior still require on-device testing. Cancellation uses SillyTavern's `stopGeneration()` with a local late-response guard; no actual AI provider was called during tests.


## v2.7.0 — Payment approvals, Braindance OS and targeted quickhacks

- **Payments:** NPCs issue `CP_PAYMENT` requests. No money moves until **Accept & pay**; **Decline** grants/spends nothing. Acceptance debits the player, credits the stored NPC and grants purchased items together. Insufficient funds leave the invoice pending. `kind:property` records residences/assets under **Balance**, without an inventory item; `kind:service` pays for a service. Pending requests remain accessible through **Balance → Payment requests**. Repeated events cannot reissue or settle an invoice twice.
- **Braindance:** Enable the draggable launcher in **Cyberware → Settings → Braindance floating control**. Owned `braindance` items appear in the OS with name, info, level, rating, genres, type and creator. Their `scenario` sets the playback scene in main chat. Start/Resume requests one normal host response when idle and the composer is empty; with an unfinished draft or unavailable host generation, send the next message to continue. No background generation loop or parallel helper request. Pause freezes the recording; Stop exits to the saved original scene. Hiding the launcher does not stop playback.
- Playback checkpoints persist in this chat. Recording events cannot change physical money, inventory, HP, location or NPC records, even if those messages are rendered after exit. Narration quality and checkpoint content still depend on the model following the injected protocol.
- **Story hacking:** An access request opens a connection window. Tap Connect for a short progress animation and bounded synthetic diagnostic stream, then play the normal Breach puzzle. Closing the connection window leaves the request available in **Skills / Hacking**; Cancel discards it. An established RPG skill whose name contains hack/netrun/breach and is level 50+ bypasses the puzzle after connecting. This threshold is an extension RP rule. Training still opens the puzzle directly. Hidden data is never included in the diagnostic stream.
- **Header targeting:** Tap an NPC Header to open Quickhack. Set up exactly eight slots under **Skills / Hacking**, using owned quickhack items. Cards show name, effect, level, RAM cost and cooldown. Upload spends resources immediately, records the selected target and leaves effect resolution to the next main-chat response. Empty, unavailable and cooling-down cards cannot upload.
- Same-speaker Header repetitions within a message are removed across narration/dialogue/monologue; another speaker resets the identity display. The prompt instructs the model to preserve the same flow.
- All experience dialogs use the extension modal stack and responsive layouts. Character/chat data remains local to the selected chat; versioned assets and the settings drawer are synchronized.


## v2.6.0 — Story trading and signal island

- Completed main-chat purchases use one atomic trade: debit the agreed total price, add items and optionally equip them when that action was established. Sales remove the specified owned quantities and credit the agreed total. Invalid equipment or insufficient funds reject the entire transaction. Tracked merchant wallets participate; other shop payments use the external story economy. Merchant stock is described by the story, not a stock simulation. Stable event IDs prevent replay. Do not emit an additional transfer/loot record for the same trade.
- Player service payments can now be recorded by the AI with a completed-action reason; quotes and offers must never be charged. Main-chat item equip, unequip, use and removal instructions are explicit in the same-response prompt. No additional model request is made.
- A single compact signal island replaces stacked notifications. New signals replace its preview while retaining up to 60 history entries. Tap to read one entry at a time using previous/next or arrow keys; Activity also opens the archive after the island expires. Existing timeout preferences and reduced-motion settings apply.
- Optional knowledge entries cover Blackwall, NetWatch, post-Krash network boundaries and quickhack queues. Each can be disabled separately. References distinguish a community transcription of the game database from the official CDPR build guide; role-play knowledge limits are original instructions. No plot-ending spoilers are injected.


## v2.5.0 — Story consequences, progression and full data files

- Active persona names replace internal `user` labels in call receipts and message labels. Completed transfers are recorded immediately, not queued as unsent messages. The data reader includes sender, recipient, amount, reason, timestamp and transaction status. Existing summary-only files remain honest about missing contents. New files support full text and named sections; item dossiers include quantity, category, slot, power, capacity and cooldown.
- Main-chat events now support resource deltas (damage/healing/stamina/RAM/stress), batch loot, earned character XP and external story income. Tracked NPC-to-player transfers still debit the NPC wallet and reject insufficient funds. External payments such as cash or employer escrow credit the named recipient with a separate audited income receipt; they must not duplicate a tracked transfer or contract reward.
- Status shows character level, XP and spendable attribute points. Local RP progression: level 1 starts at 100 XP, each threshold rises by 25, maximum level 60; each level grants one attribute point. Body adds 5 maximum HP, Reflexes adds 5 maximum stamina, Technical adds 3 capacity, Intelligence adds 1 maximum RAM and Cool relieves 3 stress. Attributes cap at 20. Increasing maxima never heals/refills the character. These are extension rules, not official 2077 balance.
- Missions show client, individual objectives, completion state and money/XP/item rewards. Complete every objective before settlement. Rewards are granted once, with persistent award IDs; reopening or restating a settled quest cannot grant them again. Manual objective controls are available for scenario correction.
- All consequences use the existing response through the main-chat protocol, with no second AI request. The model must emit the matching records for actual events; arbitrary prose alone cannot reliably update numeric state. A rejected event appears in Activity & notifications. Old chats migrate without resetting money, gear, health or map data.


## v2.4.0 — NC Zoning Board detailed map

- Night City now uses NC Zoning Board satellite tiles generated from its 16K source, loaded only for the visible area. No external JavaScript, iframe, mod-registry login or extra AI request is used. Tiles require internet access; failed requests show a Retry control and source link.
- Actual district/subdistrict boundaries replace the illustrative geography. Dogtown and NCX Spaceport / Morro Rock are included. The map has touch pan/pinch, desktop wheel zoom, district/subdistrict search, layer switches, and an optional exploration mask. Turn off **Exploration mask** to browse the full map without changing story discovery.
- **Set my position** arms one deliberate map tap to save CET coordinates; normal browsing never moves the player. Update location accepts optional paired X/Y and elevation Z. Building/floor/interior remain narrative fields; a named area without coordinates displays an approximate marker. This is story tracking, not a live game connection.
- Shared NPC positions and active mission locations have separate markers. Private NPC locations remain hidden. Main-chat location/mission records update the same saved map, with no additional model call. Existing inventory, cyberware, portraits and story addresses are retained; only the old schematic camera resets for the new geography.
- Attribution is visible below the map. Map imagery and geometry are game-derived fan content, separate from NC Zoning Board’s MIT-licensed code. See [SOURCES.md](SOURCES.md) and [third-party/ASSETS.md](third-party/ASSETS.md).

## v2.3.0 — Implant sockets and Night City atlas

- Equipment art stays in a true square inspection frame on mobile and desktop. Named SVG silhouettes distinguish arm implants, optics, medical implants, leg upgrades and weapon types; supplied images fit without distortion.
- Cyberware shows 10 anatomical groups with 19 base sockets. Frontal cortex, nervous system, circulation, skin and skeleton support multiple implants. Extra hand and skeleton sockets can be unlocked by established story progression or manual setup. Existing installs are retained; a full group asks you to unequip an implant before adding another.
- A new curved human anatomy scan replaces the angular figure. Ten numbered regions track the installed groups, with active neural paths and a compact capacity summary.
- Night City gains layered district silhouettes, illustrative blocks/routes, discovered subdistrict labels, district dossiers, pan, two-finger zoom, layer switches and a locate control. District, subdistrict, building, floor and interior remain story data; browsing does not move the player. The marker indicates an approximate district position.
- Open the [official Piggyback map](https://maps.piggyback.com/cyberpunk-2077/maps/night-city) from the atlas for the actual game geography. The built-in atlas is original illustrative art; official map images/tiles are not bundled.

## v2.2.0 — Ability telemetry and contextual call tools

- Main-chat skill cards show the actor name, known rank/category, mastery, resource cost, cooldown and equipment slot/capacity when recorded. Matching player Hacking records supply their rank and mastery; other abilities use the actor’s RPG skill data. Unknown fields are omitted. New uses retain up to 300 historical telemetry snapshots per chat; rejected uses are labeled accordingly.
- One compact button next to End call opens a bottom drawer with Eurodollars, Location, Information and Cyberware. Escape/backdrop/Close dismiss only the drawer; minimizing or ending the call cleans it up. Drafts and existing send/transfer behavior are preserved.
- Both workspaces gain layered grid drift, soft light passes and sparse particles. Navigation reveals sections in a short stagger; live chat updates do not replay the entrance. Ambient Motion and Animation Speed controls apply, with reduced-motion support and fewer particles on small screens. No animation framework, new API request or runtime dependency is added.
- Visual patterns adapted in original HTML/CSS from [NameThatUI drawers](https://namethatui.com/web/dialog-drawer-sheet), [easing](https://namethatui.com/web/easing), and [21st background examples](https://21st.dev/community/components/s/background).

## v2.1.2 — Anatomy and equipment detail

- Layered anatomy schematic with face plates, torso armor, articulated limbs, joints and neural pathways. Numbered OS/arm/leg nodes reflect equipped cyberware.
- Larger equipment imagery in a blueprint inspection stage, with touch-screen layout adjustments. No gameplay or chat-state changes.

## v2.1.1 — Emergency overlay readability fix

- Breach now covers host chat with a solid backing, including when backdrop filtering or native modal support is unavailable.
- Call windows use an opaque base with the saved opacity setting applied as tint strength; notification cards are opaque too. Cyberware, NPC forms and incoming-call cards already have solid surfaces.
- No changes to puzzle rules, chat processing or saved state. Minimize/restore and close continue to release the workspace.

## v2.1.0 — Cyberware HUD and iPhone Breach polish

- Rebuilt the Cyberware workspace with desktop side navigation and an iPhone section picker. Health has a red segmented HUD, RAM shows memory units, and stamina/capacity/stress have distinct telemetry styling and accessible values. Installed implants have a body schematic and slot list; equipment, skills, accounts, mission objectives and Relic/Blackwall use dedicated components.
- Replaced the oversized Breach matrix with bounded 44 px mobile controls, safe-area padding, a compact header/buffer and visible top-row controls. Underlying extension dialogs are suspended while Breach is open and restored when minimized/closed. Dragging is constrained to keep the header reachable. ACCESS must be matched before Upload enables. Results appear inside the HUD; they do not create a covering toast or leave a huge disabled matrix on screen. The HUD controls retain their outline style; v2.1.1 adds an opaque workspace backing to prevent host-chat bleed-through.
- Fixed the extension drawer's stale `v1.1.0` label. Runtime reconciles the version and adds a direct Cyberware entry even if older drawer markup is already present. Manifest, JavaScript, CSS, module URLs, drawer, in-app protocol reference and current documentation are updated together.
- Main-chat state records now support earned maximum HP/RAM/stamina/capacity changes as well as current resources. Equipment records support add/remove/equip/unequip/use by stored item ID. Using an item consumes resources once and creates its skill header. Invalid status patches are atomic. Private-call quick actions always use the current call participant, independent of the last NPC asset page opened.
- State continues updating with the UI closed. Repeated host render events do not replay actions, regenerate resources, rebuild the Cyberware DOM or reset scroll. Live updates retain unsaved preferences and focused inputs. Ordinary story turns regenerate once through the existing response; no extra model request is added.

**Update:** update the extension and reload SillyTavern. Both the extension drawer and interface headers should show **v2.9.0**. Saved colors, portraits, NPCs, inventory, accounts and chat state are retained.

**Validation:** 210 checks pass: 44 UI, 12 portrait/raster/vision integration, 139 RPG behavior and 15 detailed-map checks, plus syntax/CSS checks. Layout is adapted for 320–430 px mobile widths and desktop; no claim of device-tested iOS Safari is made. Live AI updates still depend on the model following the injected structured protocol. See [SOURCES.md](SOURCES.md) for official visual/gameplay references and the catalog and map scope.

## v2.0.0 — Cyberware, Breach Protocol and connected world systems

Update the extension, then reload SillyTavern. The manifest and all runtime module URLs use `2.0.0`. Runtime modules have no npm dependency; npm is only for development tests.

- **Handles:** imported/saved/generated handles lose leading `@` characters. Identity, contact and call headers always show one prefix, including legacy call peers.
- **Wand → Cyberware:** player Status, Cyberware, Weapons, Balance, Inventory, Skills/Hacking, Missions/Quests, Night City, Relic/Blackwall and Settings. Each NPC contact card also has a Cyberware button for its own account and equipment. NPC identity retains Character/Chat scope; mutable RPG assets and player state are isolated per **chat**, preventing money or injuries leaking across story branches.
- **Starting state:** open Status → Edit starting status for initial funds/resources. Inventory → Browse catalog grants established equipment without spending money; custom items and editable costs are supported. Equip implants across 10 anatomical groups (19 base sockets, plus two optional earned sockets) and up to three weapons. Single-socket groups swap an existing implant; multi-socket groups fill available spaces. Using equipment/skills consumes resources or stack quantities and respects turn cooldowns. Item data is fictional role-play state, not a shop connected to real money.
- **Cyberpsychosis:** equipped load and stress affect a per-story-turn probability. Settings → risk multiplier adjusts it; `0` disables it. Recovery spends a turn, restores RAM/stamina and lowers stress; reducing load and stress lets recovery clear an episode. These are local scenario rules, not the game's formula or a medical model.
- **Skill headers:** `[CP_SKILL]` JSON records show actual user or NPC ability use in main chat. Pipe form `[CP_SKILL|Actor|Ability]effect[/CP_SKILL]` also works. Manual activation adds a saved skill header to the current main-chat message. Ordinary narration is never guessed into a skill use; the AI prompt instructs the model to emit records for established actions.
- **Breach Protocol:** access-point/shard events open a fullscreen HUD with an opaque readability backing. Start in the top row; alternate column/row without reusing cells; match ACCESS before the buffer/time runs out. Finish upload once ACCESS is matched, or pursue the extra sequences. Drag the header vertically or use the slider. Minimize pauses and preserves the puzzle; Resume restores it; Cancel records denial. Hidden data becomes visible only after success, including during streamed generation. A training puzzle is available under Skills/Hacking.
- **Transfers:** Balance → Transfer, the call `€$` button, or `/cp transfer @lucy 500` in main chat/private composer. Thai command: `โอนเงิน 500 ให้ @lucy`. Exact stored names/handles and positive whole amounts are required. A successful transfer debits and credits both accounts atomically and saves receipts. AI NPCs can pay from their own funded accounts; AI records can debit the player for a completed payment with a reason; use CP_TRADE for purchases to keep money and items atomic. Replayed events cannot spend twice.
- **Call data:** send the current location, freeform data/mission/location cards, inventory information or mission details. NPCs can attach item/contact cards and end their own call after their final words. A contact card must contain name, handle, role, status, affiliation, age, gender, personality, appearance and notes; pressing Add contact stores the complete profile with its own supplied starting assets. Duplicate and incomplete contacts are rejected. Received cards are also retained in notification history.
- **Night City:** NC Zoning Board detailed satellite tiles, touch/desktop navigation, exploration mask, district/subdistrict search, player/shared-contact/mission markers and narrative building/floor/interior fields. Exact markers require established CET coordinates or a deliberate map pick. Map tiles load online; no live game or device GPS tracking is performed.
- **Immersion notifications:** dangerous-zone, mission, money and neural alerts disappear after a configurable 2–60 seconds. Hover/focus pauses dismissal; tap opens details. Status → Notification history retains recent information and received cards. Disable notices in Cyberware Settings.
- **Relic/Blackwall:** scenario-gated unlocks, earned/manual setup points, local Relic abilities, RAM cost, Blackwall exposure, health/stress consequences and disconnect recovery. No automatic main-story unlocks or forced spoilers. Numeric tuning and simplified effects are described in [SOURCES.md](SOURCES.md).
- **Equipment data:** 58 named item/family entries plus an opt-in searchable index of 3,420 factual game IDs. All have transparent square SVG fallbacks. **The index is not a verified complete catalog; technical labels and local stats are explicitly marked.** Provenance, source snapshot and regeneration instructions are in [SOURCES.md](SOURCES.md).

**AI integration:** regular events use the existing main response. The call AI button still makes one quiet request; NPC Generate still makes one request and optional vision reference. No background API polling is added. The prompt includes private narrator state plus precise JSON schemas; a model that ignores these schemas will not automatically trigger the new systems. Global Config → prompt injection/extension enable controls still apply. New events are idempotent across render notifications and repeated event IDs. Historical state is not automatically rolled back when editing/swiping/deleting old story messages; use status/equipment controls to reconcile an alternate outcome.

**Verification:** `npm run check` and `npm test` cover 44 DOM checks, 12 native-raster portrait/vision integration checks, and new RPG transaction, skill, call-card, map, puzzle, isolation and security checks. Browser events/ST APIs are simulated. Real iOS Safari rendering, remote tile loading, keyboard, touch gestures, live AI compliance and model vision still require device testing. `tests/preview.html` has manager/call/Cyberware/implant/atlas/Breach controls for manual review via an HTTP server.

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

For an existing installation, update the extension and reload the page. Versioned JS, CSS, and settings-template URLs request the new assets. The extension drawer and interface header should show **v2.4.0**.

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

`2.4.0`

## Development checks

Run `npm ci`, `npm run check`, and `npm test`. Development dependencies are used only by the tests; installation in SillyTavern needs no build or npm step.

The DOM regression suite covers record-level call replay prevention, world-data selection, empty-field NPC generation, navigation, search/filter state, saved settings, Thai translation, NPC edit/save, call queue/send/minimize/restore, failed generation, private-tag routing, and chat-switch isolation. Dialog and viewport APIs are simulated. These tests do not verify native browser rendering, touch behavior, or real iOS Safari keyboard behavior.

The portrait suite uses a native raster canvas to test real image downsampling, square JPEG export and framing. It simulates pointer/pinch events and the host vision API to check upload/paste integration, quota guards, crop persistence and chat isolation. It does not call an actual AI provider. `tests/preview.html` is a manual browser fixture with synthetic imagery and a simulated AI; serve the repository over HTTP to inspect it. Vision generation in that standalone fixture needs the host API or a test stub.

Validation for v1.2.0: JavaScript syntax and CSS parse checks, 41 DOM checks and 12 image/integration checks passed. Native browser visual review was blocked by the review environment's local-URL policy; real iOS Safari rendering, keyboard and touch behavior remain to be checked on-device.


### v2.7.1 — Portrait picker and Braindance deck

- NPC editing uses one extension modal at a time. Cancelling the native photo picker keeps the editor open; cancelling or saving the editor returns to the manager.
- The portrait picker is a visible native file control. Further uploads and saving are disabled while a portrait is decoding.
- Braindance has a headset launcher with viewport-aware dragging, a sensory monitor, playback state, and recording cards. Motion respects reduced-motion and extension animation settings.

Device verification still required: on iOS Safari, open Create NPC, choose a JPEG/PNG/WebP portrait, cancel and reopen the picker, then crop/save and reopen the NPC. Check a large phone photo and keyboard/orientation changes. Confirm the Braindance launcher drags without opening, taps to open, and playback/pause/resume/exit work. Automated tests simulate the host and events; they do not reproduce an iOS process crash.
