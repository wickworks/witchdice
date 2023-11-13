// import {
//   getRandomInt,
//   deepCopy
// } from '../../../utils.js';

import {
  getGrit,
  findSystemData,
  findCoreBonusData,
  findTalentData,
} from '../lancerData.js';

import {
  getSynergiesFor,
  getSynergiesForAll,
} from '../WeaponRoller/synergyUtils.js';


export function getMechMaxHP(activeMech, activePilot, frameData) {
  var total = frameData.stats.hp

  if (activeMech.frame != 'mf_emperor') {
    total += getGrit(activePilot)
  }

  const hull = activePilot.mechSkills[0]
  total += hull * 2

  total += getValueFromSystems('hp', activeMech.loadouts[0])
  total += getValueFromCoreBonuses('hp', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechMaxHeatCap(activeMech, activePilot, frameData) {
  var total = frameData.stats.heatcap

  const engi = activePilot.mechSkills[3]
  total += engi

  // total += getValueFromSystems('heatcap', activeMech.loadouts[0])
  total += getValueFromCoreBonuses('heatcap', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechMoveSpeed(activeMech, activePilot, frameData) {
  var total = frameData.stats.speed

  const agi = activePilot.mechSkills[1]
  total += Math.floor(agi * .5)

  // total += getValueFromSystems('speed', activeMech.loadouts[0])
  // total += getValueFromCoreBonuses('speed', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechEvasion(activeMech, activePilot, frameData) {
  var total = frameData.stats.evasion

  const agi = activePilot.mechSkills[1]
  total += agi

  // total += getValueFromSystems('evasion', activeMech.loadouts[0])
  total += getValueFromCoreBonuses('evasion', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechEDef(activeMech, activePilot, frameData) {
  var total = frameData.stats.edef

  const sys = activePilot.mechSkills[2]
  total += sys

  // total += getValueFromSystems('edef', activeMech.loadouts[0])
  total += getValueFromCoreBonuses('edef', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechSaveTarget(activeMech, activePilot, frameData) {
  var total = frameData.stats.save

  total += getGrit(activePilot)

  // total += getValueFromSystems('save', activeMech.loadouts[0])
  total += getValueFromCoreBonuses('save', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechMaxRepairCap(activeMech, activePilot, frameData) {
  var total = frameData.stats.repcap

  const hull = activePilot.mechSkills[0]
  total += Math.floor(hull * .5)

  // total += getValueFromSystems('repcap', activeMech.loadouts[0])
  // total += getValueFromCoreBonuses('repcap', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechTechAttack(activeMech, activePilot, frameData) {
  var total = frameData.stats.tech_attack

  const sys = activePilot.mechSkills[2]
  total += sys

  // total += getValueFromSystems('sp', activeMech.loadouts[0])
  // total += getValueFromCoreBonuses('sp', activePilot.core_bonuses)

  return parseInt(total);
}

export function getRangeSynergies(activeMech, activePilot, frameData) {
  var bonuses = []

  bonuses.push(...getBonusesFromSystems('range', activeMech.loadouts[0]))
  bonuses.push(...getBonusesFromCoreBonuses('range', activePilot.core_bonuses))

  return bonuses;
}

export function getMechSP(activeMech, activePilot, frameData) {
  var total = frameData.stats.sp

  total += getGrit(activePilot)

  const sys = activePilot.mechSkills[2]
  total += Math.floor(sys * .5)

  // total += getValueFromSystems('sp', activeMech.loadouts[0])
  // total += getValueFromCoreBonuses('sp', activePilot.core_bonuses)

  return parseInt(total);
}

export function getMechArmor(activeMech, activePilot, frameData) {
  var total = frameData.stats.armor

  // total += getValueFromSystems('save', activeMech.loadouts[0])
  total += getValueFromCoreBonuses('armor', activePilot.core_bonuses)

  return parseInt(total);
}

export function getLimitedBonus(activeMech, activePilot, frameData) {
  var total = 0

  const engi = activePilot.mechSkills[3]
  total += Math.floor(engi * .5)

  // total += getValueFromSystems('limited', activeMech.loadouts[0])
  total += parseInt(getValueFromCoreBonuses('limited_bonus', activePilot.core_bonuses))

  return parseInt(total);
}

// look for systems that increase some stat
function getValueFromSystems(bonusType, loadout) {
  return getBonusesFromSystems(bonusType, loadout).reduce(
    (previousValue, bonus) => previousValue + parseInt(bonus.val),
    0
  )
}

function getBonusesFromSystems(bonusType, loadout) {
  var bonuses = []

  loadout.systems.forEach(system => {
    const systemBonuses = findSystemData(system.id).bonuses;
    if (systemBonuses && !system.destroyed) {
      bonuses.push(
        ...systemBonuses.filter(bonus => bonus.id === bonusType)
      )
    }
  })

  return bonuses
}

// look for core bonuses that increase some stat
function getValueFromCoreBonuses(bonusType, coreBonusIDs) {
  return getBonusesFromCoreBonuses(bonusType, coreBonusIDs).reduce(
    (previousValue, bonus) => previousValue + parseInt(bonus.val),
    0
  )
}

function getBonusesFromCoreBonuses(bonusType, coreBonusIDs) {
  var bonuses = []

  coreBonusIDs.forEach(coreBonusID => {
    const coreBonusBonuses = findCoreBonusData(coreBonusID).bonuses;
    if (coreBonusBonuses) {
      bonuses.push(
        ...coreBonusBonuses.filter(bonusBonus => bonusBonus.id === bonusType)
      )
    }
  })

  return bonuses
}

export function getSkillCheckAccuracy(skill, activeMech, activePilot, frameData) {

  let synergies = []

  // Frame trait synergies
  frameData.traits.forEach(trait =>
    synergies.push(...getSynergiesForAll(['skill_check', skill], trait.synergies))
  )

  // Pilot talent synergies
  activePilot.talents.forEach(talent => {
    const talentData = findTalentData(talent.id)
    talentData.ranks.forEach(rank =>
      synergies.push(...getSynergiesForAll(['skill_check', skill], rank.synergies))
    )
  })

  // Core bonus synergies (for some reason don't use 'skill_check' as a location)
  activePilot.core_bonuses.forEach(coreBonus => {
    const coreBonusData = findCoreBonusData(coreBonus)
    synergies.push(...getSynergiesFor(skill, coreBonusData.synergies))
  })


  // Loadout synergies
  // ??? Stable structure, I guess?

  // console.log('skill synergies ', skill, synergies);

  let accuracy = 0
  synergies.forEach(synergy => {
    if (synergy.detail && synergy.detail.toLowerCase().includes('difficulty')) {
      accuracy -= 1
    } else {
      accuracy += 1
    }
  })
  return accuracy;
}

// Convert the custom counters stored in pilots (custom_counters and counter_data)
// into a single array of objects.
// This - ALSO - works for NPCs because they thankfully have the same keys.
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
