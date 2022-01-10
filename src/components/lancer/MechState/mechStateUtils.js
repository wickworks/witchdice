// import {
//   getRandomInt,
//   deepCopy
// } from '../../../utils.js';

import {
  getGrit,
  findSystemData,
  findCoreBonusData,
} from '../lancerData.js';


export function getMechMaxHP(activeMech, activePilot, frameData) {
  var total = frameData.stats.hp

  total += getGrit(activePilot)

  const hull = activePilot.mechSkills[0]
  total += hull * 2

  total += getBonusFromSystems('hp', activeMech.loadouts[0])
  total += getBonusFromCoreBonuses('hp', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechMaxHeatCap(activeMech, activePilot, frameData) {
  var total = frameData.stats.heatcap

  const engi = activePilot.mechSkills[3]
  total += engi

  // total += getBonusFromSystems('heatcap', activeMech.loadouts[0])
  total += getBonusFromCoreBonuses('heatcap', activePilot.core_bonuses)

  return parseInt(total);
}


export function getMechMoveSpeed(activeMech, activePilot, frameData) {
  var total = frameData.stats.speed

  const agi = activePilot.mechSkills[1]
  total += Math.floor(agi * .5)

  // total += getBonusFromSystems('speed', activeMech.loadouts[0])
  // total += getBonusFromCoreBonuses('speed', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechEvasion(activeMech, activePilot, frameData) {
  var total = frameData.stats.evasion

  const agi = activePilot.mechSkills[1]
  total += agi

  // total += getBonusFromSystems('evasion', activeMech.loadouts[0])
  total += getBonusFromCoreBonuses('evasion', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechEDef(activeMech, activePilot, frameData) {
  var total = frameData.stats.edef

  const sys = activePilot.mechSkills[2]
  total += sys

  // total += getBonusFromSystems('edef', activeMech.loadouts[0])
  total += getBonusFromCoreBonuses('edef', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechSaveTarget(activeMech, activePilot, frameData) {
  var total = frameData.stats.save

  total += getGrit(activePilot)

  // total += getBonusFromSystems('save', activeMech.loadouts[0])
  total += getBonusFromCoreBonuses('save', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechMaxRepairCap(activeMech, activePilot, frameData) {
  var total = frameData.stats.repcap

  const hull = activePilot.mechSkills[0]
  total += Math.floor(hull * .5)

  // total += getBonusFromSystems('repcap', activeMech.loadouts[0])
  // total += getBonusFromCoreBonuses('repcap', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechTechAttack(activeMech, activePilot, frameData) {
  var total = frameData.stats.tech_attack

  const sys = activePilot.mechSkills[2]
  total += sys

  // total += getBonusFromSystems('sp', activeMech.loadouts[0])
  // total += getBonusFromCoreBonuses('sp', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechSP(activeMech, activePilot, frameData) {
  var total = frameData.stats.sp

  total += getGrit(activePilot)

  const sys = activePilot.mechSkills[2]
  total += Math.floor(sys * .5)

  // total += getBonusFromSystems('sp', activeMech.loadouts[0])
  // total += getBonusFromCoreBonuses('sp', activePilot.core_bonuses)

  return parseInt(total);
}


// look for systems that increase some stat
function getBonusFromSystems(bonusType, loadout) {
  var systemTotal = 0

  loadout.systems.forEach(system => {
    const systemBonuses = findSystemData(system.id).bonuses;
    if (systemBonuses && !system.destroyed) {
      systemBonuses.forEach(bonus => {
        if (bonus.id === bonusType) systemTotal += bonus.val
      })
    }
  })

  return systemTotal
}

// look for core bonuses that increase some stat
function getBonusFromCoreBonuses(bonusType, coreBonusIDs) {
  var coreTotal = 0

  coreBonusIDs.forEach(coreBonusID => {
    const coreBonusBonuses = findCoreBonusData(coreBonusID).bonuses;
    if (coreBonusBonuses) {
      coreBonusBonuses.forEach(bonusBonus => {
        if (bonusBonus.id === bonusType) coreTotal += bonusBonus.val
      })
    }
  })

  return coreTotal
}

// convert the custom counters stored in pilots (custom_counters and counter_data) into a single array of objects
export function getCountersFromPilot(pilotData) {
  let counters = [];

  if (pilotData.custom_counters && pilotData.counter_data) {
    pilotData.custom_counters.forEach(counter =>
      counters.push({
        name: counter.name,
        id: counter.id
      })
    )
    pilotData.counter_data.forEach(counterData => {
      const matchingCounter = counters.find(counter => counter.id === counterData.id);
      if (matchingCounter) matchingCounter.val = counterData.val;
    })
  }

  return counters
}
