import React from 'react';
import MechSheet from '../MechSheet/MechSheet.jsx';

import { getCountersFromPilot } from '../MechState/mechStateUtils.js';
import { isNpcFeatureTechAttack } from '../MechSheet/MechMount.jsx';
import { getStat } from './npcUtils.js';
import {
  findNpcClassData,
  findNpcFeatureData,
  findNpcTemplateData,
  baselineMount,
} from '../lancerData.js';

const NpcMechSheet = ({
  activeNpc,

  setTriggerRerender,
  triggerRerender,

  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,

  updateNpcState
}) => {
  const npcClassData = findNpcClassData(activeNpc.class)

  // console.log('activeNpc',activeNpc);
  // console.log('npcClassData',npcClassData);

  const robotState = {
    overshield: activeNpc.overshield,
    hp: activeNpc.currentStats.hp,
    heat: activeNpc.currentStats.heatcap,
    burn: activeNpc.burn,
    overcharge: 0,
    coreEnergy: 0,
    repairs: 0,
    structure: activeNpc.currentStats.structure,
    stress: activeNpc.currentStats.stress,

    conditions: activeNpc.conditions,
    counters: getCountersFromPilot(activeNpc),
  }

  const robotStats = {
    maxHP: getStat('hp', activeNpc),
    maxHeat: getStat('heatcap', activeNpc),
    maxRepairCap: 0,

    size: getStat('size', activeNpc),
    armor: getStat('armor', activeNpc),
    evasion: getStat('evade', activeNpc),
    moveSpeed: getStat('speed', activeNpc),
    eDef: getStat('edef', activeNpc),
    saveTarget: getStat('save', activeNpc),
    sensorRange: getStat('sensor', activeNpc),
    techAttackBonus: getStat('systems', activeNpc),

    attackBonus: 0,
    attackBonusRanged: 0,
  }

  const robotInfo = {
    name: activeNpc.name,
    id: activeNpc.id,
    cloud_portrait: activeNpc.cloudImage,
    frameID: activeNpc.class,
    frameSourceIcon: npcClassData.role.toLowerCase(),
    frameSourceText: activeNpc.templates.map(templateID => findNpcTemplateData(templateID).name).join(' '),
    frameName: npcClassData.name.toLowerCase(),
  }

  const robotLoadout = {
    // frameTraits: getFrameTraits(frameData.traits, frameData.core_system),
    frameTraits: getNpcTraits(activeNpc.items),
    // systems: loadout.systems,
    systems: getSystemTraits(activeNpc.items),
    mounts: [...getNpcWeaponAttacks(activeNpc.items), baselineMount],
    invades: getNpcTechAttacks(activeNpc.items),
  }


  // anything the weapon roller setup will need to determine available sources of accuracy/difficulty
  const accuracyAndDamageSourceInputs = {
    frameID: activeNpc.class,
    mechSystems: [],
    pilotTalents: [],
    isImpaired: false,
  }

  // =============== MECH STATE ==================



  return (
    <MechSheet
      robotState={robotState}
      robotStats={robotStats}
      robotInfo={robotInfo}
      robotLoadout={robotLoadout}
      updateMechState={updateNpcState}

      accuracyAndDamageSourceInputs={accuracyAndDamageSourceInputs}

      setPartyLastAttackKey={setPartyLastAttackKey}
      setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
      setRollSummaryData={setRollSummaryData}
    />
  );
}

function getNpcTraits(items) {
  let featureTraits = []

  items.forEach((item, itemIndex) => {
    const featureData = findNpcFeatureData(item.itemID)

    if (featureData.type === 'Trait') {
      featureTraits.push({
        systemIndex: itemIndex,
        name: (item.flavorName || featureData.name).toLowerCase(),
        description: [item.flavorName, featureData.effect].filter(str => str).join('<br>'),
        isDestructable: false,
        isDestroyed: false,
        isTitleCase: true,
      })
    }

  })

  return featureTraits
}

function getSystemTraits(items) {
  let featureTraits = []

  items.forEach((item, itemIndex) => {
    const featureData = findNpcFeatureData(item.itemID)

    if (featureData.type === 'Tech' && !isNpcFeatureTechAttack(featureData)) {
      featureTraits.push({
        systemIndex: itemIndex,
        name: (item.flavorName || featureData.name).toLowerCase(),
        activation: `${item.tech_type || 'Quick'} Tech`,
        description: [item.flavorName, featureData.effect].filter(str => str).join('<br>'),
        isDestructable: true,
        isDestroyed: item.destroyed,
        isTitleCase: true,
      })

    } else if (['System', 'Reaction'].includes(featureData.type)) {
      featureTraits.push({
        systemIndex: itemIndex,
        name: (item.flavorName || featureData.name).toLowerCase(),
        description: [item.flavorName, featureData.effect].filter(str => str).join('<br>'),
        isDestructable: true,
        isDestroyed: item.destroyed,
        isTitleCase: true,
      })
    }
  })

  return featureTraits
}

function getNpcWeaponAttacks(items) {
  let weaponAttacks = []

  items.forEach((item, itemIndex) => {
    const featureData = findNpcFeatureData(item.itemID)

    if (featureData.type === 'Weapon') {
      const attackBonus = featureData.attack_bonus ? featureData.attack_bonus[item.tier-1] : 0
      const accuracyBonus = featureData.accuracy ? featureData.accuracy[item.tier-1] : 0

      // make a fascimile of player mounts
      weaponAttacks.push({
        mount_type: featureData.weapon_type,
        lock: false,
        slots: [
          {
             size: featureData.weapon_type,
             weapon: {
                id: item.itemID,
                destroyed: item.destroyed,
                cascading: false,
                loaded: true,
                note: item.description,
                mod: null,
                customDamageType: null,
                maxUseOverride: 0,
                uses: 0,
                selectedProfile: 0,

                npcTier: item.tier,
                npcAttackBonus: attackBonus,
                npcAccuracyBonus: accuracyBonus,
             }
          }
        ],
        extra: [],
        bonus_effects: [],
        source: 'npcItems'
      })
    }

  })

  return weaponAttacks
}

function getNpcTechAttacks(items) {
  let techAttacks = []

  items.forEach((item, itemIndex) => {
    const featureData = findNpcFeatureData(item.itemID)

    if (featureData.type === 'Tech' && isNpcFeatureTechAttack(featureData)) {
      // const effectWithoutFirstSentence = featureData.effect.slice(featureData.effect.indexOf('.') + 1)
      techAttacks.push({
        "name": featureData.name,
        "activation": "Invade",
        "detail": featureData.effect,
      })
    }

  })

  techAttacks.push({
    "name": "Fragment Signal",
    "activation": "Invade",
    "detail": "Target character takes 2 Heat and is Impaired until the end of their next turn.",
  })

  return techAttacks
}

export default NpcMechSheet;