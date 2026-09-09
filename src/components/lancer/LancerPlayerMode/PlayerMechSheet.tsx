import React from 'react';
import MechSheet from '../MechSheet/MechSheet';
import FullRepairButton from './FullRepairButton/FullRepairButton';

import {
  isSystemTechAttack,
} from '../MechSheet/MechMount';

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
} from '../MechState/mechStateUtils';

import {
  getToHitBonusFromMech,
} from '../WeaponRoller/bonusDamageSourceUtils';

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
} from '../lancerData';

import { applyUpdatesToPlayer } from './playerUtils';

import { deepCopy } from '../../../utils';
import {
  savePilotData,
} from '../lancerLocalStorage';

import type { Mech, Pilot } from '../types';


const PlayerMechSheet = ({
  activePilot,
  activeMech,

  setTriggerRerender,
  triggerRerender,

  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
  setDistantDicebagData,
}: {
  activePilot: Pilot,
  activeMech: Mech,
  setTriggerRerender: (value: boolean) => void,
  triggerRerender: boolean,
  setPartyLastAttackKey: (key: any) => void,
  setPartyLastAttackTimestamp: (timestamp: any) => void,
  setRollSummaryData: (data: any) => void,
  setDistantDicebagData: (data: any) => void,
}) => {

  const frameData = findFrameData(activeMech.frame);
  const loadout = activeMech.loadouts[0];

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


  const accuracyAndDamageSourceInputs = {
    frameID: activeMech.frame,
    mechSystems: loadout.systems,
    npcFeatures: [],
    pilotTalents: activePilot.talents,
    isImpaired: activeMech.conditions?.includes('IMPAIRED'),
    currentHeat: robotState.heat,
  }

  const updateMechState = (mechUpdate: Record<string, any>) => {
    const newPilotData = deepCopy(activePilot);
    const mechIndex = activePilot.mechs.findIndex(mech => mech.id === activeMech.id)

    if (mechIndex >= 0) {
      const newMechData = newPilotData.mechs[mechIndex]
      applyUpdatesToPlayer(mechUpdate, newPilotData, newMechData)

      savePilotData(newPilotData)

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



function getFrameTraits(traitList: any, coreSystem: any, perRoundState: any) {
  let frameTraits: any[] = []

  let activeTrait: any = {
    name: coreSystem.active_name,
    activation: `Active (1 CP), ${coreSystem.activation}`,
    description: coreSystem.active_effect,
    isCP: true,
  }
  if (coreSystem.active_actions) {
    activeTrait.subTraits = []
    coreSystem.active_actions.forEach((activeAction: any) => {
      activeTrait.subTraits.push({
        name: activeAction.name,
        activation: activeAction.activation,
        trigger: activeAction.trigger,
        description: activeAction.detail,
      })
    })

    if (!activeTrait.description && activeTrait.subTraits.length === 1) {
      activeTrait = {...activeTrait.subTraits[0]}
      activeTrait.subTraits = []
    }
  }
  frameTraits.push(activeTrait)

  if (coreSystem.passive_effect || coreSystem.passive_actions) {
    let passiveTrait: any = {
      name: coreSystem.passive_name,
      description: coreSystem.passive_effect,
      isCP: true,
    }
    if (coreSystem.passive_actions) {
      passiveTrait.subTraits = []
      coreSystem.passive_actions.forEach((passiveAction: any) => {
        passiveTrait.subTraits.push({
          name: passiveAction.name,
          activation: passiveAction.activation,
          trigger: passiveAction.trigger,
          description: passiveAction.detail,
        })
      })
    }
    if (!passiveTrait.description && passiveTrait.subTraits.length === 1) {
      passiveTrait = {...passiveTrait.subTraits[0]}
      passiveTrait.subTraits = []
    }
    passiveTrait.activation = getActivationTypes(passiveTrait)
    frameTraits.push(passiveTrait)
  }

  addDeployableTraits(coreSystem.deployables, frameTraits)

  traitList.forEach((trait: any) => {
    let traitTrait: any = {
      name: trait.name.toLowerCase(),
      isTitleCase: true,
      description: trait.description,
      perRoundCount: getSystemPerRoundCount(trait, perRoundState, trait.name.toLowerCase().replace(' ','-'))
    }
    if (trait.actions) {
      traitTrait.subTraits = []
      trait.actions.forEach((traitAction: any) =>
        traitTrait.subTraits.push({
          name: traitAction.name,
          activation: traitAction.activation,
          trigger: traitAction.trigger,
          frequency: traitAction.frequency,
          description: traitAction.detail,
        })
      )
    }
    if (!traitTrait.description && traitTrait.subTraits.length === 1) {
      traitTrait = {...traitTrait.subTraits[0]}
      traitTrait.subTraits = []
    }
    traitTrait.activation = getActivationTypes(traitTrait)
    frameTraits.push(traitTrait)
  })

  return frameTraits
}


function getSystemTraits(systems: any, limitedBonus: any, perRoundState: any) {
  let systemTraits: any[] = []

  systems.forEach((system: any, systemIndex: number) => {
    const systemData = findSystemData(system.id)
    const grantsTechAttacks = isSystemTechAttack(systemData)
    const grantsInvades = isSystemTechAttack(systemData, true)
    const selfHeat = getSelfHeat(systemData)
    const recharge = getSystemRecharge(system, systemData)
    const limited = getSystemLimited(system, systemData, limitedBonus)
    const perRoundCount = getSystemPerRoundCount(systemData, perRoundState, `${system.id}-${systemIndex}`)

    let systemTrait: any = {
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
    let systemSubTraits: any[] = []

    if (systemData.actions) {
      if (!grantsTechAttacks) {
        systemData.actions.forEach((action: any, i: number) => {
          if (action.name && action.name.includes('Grenade') && limited) limited.icon = 'grenade'

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

    addDeployableTraits(systemData.deployables, systemSubTraits, limited, systemIndex)

    if (!systemTrait.description && systemSubTraits.length === 1) {
      systemSubTraits[0].isDestructable = !hasTag(systemData, 'tg_indestructible')
      systemSubTraits[0].isDestroyed = system.destroyed
      systemTrait = {...systemTrait, ...systemSubTraits[0]}

    } else {
      systemTrait.subTraits = systemSubTraits

      systemTrait.activation = getActivationTypes(systemTrait)
    }

    if (grantsTechAttacks) {
      systemTrait.description = grantsInvades ?
        `Gain the following options for Invade: ${systemData.actions.map((action: any) => action.name).join(', ')}`
      :
        `Gain the following tech attacks: ${systemData.actions.map((action: any) => action.name || systemData.name).join(', ')}`
    }

    systemTraits.push(systemTrait)
  })

  return systemTraits
}

function addDeployableTraits(deployables: any, addToTraits: any, limited: any = null, systemIndex = -1) {
  if (deployables) {
    deployables.forEach((deployable: any, i: number) => {
      if (deployable.type === 'Mine' && limited) limited.icon = 'mine'

      let deployableSubTraits: any[] = [];
      if (deployable.actions) {
        deployable.actions.forEach((action: any) => {
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


function getPilotTraits(pilotTalents: any, pilotCoreBonuses: any, perRoundState: any) {
  let pilotTraits: any[] = []

  pilotTalents.forEach((pilotTalent: any) => {
    const talentData = findTalentData(pilotTalent.id)
    const perRoundCount = getSystemPerRoundCount(talentData, perRoundState, `${pilotTalent.id}-${pilotTalent.rank}`)
    let overallActivation = '';

    let talentRankTraits: any[] = [];
    talentData.ranks.forEach((rankData: any, i: number) => {
      if (pilotTalent.rank > i) {

        const rankChar = "I"
        const talentTrait: any = {
          name: `${rankChar.repeat(i+1)} — ${rankData.name.toLowerCase()}`,
          description: rankData.description,
          isTitleCase: true,
        }

        if (rankData.actions) {
          talentTrait.subTraits = []

          rankData.actions.forEach((action: any) => {
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

  pilotCoreBonuses.forEach((coreBonus: any) => {
    const coreBonusData = findCoreBonusData(coreBonus)
    const perRoundCount = getSystemPerRoundCount(coreBonusData, perRoundState, coreBonus)

    const coreBonusTrait: any = {
      name: coreBonusData.name.toLowerCase(),
      description: coreBonusData.effect,
      perRoundCount: perRoundCount,
      isTitleCase: true,
    }

    if (coreBonusData.actions) {
      coreBonusTrait.subTraits = []

      coreBonusData.actions.forEach((action: any) => {
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

function getActivationTypes(trait: any) {
  if (!trait.subTraits || trait.subTraits.length === 0) return trait.activation || ''

  const activationSet = [
    ...new Set([
      trait.activation,
      ...trait.subTraits.map((subtrait: any) => subtrait.activation)
    ])
  ]
  return activationSet.filter(activation => activation).join(', ')
}

export function getMountsFromLoadout(loadout: any) {
  let mounts: any[] = [];

  mounts = loadout.mounts.map((mount: any, i: number) =>
    ({...mount, source: 'mounts', index: i})
  )

  if (loadout.improved_armament.slots && loadout.improved_armament.slots[0].weapon) {
    let improved_armament = deepCopy(loadout.improved_armament)
    improved_armament.bonus_effects.push('cb_improved_armament')
    improved_armament.source = 'improved_armament'
    improved_armament.index = 0
    mounts.push(improved_armament)
  }

  if (loadout.superheavy_mounting && loadout.superheavy_mounting.slots && loadout.superheavy_mounting.slots[0].weapon) {
    let superheavy_mounting = deepCopy(loadout.superheavy_mounting)
    superheavy_mounting.bonus_effects.push('cb_superheavy_mounting')
    superheavy_mounting.source = 'superheavy_mounting'
    superheavy_mounting.index = 0
    mounts.push(superheavy_mounting)
  }

  if (loadout.integratedWeapon.slots.length > 0 && loadout.integratedWeapon.slots[0].weapon) {
    let integratedWeapon = deepCopy(loadout.integratedWeapon)
    integratedWeapon.bonus_effects = ['cb_integrated_weapon']
    integratedWeapon.source = 'integratedWeapon'
    integratedWeapon.index = 0
    mounts.push(integratedWeapon)
  }

  if (loadout.integratedMounts.length > 0) {
    const integratedMounts =
      loadout.integratedMounts.map((integratedMountWeapon: any, i: number) => {
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

function getInvadeAndTechAttacks(loadout: any, pilotTalents: any, coreSystem: any) {
  let invades: any[] = [];

  loadout.systems.forEach((system: any) => {
    const systemData = findSystemData(system.id)
    if (!system.destroyed && isSystemTechAttack(systemData, false)) {
      const techAttacks = systemData.actions.map((action: any) => {
        return {...action, name: (action.name || systemData.name)}
      })
      invades.push(...techAttacks)
    }
  })

  pilotTalents.forEach((pilotTalent: any) => {
    const talentData = findTalentData(pilotTalent.id)
    talentData.ranks.forEach((rank: any, i: number) => {
      if (pilotTalent.rank > i &&  rank.actions) {
        rank.actions.forEach((action: any) => {
          if (['Invade', 'Quick Tech', 'Full Tech'].includes(action.activation)) {
            invades.push(action)
          }
        })
      }
    });
  })

  if (coreSystem.passive_actions) {
    coreSystem.passive_actions.forEach((action: any) => {
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
