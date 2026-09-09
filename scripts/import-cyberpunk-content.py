#!/usr/bin/env python3
"""Build a Cyberpunk 2077 content registry from the extension's seed data and local game exports.

The repository deliberately does not redistribute CD PROJEKT RED texture binaries. For patch-complete
item IDs and exact game icons, export/dump data from a legally installed copy of Cyberpunk 2077 and run
this script locally.

Examples:
  python scripts/import-cyberpunk-content.py
  python scripts/import-cyberpunk-content.py --tweakdb-json C:/cp2077-export/tweakdb.json
  python scripts/import-cyberpunk-content.py --icons-dir C:/cp2077-export/icons --tweakdb-json C:/cp2077-export/tweakdb.json
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[1]
ITEM_RE = re.compile(r"\bItems\.[A-Za-z0-9_.$-]+")
VEHICLE_RE = re.compile(r"\bVehicle\.[A-Za-z0-9_.$-]+")
LOCATION_PREFIXES = (
    "FastTravelPoint.", "FastTravelPoints.", "District.", "Districts.",
    "Mappin.", "Mappins.", "WorldMap.", "WorldMapSettings.", "WorldMapFilter."
)
IMAGE_EXTENSIONS = {".png", ".webp", ".jpg", ".jpeg"}


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def unique_sorted(values: Iterable[str]) -> list[str]:
    return sorted(set(values), key=lambda value: value.lower())


def extract_existing_items(catalog_path: Path) -> list[str]:
    if not catalog_path.exists():
        return []
    return unique_sorted(ITEM_RE.findall(read_text(catalog_path)))


def extract_map_locations(map_path: Path) -> list[dict[str, Any]]:
    if not map_path.exists():
        return []
    text = read_text(map_path)
    marker = "globalThis.CyberpunkMapData = "
    start = text.find(marker)
    if start < 0:
        return []
    payload = text[start + len(marker):].strip()
    if payload.endswith(";"):
        payload = payload[:-1]
    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        return []
    output: list[dict[str, Any]] = []
    for district in data.get("districts", []):
        output.append({
            "id": district.get("id"),
            "name": district.get("name"),
            "kind": "district",
            "parent": None,
            "center": district.get("center"),
        })
        for area in district.get("areas", []):
            output.append({
                "id": area.get("id"),
                "name": area.get("name"),
                "kind": "subdistrict",
                "parent": district.get("id"),
                "center": area.get("center"),
            })
    return [entry for entry in output if entry.get("id") and entry.get("name")]


def walk_json(value: Any, path: str = "") -> Iterable[tuple[str, Any]]:
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}" if path else str(key)
            yield child_path, child
            yield from walk_json(child, child_path)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            child_path = f"{path}[{index}]"
            yield child_path, child
            yield from walk_json(child, child_path)


def strings_from_json(value: Any) -> Iterable[str]:
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for key, child in value.items():
            yield str(key)
            yield from strings_from_json(child)
    elif isinstance(value, list):
        for child in value:
            yield from strings_from_json(child)


def load_tweakdb(path: Path | None) -> tuple[list[str], list[str], list[str]]:
    if path is None:
        return [], [], []
    raw = json.loads(read_text(path))
    strings = list(strings_from_json(raw))
    items = unique_sorted(match.group(0) for s in strings for match in ITEM_RE.finditer(s))
    vehicles = unique_sorted(match.group(0) for s in strings for match in VEHICLE_RE.finditer(s))
    locations = unique_sorted(
        s.strip() for s in strings
        if isinstance(s, str) and s.strip().startswith(LOCATION_PREFIXES)
    )
    return items, vehicles, locations


def normalize_token(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def index_icons(directory: Path | None, item_ids: list[str]) -> dict[str, Any]:
    result: dict[str, Any] = {"files": [], "itemMatches": {}}
    if directory is None or not directory.exists():
        return result
    files = sorted(
        path for path in directory.rglob("*")
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    )
    relative = [path.relative_to(directory).as_posix() for path in files]
    result["files"] = relative

    by_token: dict[str, list[str]] = {}
    for rel in relative:
        stem_token = normalize_token(Path(rel).stem)
        if stem_token:
            by_token.setdefault(stem_token, []).append(rel)

    matches: dict[str, str] = {}
    for item_id in item_ids:
        tail = item_id.split(".", 1)[-1]
        token = normalize_token(tail)
        if not token:
            continue
        exact = by_token.get(token)
        if exact:
            matches[item_id] = exact[0]
            continue
        # WolvenKit exports often preserve longer archive paths or prefixes.
        candidates = [rel for rel in relative if token in normalize_token(Path(rel).stem)]
        if len(candidates) == 1:
            matches[item_id] = candidates[0]
    result["itemMatches"] = matches
    return result


def load_vehicle_seed(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    payload = json.loads(read_text(path))
    return payload.get("vehicles", []) if isinstance(payload, dict) else []


def build_registry(args: argparse.Namespace) -> dict[str, Any]:
    existing_items = extract_existing_items(args.catalog)
    tweak_items, tweak_vehicles, tweak_locations = load_tweakdb(args.tweakdb_json)
    all_items = unique_sorted(existing_items + tweak_items)
    map_locations = extract_map_locations(args.map_data)
    vehicle_seed = load_vehicle_seed(args.vehicle_seed)
    icons = index_icons(args.icons_dir, all_items)

    return {
        "schemaVersion": 1,
        "game": "Cyberpunk 2077",
        "compatibilityBaseline": "2.31",
        "contentBaseline": "2.3 + Phantom Liberty",
        "generatedFrom": {
            "existingCatalog": str(args.catalog),
            "mapData": str(args.map_data),
            "vehicleSeed": str(args.vehicle_seed),
            "tweakdbDump": str(args.tweakdb_json) if args.tweakdb_json else None,
            "iconsDirectory": str(args.icons_dir) if args.icons_dir else None,
        },
        "counts": {
            "itemTechnicalIds": len(all_items),
            "vehicleSeedEntries": len(vehicle_seed),
            "vehicleTechnicalIds": len(tweak_vehicles),
            "mapDistrictAndSubdistrictEntries": len(map_locations),
            "tweakdbLocationIds": len(tweak_locations),
            "iconFiles": len(icons["files"]),
            "iconsMatchedToItems": len(icons["itemMatches"]),
        },
        "items": {"technicalIds": all_items, "icons": icons["itemMatches"]},
        "vehicles": {"seed": vehicle_seed, "technicalIds": tweak_vehicles},
        "locations": {"map": map_locations, "technicalIds": tweak_locations},
        "unmatchedIconFiles": [rel for rel in icons["files"] if rel not in set(icons["itemMatches"].values())],
    }


def write_outputs(registry: dict[str, Any], output_json: Path, output_js: Path | None) -> None:
    output_json.parent.mkdir(parents=True, exist_ok=True)
    pretty = json.dumps(registry, ensure_ascii=False, indent=2) + "\n"
    output_json.write_text(pretty, encoding="utf-8")
    if output_js:
        output_js.parent.mkdir(parents=True, exist_ok=True)
        payload = json.dumps(registry, ensure_ascii=False, separators=(",", ":"))
        output_js.write_text(
            "/* Generated by scripts/import-cyberpunk-content.py. Do not edit manually. */\n"
            "globalThis.BLACK_RPG = globalThis.BLACK_RPG || {};\n"
            f"globalThis.BLACK_RPG.CONTENT = {payload};\n",
            encoding="utf-8",
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--catalog", type=Path, default=ROOT / "rpg-catalog.js")
    parser.add_argument("--map-data", type=Path, default=ROOT / "rpg-map-data.js")
    parser.add_argument("--vehicle-seed", type=Path, default=ROOT / "data" / "cyberpunk-vehicles.seed.json")
    parser.add_argument("--tweakdb-json", type=Path)
    parser.add_argument("--icons-dir", type=Path)
    parser.add_argument("--output-json", type=Path, default=ROOT / "data" / "cyberpunk-content.generated.json")
    parser.add_argument("--output-js", type=Path, default=ROOT / "rpg-content.generated.js")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    registry = build_registry(args)
    write_outputs(registry, args.output_json, args.output_js)
    print(json.dumps(registry["counts"], indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
