import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  loadPilotData, loadNpcLibrary, loadEncounterData, MODEL_TAG,
  PILOT_PREFIX, ENCOUNTER_PREFIX, STORAGE_ID_LENGTH,
} from '../lancerLocalStorage';
import { getIDFromStorageName } from '../../../localstorage.js';
import { getStat, fullRepairNpc } from '../LancerNpcMode/npcUtils';
import { findNpcClassData, registerNpcsInlineContent } from '../lancerData';

const LEGACY_DIR = path.join(fileURLToPath(new URL('.', import.meta.url)), '__fixtures__', 'legacy-storage');

const dumps = fs.readdirSync(LEGACY_DIR)
  .filter(f => f.endsWith('.json'))
  .sort()
  .map(f => ({ name: f, json: JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, f), 'utf8')) as Record<string, any> }));

class LocalStorageMock {
  store: Record<string, string> = {};
  get length() { return Object.keys(this.store).length; }
  key(i: number) { return Object.keys(this.store)[i] ?? null; }
  getItem(k: string) { return this.store[k] ?? null; }
  setItem(k: string, v: string) { this.store[k] = String(v); }
  removeItem(k: string) { delete this.store[k]; }
  clear() { this.store = {}; }
}

function seed(dump: Record<string, any>) {
  const storage = new LocalStorageMock();
  Object.entries(dump).forEach(([key, value]) => {
    storage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  });
  (globalThis as any).localStorage = storage;
  return storage;
}

function keysWithPrefix(storage: LocalStorageMock, prefix: string) {
  return Object.keys(storage.store).filter(key => key.startsWith(`${prefix}-`));
}

function expectDomainNpc(npc: any, label: string) {
  expect(npc._model, `${label} tagged`).toBe(MODEL_TAG);
  expect(typeof npc.class, `${label} class`).toBe('string');
  expect(npc.name, `${label} name`).toBeTruthy();
  npc.templates.forEach((t: any) => expect(typeof t, `${label} template`).toBe('string'));
  npc.labels.forEach((l: any) => expect(typeof l, `${label} label`).toBe('string'));
  for (const key of ['hp', 'structure', 'stress', 'heatcap', 'activations']) {
    const stat = getStat(key, npc);
    expect(typeof stat, `${label} max ${key}`).toBe('number');
    expect(Number.isNaN(stat), `${label} max ${key} NaN`).toBe(false);
  }
  expect(Array.isArray(npc.items), `${label} items`).toBe(true);
  npc.items.forEach((item: any) => expect(typeof item.itemID, `${label} itemID`).toBe('string'));
  expect(Array.isArray(npc.conditions), `${label} conditions`).toBe(true);
}

describe.each(dumps)('legacy localStorage snapshot $name', ({ json }) => {
  let storage: LocalStorageMock;
  let errors: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    storage = seed(json);
    errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errors.mockRestore();
  });

  it('loads every pilot into the domain model without falling back', () => {
    const keys = keysWithPrefix(storage, PILOT_PREFIX);
    expect(keys.length).toBeGreaterThan(0);
    keys.forEach(key => {
      const id = getIDFromStorageName(PILOT_PREFIX, key, STORAGE_ID_LENGTH);
      const pilot: any = loadPilotData(id);
      expect(pilot, key).toBeTruthy();
      expect(pilot._model, key).toBe(MODEL_TAG);
      pilot.mechs.forEach((mech: any) => {
        expect(typeof mech.current_hp, `${key} current_hp`).toBe('number');
        expect(typeof mech.frame, `${key} frame`).toBe('string');
      });
    });
    expect(errors).not.toHaveBeenCalled();
  });

  it('loads the NPC library into the domain model without falling back', () => {
    const library = loadNpcLibrary();
    expect(Object.keys(library).length).toBeGreaterThan(0);
    Object.entries(library).forEach(([id, npc]) => expectDomainNpc(npc, `library ${id}`));
    expect(errors).not.toHaveBeenCalled();
  });

  it('loads every encounter, migrating NPC instances and keeping their combat state', () => {
    const keys = keysWithPrefix(storage, ENCOUNTER_PREFIX);
    expect(keys.length).toBeGreaterThan(0);
    keys.forEach(key => {
      const id = getIDFromStorageName(ENCOUNTER_PREFIX, key, STORAGE_ID_LENGTH);
      const raw = JSON.parse(storage.getItem(key)!);
      const encounter: any = loadEncounterData(id);
      expect(encounter, key).toBeTruthy();

      const fingerprints = [...encounter.active, ...encounter.reinforcements, ...encounter.casualties];
      expect(fingerprints.sort()).toEqual(Object.keys(encounter.allNpcs).sort());
      registerNpcsInlineContent(Object.values(encounter.allNpcs));

      fingerprints.forEach(fingerprint => {
        const npc = encounter.allNpcs[fingerprint];
        const before = raw.allNpcs[fingerprint];
        const label = `${key} ${fingerprint}`;
        expectDomainNpc(npc, label);

        expect(npc.fingerprint, label).toBe(fingerprint);
        expect(npc.conditions, label).toEqual(before.conditions || []);
        expect(Number(npc.currentStats.hp), label).toBe(Number(before.currentStats.hp));
        for (const stat of ['hp', 'structure', 'stress', 'heatcap', 'activations']) {
          expect(typeof npc.currentStats[stat], `${label} current ${stat}`).toBe('number');
        }
        expect(npc.currentStats.activations, label).toBeLessThanOrEqual(getStat('activations', npc));

        if (npc.classData) expect(findNpcClassData(npc.class).id, `${label} class data`).toBe(npc.class);
        const sourceItemCount = Array.isArray(before.features) ? before.features.length : (before.items || []).length;
        expect(npc.items.length, `${label} items rebuilt`).toBe(sourceItemCount);

        const repaired = JSON.parse(JSON.stringify(npc));
        expect(() => fullRepairNpc(repaired), label).not.toThrow();
        expect(repaired.currentStats.hp, label).toBe(getStat('hp', npc));
      });

      const persisted = JSON.parse(storage.getItem(key)!);
      Object.values(persisted.allNpcs).forEach((npc: any) => expect(npc._model).toBe(MODEL_TAG));
    });
    expect(errors).not.toHaveBeenCalled();
  });
});
