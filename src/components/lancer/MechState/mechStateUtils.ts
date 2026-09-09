import {
  getGrit,
  findSystemData,
  findCoreBonusData,
  findTalentData,
} from '../lancerData';

import {
  getSynergiesFor,
  getSynergiesForAll,
} from '../WeaponRoller/synergyUtils';

import type { Mech, Pilot, Loadout, Counter } from '../types';

export function getMechMaxHP(activeMech: Mech, activePilot: Pilot, frameData: any) {
  var total = frameData.stats.hp

  if (activeMech.frame != 'mf_emperor') {
    total += getGrit(activePilot)
  }

  const hull = activePilot.mechSkills[0]
  total += hull * 2

  total += getValueFromSystems('hp', activeMech.loadouts[0])
  total += getValueFromCoreBonuses('hp', activePilot.core_bonuses)

  return parseInt(String(total));
}

export function getMechMaxHeatCap(activeMech: Mech, activePilot: Pilot, frameData: any) {
  var total = frameData.stats.heatcap

  const engi = activePilot.mechSkills[3]
  total += engi

  total += getValueFromCoreBonuses('heatcap', activePilot.core_bonuses)

  return parseInt(String(total));
}

export function getMechMoveSpeed(activeMech: Mech, activePilot: Pilot, frameData: any) {
  var total = frameData.stats.speed

  const agi = activePilot.mechSkills[1]
  total += Math.floor(agi * .5)

  return parseInt(String(total));
}

export function getMechEvasion(activeMech: Mech, activePilot: Pilot, frameData: any) {
  var total = frameData.stats.evasion

  const agi = activePilot.mechSkills[1]
  total += agi

  total += getValueFromCoreBonuses('evasion', activePilot.core_bonuses)

  return parseInt(String(total));
}

export function getMechEDef(activeMech: Mech, activePilot: Pilot, frameData: any) {
  var total = frameData.stats.edef

  const sys = activePilot.mechSkills[2]
  total += sys

  total += getValueFromCoreBonuses('edef', activePilot.core_bonuses)

  return parseInt(String(total));
}

export function getMechSaveTarget(activeMech: Mech, activePilot: Pilot, frameData: any) {
  var total = frameData.stats.save

  total += getGrit(activePilot)

  total += getValueFromCoreBonuses('save', activePilot.core_bonuses)

  return parseInt(String(total));
}

export function getMechMaxRepairCap(activeMech: Mech, activePilot: Pilot, frameData: any) {
  var total = frameData.stats.repcap

  const hull = activePilot.mechSkills[0]
  total += Math.floor(hull * .5)

  return parseInt(String(total));
}

export function getMechTechAttack(activeMech: Mech, activePilot: Pilot, frameData: any) {
  var total = frameData.stats.tech_attack

  const sys = activePilot.mechSkills[2]
  total += sys

  return parseInt(String(total));
}

export function getRangeSynergies(activeMech: Mech, activePilot: Pilot, frameData: any) {
  var bonuses: any[] = []

  bonuses.push(...getBonusesFromSystems('range', activeMech.loadouts[0]))
  bonuses.push(...getBonusesFromCoreBonuses('range', activePilot.core_bonuses))

  return bonuses;
}

export function getMechSP(activeMech: Mech, activePilot: Pilot, frameData: any) {
  var total = frameData.stats.sp

  total += getGrit(activePilot)

  const sys = activePilot.mechSkills[2]
  total += Math.floor(sys * .5)

  return parseInt(String(total));
}

export function getMechArmor(activeMech: Mech, activePilot: Pilot, frameData: any) {
  var total = frameData.stats.armor

  total += getValueFromCoreBonuses('armor', activePilot.core_bonuses)

  return parseInt(String(total));
}

export function getLimitedBonus(activeMech: Mech, activePilot: Pilot, frameData: any) {
  var total = 0

  const engi = activePilot.mechSkills[3]
  total += Math.floor(engi * .5)

  total += parseInt(String(getValueFromCoreBonuses('limited_bonus', activePilot.core_bonuses)))

  return parseInt(String(total));
}

function getValueFromSystems(bonusType: string, loadout: Loadout) {
  return getBonusesFromSystems(bonusType, loadout).reduce(
    (previousValue, bonus) => previousValue + parseInt(bonus.val),
    0
  )
}

function getBonusesFromSystems(bonusType: string, loadout: Loadout) {
  var bonuses: any[] = []

  loadout.systems.forEach(system => {
    const systemBonuses = findSystemData(system.id).bonuses;
    if (systemBonuses && !system.destroyed) {
      bonuses.push(
        ...systemBonuses.filter((bonus: any) => bonus.id === bonusType)
      )
    }
  })

  return bonuses
}

function getValueFromCoreBonuses(bonusType: string, coreBonusIDs: string[]) {
  return getBonusesFromCoreBonuses(bonusType, coreBonusIDs).reduce(
    (previousValue, bonus) => previousValue + parseInt(bonus.val),
    0
  )
}

function getBonusesFromCoreBonuses(bonusType: string, coreBonusIDs: string[]) {
  var bonuses: any[] = []

  coreBonusIDs.forEach(coreBonusID => {
    const coreBonusBonuses = findCoreBonusData(coreBonusID).bonuses;
    if (coreBonusBonuses) {
      bonuses.push(
        ...coreBonusBonuses.filter((bonusBonus: any) => bonusBonus.id === bonusType)
      )
    }
  })

  return bonuses
}

export function getSkillCheckAccuracy(skill: string, activeMech: Mech, activePilot: Pilot, frameData: any) {

  let synergies: any[] = []

  frameData.traits.forEach((trait: any) =>
    synergies.push(...getSynergiesForAll(['skill_check', skill], trait.synergies))
  )

  activePilot.talents.forEach(talent => {
    const talentData = findTalentData(talent.id)
    talentData.ranks.forEach((rank: any) =>
      synergies.push(...getSynergiesForAll(['skill_check', skill], rank.synergies))
    )
  })

  activePilot.core_bonuses.forEach(coreBonus => {
    const coreBonusData = findCoreBonusData(coreBonus)
    synergies.push(...getSynergiesFor(skill, coreBonusData.synergies))
  })

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

export function getCountersFromPilot(pilotData: Pilot) {
  let counters: Counter[] = [];

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
