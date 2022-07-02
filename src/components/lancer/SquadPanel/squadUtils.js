import {
  getMechMaxHP,
  getMechMaxHeatCap,
  getMechMaxRepairCap,
  getCountersFromPilot,
} from '../MechState/mechStateUtils.js';

import {
  findFrameData,
  findSystemData,
	findWeaponData,
  OVERCHARGE_SEQUENCE,
} from '../lancerData.js';

import { getWeaponsOnMount } from '../MechSheet/MechMount.jsx';

import { getMountsFromLoadout } from '../LancerPlayerMode/PlayerMechSheet.jsx';

import { capitalize } from '../../../utils.js';


// makes a condensed form of mech + pilot to show to the rest of the squad
export function createSquadMech(activeMech, activePilot) {
  // console.log('activePilot', activePilot);
  // console.log('activeMech', activeMech);

	const frameData = findFrameData(activeMech.frame);
	let squadMech = {}
	squadMech.id = activeMech.id
  if (activePilot.shareCode) squadMech.shareCode = activePilot.shareCode

  squadMech.name = activeMech.name
  squadMech.callsign = activePilot.callsign

	squadMech.hpCurrent = activeMech.current_hp
	squadMech.hpMax = getMechMaxHP(activeMech, activePilot, frameData)
	squadMech.heatCurrent = activeMech.current_heat
	squadMech.heatMax = getMechMaxHeatCap(activeMech, activePilot, frameData)
	squadMech.structure = activeMech.current_structure
	squadMech.stress = activeMech.current_stress

	// starts with 'mf_' if it's a default one
	squadMech.portraitMech = activeMech.cloud_portrait ? activeMech.cloud_portrait : frameData.id
	// TODO: should sanitize this on the receiving end
	squadMech.portraitPilot = activePilot.cloud_portrait

	let statuses;

  // EXTERNAL statuses
  statuses = []
  if (activeMech.conditions) statuses = activeMech.conditions.map(condition => capitalize(condition.toLowerCase()))
  if (activeMech.burn) statuses.push(`Burn ${activeMech.burn}`)
	if (activeMech.overshield) statuses.push(`Overshield ${activeMech.overshield}`)
	squadMech.statusExternal = statuses.join(',')

  // INTERNAL statuses
  statuses = []
  if (activePilot.custom_counters) {
    getCountersFromPilot(activePilot)
      .filter(counter => counter.name.length > 0)
      .forEach(counter => statuses.push(`${counter.name}: ${counter.val}`))
  }
  if (activeMech.current_overcharge > 0) statuses.push(`Overcharge ${OVERCHARGE_SEQUENCE[activeMech.current_overcharge]} heat`)
  if (!activeMech.current_core_energy) statuses.push('CP exhausted')
	if (activeMech.current_repairs < getMechMaxRepairCap(activeMech, activePilot, frameData)) {
    statuses.push(`${activeMech.current_repairs} repairs left`)
  }

  let destroyedSystemNames = []
  activeMech.loadouts[0].systems.forEach(system => {
    if (system.destroyed) {
      const destroyedSystemData = findSystemData(system.id)
      destroyedSystemNames.push( destroyedSystemData.name.toUpperCase() )
    }
  })
  getMountsFromLoadout(activeMech.loadouts[0]).forEach(mount => {
    getWeaponsOnMount(mount).forEach(weapon => {
      if (weapon.destroyed) destroyedSystemNames.push( findWeaponData(weapon.id).name )
    })
  })
  if (destroyedSystemNames.length > 0) statuses.push(`DESTROYED:,${destroyedSystemNames.join(',')}`)

	squadMech.statusInternal = statuses.join(',')

	// console.log('squad mech', squadMech);
	return squadMech;
}
