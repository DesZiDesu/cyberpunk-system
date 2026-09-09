# Cyberpunk 2077 content registry

This repository now has a patch-aware path for building one searchable registry for items, item icons, vehicles and locations without hard-coding a stale public dump.

## Current baseline

- Runtime compatibility target: Cyberpunk 2077 2.31.
- Content baseline: Update 2.3 plus Phantom Liberty.
- Existing `rpg-catalog.js`: retained as the built-in seed for `Items.*` technical IDs.
- Existing `rpg-map-data.js`: retained as the built-in district/subdistrict geometry source.
- `data/cyberpunk-vehicles.seed.json`: curated display-name seed for vehicles, motorcycles, military vehicles, AV/aircraft, watercraft and rail vehicles.
- `scripts/import-cyberpunk-content.py`: merges the built-in seed with a local TweakDB JSON dump and locally exported icon images.

`data/cyberpunk-vehicles.seed.json` is deliberately a display-name seed, not a claim that every hidden spawn, livery, quest clone or traffic variant is represented by hand. The authoritative way to enumerate those records is a dump from the installed game version.

## Build a registry from the repository only

```bash
python scripts/import-cyberpunk-content.py
```

This creates:

- `data/cyberpunk-content.generated.json`
- `rpg-content.generated.js`

The generated JavaScript assigns the registry to `globalThis.BLACK_RPG.CONTENT`.

## Patch-complete item and vehicle technical IDs

Cyberpunk 2077 stores gameplay records in TweakDB. Use a current tool such as WolvenKit's Tweak Browser, TweakXL or Cyber Engine Tweaks to inspect/export records from your legally installed game, then provide a JSON dump:

```bash
python scripts/import-cyberpunk-content.py \
  --tweakdb-json "D:/cp2077-export/tweakdb.json"
```

The importer searches all strings and object keys in the dump for:

- `Items.*`
- `Vehicle.*`
- fast-travel, district, world-map and mappin record prefixes

This means post-2023 item records and hidden vehicle variants can augment the older public catalog instead of being silently omitted.

## Exact in-game item/weapon icons

WolvenKit can export Cyberpunk `.xbm` textures to PNG. Export the UI item/icon atlases or individual item textures into a local directory and run:

```bash
python scripts/import-cyberpunk-content.py \
  --tweakdb-json "D:/cp2077-export/tweakdb.json" \
  --icons-dir "D:/cp2077-export/icons"
```

The importer recursively indexes PNG/WebP/JPEG files and attempts deterministic matches against `Items.*` IDs. It also preserves unmatched files in `unmatchedIconFiles`, so an uncertain match is never silently invented.

For item UI assets, useful game archive paths commonly live under the gameplay GUI/item icon atlases. Keep the exported directory structure intact when possible; it makes later matching and auditing easier.

## Locations

There are two location layers:

1. **Geographic layer** — `rpg-map-data.js` supplies district and subdistrict IDs, names, centers and polygons already used by BLACK's map.
2. **Game-record layer** — a current TweakDB dump adds fast-travel/world-map/mappin/district technical records. This is the path to exhaustive POI identifiers without maintaining a hand-written list that goes stale.

Named interiors, quest-only spaces and streaming-sector objects are not necessarily represented as one simple `FastTravelPoint` record. If BLACK later needs every world-streaming entity, build a second extractor from WolvenKit/archive metadata rather than treating every archive node as a player-facing place.

## Registry shape

```json
{
  "schemaVersion": 1,
  "game": "Cyberpunk 2077",
  "compatibilityBaseline": "2.31",
  "contentBaseline": "2.3 + Phantom Liberty",
  "counts": {},
  "items": {
    "technicalIds": [],
    "icons": {}
  },
  "vehicles": {
    "seed": [],
    "technicalIds": []
  },
  "locations": {
    "map": [],
    "technicalIds": []
  },
  "unmatchedIconFiles": []
}
```

## Source and redistribution policy

The registry stores metadata, technical identifiers, local file mappings and derived indexes. It does **not** add a wholesale dump of proprietary Cyberpunk 2077 texture binaries to this public repository.

CD PROJEKT RED's Fan Content Guidelines allow fan/community software subject to their rules, including non-commercial and unofficial presentation requirements. The project should keep a visible unofficial-fan-work notice and should not assume that bulk redistribution of extracted game assets is automatically licensed.

Recommended workflow:

- Commit metadata and code.
- Generate exact asset mappings from the developer's own installed copy.
- Keep extracted proprietary image binaries local/private unless redistribution rights are confirmed.
- If the public extension needs icons without shipping CDPR texture files, use original project-made iconography or a licensed asset pack and keep `Items.*` as the canonical lookup key.

## Next integration point

The existing app currently loads `rpg-catalog.js`, `rpg-map-data.js` and `rpg-assets.js`. A follow-up UI integration can load `rpg-content.generated.js` after `rpg-catalog.js` and use `BLACK_RPG.CONTENT` for:

- searchable item/weapon preset pickers,
- icon-backed inventory cards,
- garage vehicle presets,
- AV/military/rail/watercraft reference entries,
- location/fast-travel preset pickers,
- custom-input fallback when a preset is not suitable.
