import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  migrateLegacyLcpData, loadNpcLibrary, loadEncounterData,
  ENCOUNTER_PREFIX, STORAGE_ID_LENGTH,
} from '../lancerLocalStorage';
import { getIDFromStorageName } from '../../../localstorage.js';
import {
  registerNpcsInlineContent, findNpcFeatureData, findNpcClassData, findNpcTemplateData,
} from '../lancerData';

const SNAPSHOT = path.join(
  fileURLToPath(new URL('.', import.meta.url)),
  '__fixtures__', 'legacy-storage', 'v1.3.8-localstorage.json',
);
const LCP_KEY = 'lcp-abc123-Synthetic NPCs';

class LocalStorageMock {
  store: Record<string, string> = {};
  get length() { return Object.keys(this.store).length; }
  key(i: number) { return Object.keys(this.store)[i] ?? null; }
  getItem(k: string) { return this.store[k] ?? null; }
  setItem(k: string, v: string) { this.store[k] = String(v); }
  removeItem(k: string) { delete this.store[k]; }
  clear() { this.store = {}; }
}

function snapshotNpcs(dump: Record<string, any>): any[] {
  const library = Object.values(dump['lancer-npcs'] || {});
  const encounterNpcs = Object.keys(dump)
    .filter(key => key.startsWith(`${ENCOUNTER_PREFIX}-`))
    .flatMap(key => Object.values(dump[key].allNpcs || {}));
  return [...library, ...encounterNpcs];
}

function syntheticLcp(npcs: any[]) {
  const featureIDs = new Set<string>(npcs.flatMap(npc => npc.items.map((item: any) => item.itemID)));
  const classIDs = new Set<string>(npcs.map(npc => npc.class));
  const templateIDs = new Set<string>(npcs.flatMap(npc => npc.templates || []));
  const typeFor = (id: string) => /hammer|cannon|flamethrower|pods|rockets|missiles/.test(id) ? 'Weapon'
    : /armor|frame|compensation|insulated|huntsman|mark/.test(id) ? 'Trait' : 'System';
  return {
    id: 'abc123-synthetic',
    active: false,
    manifest: { name: 'Synthetic NPCs', author: 'test' },
    data: {
      npcClasses: [...classIDs].map(id => ({ id, name: id.toUpperCase(), role: 'striker', info: { flavor: '', tactics: '' }, stats: {} })),
      npcFeatures: [...featureIDs].map(id => ({
        id, name: id.toUpperCase(), type: typeFor(id), effect: 'synthetic', tags: [],
        origin: { type: 'Class', name: 'SYNTHETIC', base: true },
        ...(typeFor(id) === 'Weapon' ? { weapon_type: 'Cannon', damage: [{ type: 'Kinetic', damage: [1, 2, 3] }], range: [{ type: 'Range', val: 10 }] } : {}),
      })),
      npcTemplates: [...templateIDs].map(id => ({ id, name: id.toUpperCase(), description: '', base_features: [], optional_features: [], power: 0 })),
    },
  };
}

function seed(withLcp: boolean) {
  const dump = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')) as Record<string, any>;
  const storage = new LocalStorageMock();
  Object.entries(dump).forEach(([key, value]) => {
    storage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  });
  if (withLcp) storage.setItem(LCP_KEY, JSON.stringify(syntheticLcp(snapshotNpcs(dump))));
  (globalThis as any).localStorage = storage;
  return { storage, dump };
}

function loadedNpcs(storage: LocalStorageMock): { label: string; npc: any }[] {
  const library = Object.entries(loadNpcLibrary()).map(([id, npc]) => ({ label: `library ${id}`, npc }));
  const encounters = Object.keys(storage.store)
    .filter(key => key.startsWith(`${ENCOUNTER_PREFIX}-`))
    .flatMap(key => {
      const encounter: any = loadEncounterData(getIDFromStorageName(ENCOUNTER_PREFIX, key, STORAGE_ID_LENGTH));
      return Object.entries(encounter.allNpcs).map(([fp, npc]) => ({ label: `${key} ${fp}`, npc }));
    });
  return [...library, ...encounters];
}

describe('legacy LCP migration', () => {
  let errors: ReturnType<typeof vi.spyOn>;
  beforeEach(() => { errors = vi.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => { errors.mockRestore(); });

  it('copies LCP NPC content onto stored V2 NPCs before removing the LCP', () => {
    const { storage } = seed(true);
    const before = loadedNpcs(storage);
    before.forEach(({ npc, label }) => npc.items.forEach((item: any) => expect(item.data, label).toBeUndefined()));

    expect(migrateLegacyLcpData()).toBe(1);
    expect(storage.getItem(LCP_KEY)).toBeNull();

    const after = loadedNpcs(storage);
    expect(after.length).toBe(before.length);
    after.forEach(({ npc, label }) => {
      expect(npc.items.length, label).toBeGreaterThan(0);
      npc.items.forEach((item: any) => expect(item.data && item.data.id, label).toBe(item.itemID));
      expect(npc.classData && npc.classData.id, label).toBe(npc.class);
      expect((npc.templateData || []).map((t: any) => t.id).sort(), label).toEqual([...npc.templates].sort());
    });

    registerNpcsInlineContent(after.map(({ npc }) => npc));
    after.forEach(({ npc, label }) => {
      npc.items.forEach((item: any) => expect(findNpcFeatureData(item.itemID).id, label).toBe(item.itemID));
      expect(findNpcClassData(npc.class).id, label).toBe(npc.class);
      npc.templates.forEach((id: string) => expect(findNpcTemplateData(id).id, label).toBe(id));
    });
    expect(errors).not.toHaveBeenCalled();
  });

  it('is a no-op once the LCP is gone', () => {
    const { storage } = seed(true);
    migrateLegacyLcpData();
    const snapshot = { ...storage.store };
    expect(migrateLegacyLcpData()).toBe(0);
    expect(storage.store).toEqual(snapshot);
  });

  it('leaves NPCs untouched when no LCP was ever stored', () => {
    const { storage } = seed(false);
    expect(migrateLegacyLcpData()).toBe(0);
    loadedNpcs(storage).forEach(({ npc, label }) =>
      npc.items.forEach((item: any) => expect(item.data, label).toBeUndefined()));
  });
});
