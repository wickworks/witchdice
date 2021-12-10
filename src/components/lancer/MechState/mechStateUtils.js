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
  // start with frame base stat
  var total = parseInt(frameData.stats.hp)

  // add pilot grit
  total += getGrit(activePilot)

  // add pilot skill
  const hase = activePilot.mechSkills
  const hull = hase[0]
  total += hull * 2

  // add stuff from systems i.e. personalizations
  const loadout = activeMech.loadouts[0]
  loadout.systems.forEach(system => {
    const systemBonuses = findSystemData(system.id).bonuses;
    if (systemBonuses) {
      systemBonuses.forEach(bonus => {
        if (bonus.id === 'hp') total += bonus.val
      })
    }
  })

  // add stuff from core bonuses i.e. that one IPSN one
  activePilot.core_bonuses.forEach(coreBonusID => {
    const coreBonusBonuses = findCoreBonusData(coreBonusID).bonuses;
    if (coreBonusBonuses) {
      coreBonusBonuses.forEach(bonusBonus => {
        if (bonusBonus.id === 'hp') total += bonusBonus.val
      })
    }
  })

  return total;
}

export function getMechMaxHeatCap(activeMech, activePilot, frameData) {

  return parseInt(frameData.stats.heatcap);
}


export const tickOvercharge = (currentOverchargeDie, direction) => {
  var index = OVERCHARGE_SEQUENCE.indexOf(String(currentOverchargeDie))
  index += direction
  index = Math.max(Math.min(index, OVERCHARGE_SEQUENCE.length-1), 0);
  return OVERCHARGE_SEQUENCE[index]
}
