import {
  getLimitedBonus,
} from '../MechState/mechStateUtils.js';

import {
  findWeaponData,
  findFrameData,
  findSystemData,
} from '../lancerData.js';


export function applyUpdatesToPlayer(mechUpdate, newPilotData, newMechData) {
  if (!newPilotData || !newMechData) return

  const frameData = findFrameData(newMechData.frame);
  const loadout = newMechData.loadouts[0]
  Object.keys(mechUpdate).forEach(statKey => {
    const updateValue = mechUpdate[statKey]

    // console.log('statKey',statKey, ':', mechUpdate[statKey]);
    switch (statKey) {
      // update something on the pilot
      case 'custom_counters':
      case 'counter_data':
        newPilotData[statKey] = updateValue
        break;

      case 'systemUses':
      case 'systemCharged':
      case 'systemDestroyed':
        let systemIndex = updateValue.index
        let system
        if (systemIndex < loadout.systems.length) {
          system = loadout.systems[systemIndex]
        } else {
          systemIndex = systemIndex - loadout.systems.length
          system = loadout.integratedSystems[systemIndex]
        }
        if ('uses' in updateValue)  system.uses = updateValue.uses
        if ('charged' in updateValue)       system.uses = updateValue.charged ? 1 : 0
        if ('destroyed' in updateValue)     system.destroyed = updateValue.destroyed
        break;

      case 'systemPerRoundCount':
        var perRoundState = newPilotData.state.per_round_uses || {}
        if (updateValue.source) {
          perRoundState[updateValue.source] = Math.max(updateValue.uses || 0, 0)
        }
        newPilotData.state.per_round_uses = perRoundState // in case it was new
        break;
      case 'resetPerRoundCounts':
        newPilotData.state.per_round_uses = {}
        break;

      case 'weaponLoaded':
      case 'weaponDestroyed':
      case 'weaponUses':
      case 'weaponModUses':
        const mountSource = updateValue.mountSource
        const mountIndex = updateValue.mountIndex
        const weaponIndex = updateValue.weaponIndex
        let slot
        if (mountSource === 'mounts') {
          slot = loadout.mounts[mountIndex].slots[weaponIndex]
          if (!slot) slot = loadout.mounts[mountIndex].extra[0]
        } else if (mountSource === 'improved_armament') {
          slot = loadout.improved_armament.slots[weaponIndex]
          if (!slot) slot = loadout.improved_armament.extra[0]
        } else if (mountSource === 'superheavy_mounting') {
          slot = loadout.superheavy_mounting.slots[weaponIndex]
          if (!slot) slot = loadout.superheavy_mounting.extra[0]
        } else if (mountSource === 'integratedWeapon') {
          slot = loadout.integratedWeapon.slots[weaponIndex]
          if (!slot) slot = loadout.integratedWeapon.extra[0]
        } else if (mountSource === 'integratedMounts') {
          slot = loadout.integratedMounts[mountIndex]
        }
        if ('destroyed' in updateValue)  slot.weapon.destroyed = updateValue.destroyed
        if ('loaded' in updateValue)     slot.weapon.loaded = updateValue.loaded
        if ('uses' in updateValue)       slot.weapon.uses = updateValue.uses
        if ('modUses' in updateValue)    slot.weapon.mod.uses = updateValue.modUses
        break;

      case 'repairAllWeaponsAndSystems':
        const limitedBonus = getLimitedBonus(newMechData, newPilotData, frameData);

        // - systems - //
        [loadout.systems, loadout.integratedSystems].forEach(systemArray => {
          systemArray.forEach(system => {
            // Repair
            system.destroyed = false
            // Restore limited uses
            const systemData = findSystemData(system.id)
            if (systemData && systemData.tags) {
              const limitedTag = systemData.tags.find(tag => tag.id === 'tg_limited')
              if (limitedTag) system.uses = limitedTag.val + limitedBonus
            }
          })
        });
        // - weapons - //
        [loadout.mounts, [loadout.improved_armament], [loadout.integratedWeapon], [loadout.superheavy_mounting]].forEach(weaponMounts => {
          weaponMounts.forEach(mount => {
            [...mount.slots, ...(mount.extra || [])].forEach(slot => {
              if (slot.weapon) {
                // Repair
                slot.weapon.destroyed = false
                slot.weapon.loaded = true
                // Restore limited uses
                const weaponData = findWeaponData(slot.weapon.id)
                if (weaponData && weaponData.tags) {
                  const limitedTag = weaponData.tags.find(tag => tag.id === 'tg_limited')
                  if (limitedTag) slot.weapon.uses = limitedTag.val + limitedBonus
                }
              }
            })
          })
        });
        break;

      // update a mech value
      case 'active':
      case 'conditions':
        newMechData[statKey] = updateValue
        break;
      default:
        newMechData[statKey] = parseInt(updateValue)
        break;
      }
  });
}
