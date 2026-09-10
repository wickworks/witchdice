import {
  savePilotData, loadPilotData, MODEL_TAG, loadNpcLibrary, loadEncounterData,
} from '../lancerLocalStorage';
import { parseCompconPilot } from './parsePilot';
import { parseCompconNpc } from './parseNpc';
import { applyUpdatesToPlayer } from '../LancerPlayerMode/playerUtils';
import { getStat } from '../LancerNpcMode/npcUtils';
import { v2Pilots, v3Pilots, v2Npcs, v3Npcs, loadFixture, BONDED_V3_PILOT } from './__fixtures__/fixtures';

class LocalStorageMock {
  store: Record<string, string> = {};
  get length() { return Object.keys(this.store).length; }
  key(i: number) { return Object.keys(this.store)[i] ?? null; }
  getItem(k: string) { return this.store[k] ?? null; }
  setItem(k: string, v: string) { this.store[k] = String(v); }
  removeItem(k: string) { delete this.store[k]; }
  clear() { this.store = {}; }
}

beforeEach(() => {
  (globalThis as any).localStorage = new LocalStorageMock();
});

describe('pilot storage round-trip', () => {
  it('saves a domain pilot tagged with the model version and loads it back', () => {
    const domain = parseCompconPilot(v2Pilots[0].json);
    savePilotData(domain);
    const loaded = loadPilotData(domain.id) as any;
    expect(loaded).toBeTruthy();
    expect(loaded._model).toBe(MODEL_TAG);
    expect(loaded.id).toBe(domain.id);
  });

  it('migrates a raw COMP/CON pilot placed directly in storage (V2 and V3)', () => {
    for (const { name, json } of [v2Pilots[0], v3Pilots[0]]) {
      (globalThis as any).localStorage.clear();
      const rawPilot = (json.EXPORT_TYPE === 'Save Pilot' && json.data) ? json.data : json;
      (globalThis as any).localStorage.setItem(
        `pilot-${rawPilot.id.slice(0, 6)}-${rawPilot.name}`,
        JSON.stringify(rawPilot),
      );
      const loaded = loadPilotData(rawPilot.id) as any;
      expect(loaded, name).toBeTruthy();
      expect(loaded._model, name).toBe(MODEL_TAG);
      expect(typeof loaded.mechs[0].current_hp, name).toBe('number');
      expect(Number.isNaN(loaded.mechs[0].current_hp), name).toBe(false);
    }
  });

  it('flattens a nested V3 bond left on an already-migrated stored pilot', () => {
    const raw = loadFixture('v3-pilots', BONDED_V3_PILOT);
    const stale: any = { ...parseCompconPilot(raw), _model: MODEL_TAG };
    for (const field of ['bondId', 'bondData', 'bondPowers', 'burdens', 'bondAnswers', 'minorIdeal', 'xp', 'stress']) delete stale[field];
    stale.bond = raw.data.bond;
    (globalThis as any).localStorage.setItem(`pilot-${stale.id.slice(0, 6)}-${stale.name}`, JSON.stringify(stale));

    const loaded = loadPilotData(stale.id) as any;
    expect(loaded.bond).toBeUndefined();
    expect(loaded.bondId).toBe(raw.data.bond.bondId);
    expect(loaded.bondData.id).toBe(raw.data.bond.bondId);
    expect(loaded.bondPowers.length).toBe(raw.data.bond.bondPowers.length);

    const persisted = JSON.parse((globalThis as any).localStorage.getItem(`pilot-${stale.id.slice(0, 6)}-${stale.name}`));
    expect(persisted.bond).toBeUndefined();
    expect(persisted.bondId).toBe(raw.data.bond.bondId);
  });

  it('round-trips a mutation through applyUpdatesToPlayer + save + reload', () => {
    const domain = parseCompconPilot(v2Pilots[0].json);
    savePilotData(domain);
    const pilot = loadPilotData(domain.id) as any;
    const mech = pilot.mechs[0];
    applyUpdatesToPlayer({ current_hp: 3 }, pilot, mech);
    savePilotData(pilot);
    const reloaded = loadPilotData(domain.id) as any;
    expect(reloaded.mechs[0].current_hp).toBe(3);
    expect(reloaded._model).toBe(MODEL_TAG);
  });
});

describe('npc library storage round-trip', () => {
  it('migrates raw COMP/CON NPCs to the domain model on load (V2 and V3)', () => {
    const v2 = v2Npcs[0].json;
    const v3 = v3Npcs[0].json;
    const rawLib: Record<string, any> = { [v2.id]: v2, [v3.id]: v3 };
    (globalThis as any).localStorage.setItem('lancer-npcs', JSON.stringify(rawLib));

    const lib = loadNpcLibrary();
    expect(Object.keys(lib).length).toBe(2);
    Object.values(lib).forEach((npc: any) => {
      expect(npc._model).toBe(MODEL_TAG);
      expect(typeof npc.class).toBe('string');
      expect(typeof (npc.stats as any).hp).toBe('number');
    });
  });
});

describe('encounter storage round-trip', () => {
  function legacyEncounterWith(npcs: any[]) {
    const encounter = {
      id: '363387abcdef',
      name: 'Bloom tarot',
      active: npcs.map(npc => npc.fingerprint),
      reinforcements: [],
      casualties: [],
      allNpcs: Object.fromEntries(npcs.map(npc => [npc.fingerprint, npc])),
      roundCount: 2,
    };
    (globalThis as any).localStorage.setItem(`encounter-363387-${encounter.name}`, JSON.stringify(encounter));
    return encounter;
  }

  function legacyV3Instance(json: any, fingerprint: string) {
    return {
      ...json,
      fingerprint,
      items: [],
      currentStats: { hp: 3, structure: 1, stress: 1, heatcap: 2, activations: 0 },
      conditions: ['Impaired'],
      overshield: 2,
      burn: 1,
      per_round_uses: { something: 1 },
    };
  }

  it('keeps items on an untagged domain NPC that was copied into an encounter before the library reloaded', () => {
    const domain: any = parseCompconNpc(v3Npcs[0].json);
    expect(domain.items.length).toBeGreaterThan(0);
    const instance = { ...JSON.parse(JSON.stringify(domain)), fingerprint: 'A-123456', currentStats: { hp: 3, heatcap: 1, structure: 1, stress: 1, activations: 1 } };
    const encounter = { id: '999999', name: 'Fresh', active: [], reinforcements: ['A-123456'], casualties: [], allNpcs: { 'A-123456': instance }, roundCount: 1 };
    (globalThis as any).localStorage.setItem('encounter-999999-Fresh', JSON.stringify(encounter));

    const loaded: any = loadEncounterData('999999');
    const npc = loaded.allNpcs['A-123456'];
    expect(npc._model).toBe(MODEL_TAG);
    expect(npc.items.length).toBe(domain.items.length);
    expect(npc.items.every((i: any) => i.data)).toBe(true);
    expect(npc.currentStats.hp).toBe(3);
  });

  it('migrates raw V3 NPC instances left in an encounter by the pre-domain build', () => {
    const v3 = v3Npcs.find(f => f.name.includes('engineer'))!.json;
    legacyEncounterWith([legacyV3Instance(v3, 'A-495669'), legacyV3Instance(v3, 'B-555861')]);

    const encounter = loadEncounterData('363387abcdef') as any;
    expect(encounter).toBeTruthy();
    expect(encounter.active).toEqual(['A-495669', 'B-555861']);

    const npc = encounter.allNpcs['A-495669'];
    expect(() => getStat('stress', npc)).not.toThrow();
    expect(npc._model).toBe(MODEL_TAG);
    expect(getStat('stress', npc)).toBe(v3.combat_data.stats.max.stress);
    expect(npc.class).toBe('npcc_engineer');

    expect(npc.fingerprint).toBe('A-495669');
    expect(npc.currentStats).toEqual({ hp: 3, structure: 1, stress: 1, heatcap: 2, activations: 0 });
    expect(npc.conditions).toEqual(['Impaired']);
    expect(npc.overshield).toBe(2);
    expect(npc.burn).toBe(1);
    expect(npc.per_round_uses).toEqual({ something: 1 });

    const turret = npc.items.find((item: any) => item.itemID === 'npcf_deployable_turret_engineer');
    expect(turret, 'features rebuilt into items').toBeTruthy();
    expect(turret.uses).toBe(6);

    const persisted = JSON.parse((globalThis as any).localStorage.getItem('encounter-363387-Bloom tarot'));
    expect(persisted.allNpcs['B-555861']._model).toBe(MODEL_TAG);
  });

  it('leaves already-migrated encounters alone and still loads V2 instances', () => {
    const v2 = v2Npcs[0].json;
    const instance = { ...v2, fingerprint: 'A-111111', currentStats: { hp: 5 } };
    legacyEncounterWith([instance]);

    const first = loadEncounterData('363387abcdef') as any;
    expect(first.allNpcs['A-111111']._model).toBe(MODEL_TAG);
    expect(getStat('hp', first.allNpcs['A-111111'])).toBe(getStat('hp', v2));
    expect(first.allNpcs['A-111111'].currentStats).toEqual({ hp: 5, activations: 1 });

    const before = (globalThis as any).localStorage.getItem('encounter-363387-Bloom tarot');
    loadEncounterData('363387abcdef');
    expect((globalThis as any).localStorage.getItem('encounter-363387-Bloom tarot')).toBe(before);
  });
});
