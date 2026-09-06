# Cyberware v2.3 sources and scope

Reviewed through 2026-09-06. This is an unofficial SillyTavern role-play extension. No game screenshots, proprietary map tiles, game UI code, or ripped inventory textures are bundled. SVG symbols and the schematic map are original code.

## Official setting and gameplay references

- [CD PROJEKT RED — Update 2.0](https://www.cyberpunk.net/en/news/49060/update-2-0): cyberware capacity, RAM/Overclock, the five progression tracks and the distinction between quickhacks and access-point Breach Protocol. Breach is not offered as the pre-2.0 enemy-breaching action.
- [CD PROJEKT RED — Netrunner build](https://www.cyberpunk.net/en/news/50026/hack-slash-netrunner-build-breakdown): cyberdecks, quickhacks and resource-based netrunning.
- [CD PROJEKT RED — Bullet-Time Ninja](https://www.cyberpunk.net/en/news/50020/bullet-time-ninja-build-breakdown): Sandevistan/weapon build context.
- [CD PROJEKT RED — Night City visitor guide](https://www.nightcity.love/en/): district/subdistrict identities, public transit and local context. This is in-world promotional writing; its safety claims are not used as objective danger ratings.
- [Cyberpunk 2077 / Phantom Liberty](https://www.cyberpunk.net/): Relic skill-tree framing. The local Relic and Blackwall controls are scenario tools; they do not recreate the DLC story or force its spoilers.
- [Official Piggyback interactive Night City map](https://maps.piggyback.com/cyberpunk-2077/maps/night-city): useful external reference. Its tiles, markers, paid data and geographic coordinates are **not** copied. The extension map is an original illustrative atlas with narrative interior/floor fields, not street-level navigation. District centers are approximate; blocks/routes are decorative. The UI links to the official map separately.

## Breach Protocol cross-checks

- [Polygon — Breach Protocol guide](https://www.polygon.com/cyberpunk-2077-guide-walkthrough/22163900/breach-protocol-encrypted-shard-militech-datashard-access-point-quickhack-buffer/).
- [Steam Community — Breach Protocol guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2318375253).

The local puzzle starts in the top row, alternates column/row, forbids reuse of a selected cell and checks contiguous code sequences in a limited buffer. Timer starts on the first choice. **Extension conveniences:** minimizing pauses the timer; a slider/drag moves the outline HUD over its opaque workspace; generated sequences and rewards are local. ACCESS unlocks data, DATAMINE/BONUS are optional sequence goals. These are inspired mechanics and original presentation, not an exact replica of the game UI.

## Equipment index provenance

Factual `Items.*` identifiers and category assignments were extracted from the PUBLICNET and BLACKWALL store lists in [neideltern/agis-all-game-items-store](https://github.com/neideltern/agis-all-game-items-store), snapshot [`103a6250ca119ad575125de86d3118703370db8b`](https://github.com/neideltern/agis-all-game-items-store/tree/103a6250ca119ad575125de86d3118703370db8b). Only identifier facts/category metadata were retained; mod store code, pricing, localization, branded art and creative descriptions were not copied.

- **3,420 distinct technical IDs**, deduplicated across tiers/lists. Their labels are mechanically separated ID tokens, **not verified localized display names**.
- **58 named equipment/item-family entries** for convenient role-play browsing. Some are broad families (e.g. Cyberdeck or Sandevistan), not specific item models. This subset has local editable defaults.
- This is **not a verified exhaustive catalog of every game/DLC item**, quest object, variant, statistic or appearance. No claim of patch-complete coverage is made.
- The UI makes the technical index opt-in, searches names/IDs/categories and renders at most 60 matches at once. Narrow the search to find additional matches.
- Every category has an original transparent 1:1 SVG fallback. Valid embedded PNG/JPEG/WebP data supplied in item records can replace it. The bundle does not pretend a category icon is a verified photograph of a particular weapon.
- Rebuild from that checkout using `python scripts/build-catalog.py /path/to/agis-all-game-items-store`. The script contains the named entries and district metadata alongside the extraction rule.

## Local mechanics, not canon formulas

Cyberpsychosis probability, implant capacity costs, health/stamina recovery, item power, cooldown turns, weapon slots, Relic point rewards/effects, Blackwall exposure and damage are **extension role-play tuning**. The risk multiplier can be set to zero. A risk roll does not command the AI to take control of the player's character. NPC knowledge remains limited to information established in the scene.

## v2.1 visual refinement references

- [CD PROJEKT RED — What is coming in 2.0: Cyberware](https://www.cyberpunk.net/en/news/49129/whats-coming-in-2-0-cyberware): visual/body-installation and capacity framing. The new extension scan, slots and HUD are original components; they do not bundle the game's UI art.
- [Official build planner](https://www.cyberpunk.net/en/build-planner): angular panels, concise section hierarchy and distinct progression information informed the revised workspace.
- [CD PROJEKT RED — Update 2.1 accessibility features](https://www.cyberpunk.net/en/news/49591/update-2-1-accessibility-features): readable HUD scale and optional decoration inform the bounded mobile controls and preserved reduced-motion settings.

Theme colors remain configurable. The mobile matrix uses explicit touch-sized rows instead of growing square cells. Desktop and mobile navigation differ in layout while reading the same authoritative chat state.

## v2.2.0 interaction references

Reviewed 2026-09-06: [NameThatUI — drawers/sheets](https://namethatui.com/web/dialog-drawer-sheet), [easing](https://namethatui.com/web/easing), and [21st — background components](https://21st.dev/community/components/s/background). Used as pattern references for an original dependency-free implementation: contextual bottom sheet, eased page reveals, sparse particle/grid/light layers. No third-party component source copied.

## v2.3.0 implant and atlas references

- [CD PROJEKT RED — Cyberware in Update 2.0](https://www.cyberpunk.net/en/news/49129/whats-coming-in-2-0-cyberware): body-system grouping and implant capacity context.
- [VULKK — Update 2.0 cyberware catalog](https://vulkk.com/2023/09/30/full-cyberware-catalog-for-cyberpunk-2077-update-2-0-and-phantom-liberty/): cross-check for the ten body groups and base socket counts, including the optional second hand socket (Ambidextrous).
- [CD PROJEKT RED — Patch 2.11](https://www.cyberpunk.net/en/news/49831/patch-2-11): License to Chrome additional skeleton socket. The extension uses explicit earned/manual unlock flags; it does not implement attribute/perk prerequisites.
- [Piggyback official map](https://maps.piggyback.com/cyberpunk-2077/maps/night-city): provided as an external link. No official map image, paid tile or marker database is bundled. The local atlas is original illustrative geometry and must not be used as exact in-game street navigation.

Base sockets: frontal cortex 3, face 1, operating system 1, arms 1, hands 1, skeleton 2, nervous system 3, circulatory system 3, integumentary system 3 and legs 1 (19 total). The two optional sockets bring the total to 21. Slot restrictions preserve existing installations on migration; capacity costs, combat effects and cooldowns remain editable local role-play tuning. New anatomy paths and named square equipment glyphs are original SVG, not traced game art.
