import { parseCompconPilot } from './parsePilot';
import { applyUpdatesToPlayer, resetAllLimitedUses } from '../LancerPlayerMode/playerUtils';
import { loadFixture, INLINE_LCP_PILOT } from './__fixtures__/fixtures';

describe('full repair restores integrated-mount limited weapons', () => {
  it('restores mw_fuel_rod_gun and mw_prototype_1 (die-string limited) to a numeric max', () => {
    const pilot = parseCompconPilot(loadFixture('v3-pilots', INLINE_LCP_PILOT));
    const mech = pilot.mechs[0];

    applyUpdatesToPlayer({ repairAllWeaponsAndSystems: true }, pilot as any, mech as any);

    const byId: Record<string, any> = {};
    ((mech.loadouts[0] as any).integratedMounts || []).forEach((slot: any) => {
      if (slot && slot.weapon) byId[slot.weapon.id] = slot.weapon;
    });

    const fuelRod = byId['mw_fuel_rod_gun'];
    expect(fuelRod, 'fuel rod gun present in integratedMounts').toBeTruthy();
    expect(typeof fuelRod.uses).toBe('number');
    expect(fuelRod.uses).toBeGreaterThan(0);

    const prototype = byId['mw_prototype_1'];
    expect(prototype, 'prototype weapon present in integratedMounts').toBeTruthy();
    expect(typeof prototype.uses).toBe('number');
    expect(prototype.uses).toBeGreaterThan(0);
  });
});

describe('fresh import starts every limited item at max uses', () => {
  it('sets weapon and system uses to their limited max regardless of exported currentUses', () => {
    const pilot = parseCompconPilot(loadFixture('v3-pilots', 'v3-pilot-02-glassjaw.json'));
    const loadout: any = pilot.mechs[0].loadouts[0];

    const fuelRod = loadout.integratedMounts.find((slot: any) => slot.weapon.id === 'mw_fuel_rod_gun').weapon;
    const agni = loadout.systems.find((system: any) => system.id === 'ms_agni_class_nhp');
    expect(fuelRod.uses).toBe(0);
    expect(agni.uses).toBe(0);

    resetAllLimitedUses(pilot as any);

    expect(fuelRod.uses).toBe(4);
    expect(agni.uses).toBe(2);
  });
});
