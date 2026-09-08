"""Fetch only the six verified public district photographs; no scraping of interiors.
Original JPEG bytes are retained. Record actual dimensions rather than claiming 4K.
"""
from pathlib import Path
import hashlib, io, json, urllib.request
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    'city-center': 'city-center-92fa18a6.jpg',
    'watson': 'watson-790e35e2.jpg',
    'heywood': 'heywood-083e3909.jpg',
    'westbrook': 'westbrook-f5cc7f59.jpg',
    'santo-domingo': 'santo-domingo-03e66181.jpg',
    'pacifica': 'pacifica2-485e579d.jpg',
}
folder = ROOT / 'assets/locations'
folder.mkdir(parents=True, exist_ok=True)
entries = []
for place, name in SOURCES.items():
    url = 'https://www.nightcity.love/build/images/districts/' + name
    target = folder / (place + '.jpg')
    data = target.read_bytes() if target.exists() else urllib.request.urlopen(url, timeout=30).read()
    image = Image.open(io.BytesIO(data))
    assert image.format == 'JPEG' and len(data) < 4_000_000
    target.write_bytes(data)
    entries.append(dict(id=place, file=target.relative_to(ROOT).as_posix(), source=url,
                        page='https://www.nightcity.love/en/', creator='CD PROJEKT RED',
                        kind='district-reference', interior=False, width=image.width,
                        height=image.height, sha256=hashlib.sha256(data).hexdigest()))
    print(place, image.size, len(data))
(folder / 'coverage.json').write_text(json.dumps(dict(
    checked='2026-09-07', complete=False, interiorCoverage='No verified complete interior collection available.',
    note='Original official public district images; no claim of open licensing, HD upgrades or exhaustive location coverage.',
    images=entries), ensure_ascii=False, indent=2) + '\n')
