import { deepCopy } from '../../../utils';
import { PilotSchema, type DomainPilot } from './schema';

function unwrapEnvelope(raw: any): any {
  if (raw && raw.EXPORT_TYPE === 'Save Pilot' && raw.data) return raw.data;
  return raw;
}

// V3 inlines ID references as objects; V2 stores them as bare ID strings.
function idOf(ref: any): string {
  return (ref && typeof ref === 'object') ? ref.id : ref;
}

function normalizeWeapon(weapon: any) {
  if (!weapon) return;
  if (!('uses' in weapon) && 'currentUses' in weapon) weapon.uses = weapon.currentUses;
  if (!('loaded' in weapon)) weapon.loaded = true;
  if (!('mod' in weapon)) weapon.mod = null;
}

function normalizeMechLoadout(loadout: any) {
  if (!loadout) return;

  const systemArrays = [loadout.systems, loadout.integratedSystems];
  systemArrays.forEach(systems => {
    (systems || []).forEach((system: any) => {
      if (!('uses' in system) && 'currentUses' in system) system.uses = system.currentUses;
    });
  });

  const slotContainers = [
    ...(loadout.mounts || []),
    loadout.improved_armament,
    loadout.superheavy_mounting,
    loadout.integratedWeapon,
  ].filter(Boolean);
  slotContainers.forEach((mount: any) => {
    if (Array.isArray(mount.bonus_effects)) {
      mount.bonus_effects = mount.bonus_effects.map(idOf);
    }
    [...(mount.slots || []), ...(mount.extra || [])].forEach((slot: any) => {
      if (slot) normalizeWeapon(slot.weapon);
    });
  });
  (loadout.integratedMounts || []).forEach((slot: any) => {
    if (slot) normalizeWeapon(slot.weapon);
  });
}

function normalizeMech(mech: any) {
  if (!mech.cloud_portrait && mech.img && mech.img.cloud_portrait) {
    mech.cloud_portrait = mech.img.cloud_portrait;
  }

  if (!('current_hp' in mech) && mech.stats && mech.stats.current) {
    const cur = mech.stats.current || {};
    const max = mech.stats.max || {};
    const full = (k: string) => cur[k] ?? max[k] ?? 0;
    const tracked = (k: string) => cur[k] ?? 0;
    mech.current_hp = full('hp');
    mech.current_structure = full('structure');
    mech.current_stress = full('stress');
    mech.current_repairs = full('repairCapacity');
    mech.current_heat = tracked('heat');
    mech.current_overcharge = tracked('overcharge');
    mech.overshield = tracked('overshield');
    mech.burn = tracked('burn');
    mech.current_core_energy = mech.corePower ? 1 : 0;
    mech.conditions = mech.statuses || [];
  }

  mech.conditions = (mech.conditions || []).map(idOf);

  (mech.loadouts || []).forEach(normalizeMechLoadout);
  return mech;
}

const LOCAL_PILOT_FIELDS = [
  'bondId', 'xp', 'stress', 'burdens', 'bondPowers', 'bondAnswers', 'minorIdeal',
] as const;

export function carryOverLocalPilotFields(parsed: DomainPilot, existing: any): DomainPilot {
  if (!existing) return parsed;
  const carried: any = { ...parsed };
  for (const field of LOCAL_PILOT_FIELDS) {
    if (existing[field] !== undefined) carried[field] = existing[field];
  }
  return carried;
}

export function parseCompconPilot(raw: any): DomainPilot {
  const pilot = deepCopy(unwrapEnvelope(raw));

  if (!pilot || !pilot.id || !pilot.mechs) {
    throw new Error('Invalid pilot file: missing id or mechs');
  }

  if (!pilot.cloud_portrait && pilot.img && pilot.img.cloud_portrait) {
    pilot.cloud_portrait = pilot.img.cloud_portrait;
  }

  if (!pilot.loadout && Array.isArray(pilot.loadouts)) {
    pilot.loadout = pilot.loadouts[0];
  }

  if (Array.isArray(pilot.core_bonuses)) {
    const inlineCoreBonuses = pilot.core_bonuses.filter((ref: any) => ref && typeof ref === 'object');
    if (inlineCoreBonuses.length > 0) pilot.core_bonus_data = inlineCoreBonuses;
    pilot.core_bonuses = pilot.core_bonuses.map(idOf);
  }

  pilot.mechs = pilot.mechs.map(normalizeMech);

  return PilotSchema.parse(pilot);
}
