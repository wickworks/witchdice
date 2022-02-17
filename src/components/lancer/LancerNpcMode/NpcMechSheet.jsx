import React from 'react';
import MechSheet from '../MechSheet/MechSheet.jsx';

import { getCountersFromPilot } from '../MechState/mechStateUtils.js';
import { isNpcFeatureTechAttack } from '../MechSheet/MechMount.jsx';
import {
  findNpcClassData,
  findNpcFeatureData,
  findNpcTemplateData,
  baselineMount,
} from '../lancerData.js';

const PlayerMechSheet = ({
  activeNpc,

  setTriggerRerender,
  triggerRerender,

  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
}) => {
  console.log('activeNpc',activeNpc);

  const npcClassData = findNpcClassData(activeNpc.class)

  console.log('npcClassData',npcClassData);

  function getStat(key) {
    let stat = activeNpc.stats[key]
    if (activeNpc.stats.overrides && activeNpc.stats.overrides[key] > 0) {
      stat = activeNpc.stats.overrides[key]
    } else if (activeNpc.stats.bonuses) {
      stat += activeNpc.stats.bonuses[key] || 0
    }
    return stat
  }

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
    maxHP: getStat('hp'),
    maxHeat: getStat('heatcap'),
    maxRepairCap: 0,

    size: getStat('size'),
    armor: getStat('armor'),
    evasion: getStat('evade'),
    moveSpeed: getStat('speed'),
    eDef: getStat('edef'),
    saveTarget: getStat('save'),
    sensorRange: getStat('sensor'),
    techAttackBonus: getStat('systems'),

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

  const updateMechState = (newMechData) => {

  }



  return (
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
        isDestructable: true,
        isDestroyed: item.destroyed,
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

      // make a fascimile of player mounts
      weaponAttacks.push({
        mount_type: featureData.weapon_type,
        lock: false,
        slots: [
          {
             size: featureData.weapon_type,
             weapon: {
                id: item.itemID,
                destroyed: false,
                cascading: false,
                loaded: true,
                note: item.description,
                mod: null,
                customDamageType: null,
                maxUseOverride: 0,
                uses: 0,
                selectedProfile: 0
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

export default PlayerMechSheet;
