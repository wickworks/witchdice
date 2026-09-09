#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const SRC = path.resolve('examples');
const OUT = path.resolve('src/components/lancer/domain/__fixtures__');

const DIRS = [
  ['old v2 format PCs', 'v2-pilots', 'pilot'],
  ['new v3 format PCs', 'v3-pilots', 'pilot'],
  ['old v2 format NPCs', 'v2-npcs', 'npc'],
  ['new v3 format NPCs', 'v3-npcs', 'npc'],
];

const LEGACY_STORAGE_SRC = path.join(SRC, 'legacy-storage');
const LEGACY_STORAGE_OUT = path.join(OUT, 'legacy-storage');

const RENAMES = {
  'new v3 format PCs/EVILNOESHOTGUN.json': 'v3-pilot-inline-lcp-content.json',
};

const PROSE_MIN_LENGTH = 30;

const PROSE_KEYS = new Set([
  'description', 'detail', 'effect', 'terse', 'condition', 'mounted_effect',
  'tactics', 'active_effect', 'passive_effect', 'trigger', 'flavor',
  'custom_desc', 'custom_detail', 'on_attack', 'on_hit', 'on_crit',
  'requirements', 'flavorDescription', 'gmDescription',
]);

const ALLOWED_LONG_KEYS = new Set([
  'id', 'instanceId', 'originId', 'active_mech_id', 'remote_mech_id', 'frame',
  'name', 'flavorName', 'Website', 'LcpId', 'LcpName', 'itemType', 'core_bonuses',
]);

const CALLSIGNS = [
  'HALFLIGHT', 'TIN CROWN', 'SALTWIRE', 'GLASSJAW', 'NINE PENNIES', 'PALE ORBIT',
  'BRASS LILY', 'DUSTFALL', 'SLOW THUNDER', 'CANDLEWICK', 'IRON SPARROW', 'MOTH HOUR',
  'GREY VESPERS', 'LONGSHORE', 'QUIET ENGINE', 'RED MERIDIAN', 'HOLLOWPOINT', 'STARLING',
  'FIRST FROST', 'TALLOW', 'BLUE ARREARS', 'SIGNAL FIRE', 'DEEP LADDER', 'WICKERWORK',
];

const PERSON_NAMES = [
  'Ada Norrell', 'Bexley Tarn', 'Cyra Alcott', 'Dov Ferreira', 'Esme Lindqvist',
  'Faron Okonjo', 'Gale Whitmore', 'Hana Suvari', 'Ilya Brandt', 'Jules Amari',
  'Kesh Idowu', 'Lior Vance', 'Mira Kastellan', 'Noor Halvorsen', 'Oren Blackwell',
  'Pilar Renaud', 'Quill Marchetti', 'Rae Sundberg', 'Soren Vashti', 'Tamsin Ellory',
  'Uma Petrakis', 'Vidal Ashworth', 'Wren Calloway', 'Yusra Denholm',
];

const MECH_NAMES = [
  'PATIENT ANIMAL', 'SUNKEN BELL', 'GOOD DOG', 'LAST TRAIN OUT', 'PAPER LANTERN',
  'HONEST MISTAKE', 'THE LONG WAY ROUND', 'SMALL MERCY', 'CLOUDBANK', 'ANOTHER TUESDAY',
  'HAND ME DOWN', 'BRIGHT ARREARS', 'FIRE ESCAPE', 'THIRD OPINION', 'WATCHMAKER',
  'SOFT LANDING', 'PENNY WHISTLE', 'OLD ARGUMENT', 'HALF MEASURE', 'STRAY CURRENT',
];

const NPC_NAMES = [
  'Cormorant', 'Dogwood', 'Ember', 'Furlong', 'Gantry', 'Hazel', 'Ironmonger',
  'Juniper', 'Keeling', 'Lockstep', 'Marrow', 'Nettle', 'Oxbow', 'Pitch',
];

function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  return h;
}

function pick(list, seed) {
  return list[hash(seed) % list.length];
}

const PLACEHOLDER_HTML = '<p>Redacted for fixture use.</p>';
const PLACEHOLDER_TEXT = 'Redacted for fixture use.';

function redactText(value) {
  if (typeof value !== 'string' || value === '') return value;
  return /<[a-z][^>]*>/i.test(value) ? PLACEHOLDER_HTML : PLACEHOLDER_TEXT;
}

const BLANK_KEYS = new Set([
  'portrait', 'cloud_portrait', 'cloudImage', 'localImage', 'avatar', 'image_url',
  'cloudID', 'cloudOwnerID', 'shareCode', 'shareCodeExpiry',
  'lastSync', 'lastUpdate_cloud', 'remote_author', 'remote_code', 'remote_collection',
]);

const REDACT_KEYS = new Set([
  'text_appearance', 'history', 'quirks', 'background', 'notes', 'note',
  'minorIdeal', 'majorIdeal', 'bondAnswers', 'resource_note',
  'flavorName', 'flavorDescription', 'campaign', 'subtitle', 'group', 'title',
]);

const FIXED_TIMESTAMP = 'Thu Jan 01 2026 00:00:00 GMT+0000';

function isPilotRoot(o) {
  return 'callsign' in o && 'mechSkills' in o;
}
function isMech(o) {
  return 'frame' in o && ('loadouts' in o || 'loadout' in o);
}
function isNpcRoot(o) {
  return 'class' in o && 'tier' in o && ('items' in o || 'features' in o);
}
function anonymizeLabels(labels) {
  if (!Array.isArray(labels)) return;
  labels.forEach((label, i) => {
    const title = `Label ${i + 1}`;
    if (label && typeof label === 'object') {
      label.title = title;
      if (typeof label.value === 'string' && label.value !== '') label.value = 'redacted';
    } else if (typeof label === 'string') {
      labels[i] = title;
    }
  });
}

function walk(node, seed) {
  if (Array.isArray(node)) {
    node.forEach(v => walk(v, seed));
    return;
  }
  if (!node || typeof node !== 'object') return;

  if (isPilotRoot(node)) {
    node.callsign = pick(CALLSIGNS, seed + (node.callsign || ''));
    node.name = pick(PERSON_NAMES, seed + (node.name || ''));
    if (typeof node.player_name === 'string') node.player_name = 'Playtester';
  }
  if (isMech(node) && typeof node.name === 'string') {
    node.name = pick(MECH_NAMES, seed + node.name);
  }
  if (isNpcRoot(node) && typeof node.name === 'string' && node.name !== '') {
    node.name = pick(NPC_NAMES, seed + node.name);
  }
  if (isNpcRoot(node)) {
    anonymizeLabels(node.labels);
    if (node.narrative) anonymizeLabels(node.narrative.labels);
  }
  if (Array.isArray(node.custom_counters)) {
    node.custom_counters.forEach((c, i) => {
      if (c && typeof c.name === 'string') c.name = `Custom Counter ${i + 1}`;
    });
  }
  if (Array.isArray(node.reserves)) {
    node.reserves.forEach((r, i) => {
      if (!r || typeof r !== 'object') return;
      for (const k of ['name', 'label', 'description', 'resource_cost', 'resource_name']) {
        if (typeof r[k] === 'string' && r[k] !== '') r[k] = `Reserve ${i + 1}`;
      }
    });
  }

  for (const [k, v] of Object.entries(node)) {
    if (k === 'labels') continue;
    if (BLANK_KEYS.has(k)) {
      node[k] = typeof v === 'number' ? 0 : Array.isArray(v) ? [] : '';
      continue;
    }
    if (typeof v === 'string' && /^[A-Z][a-z]{2} [A-Z][a-z]{2} \d{2} \d{4} /.test(v)) {
      node[k] = FIXED_TIMESTAMP;
      continue;
    }
    if (typeof v === 'string' && PROSE_KEYS.has(k) && v.length >= PROSE_MIN_LENGTH) {
      node[k] = redactText(v);
      continue;
    }
    if (REDACT_KEYS.has(k)) {
      if (typeof v === 'string') node[k] = redactText(v);
      else if (Array.isArray(v)) node[k] = v.map(e => (typeof e === 'string' ? redactText(e) : e));
      continue;
    }
    walk(v, seed);
  }
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

for (const outDir of [...DIRS.map(d => d[1]), 'legacy-storage']) {
  fs.rmSync(path.join(OUT, outDir), { recursive: true, force: true });
}
let count = 0;
for (const [srcDir, outDir, kind] of DIRS) {
  const from = path.join(SRC, srcDir);
  if (!fs.existsSync(from)) continue;
  const to = path.join(OUT, outDir);
  fs.mkdirSync(to, { recursive: true });
  const files = fs.readdirSync(from).filter(f => f.endsWith('.json')).sort();
  files.forEach((file, index) => {
    const json = JSON.parse(fs.readFileSync(path.join(from, file), 'utf8'));
    walk(json, file);
    const root = json.data && json.EXPORT_TYPE ? json.data : json;
    const label = kind === 'pilot' ? root.callsign : root.name || root.class?.data?.name || 'npc';
    const ordinal = String(index + 1).padStart(2, '0');
    const name = RENAMES[`${srcDir}/${file}`]
      || `${outDir.replace(/s$/, '')}-${ordinal}-${slugify(label)}.json`;
    fs.writeFileSync(path.join(to, name), JSON.stringify(json, null, 2) + '\n');
    count++;
  });
}
function storageKeyFor(key, value) {
  const match = key.match(/^(pilot|encounter)-([^-]+)-/);
  if (!match || !value || typeof value !== 'object') return key;
  return `${match[1]}-${match[2]}-${value.name}`;
}

if (fs.existsSync(LEGACY_STORAGE_SRC)) {
  fs.mkdirSync(LEGACY_STORAGE_OUT, { recursive: true });
  const dumps = fs.readdirSync(LEGACY_STORAGE_SRC)
    .filter(f => f.endsWith('-localstorage.json')).sort();
  dumps.forEach(file => {
    let dump = JSON.parse(fs.readFileSync(path.join(LEGACY_STORAGE_SRC, file), 'utf8'));
    if (typeof dump === 'string') dump = JSON.parse(dump);
    const out = {};
    Object.entries(dump).forEach(([key, stored]) => {
      let value = stored;
      try { value = JSON.parse(stored); } catch (e) { /* plain string value */ }
      walk(value, file + key);
      out[storageKeyFor(key, value)] = value;
    });
    fs.writeFileSync(path.join(LEGACY_STORAGE_OUT, file), JSON.stringify(out, null, 2) + '\n');
    count++;
  });
}

const leaks = [];
function audit(node, key, file) {
  if (Array.isArray(node)) return node.forEach(v => audit(v, key, file));
  if (node && typeof node === 'object') {
    return Object.entries(node).forEach(([k, v]) => audit(v, k, file));
  }
  if (typeof node !== 'string') return;
  if (node.length > 40 && !ALLOWED_LONG_KEYS.has(key) && node !== PLACEHOLDER_HTML
      && node !== PLACEHOLDER_TEXT && node !== FIXED_TIMESTAMP) {
    leaks.push(`${file}: ${key} = ${JSON.stringify(node.slice(0, 70))}`);
  }
}
for (const outDir of [...DIRS.map(d => d[1]), 'legacy-storage']) {
  const dir = path.join(OUT, outDir);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    audit(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')), '', `${outDir}/${f}`);
  }
}

console.log(`wrote ${count} fixtures to ${path.relative(process.cwd(), OUT)}`);
if (leaks.length) {
  console.error(`\n${leaks.length} unredacted long strings — add their keys to PROSE_KEYS or ALLOWED_LONG_KEYS:`);
  leaks.slice(0, 40).forEach(l => console.error('  ' + l));
  process.exit(1);
}
console.log('audit clean: no prose or personal free text remains');
