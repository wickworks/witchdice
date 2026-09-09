import { parseCompconPilot } from './parsePilot';
import { parseCompconNpc } from './parseNpc';
import { v2Pilots, v3Pilots, v2Npcs, v3Npcs } from './__fixtures__/fixtures';

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
});

describe('parseCompconNpc', () => {
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
