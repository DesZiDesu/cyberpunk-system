# v3.5.0 shops and Device Hacking release checklist

Status: automated host/DOM tests passed; these device checks are **not yet executed**. The local browser preview was blocked in the authoring environment. Use a copy of a chat and export a backup before destructive/restore tests. Never use a paid model merely to run the automated suite.

## iPhone Safari

- [ ] Update and reload; confirm 3.5.0 in the settings drawer and newly opened windows.
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
