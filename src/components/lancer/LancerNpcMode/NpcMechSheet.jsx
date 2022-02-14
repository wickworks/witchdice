import React from 'react';
import MechSheet from '../MechSheet/MechSheet.jsx';

import {
  getCountersFromPilot,
} from '../MechState/mechStateUtils.js';

import {
  findNpcClassData
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
    maxHP: activeNpc.stats.overshield,
    maxHeat: activeNpc.stats.heatcap,
    maxRepairCap: 0,

    size: activeNpc.stats.size,
    armor: activeNpc.stats.armor,
    evasion: activeNpc.stats.evade,
    moveSpeed: activeNpc.stats.speed,
    eDef: activeNpc.stats.edef,
    saveTarget: activeNpc.stats.save,
    sensorRange: activeNpc.stats.sensor,
    techAttackBonus: activeNpc.stats.systems,

    attackBonus: 0,
    attackBonusRanged: 0,
  }

  const robotInfo = {
    name: activeNpc.name,
    id: activeNpc.id,
    cloud_portrait: activeNpc.cloudImage,
    frameID: activeNpc.class,
    frameSourceIcon: npcClassData.role.toLowerCase(),
    frameSourceText: npcClassData.role,
    frameName: npcClassData.name.toLowerCase(),
  }

  const robotLoadout = {
    // frameTraits: getFrameTraits(frameData.traits, frameData.core_system),
    frameTraits: [],
    // systems: loadout.systems,
    systems: [],
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




export default PlayerMechSheet;
