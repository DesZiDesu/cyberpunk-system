#!/usr/bin/env python3
"""Build a Cyberpunk 2077 content registry from seed data and local/current record exports.

The repository deliberately does not redistribute CD PROJEKT RED texture binaries. For patch-complete
item IDs and exact game icons, export/dump data from a legally installed copy of Cyberpunk 2077 and run
this script locally. Plain-text record lists from tooling can also be merged as supplementary indexes.

Examples:
  python scripts/import-cyberpunk-content.py
  python scripts/import-cyberpunk-content.py --tweakdb-json C:/cp2077-export/tweakdb.json
  python scripts/import-cyberpunk-content.py --record-list C:/cp2077-export/records.txt
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


def split_records(strings: Iterable[str]) -> tuple[list[str], list[str], list[str]]:
    materialized = [value.strip() for value in strings if isinstance(value, str) and value.strip()]
    items = unique_sorted(match.group(0) for value in materialized for match in ITEM_RE.finditer(value))
    vehicles = unique_sorted(match.group(0) for value in materialized for match in VEHICLE_RE.finditer(value))
    locations = unique_sorted(
        value for value in materialized if value.startswith(LOCATION_PREFIXES)
    )
    return items, vehicles, locations


def load_tweakdb(path: Path | None) -> tuple[list[str], list[str], list[str]]:
    if path is None:
        return [], [], []
    raw = json.loads(read_text(path))
    return split_records(strings_from_json(raw))


def load_record_lists(paths: list[Path]) -> tuple[list[str], list[str], list[str]]:
    items: list[str] = []
    vehicles: list[str] = []
    locations: list[str] = []
    for path in paths:
        if not path.exists():
            raise FileNotFoundError(f"Record list does not exist: {path}")
        record_items, record_vehicles, record_locations = split_records(read_text(path).splitlines())
        items.extend(record_items)
        vehicles.extend(record_vehicles)
        locations.extend(record_locations)
    return unique_sorted(items), unique_sorted(vehicles), unique_sorted(locations)


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
    list_items, list_vehicles, list_locations = load_record_lists(args.record_list)
    all_items = unique_sorted(existing_items + tweak_items + list_items)
    all_vehicle_records = unique_sorted(tweak_vehicles + list_vehicles)
    all_location_records = unique_sorted(tweak_locations + list_locations)
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
            "recordLists": [str(path) for path in args.record_list],
            "iconsDirectory": str(args.icons_dir) if args.icons_dir else None,
        },
        "counts": {
            "itemTechnicalIds": len(all_items),
            "vehicleSeedEntries": len(vehicle_seed),
            "vehicleTechnicalIds": len(all_vehicle_records),
            "mapDistrictAndSubdistrictEntries": len(map_locations),
            "locationTechnicalIds": len(all_location_records),
            "iconFiles": len(icons["files"]),
            "iconsMatchedToItems": len(icons["itemMatches"]),
        },
        "items": {"technicalIds": all_items, "icons": icons["itemMatches"]},
        "vehicles": {"seed": vehicle_seed, "technicalIds": all_vehicle_records},
        "locations": {"map": map_locations, "technicalIds": all_location_records},
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
    parser.add_argument(
        "--record-list",
        type=Path,
        action="append",
        default=[],
        help="Plain-text record list; may be repeated. Items.*, Vehicle.* and location records are merged.",
    )
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
