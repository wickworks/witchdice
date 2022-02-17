import React from 'react';
import MechSheet from '../MechSheet/MechSheet.jsx';

import {
  getCountersFromPilot,
} from '../MechState/mechStateUtils.js';

import {
  findNpcClassData,
  findNpcFeatureData,
  findNpcTemplateData,
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
    frameTraits: [],
    // systems: loadout.systems,
    systems: getFeatureTraits(activeNpc.items),
    // mounts: [...getMountsFromLoadout(loadout), modifiedBaselineMount(activePilot, loadout)],
    mounts: [],
    // invades: getInvadeAndTechAttacks(loadout, activePilot.talents),
    invades: [],
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

function getFeatureTraits(items) {
  let featureTraits = []

  items.forEach((item, itemIndex) => {
    const featureData = findNpcFeatureData(item.itemID)

    featureTraits.push({
      systemIndex: itemIndex,
      name: (item.flavorName || featureData.name).toLowerCase(),
      description: [item.flavorName, featureData.effect].filter(str => str).join('<br>'),
      isDestructable: true,
      isDestroyed: item.destroyed,
      isTitleCase: true,
    })
  })

  return featureTraits
}


export default PlayerMechSheet;
