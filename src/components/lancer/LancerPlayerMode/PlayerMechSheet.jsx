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
  getRangeSynergies,
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
  findFrameData,
  findSystemData,
  findTalentData,
  findCoreBonusData,
  baselineMount,
  hasTag,
  getSystemLimited,
  getSystemRecharge,
  getSystemPerRoundCount,
  getSelfHeat,
  getUsesPerRound,
} from '../lancerData.js';

import { applyUpdatesToPlayer } from './playerUtils.js';

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
    rangeSynergies: getRangeSynergies(activeMech, activePilot, frameData),

    attackBonus: getGrit(activePilot),
    attackBonusRanged: getToHitBonusFromMech(activeMech.frame),
  }

  const robotInfo = {
    name: activeMech.name,
    id: activeMech.id,
    cloud_portrait: activeMech.cloud_portrait,
    hasMultipleLoadouts: (activeMech.loadouts && activeMech.loadouts.length > 1),
    frameID: frameData.id,
    frameSourceIcon: frameData.source.toLowerCase(),
    frameSourceText: frameData.source,
    frameName: frameData.name.toLowerCase(),

  }

  const robotLoadout = {
    frameTraits: getFrameTraits(frameData.traits, frameData.core_system, activePilot.state.per_round_uses),
    systems: getSystemTraits([...loadout.systems, ...loadout.integratedSystems], robotStats.limitedBonus, activePilot.state.per_round_uses),
    pilotTraits: getPilotTraits(activePilot.talents, activePilot.core_bonuses, activePilot.state.per_round_uses),

    mounts: [...getMountsFromLoadout(loadout), deepCopy(baselineMount)],
    invades: getInvadeAndTechAttacks(loadout, activePilot.talents, frameData.core_system),
  }


  // anything the weapon roller setup will need to determine available sources of accuracy/difficulty
  const accuracyAndDamageSourceInputs = {
    frameID: activeMech.frame,
    mechSystems: loadout.systems,
    npcFeatures: [],
    pilotTalents: activePilot.talents,
    isImpaired: activeMech.conditions.includes('IMPAIRED'),
    currentHeat: robotState.heat, // may replace this with the rest of state if we ever need it
  }

  // =============== MECH STATE ==================

  const updateMechState = (mechUpdate) => {
    const newPilotData = deepCopy(activePilot);
    const mechIndex = activePilot.mechs.findIndex(mech => mech.id === activeMech.id)

    if (mechIndex >= 0) {
      const newMechData = newPilotData.mechs[mechIndex]
      applyUpdatesToPlayer(mechUpdate, newPilotData, newMechData)

      savePilotData(newPilotData) // update it in localstorage

      setTriggerRerender(!triggerRerender)
    } else {
      console.error('Could not find mech to save it!', mechIndex)
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
function getFrameTraits(traitList, coreSystem, perRoundState) {
  let frameTraits = []

  // -- ACTIVE CORE SYSTEM --
  let activeTrait = {
    name: coreSystem.active_name,
    activation: `Active (1 CP), ${coreSystem.activation}`,
    description: coreSystem.active_effect,
    isCP: true,
  }
  if (coreSystem.active_actions) {
    activeTrait.subTraits = []
    coreSystem.active_actions.forEach(activeAction => {
      activeTrait.subTraits.push({
        name: activeAction.name,
        activation: activeAction.activation,
        trigger: activeAction.trigger,
        description: activeAction.detail,
      })
    })

    // YO if we only have one action/deployable and nothing to say about it, just use that subcard instead of us
    if (!activeTrait.description && activeTrait.subTraits.length === 1) {
      activeTrait = {...activeTrait.subTraits[0]}
      activeTrait.subTraits = []
    }
  }
  frameTraits.push(activeTrait)

  // -- PASSIVE CORE SYSTEM --
  if (coreSystem.passive_effect || coreSystem.passive_actions) {
    let passiveTrait = {
      name: coreSystem.passive_name,
      description: coreSystem.passive_effect,
      isCP: true,
    }
    if (coreSystem.passive_actions) {
      passiveTrait.subTraits = []
      coreSystem.passive_actions.forEach(passiveAction => {
        passiveTrait.subTraits.push({
          name: passiveAction.name,
          activation: passiveAction.activation,
          trigger: passiveAction.trigger,
          description: passiveAction.detail,
        })
      })
    }
    // YO if we only have one action/deployable and nothing to say about it, just use that subcard instead of us
    if (!passiveTrait.description && passiveTrait.subTraits.length === 1) {
      passiveTrait = {...passiveTrait.subTraits[0]}
      passiveTrait.subTraits = []
    }
    passiveTrait.activation = getActivationTypes(passiveTrait)
    frameTraits.push(passiveTrait)
  }

  // -- CORE SYSTEM DEPLOYABLES --
  addDeployableTraits(coreSystem.deployables, frameTraits)

  // -- FRAME TRAITS --
  traitList.forEach(trait => {
    let traitTrait = {
      name: trait.name.toLowerCase(),
      isTitleCase: true,
      description: trait.description,
      perRoundCount: getSystemPerRoundCount(trait, perRoundState, trait.name.toLowerCase().replace(' ','-'))
    }
    if (trait.actions) {
      traitTrait.subTraits = []
      trait.actions.forEach(traitAction =>
        traitTrait.subTraits.push({
          name: traitAction.name,
          activation: traitAction.activation,
          trigger: traitAction.trigger,
          frequency: traitAction.frequency,
          description: traitAction.detail,
        })
      )
    }
    // YO if we only have one action/deployable and nothing to say about it, just use that subcard instead of us
    if (!traitTrait.description && traitTrait.subTraits.length === 1) {
      traitTrait = {...traitTrait.subTraits[0]}
      traitTrait.subTraits = []
    }
    traitTrait.activation = getActivationTypes(traitTrait)
    frameTraits.push(traitTrait)
  })

  return frameTraits
}


// Harvest the actions and whatnot from a mech's loadout
function getSystemTraits(systems, limitedBonus, perRoundState) {
  let systemTraits = []

  // PASSIVES and TECH first
  systems.forEach((system, systemIndex) => {
    const systemData = findSystemData(system.id)
    const grantsTechAttacks = isSystemTechAttack(systemData)
    const grantsInvades = isSystemTechAttack(systemData, true)
    const selfHeat = getSelfHeat(systemData)
    const recharge = getSystemRecharge(system, systemData)
    const limited = getSystemLimited(system, systemData, limitedBonus)
    const perRoundCount = getSystemPerRoundCount(systemData, perRoundState, `${system.id}-${systemIndex}`)

    let systemTrait = {
      systemIndex: systemIndex,
      name: (system.flavorName || systemData.name).toLowerCase(),
      selfHeat: selfHeat,
      description: systemData.effect,
      frequency: getUsesPerRound(systemData),
      isDestructable: !hasTag(systemData, 'tg_indestructible'),
      isDestroyed: system.destroyed,
      recharge: recharge,
      limited: limited,
      perRoundCount: perRoundCount,
      isTitleCase: true,
    }
    let systemSubTraits = []

    // system actions
    if (systemData.actions) {
      // (invades & tech attacks go into the mounts list; only allow non-attack tech here)
      if (!grantsTechAttacks) {
        systemData.actions.forEach((action, i) => {
          if (action.name && action.name.includes('Grenade')) limited.icon = 'grenade'

          systemSubTraits.push({
            systemIndex: systemIndex,
            name: (action.name || system.flavorName || systemData.name).toLowerCase(),
            activation: action.activation || 'Quick',
            trigger: action.trigger,
            frequency: action.frequency,
            range: action.range,
            selfHeat: selfHeat,
            description: action.detail,
            isDestroyed: system.destroyed,
            isTitleCase: true,
          })
        })
      }
    }

    // system deployables
    addDeployableTraits(systemData.deployables, systemSubTraits, limited, systemIndex)

    // -- post-processing depending on the subtraits ---
    // YO if we only have one action/deployable and nothing to say about it, just use that subcard instead of us
    if (!systemTrait.description && systemSubTraits.length === 1) {
      systemSubTraits[0].isDestructable = !hasTag(systemData, 'tg_indestructible')
      systemSubTraits[0].isDestroyed = system.destroyed
      systemTrait = {...systemTrait, ...systemSubTraits[0]}

    } else {
      // add actions and deployable sub cards
      systemTrait.subTraits = systemSubTraits

      // harvest any action types of the subtraits
      systemTrait.activation = getActivationTypes(systemTrait)
    }

    // tech ATTACKS — they're described down in the attacks section, no need to repeat them here.
    if (grantsTechAttacks) {
      systemTrait.description = grantsInvades ?
        `Gain the following options for Invade: ${systemData.actions.map(action => action.name).join(', ')}`
      :
        `Gain the following tech attacks: ${systemData.actions.map(action => action.name || systemData.name).join(', ')}`
    }

    systemTraits.push(systemTrait)
  })

  return systemTraits
}

// makes subtraits for deployables
function addDeployableTraits(deployables, addToTraits, limited = null, systemIndex = -1) {
  // system deployables
  if (deployables) {
    deployables.forEach((deployable, i) => {
      if (deployable.type === 'Mine' && limited) limited.icon = 'mine'

      let deployableSubTraits = [];
      if (deployable.actions) {
        deployable.actions.forEach(action => {
          deployableSubTraits.push({
            systemIndex: systemIndex,
            name: action.name,
            activation: action.activation || 'Quick',
            trigger: action.trigger,
            range: action.range,
            description: action.detail,
            isTitleCase: true,
          })
        })
      }

      const deployableStatblock = deployable.hp ? {
        edef: deployable.edef || 10,
        evasion: deployable.evasion || 10,
        hp: deployable.hp,
        size: deployable.size || 1
      } : null

      addToTraits.push({
        systemIndex: systemIndex,
        name: deployable.name,
        activation: deployable.activation || 'Deployable',
        trigger: deployable.trigger,
        range: deployable.range,
        description: deployable.detail,
        statblock: deployableStatblock,
        subTraits: deployableSubTraits,
        isTitleCase: true,
      })
    })
  }
}


// Harvest the traits for each pilot talent
function getPilotTraits(pilotTalents, pilotCoreBonuses, perRoundState) {
  let pilotTraits = []

  // TALENTS
  pilotTalents.forEach(pilotTalent => {
    const talentData = findTalentData(pilotTalent.id)
    const perRoundCount = getSystemPerRoundCount(talentData, perRoundState, `${pilotTalent.id}-${pilotTalent.rank}`) // HACK: RANK IS LAST CHAR
    let overallActivation = '';

    let talentRankTraits = [];
    talentData.ranks.forEach((rankData,i) => {
      if (pilotTalent.rank > i) {

        // const rankChars = ['Ⅰ','Ⅱ','Ⅲ']
        const rankChar = "I"
        const talentTrait = {
          name: `${rankChar.repeat(i+1)} — ${rankData.name.toLowerCase()}`,
          description: rankData.description,
          isTitleCase: true,
        }

        // add any sub-actions from this trait
        if (rankData.actions) {
          talentTrait.subTraits = []

          rankData.actions.forEach(action => {
            overallActivation = overallActivation || action.activation
            talentTrait.subTraits.push({
              name: action.name,
              activation: action.activation,
              trigger: action.trigger,
              frequency: action.frequency,
              description: action.detail,
            })
          })
        }

        talentRankTraits.push(talentTrait)
      }
    });

    pilotTraits.push({
      name: `${talentData.name.toLowerCase()} ${pilotTalent.rank}`,
      subTraits: talentRankTraits,
      isTitleCase: true,
      activation: overallActivation,
      perRoundCount: perRoundCount,
    })
  })

  // CORE BONUSES
  pilotCoreBonuses.forEach(coreBonus => {
    const coreBonusData = findCoreBonusData(coreBonus)
    const perRoundCount = getSystemPerRoundCount(coreBonusData, perRoundState, coreBonus)

    const coreBonusTrait = {
      name: coreBonusData.name.toLowerCase(),
      description: coreBonusData.effect,
      perRoundCount: perRoundCount,
      isTitleCase: true,
    }

    // add any sub-actions from this trait
    if (coreBonusData.actions) {
      coreBonusTrait.subTraits = []

      coreBonusData.actions.forEach(action => {
        coreBonusTrait.activation = coreBonusTrait.activation || action.activation
        coreBonusTrait.subTraits.push({
          name: action.name,
          activation: action.activation,
          trigger: action.trigger,
          frequency: action.frequency,
          description: action.detail,
        })
      })
    }

    pilotTraits.push(coreBonusTrait)
  })

  return pilotTraits
}

// return a string of all activation types of a trait and its subs (e.g. "Quick, Full")
function getActivationTypes(trait) {
  if (!trait.subTraits || trait.subTraits.length === 0) return trait.activation || ''

  const activationSet = [
    ...new Set([
      trait.activation,
      ...trait.subTraits.map(subtrait => subtrait.activation)
    ])
  ]
  return activationSet.filter(activation => activation).join(', ')
}

export function getMountsFromLoadout(loadout) {
  let mounts = [];

  // STANDARD MOUNTS
  mounts = loadout.mounts.map((mount, i) =>
    ({...mount, source: 'mounts', index: i})
  )

  // IMPROVED improved_armament
  if (loadout.improved_armament.slots && loadout.improved_armament.slots[0].weapon) {
    let improved_armament = deepCopy(loadout.improved_armament)
    improved_armament.bonus_effects.push('cb_improved_armament')
    improved_armament.source = 'improved_armament'
    improved_armament.index = 0
    mounts.push(improved_armament)
  }

  // SUPERHEAVY superheavy_mounting
  if (loadout.superheavy_mounting && loadout.superheavy_mounting.slots && loadout.superheavy_mounting.slots[0].weapon) {
    let superheavy_mounting = deepCopy(loadout.superheavy_mounting)
    superheavy_mounting.bonus_effects.push('cb_superheavy_mounting')
    superheavy_mounting.source = 'superheavy_mounting'
    superheavy_mounting.index = 0
    mounts.push(superheavy_mounting)
  }

  // give the integrated weapon a bonus_effect and source to make it clear where it came from
  if (loadout.integratedWeapon.slots.length > 0 && loadout.integratedWeapon.slots[0].weapon) {
    let integratedWeapon = deepCopy(loadout.integratedWeapon)
    integratedWeapon.bonus_effects = ['cb_integrated_weapon']
    integratedWeapon.source = 'integratedWeapon'
    integratedWeapon.index = 0
    mounts.push(integratedWeapon)
  }

  // gotta make a dummy mount for integrated mounts
  if (loadout.integratedMounts.length > 0) {
    const integratedMounts =
      loadout.integratedMounts.map((integratedMountWeapon, i) => {
        return {
          mount_type: "Integrated",
          lock: false,
          slots: [ integratedMountWeapon ],
          extra: [],
          bonus_effects: [],
          source: 'integratedMounts',
          index: i
        }
      })
    mounts.push(...integratedMounts)
  }

  return mounts;
}

function getInvadeAndTechAttacks(loadout, pilotTalents, coreSystem) {
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
    talentData.ranks.forEach((rank,i) => {
      if (pilotTalent.rank > i &&  rank.actions) {
        rank.actions.forEach(action => {
          if (['Invade', 'Quick Tech', 'Full Tech'].includes(action.activation)) {
            invades.push(action)
          }
        })
      }
    });
  })

  // CHOMOLUNGMA core system
  if (coreSystem.passive_actions) {
    coreSystem.passive_actions.forEach(action => {
      if (['Invade', 'Quick Tech', 'Full Tech'].includes(action.activation)) {
        invades.push(action)
      }
    })
  }

  invades.push({
    "name": "Fragment Signal",
    "activation": "Invade",
    "detail": "IMPAIR and SLOW a character until the end of their next turn.",
  })

  return invades
}

export default PlayerMechSheet;
