const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const seedPath = path.join(root, 'data', 'cyberpunk-vehicles.seed.json');
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(seed.schemaVersion === 1, 'vehicle seed schemaVersion must be 1');
assert(seed.compatibilityBaseline === '2.31', 'vehicle seed must target compatibility baseline 2.31');
assert(Array.isArray(seed.vehicles), 'vehicle seed must contain vehicles[]');
assert(seed.vehicles.length >= 150, `expected broad vehicle coverage, got ${seed.vehicles.length}`);

const ids = new Set();
for (const vehicle of seed.vehicles) {
  assert(vehicle && typeof vehicle === 'object', 'vehicle entry must be an object');
  assert(typeof vehicle.id === 'string' && vehicle.id.length > 0, 'vehicle id is required');
  assert(typeof vehicle.name === 'string' && vehicle.name.length > 0, `vehicle name is required for ${vehicle.id}`);
  assert(typeof vehicle.manufacturer === 'string' && vehicle.manufacturer.length > 0, `manufacturer is required for ${vehicle.id}`);
  assert(typeof vehicle.class === 'string' && vehicle.class.length > 0, `class is required for ${vehicle.id}`);
  assert(!ids.has(vehicle.id), `duplicate vehicle id: ${vehicle.id}`);
  ids.add(vehicle.id);
}

for (const required of [
  'yaiba-arv-q340-semimaru',
  'rayfield-caliburn-mordred',
  'yaiba-asm-r250-muramasa',
  'chevillon-legatus-450-aquila',
  'militech-xt-451-basilisk',
  'militech-chimera-0005-c-m',
  'militech-manticore',
  'zetatech-surveyor',
  'other-ncart'
]) {
  assert(ids.has(required), `missing required vehicle seed: ${required}`);
}

const classes = new Set(seed.vehicles.map(vehicle => vehicle.class));
for (const requiredClass of ['car', 'bike', 'tank', 'armored', 'av', 'aircraft', 'ship', 'rail']) {
  assert(classes.has(requiredClass), `missing vehicle class: ${requiredClass}`);
}

console.log(`content-registry: ${seed.vehicles.length} vehicle seed entries OK`);
