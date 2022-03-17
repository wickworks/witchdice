import React from 'react';
import MechSheet from '../MechSheet/MechSheet.jsx';
import FullRepairButton from './FullRepairButton/FullRepairButton.jsx';

import {
  isSystemTechAttack,
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
  getLimitedBonus,
  getSkillCheckAccuracy,
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
  findTalentData,
  baselineMount,
  systemHasTag,
  getSystemLimited,
  getSystemRecharge,
} from '../lancerData.js';

import { deepCopy } from '../../../utils.js';
import {
  savePilotData,
} from '../lancerLocalStorage.js';


const PlayerMechSheet = ({
  activePilot,
  activeMech,

  setTriggerRerender,
  triggerRerender,

  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
  setDistantDicebagData,
}) => {

  const frameData = findFrameData(activeMech.frame);
  const loadout = activeMech.loadouts[0];

  // weird special case looking for an un-used custom paint job
  const customPaintJobSystem = loadout.systems.find(system => system.id === 'ms_custom_paint_job')
  const hasIntactCustomPaintJob = customPaintJobSystem && (customPaintJobSystem.uses === 0)

  const robotState = {
    overshield: activeMech.overshield,
    hp: activeMech.current_hp,
    heat: activeMech.current_heat,
    burn: activeMech.burn,
    overcharge: activeMech.current_overcharge,
    coreEnergy: activeMech.current_core_energy,
    repairs: activeMech.current_repairs,
    structure: activeMech.current_structure,
    stress: activeMech.current_stress,

    conditions: activeMech.conditions,
    counters: getCountersFromPilot(activePilot),

    hasIntactCustomPaintJob: hasIntactCustomPaintJob,
  }

  const robotStats = {
    hull: activePilot.mechSkills[0],
    hullAccuracy: getSkillCheckAccuracy('hull', activeMech, activePilot, frameData),
    engineering: activePilot.mechSkills[3],
    engineeringAccuracy: getSkillCheckAccuracy('engineering', activeMech, activePilot, frameData),
    agility: activePilot.mechSkills[1],
    agilityAccuracy: getSkillCheckAccuracy('agility', activeMech, activePilot, frameData),
    systems: activePilot.mechSkills[2],
    systemsAccuracy: getSkillCheckAccuracy('systems', activeMech, activePilot, frameData),

    maxHP: getMechMaxHP(activeMech, activePilot, frameData),
    maxHeat: getMechMaxHeatCap(activeMech, activePilot, frameData),
    maxRepairCap: getMechMaxRepairCap(activeMech, activePilot, frameData),
    maxStructure: 4,
    maxStress: 4,

    size: frameData.stats.size,
    armor: getMechArmor(activeMech, activePilot, frameData),
    evasion: getMechEvasion(activeMech, activePilot, frameData),
    moveSpeed: getMechMoveSpeed(activeMech, activePilot, frameData),
    eDef: getMechEDef(activeMech, activePilot, frameData),
    saveTarget: getMechSaveTarget(activeMech, activePilot, frameData),
    sensorRange: frameData.stats.sensor_range,
    techAttackBonus: getMechTechAttack(activeMech, activePilot, frameData),
    limitedBonus: getLimitedBonus(activeMech, activePilot, frameData),

    attackBonus: getGrit(activePilot),
    attackBonusRanged: getToHitBonusFromMech(activeMech.frame),
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
    systems: getSystemTraits(loadout.systems, robotStats.limitedBonus),

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
        // console.log('statKey',statKey, ':', newMechData[statKey]);
        switch (statKey) {
          case 'custom_counters':
          case 'counter_data':
            newPilotData[statKey] = newMechData[statKey]
            break;

          case 'systemUses':
            loadout.systems[ newMechData[statKey].index ].uses = newMechData[statKey].uses
            break;
          case 'systemCharged':
            loadout.systems[ newMechData[statKey].index ].uses = newMechData[statKey].charged ? 1 : 0
            break;
          case 'systemDestroyed':
            loadout.systems[ newMechData[statKey].index ].destroyed = newMechData[statKey].destroyed
            break;
          case 'weaponLoaded':
          case 'weaponDestroyed':
          case 'weaponUses':
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
            if ('destroyed' in newMechData[statKey])  slot.weapon.destroyed = newMechData[statKey].destroyed
            if ('uses' in newMechData[statKey])       slot.weapon.uses = newMechData[statKey].uses
            if ('loaded' in newMechData[statKey])     slot.weapon.loaded = newMechData[statKey].loaded
            break;

          case 'repairAllWeaponsAndSystems':
            const limitedBonus = getLimitedBonus(activeMech, activePilot, frameData);

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
                      if (limitedTag) slot.weapon.uses = limitedTag.val + limitedBonus
                    }
                  }
                })
              })
            });
            break;

          // update a mech value
          case 'conditions':
            newPilotData.mechs[mechIndex][statKey] = newMechData[statKey]
            break;
          default:
            newPilotData.mechs[mechIndex][statKey] = parseInt(newMechData[statKey])
            break;
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
        setDistantDicebagData={setDistantDicebagData}
      />
    </>
  );
}



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


// Harvest the actions and whatnot from a mech's loadout
function getSystemTraits(systems, limitedBonus) {
  let systemTraits = []

  // PASSIVES and TECH first
  systems.forEach((system, systemIndex) => {
    const systemData = findSystemData(system.id)
    const grantsTechAttacks = isSystemTechAttack(systemData)

    // passives
    if (systemData.effect) {
      let recharge = getSystemRecharge(system, systemData)

      systemTraits.push({
        systemIndex: systemIndex,
        name: systemData.name.toLowerCase(),
        description: systemData.effect,
        isDestructable: !systemHasTag(systemData, 'tg_indestructible'),
        isDestroyed: system.destroyed,
        recharge: recharge,
        isTitleCase: true,
      })
    }

    // tech actions
    if (!systemData.effect && grantsTechAttacks) {
      const isInvade = isSystemTechAttack(systemData, true)
      const techDescription = isInvade ?
        `Gain the following options for Invade: ${systemData.actions.map(action => action.name).join(', ')}`
      :
        `Gain the following tech actions: ${systemData.actions.map(action => action.name || systemData.name).join(', ')}`

      systemTraits.push({
        systemIndex: systemIndex,
        name: systemData.name.toLowerCase(),
        description: techDescription,
        isDestructable: !systemHasTag(systemData, 'tg_indestructible'),
        isDestroyed: system.destroyed,
        isTitleCase: true,
      })
    }
  })

  // ACTIONS and DEPLOYABLES second
  systems.forEach((system,systemIndex) => {
    const systemData = findSystemData(system.id)

    // actions
    if (systemData.actions) {
      let limited = getSystemLimited(system, systemData, limitedBonus)

      // (invades go into the mounts list, but quick tech is fine here)
      if (!isSystemTechAttack(systemData)) {
        systemData.actions.forEach((action, i) => {
          if (action.name && action.name.includes('Grenade')) limited.icon = 'grenade'

          systemTraits.push({
            systemIndex: systemIndex,
            name: (action.name || systemData.name).toLowerCase(),
            activation: action.activation || 'Quick',
            trigger: action.trigger,
            range: action.range,
            description: action.detail,
            isDestructable: !systemHasTag(systemData, 'tg_indestructible'),
            isDestroyed: system.destroyed,
            limited: limited,
            isTitleCase: true,
          })
        })
      }
    }

    // deployables
    if (systemData.deployables) {
      let limited = getSystemLimited(system, systemData, limitedBonus)

      systemData.deployables.forEach((deployable, i) => {
        if (deployable.type === 'Mine') limited.icon = 'mine'

        systemTraits.push({
          systemIndex: systemIndex,
          name: deployable.name,
          activation: deployable.activation || 'Quick',
          trigger: deployable.trigger,
          range: deployable.range,
          description: deployable.detail,
          isDestructable: !systemHasTag(systemData, 'tg_indestructible'),
          isDestroyed: system.destroyed,
          limited: limited,
          isTitleCase: true,
        })
      })
    }
  })

  // console.log('systemTraits',systemTraits);

  return systemTraits
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


export function getMountsFromLoadout(loadout) {
  let mounts = [];

  // STANDARD MOUNTS
  mounts = loadout.mounts.map(mount =>
    ({...mount, source: 'mounts'})
  )

  // IMPROVED improved_armament
  if (loadout.improved_armament.slots.length > 0 && loadout.improved_armament.slots[0].weapon) {
    let improved_armament = deepCopy(loadout.improved_armament)
    improved_armament.bonus_effects.push('cb_improved_armament')
    improved_armament.source = 'improved_armament'
    mounts.push(improved_armament)
  }

  // give the integrated weapon a bonus_effect and source to make it clear where it came from
  if (loadout.integratedWeapon.slots.length > 0 && loadout.integratedWeapon.slots[0].weapon) {
    let integratedWeapon = deepCopy(loadout.integratedWeapon)
    integratedWeapon.bonus_effects = ['cb_integrated_weapon']
    integratedWeapon.source = 'integratedWeapon'
    mounts.push(integratedWeapon)
  }

  // gotta make a dummy mount for integrated mounts
  if (loadout.integratedMounts.length > 0) {
    const integratedMounts =
      loadout.integratedMounts.map(integratedMountWeapon => {
        return {
          mount_type: "Integrated",
          lock: false,
          slots: [ integratedMountWeapon ],
          extra: [],
          bonus_effects: [],
          source: 'integratedMounts'
        }
      })
    mounts.push(...integratedMounts)
  }

  return mounts;
}


function getInvadeAndTechAttacks(loadout, pilotTalents) {
  let invades = [];

  loadout.systems.forEach(system => {
    const systemData = findSystemData(system.id)
    if (!system.destroyed && isSystemTechAttack(systemData, false)) {
      // not all actions have unique names e.g. Markerlight; in these cases, inherit from the system
      const techAttacks = systemData.actions.map(action => {
        return {...action, name: (action.name || systemData.name)}
      })
      invades.push(...techAttacks)
    }
  })

  pilotTalents.forEach(pilotTalent => {
    const talentData = findTalentData(pilotTalent.id)
    talentData.ranks.forEach(rank => {
      if (rank.actions) {
        rank.actions.forEach(action => {
          if (['Invade', 'Quick Tech', 'Full Tech'].includes(action.activation)) {
            invades.push(action)
          }
        })
      }
    });
  })

  invades.push({
    "name": "Fragment Signal",
    "activation": "Invade",
    "detail": "IMPAIR and SLOW a character until the end of their next turn.",
  })

  return invades
}

export default PlayerMechSheet;
