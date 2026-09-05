# Cyberpunk System

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
