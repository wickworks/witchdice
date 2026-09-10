import { parseCompconPilot } from './parsePilot';
import { parseCompconNpc, featureDataFromV3 } from './parseNpc';
import { v2Pilots, v3Pilots, v2Npcs, v3Npcs, loadFixture, BONDED_V3_PILOT, INLINE_LCP_PILOT } from './__fixtures__/fixtures';
import { registerPilotInlineContent, findBondData, findAllBondData } from '../lancerData';

describe('parseCompconPilot', () => {
  it.each([...v2Pilots, ...v3Pilots])('parses $name to a valid domain pilot', ({ json }) => {
    const pilot = parseCompconPilot(json);
    expect(pilot.id).toBeTruthy();
    expect(pilot.mechs.length).toBeGreaterThan(0);
    expect(pilot.state.per_round_uses).toBeDefined();
    pilot.mechs.forEach(mech => {
      for (const key of [
        'current_hp', 'current_heat', 'current_structure', 'current_stress',
        'current_repairs', 'current_overcharge', 'current_core_energy',
        'overshield', 'burn',
      ] as const) {
        expect(typeof (mech as any)[key], `${key}`).toBe('number');
        expect(Number.isNaN((mech as any)[key]), `${key} NaN`).toBe(false);
      }
      expect(Array.isArray(mech.conditions)).toBe(true);
      expect(typeof mech.frame).toBe('string');
    });
  });

  it('normalizes all core-bonus references to id strings (pilot + mount bonus_effects)', () => {
    [...v2Pilots, ...v3Pilots].forEach(({ name, json }) => {
      const pilot = parseCompconPilot(json);
      pilot.core_bonuses.forEach(cb =>
        expect(typeof cb, `${name} pilot core_bonus`).toBe('string'));
      pilot.mechs.forEach(mech => {
        (mech.loadouts || []).forEach((lo: any) => {
          [...(lo.mounts || []), lo.improved_armament, lo.superheavy_mounting, lo.integratedWeapon]
            .filter(Boolean)
            .forEach((mount: any) => {
              (mount.bonus_effects || []).forEach((e: any) =>
                expect(typeof e, `${name} mount bonus_effect`).toBe('string'));
            });
        });
      });
    });
  });

  it('normalizes V3 mech stats (stats.current + corePower + statuses) to flat V2 shape', () => {
    const v3 = v3Pilots[0];
    expect(v3, 'need at least one V3 pilot fixture').toBeTruthy();
    const pilot = parseCompconPilot(v3.json);
    const mech = pilot.mechs[0];
    expect(typeof mech.current_hp).toBe('number');
    expect([0, 1]).toContain(mech.current_core_energy);
  });

  it('flattens the nested V3 bond onto the pilot and keeps the inline bond data', () => {
    const raw = loadFixture('v3-pilots', BONDED_V3_PILOT);
    const source = raw.data.bond;
    const pilot: any = parseCompconPilot(raw);

    expect(pilot.bond).toBeUndefined();
    expect(pilot.bondId).toBe(source.bondId);
    expect(pilot.bondData.id).toBe(source.bondId);
    expect(pilot.bondPowers.map((p: any) => p.name)).toEqual(source.bondPowers.map((p: any) => p.name));
    expect(pilot.burdens).toEqual(source.burdens);
    expect(pilot.bondAnswers).toEqual(source.bondAnswers);
    expect(pilot.minorIdeal).toBe(source.minorIdeal);
    expect(pilot.xp).toBe(source.xp);
    expect(pilot.stress).toBe(source.stress);

    registerPilotInlineContent(pilot);
    expect(findBondData(pilot.bondId).id).toBe(pilot.bondId);
    expect(findAllBondData()[pilot.bondId].name).toBe(source.data.name);
    pilot.bondPowers.forEach((power: any) =>
      expect(findBondData(pilot.bondId).powers.some((p: any) => p.name === power.name), power.name).toBe(true));
  });

  it('flattens V3 bond powers even when the export carries no bond id', () => {
    const pilot: any = parseCompconPilot(loadFixture('v3-pilots', INLINE_LCP_PILOT));
    expect(pilot.bond).toBeUndefined();
    expect(pilot.bondId).toBe('');
    expect(pilot.bondData).toBeUndefined();
    expect(pilot.bondPowers.length).toBeGreaterThan(0);
  });

  it('leaves V2 top-level bond fields as they are', () => {
    const bonded = v2Pilots.find(({ json }) => json.bondId);
    expect(bonded, 'need a bonded V2 pilot fixture').toBeTruthy();
    const pilot: any = parseCompconPilot(bonded!.json);
    expect(pilot.bondId).toBe(bonded!.json.bondId);
    expect(pilot.bondPowers).toEqual(bonded!.json.bondPowers);
    expect(pilot.bondData).toBeUndefined();
  });
});

describe('parseCompconNpc', () => {
  it('is idempotent: re-parsing an already-parsed V3 NPC keeps its items and stats', () => {
    v3Npcs.forEach(({ name, json }) => {
      const once: any = parseCompconNpc(json);
      const twice: any = parseCompconNpc(JSON.parse(JSON.stringify(once)));
      expect(twice.items.length, name).toBe(once.items.length);
      expect(twice.items.map((i: any) => i.itemID), name).toEqual(once.items.map((i: any) => i.itemID));
      expect(twice.items.every((i: any) => i.data), name).toBe(true);
      expect(twice.stats, name).toEqual(once.stats);
      expect(twice.class, name).toBe(once.class);
      expect(twice.templates, name).toEqual(once.templates);
    });
  });

  it('derives effect text, trigger, and activation tags from V3 action-based features', () => {
    const ace = v3Npcs.find(f => f.name.includes('ace'))!.json;
    const npc: any = parseCompconNpc(ace);
    const byName = (name: string) => npc.items.find((i: any) => i.data.name === name).data;
    const tagIds = (d: any) => (d.tags || []).map((t: any) => t.id);

    for (const item of npc.items) {
      if (item.data.type === 'Weapon') continue;
      expect(typeof item.data.effect, item.data.name).toBe('string');
      expect(item.data.effect.trim(), item.data.name).not.toBe('');
    }

    const barrelRoll = byName('Barrel Roll');
    expect(barrelRoll.trigger).toBe(ace.features.find((f: any) => f.data.name === 'Barrel Roll').data.actions[0].trigger);
    expect(barrelRoll.effect).not.toContain('Trigger:');

    const strafe = byName('Strafe');
    expect(tagIds(strafe)).toContain('tg_quick_action');
    expect((strafe.tags as any[]).find(t => t.id === 'tg_round').val).toBe(1);

    const flight = byName('SSC Flight System');
    expect(flight.effect).toBe(ace.features.find((f: any) => f.data.name === 'SSC Flight System').data.effect);
  });

  it('renders multi-action and deployable V3 features into one effect block', () => {
    const multi = featureDataFromV3({
      id: 'x', name: 'Eye Of Midnight', type: 'System',
      actions: [
        { name: 'Activate', activation: 'Quick', detail: 'On.' },
        { name: 'Deactivate', activation: 'Quick', detail: 'Off.' },
      ],
    });
    expect(multi.effect).toContain('<strong>Activate</strong> (Quick)');
    expect(multi.effect).toContain('<strong>Deactivate</strong> (Quick)');
    expect(multi.trigger).toBeUndefined();

    const turret = featureDataFromV3({
      id: 'y', name: 'Deployable Turret', type: 'System',
      deployables: [{
        name: 'Deployable Turret', activation: 'Quick', size: 0.5, hp: [5, 8, 10], evasion: 10, edef: 10, type: 'Drone',
        detail: 'Shoots.', range: [{ type: 'Range', val: 10 }], damage: [{ type: 'Kinetic', val: [4, 5, 6] }],
      }],
    });
    expect(turret.effect).toContain('HP {5/8/10}');
    expect(turret.effect).toContain('Range 10');
    expect(turret.effect).toContain('{4/5/6} Kinetic');
    expect(turret.effect).toContain('Shoots.');

    const tech = featureDataFromV3({
      id: 'z', name: 'Tear Down', type: 'Tech', attack_bonus: [2, 4, 6],
      actions: [{ name: 'Tear Down', activation: 'Quick Tech', detail: 'Make a tech attack.' }],
    });
    expect(tech.tech_type).toBe('Quick');
    expect(tech.effect).toBe('Make a tech attack.');
  });

  it('fills an empty V3 name with the COMP/CON default of tier, templates, class, and tag', () => {
    const bombard = v3Npcs.find(f => f.name.includes('bombard'))!.json;
    expect(bombard.name).toBe('');
    expect(parseCompconNpc(bombard).name).toBe('T1 Elite Bombard Mech');

    const named = JSON.parse(JSON.stringify(bombard));
    named.name = 'CONDOR REPULSOR';
    expect(parseCompconNpc(named).name).toBe('CONDOR REPULSOR');
  });

  it('flattens V3 narrative label objects to their titles', () => {
    const json = JSON.parse(JSON.stringify(v3Npcs[0].json));
    json.narrative.labels = [
      { title: 'Bloom tarot', value: '' },
      { title: 'GM notes', value: 'secret', gm_only: true },
      'legacy string',
      { title: '', value: '' },
    ];
    const npc = parseCompconNpc(json);
    expect(npc.labels).toEqual(['Bloom tarot', 'GM notes', 'legacy string']);
  });

  it.each([...v2Npcs, ...v3Npcs])('parses $name to a valid domain npc', ({ json }) => {
    const npc = parseCompconNpc(json);
    expect(npc.id).toBeTruthy();
    expect(typeof npc.class).toBe('string');
    expect(Array.isArray(npc.templates)).toBe(true);
    npc.templates.forEach(t => expect(typeof t).toBe('string'));
    expect(typeof (npc.stats as any).hp).toBe('number');
  });

  it('remaps V3 combat_data stat names to V2 keys (evasion->evade, saveTarget->save, etc.)', () => {
    const v3 = v3Npcs[0];
    expect(v3, 'need at least one V3 npc fixture').toBeTruthy();
    const npc = parseCompconNpc(v3.json);
    const raw = v3.json.combat_data.stats.max;
    expect((npc.stats as any).evade).toBe(raw.evasion);
    expect((npc.stats as any).save).toBe(raw.saveTarget);
    expect((npc.stats as any).sensor).toBe(raw.sensorRange);
    expect((npc.stats as any).systems).toBe(raw.sys);
  });
});
