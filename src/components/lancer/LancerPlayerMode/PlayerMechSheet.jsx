import React from 'react';
import MechSheet from '../MechSheet/MechSheet.jsx';
import FullRepairButton from './FullRepairButton/FullRepairButton.jsx';

import {
  getMountsFromLoadout,
  getInvadeAndTechAttacks,
} from '../MechSheet/MechMount.jsx';

import {
  getMechMaxHP,
  getMechMaxHeatCap,
  getMechMoveSpeed,
  getMechEvasion,
  getMechEDef,
  getMechSaveTarget,
  getMechArmor,
  getMechMaxRepairCap,

  getMechTechAttack,
  getCountersFromPilot,
} from '../MechState/mechStateUtils.js';

import {
  getToHitBonusFromMech,
} from '../WeaponRoller/bonusDamageSourceUtils.js';

import {
  getGrit,
  findWeaponData,
  findFrameData,
  findSystemData,
  baselineMount,
} from '../lancerData.js';

import { deepCopy } from '../../../utils.js';
import {
  savePilotData,
} from '../lancerLocalStorage.js';


// Harvest the many frame traits and actions available in core systems
function getFrameTraits(traitList, coreSystem) {
  let frameTraits = []

  traitList.forEach(trait => {
    frameTraits.push({
      name: trait.name.toLowerCase(),
      isTitleCase: true,
      description: trait.description,
    })

    if (trait.actions) {
      trait.actions.forEach(traitAction =>
        frameTraits.push({
          name: traitAction.name,
          activation: traitAction.activation,
          trigger: traitAction.trigger,
          frequency: traitAction.frequency,
          description: traitAction.detail,
        })
      )
    }
  })

  if (coreSystem.passive_effect) {
    frameTraits.push({
      name: coreSystem.passive_name,
      description: coreSystem.passive_effect,
    })
  }

  if (coreSystem.passive_actions) {
    coreSystem.passive_actions.forEach(passiveAction => {
      frameTraits.push({
        name: passiveAction.name,
        activation: passiveAction.activation,
        trigger: passiveAction.trigger,
        description: passiveAction.detail,
      })
    })
  }

  frameTraits.push({
    name: coreSystem.active_name,
    activation: `Active (1 CP), ${coreSystem.activation}`,
    description: coreSystem.active_effect,
    isCP: true,
  })

  if (coreSystem.active_actions) {
    coreSystem.active_actions.forEach(activeAction => {
      frameTraits.push({
        name: activeAction.name,
        activation: activeAction.activation,
        trigger: activeAction.trigger,
        description: activeAction.detail,
      })
    })
  }

  return frameTraits
}


// Special case: modify RAM and IMPROVISED ATTACKS due to systems or talents
function modifiedBaselineMount(activePilot, loadout) {
  let mount = deepCopy(baselineMount)
  mount.slots.forEach(slot => {
    if (slot.weapon.id === 'act_ram' && loadout.systems.find(system => system.id === 'ms_siege_ram')) {
      slot.weapon.mod = 'ms_siege_ram'
    }

    if (slot.weapon.id === 'act_improvised_attack' && activePilot.talents.find(talent => (talent.id === 't_brawler' && talent.rank >= 2))) {
      slot.weapon.mod = 't_brawler'
    }
  })
  return mount
}


const PlayerMechSheet = ({
  activePilot,
  activeMech,

  setTriggerRerender,
  triggerRerender,

  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
}) => {

  const frameData = findFrameData(activeMech.frame);
  const loadout = activeMech.loadouts[0];

  const robotState = {
    overshield: activeMech.overshield,
    current_hp: activeMech.current_hp,
    current_heat: activeMech.current_heat,
    burn: activeMech.burn,
    current_overcharge: activeMech.current_overcharge,
    current_core_energy: activeMech.current_core_energy,
    current_repairs: activeMech.current_repairs,
    current_structure: activeMech.current_structure,
    current_stress: activeMech.current_stress,

    conditions: activeMech.conditions,
    counters: getCountersFromPilot(activePilot),
  }

  const robotStats = {
    maxHP: getMechMaxHP(activeMech, activePilot, frameData),
    maxHeat: getMechMaxHeatCap(activeMech, activePilot, frameData),
    maxRepairCap: getMechMaxRepairCap(activeMech, activePilot, frameData),

    size: frameData.stats.size,
    armor: getMechArmor(activeMech, activePilot, frameData),
    evasion: getMechEvasion(activeMech, activePilot, frameData),
    moveSpeed: getMechMoveSpeed(activeMech, activePilot, frameData),
    eDef: getMechEDef(activeMech, activePilot, frameData),
    saveTarget: getMechSaveTarget(activeMech, activePilot, frameData),
    sensorRange: frameData.stats.sensor_range,
    techAttackBonus: getMechTechAttack(activeMech, activePilot, frameData),

    attackBonus: getGrit(activePilot),
    attackBonusRanged: getToHitBonusFromMech(activeMech),
  }

  const robotInfo = {
    name: activeMech.name,
    id: activeMech.id,
    cloud_portrait: activeMech.cloud_portrait,
    frameID: frameData.id,
    frameSourceIcon: frameData.source.toLowerCase(),
    frameSourceText: frameData.source,
    frameName: frameData.name.toLowerCase(),
  }

  const robotLoadout = {
    frameTraits: getFrameTraits(frameData.traits, frameData.core_system),
    systems: loadout.systems,

    mounts: [...getMountsFromLoadout(loadout), modifiedBaselineMount(activePilot, loadout)],
    invades: getInvadeAndTechAttacks(loadout, activePilot.talents),
  }


  // anything the weapon roller setup will need to determine available sources of accuracy/difficulty
  const accuracyAndDamageSourceInputs = {
    frameID: activeMech.frame,
    mechSystems: loadout.systems,
    pilotTalents: activePilot.talents,
    isImpaired: activeMech.conditions.includes('IMPAIRED'),
  }

  // =============== MECH STATE ==================

  const updateMechState = (newMechData) => {
    let newPilotData = deepCopy(activePilot);
    const mechIndex = activePilot.mechs.findIndex(mech => mech.id === activeMech.id)
    const loadout = newPilotData.mechs[mechIndex].loadouts[0]

    if (mechIndex >= 0) {
      Object.keys(newMechData).forEach(statKey => {
        // update something on the pilot, actually
        if (statKey === 'custom_counters' || statKey === 'counter_data') {
          newPilotData[statKey] = newMechData[statKey]

        // update the state of a system on the mech (modifying a value in a json tree is hell)
        } else if (statKey === 'systemUses') {
          const systemIndex = newMechData[statKey].index
          loadout.systems[systemIndex].uses = newMechData[statKey].uses
        } else if (statKey === 'systemDestroyed') {
          const systemIndex = newMechData[statKey].index
          loadout.systems[systemIndex].destroyed = newMechData[statKey].destroyed
        } else if (statKey === 'weaponDestroyed') {
          const mountSource = newMechData[statKey].mountSource
          const mountIndex = newMechData[statKey].mountIndex
          const weaponIndex = newMechData[statKey].weaponIndex
          let slot
          if (mountSource === 'mounts') {
            slot = loadout.mounts[mountIndex].slots[weaponIndex]
            if (!slot) slot = loadout.mounts[mountIndex].extra[0]
          } else if (mountSource === 'improved_armament') {
            slot = loadout.improved_armament.slots[weaponIndex]
            if (!slot) slot = loadout.improved_armament.extra[0]
          } else if (mountSource === 'integratedWeapon') {
            slot = loadout.integratedWeapon.slots[weaponIndex]
            if (!slot) slot = loadout.integratedWeapon.extra[0]
          } else if (mountSource === 'integratedMounts') {
            // integrated mounts can't be destroyed; only including here for thouroughness
          }
          slot.weapon.destroyed = newMechData[statKey].destroyed
        } else if (statKey === 'repairAllWeaponsAndSystems') {
          // - systems - //
          [loadout.systems, loadout.integratedSystems].forEach(systemArray => {
            systemArray.forEach(system => {
              // Repair
              system.destroyed = false
              // Restore limited uses
              const systemData = findSystemData(system.id)
              if (systemData && systemData.tags) {
                const limitedTag = systemData.tags.find(tag => tag.id === 'tg_limited')
                if (limitedTag) system.uses = limitedTag.val
              }
            })
          });
          // - weapons - //
          [loadout.mounts, [loadout.improved_armament], [loadout.integratedWeapon]].forEach(weaponMounts => {
            weaponMounts.forEach(mount => {
              mount.slots.forEach(slot => {
                if (slot.weapon) {
                  // Repair
                  slot.weapon.destroyed = false
                  // Restore limited uses
                  const weaponData = findWeaponData(slot.weapon.id)
                  if (weaponData && weaponData.tags) {
                    const limitedTag = weaponData.tags.find(tag => tag.id === 'tg_limited')
                    if (limitedTag) slot.weapon.uses = limitedTag.val
                  }
                }
              })
            })
          });

        // update a mech value
        } else if (statKey === 'conditions') {
          newPilotData.mechs[mechIndex][statKey] = newMechData[statKey]
        } else {
          newPilotData.mechs[mechIndex][statKey] = parseInt(newMechData[statKey])
        }
      });

      // update it in localstorage
      savePilotData(newPilotData)

      setTriggerRerender(!triggerRerender)

    } else {
      console.error('Could not find mech to save it!', newMechData)
    }
  }



  return (
    <>
      <FullRepairButton activeMech={activeMech} activePilot={activePilot} updateMechState={updateMechState} />

      <MechSheet
        robotState={robotState}
        robotStats={robotStats}
        robotInfo={robotInfo}
        robotLoadout={robotLoadout}
        updateMechState={updateMechState}

        accuracyAndDamageSourceInputs={accuracyAndDamageSourceInputs}

        setPartyLastAttackKey={setPartyLastAttackKey}
        setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
        setRollSummaryData={setRollSummaryData}
      />
    </>
  );
}




export default PlayerMechSheet;
