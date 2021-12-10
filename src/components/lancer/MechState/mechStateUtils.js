// import {
//   getRandomInt,
//   deepCopy
// } from '../../../utils.js';

import {
  OVERCHARGE_SEQUENCE,
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

  total += getBonusFromSystems('heatcap', activeMech.loadouts[0])
  total += getBonusFromCoreBonuses('heatcap', activePilot.core_bonuses)

  return parseInt(total);
}


export function getMechMoveSpeed(activeMech, activePilot, frameData) {
  var total = frameData.stats.speed

  const agi = activePilot.mechSkills[1]
  total += Math.floor(agi * .5)

  total += getBonusFromSystems('speed', activeMech.loadouts[0])
  total += getBonusFromCoreBonuses('speed', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechEvasion(activeMech, activePilot, frameData) {
  var total = frameData.stats.evasion

  const agi = activePilot.mechSkills[1]
  total += agi

  total += getBonusFromSystems('evasion', activeMech.loadouts[0])
  total += getBonusFromCoreBonuses('evasion', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechEDef(activeMech, activePilot, frameData) {
  var total = frameData.stats.edef

  const sys = activePilot.mechSkills[2]
  total += sys

  total += getBonusFromSystems('edef', activeMech.loadouts[0])
  total += getBonusFromCoreBonuses('edef', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechSaveTarget(activeMech, activePilot, frameData) {
  var total = frameData.stats.save

  total += getBonusFromSystems('save', activeMech.loadouts[0])
  total += getBonusFromCoreBonuses('save', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechMaxRepairCap(activeMech, activePilot, frameData) {
  var total = frameData.stats.repcap

  const hull = activePilot.mechSkills[0]
  total += Math.floor(hull * .5)

  total += getBonusFromSystems('repcap', activeMech.loadouts[0])
  total += getBonusFromCoreBonuses('repcap', activePilot.core_bonuses)

  return parseInt(total);
}


// look for systems that increase some stat
function getBonusFromSystems(bonusType, loadout) {
  var systemTotal = 0

  loadout.systems.forEach(system => {
    const systemBonuses = findSystemData(system.id).bonuses;
    if (systemBonuses) {
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





export const tickOvercharge = (currentOverchargeDie, direction) => {
  var index = OVERCHARGE_SEQUENCE.indexOf(String(currentOverchargeDie))
  index += direction
  index = Math.max(Math.min(index, OVERCHARGE_SEQUENCE.length-1), 0);
  return OVERCHARGE_SEQUENCE[index]
}
