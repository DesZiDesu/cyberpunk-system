# v3.7.1 native acceptance checks — pending

- [ ] Confirm version 3.7.1. On the reported closed store, review both addresses, confirm only if actually at that counter, and verify stock/wallet/till do not change. Leaving the counter still disables checkout.
- [ ] Reopen a closed pending Device Breach; it resumes the existing console. Try another device; Resume existing and Cancel-and-switch both work without AI or RAM spend. A successful actual puzzle is still required for secured access.
- [ ] Mixed unknown device actions display a warning but retain supported operations. Exact-name inline ID mismatches do not add duplicate UNRECORDED rows. Local confirmation of an existing same-name/type device creates no new registry entry.
- [ ] Send one mail/call/neural/NPC-text request. Recovery reports isolated raw on a supported host, no duplicate request, the chosen output cap, and character count. Compare provider Usage separately; do not infer currency cost from these counts.
- [ ] Main Send/Stop state restores after raw completion, cancellation, provider error and chat switch; private request controls remain cancellable. Test with a real configured provider, including a reasoning model if used.
- [ ] Vision and older-host requests show quiet compatibility; review their actual context size in host/provider diagnostics. Cancellation must not trigger an automatic retry.

## v3.7.0 acceptance checks

- [ ] Update/reload and confirm 3.7.0; retain an old-chat backup. Existing Device Hacking configuration and current story remain unchanged.
- [ ] Blank first-message card and empty chat: one six-step registration panel appears in Main Chat. A real greeting, alternate greeting, existing story or group chat is not replaced.
- [ ] Complete all steps at 320–430 CSS pixels, enlarged text and landscape. Thai inputs do not zoom unexpectedly, keyboard does not trap the final controls, and theme colors match.
- [ ] Reload mid-form: draft remains. Invalid level/name/custom path/opening cannot mutate starting assets. Review and confirm; one normal main-chat reply streams, generation status and cancellation are visible, and UI disappears only after success.
- [ ] Offline/empty API response retains draft with retry error. Cancel mid-stream; review any partial host message before retry. Double taps and switching chat during generation do not duplicate or apply old character data in the new chat.
- [ ] A nonempty composer draft is preserved and blocks opening generation.
- [ ] Export a populated world with portraits, mail offers, completed payments, NPC actors, property storage, vehicle cargo, equipped Quickhacks, shop stock and device programs. Review continuity notes; verify downloaded JSON remains below 25 MB.
- [ ] In a new empty single-card chat import, review and confirm. Existing story blocks import. Verify all balances/quantities/IDs, inactive calls and puzzles, preserved transaction receipts, and no repeated old notification popups. No AI call occurs before Continue is confirmed.
- [ ] Generate continuation: previous identity, location/date/time and reviewed story notes are present, no starting assets are awarded twice, and the old chat is unchanged. Revisit shops/devices through new story observations.
- [ ] Shop entrance, device rows and pagination arrows render as monochrome SVG, not emoji.

## Previous release checks still applicable

- [ ] Update/reload and confirm 3.6.0. Preserve the current chat and Device Hacking configuration.
- [ ] AI estimates 3 seconds for an easy link and 20 seconds for a harder one. Confirm the estimate/reason before Connect, different durations, and unchanged puzzle timer.
- [ ] Older device without an estimate shows “Default · no AI estimate”, 12s. Fresh CP_DEVICE observation updates the estimate.
- [ ] ICE geometry and log fit portrait/landscape at 320–430 CSS pixels; footer remains reachable with enlarged UI/text.
- [ ] Background/foreground the app: preparation pauses and resumes without rushing. Motion off/Reduce Motion stop decorative rotation.
- [ ] Device link: cancel, disconnect/reconnect, leave/return and reset security before Continue. Old link must not grant access.
- [ ] Switch accent/surface/text theme colors; inspect console, nearby list and shop entrance, including disabled shop state and keyboard focus.
- [ ] 13 nearby devices: swipe-scroll vertically, page using arrows, open a later row, continue main chat and leave room. Only one current list, no underlined device buttons.
- [ ] 500 NPCs with portraits: page/search/filter, toggle a disabled NPC, edit a later record, close/reopen. Observe memory/reload behavior on the target iPhone; automated DOM tests are not a native memory benchmark.
- [ ] Upload normal JPEG/PNG/WebP and 48MP photo. The latter must show a resize error without crashing; cancel and retry a smaller image. Existing portrait remains intact.

Historical checklists below document previous versions; their selectable-duration/inline-device UI has been superseded.

# v3.5.2 shops and Device Hacking release checklist

Status: automated host/DOM tests passed; these device checks are **not yet executed**. The local browser preview was blocked in the authoring environment. Use a copy of a chat and export a backup before destructive/restore tests. Never use a paid model merely to run the automated suite.

## iPhone Safari

- [ ] Update and reload; confirm 3.5.2 in the settings drawer and newly opened windows.
- [ ] Retry a current-message camera record with `operation:"shutdown"`: registration succeeds, Device Control shows the pending request, and no RAM or effect changes until a permitted Upload. An older-message retry must request a fresh observation rather than claim success.
- [ ] Open `tests/preview.html` → Shop scene / return. Buy and Sell, categories, search, quantity fields, receipt review and Edit shop remain readable at 320–430 CSS px widths and with the keyboard open.
- [ ] Stay in shop for multiple messages: the original button remains usable. Leave counter: the old card becomes muted; an already open confirmation cannot charge. Return: a fresh card replaces the old one and depleted stock stays depleted.
- [ ] Buy the last item, double-tap Confirm, sell an owned stack and buy back its resale copy. Check stock, money, ammunition/level metadata and a single receipt. Equipped gear and loaded Quickhacks cannot be sold.
- [ ] Edit catalog/story stock and buyback terms; cancel/back without saving, then save deliberately. Shop funds and player money remain separate. No refresh or real-time delay replenishes stock.
- [ ] Change theme colors and motion preferences; shop cards, product grid, editor and receipt dialog use the saved palette. Scroll/select products without losing the quantity field to an unchanged background refresh.
- [ ] Use inline devices and a storefront in the same scene; leaving invalidates the correct shop visit and device connectivity. Device Hacks, Quickhack slots and shared-network Breach keep their prior behavior.
- [ ] Open `tests/preview.html` → Device scene: inline camera/drone names keep the paragraph's font and line spacing. Tap each name with a finger and focus it with an external keyboard.
- [ ] Device Control stays within the visible viewport at 320–430 CSS px widths, with Back/Close, Upload, RAM and rejection reasons readable. Target Override input stays reachable with the keyboard open.
- [ ] Breach Camera A, finish ACCESS, close Breach and use Camera B. The separate drone network stays locked. Cancel a second breach and verify no rights are granted.
- [ ] Quickhack Deck tabs retain independent selections. Shrinking occupied Device slots reports an error without dropping programs; the device switch blocks Upload without deleting data.
- [ ] Change theme colors and disable motion; check device panels, inline underlines, reticle and program controls. Turning the feature off must not alter ordinary narration.
- [ ] Enter each workspace from Wand and from Cyberware; Back returns to its parent/previous section, and Close remains reachable in portrait/landscape.
- [ ] Switch saved accent/background colors; check Mailbox, house/car cards, dossiers, support monitor and recovery dialogs match.
- [ ] With a keyboard open, verify text fields do not force an unwanted page zoom and Send/Save/Cancel remain reachable. Test at 320–430 CSS px widths and with larger text settings.
- [ ] In the NPC editor, select a large photo, cancel the picker, select again, crop/zoom and save. Confirm Safari does not reload or lose the current chat. Try a HEIC photo exported to a supported format if necessary.
- [ ] Reduce Motion and extension animation Off stop ambient/detail animation. Normal motion stays smooth during scrolling and the device does not become unusually hot.
- [ ] Swipe mail rightward for Read/Delete and leftward for Archive/Pin; vertical scrolling must not trigger either action. Trash restores a message into the original thread.
- [ ] Edit an original and a reply, regenerate an NPC message, restore an earlier text version and confirm no attached money/items are paid twice.
- [ ] Start one mail reply with a configured model. Check thread and main-chat generation indicators, cancel, and confirm a late response is ignored. Test offline/timeout recovery and retry explicitly.
- [ ] Start NPC generation, cancel and close; reopen the editor and verify no late fields are saved. Repeat for call and neural AI with separate drafts.

## Connected data and recovery

- [ ] Buy/enter an established home; upgrade Stash, Workshop, Living and Garage. Deposit/withdraw quantities, craft a program, load it into the existing deck and use a crafted medkit.
- [ ] Split a stack, change one copy's stats and withdraw the other; verify both stats remain intact. Insufficient funds/materials must not consume either.
- [ ] Rest once, try resting again in the same story turn, then advance the story and retry. Resource caps remain intact.
- [ ] Buy/summon a vehicle, record a trip and check displayed fuel/wear. Refuel, upgrade Cargo/Engine/Armor, assign a home garage and check capacity.
- [ ] Try selling a home/car with cargo or assigned vehicles. The operation must reject without changing money or ownership.
- [ ] Inspect a deliberately malformed complete story record in a test chat, correct its payload and retry once. Rerendering the original message must not apply it again.
- [ ] Export a checkpoint, change extension inventory, review/import and restore. The old extension state returns; ordinary SillyTavern text and historical HUDs intentionally do not rewind.
- [ ] Change chats during a pending request/import preview. No old result or restore may affect the new chat.

## Desktop

- [ ] Repeat Back/Close and keyboard-only tab navigation, especially sticky dossier tabs and confirmation dialogs.
- [ ] Use Mailbox Edit mode for selection/deletion without touch swipes.
- [ ] Confirm JSON download/import works and exported backups are stored privately.

Record device, iOS/browser and SillyTavern versions with failures. Do not paste private prompts, API keys or full backups into public issues.

## 3.5.2 connection and interaction follow-up — native checks pending

- [ ] Story connection: the three stages and code stream fit portrait iPhone; footer controls remain reachable while the log scrolls.
- [ ] Select 8, 12 and 20 seconds. The finished log waits for Enter Breach; going to another app pauses preparation.
- [ ] Close, cancel and reopen. Ready logs persist, cancelled links never open protected data.
- [ ] A shop containing an unknown catalog row still opens; that row is not purchasable. Verify recovery of an earlier failed opening at the same counter.
- [ ] Device metadata without inline tags creates a control. Thai look/scan narration without tags exposes Inspect device. Confirming a scene device still requires Breach before commands.
## 3.7.2 registration — native checks pending

- [ ] On iPhone portrait/landscape, all six steps retain the same full available width without horizontal scrolling or composer overlap at the bottom.
- [ ] Preset cards follow the selected theme; tap targets and keyboard focus are clear. Reduced motion disables transitions.
- [ ] Type a custom value, switch to Preset and choose a card, then switch back: the typed value returns. Navigate away/back and reload to verify draft persistence.
- [ ] Custom lifepath has one editor. Custom player-agency text reaches the opening prompt.
- [ ] Select/deselect multiple assets and None. No inventory change or AI request occurs before confirmation.
- [ ] Review defaults to 5 minutes and supports 10. Start one opening, observe host generation, cancel, and verify no automatic retry. Test a slow provider manually; already processed tokens may be charged.
