import {
  getMechMaxHP,
  getMechMaxHeatCap,
  getMechMaxRepairCap,
  getCountersFromPilot,
  getMechArmor,
  getMechTechAttack,
  getLimitedBonus,
  getMechMoveSpeed,
  getMechEvasion,
  getMechEDef,
  getMechSaveTarget,
} from '../MechState/mechStateUtils.js';

import {
  findFrameData,
  findTalentData,
  findCoreBonusData,
  findSystemData,
	findWeaponData,
  OVERCHARGE_SEQUENCE,
} from '../lancerData.js';

import { getWeaponsOnMount } from '../MechSheet/MechMount.jsx';

import { getMountsFromLoadout } from '../LancerPlayerMode/PlayerMechSheet.jsx';

import { capitalize } from '../../../utils.js';

// makes a condensed form of mech + pilot to show to the rest of the squad
export function createSquadMech(activeMech, activePilot) {
  // console.log('activeMech', activeMech);

	const frameData = findFrameData(activeMech.frame);
	let squadMech = {
    detail: {},
    status: {}
  }

  // == DETAILS == things that don't change
	squadMech.detail.id = activeMech.id
  squadMech.detail.name = activeMech.name
  squadMech.detail.callsign = activePilot.callsign

  // starts with 'mf_' if it's a default one
	squadMech.detail.portraitMech = activeMech.cloud_portrait ? activeMech.cloud_portrait : frameData.id
	// TODO: should sanitize this on the receiving end
	squadMech.detail.portraitPilot = activePilot.cloud_portrait

  squadMech.detail.hpMax = getMechMaxHP(activeMech, activePilot, frameData)
  squadMech.detail.heatMax = getMechMaxHeatCap(activeMech, activePilot, frameData)

  let build = {}
  // build.licenses = activePilot.licenses
  build.licenses = activePilot.licenses.map(license => `${findFrameData(license.id).name} ${license.rank}`).join(', ')
  // build.core_bonuses = activePilot.core_bonuses
  build.core_bonuses = activePilot.core_bonuses.map(license => findCoreBonusData(license).name).join(', ')
  // build.talents = activePilot.talents
  build.talents = activePilot.talents.map(talent => `${findTalentData(talent.id).name} ${talent.rank}`).join(', ')
  build.mechSkills = [
    `HULL:${activePilot.mechSkills[0]}`,
    `AGI:${activePilot.mechSkills[1]}`,
    `SYS:${activePilot.mechSkills[2]}`,
    `ENGI:${activePilot.mechSkills[3]}`,
  ].join(' ')

  const techAtk = getMechTechAttack(activeMech, activePilot, frameData)
  const limitedBonus = getLimitedBonus(activeMech, activePilot, frameData)
  const maxRepairCap = getMechMaxRepairCap(activeMech, activePilot, frameData)
  build.stats = [
    `SPD:${getMechMoveSpeed(activeMech, activePilot, frameData)}`,
    `EVA:${getMechEvasion(activeMech, activePilot, frameData)}`,
    `EDEF:${getMechEDef(activeMech, activePilot, frameData)}`,
    `ARMOR:${getMechArmor(activeMech, activePilot, frameData)}`,
    `SENSOR:${frameData.stats.sensor_range}`,
    `SAVE:${getMechSaveTarget(activeMech, activePilot, frameData)}`,
  ].join(' ')

  build.statBonuses = [
    `REPAIR:${maxRepairCap}`,
    `TECH ATK:${techAtk > 0 ? '+' : ''}${techAtk}`,
    `LIMITED:${limitedBonus > 0 ? '+' : ''}${limitedBonus}`,
  ].join(' ')

  let destroyedSystemNames = []

  let allWeaponNames = []
  const mounts = getMountsFromLoadout(activeMech.loadouts[0])
  mounts.forEach(mount => {
    getWeaponsOnMount(mount).forEach(weapon => {
      const weaponName = findWeaponData(weapon.id).name
      allWeaponNames.push(weaponName)
      if (weapon.destroyed) destroyedSystemNames.push(weaponName)
    })
  })
  build.weapons = allWeaponNames.join(', ')

  let allSystemNames = []
  activeMech.loadouts[0].systems.forEach(system => {
    const systemName = findSystemData(system.id).name.toUpperCase()
    allSystemNames.push(systemName)
    if (system.destroyed) destroyedSystemNames.push( systemName )
  })
  build.systems = allSystemNames.join(', ')

  squadMech.detail.build = build

  // == STATUS == things that change a lot
  squadMech.status.id = activeMech.id // except for the id; it's gotta match up somehow
	squadMech.status.hpCurrent = activeMech.current_hp
	squadMech.status.heatCurrent = activeMech.current_heat
	squadMech.status.structure = activeMech.current_structure
	squadMech.status.stress = activeMech.current_stress

	let statuses;

  // EXTERNAL statuses
  statuses = []
  if (activeMech.conditions) statuses = activeMech.conditions.map(condition => capitalize(condition.toLowerCase()))
  if (activeMech.burn) statuses.push(`Burn ${activeMech.burn}`)
	if (activeMech.overshield) statuses.push(`Overshield ${activeMech.overshield}`)
	squadMech.status.statusExternal = statuses.join(',')

  // INTERNAL statuses
  statuses = []
  if (activePilot.custom_counters) {
    getCountersFromPilot(activePilot)
      .filter(counter => counter.name.length > 0)
      .forEach(counter => statuses.push(`${counter.name}: ${counter.val}`))
  }
  if (activeMech.current_overcharge > 0) statuses.push(`Overcharge ${OVERCHARGE_SEQUENCE[activeMech.current_overcharge]} heat`)
  if (!activeMech.current_core_energy) statuses.push('CP exhausted')
	if (activeMech.current_repairs < maxRepairCap) {
    statuses.push(`${activeMech.current_repairs} repairs left`)
  }

  if (destroyedSystemNames.length > 0) statuses.push(`DESTROYED:${destroyedSystemNames.join(',')}`)

	squadMech.status.statusInternal = statuses.join(',')

	// console.log('squad mech', squadMech);
	return squadMech;
}
