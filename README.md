# Cyberpunk System

A mobile-first SillyTavern extension for cyberpunk character presentation, persistent Character/Chat NPC records, private calls, and hacking-skill progression.

## Features

- Cyberpunk Header, Dialogue, and Monologue blocks rendered in the main chat.
- Exactly two persistence scopes: **Character** and **Chat**. Chat records override matching Character records.
- Wand-menu interface with NPC dossiers, outgoing calls, hacking skills, and live configuration.
- Incoming call notification outside the main chat; Accept opens a translucent, blurred full-screen private-call interface.
- Press **Enter** in a call to queue a local message without generation. Press the adjacent AI-send button to submit queued text and request one private response.
- Active calls may receive `[CP_SIGNAL]` content from the next normal main-chat AI reply, even while minimized.
- AI hacking updates ride inside the normal main reply and do not start a second request.
- English and Thai UI with Orbitron / Chakra Petch cyberpunk font stacks.
- Safe-area-aware vertical iPhone/Safari layout.

### v1.0.1 reliability fixes

- Reprocesses streamed and late-rendered SillyTavern messages so private call and hacking tags never remain visible in the main chat.
- Uses explicit left/right call rows for NPC and user messages.
- Moves the minimized-call control above the mobile composer and restores the call through a topmost interaction layer.
- Uses native full-screen dialogs for Create/Edit NPC and hacking-skill forms on mobile Safari.

## Install

1. Open **Extensions** in SillyTavern.
2. Select **Install extension**.
3. Paste `https://github.com/DesZiDesu/cyberpunk-system`.
4. Reload SillyTavern.

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

`1.0.1`
