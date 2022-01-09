
import {
  findTagOnWeapon,
  findTalentData,
} from '../lancerData.js';

function addAccSource(sourceData, name, isAccuracy = true, defaultOn = false) {
  sourceData.push(newAccSource(name, isAccuracy, defaultOn ))
}

function newAccSource(name, isAccuracy = true, defaultOn = false) {
  return ({
    name: name,
    accuracy: isAccuracy,
    default: defaultOn
  })
}

export function getAvailableAccuracySources(activeMech, activePilot, weaponData, invadeData) {
  let sourceData = []

  if (activeMech.conditions.includes('IMPAIRED')) addAccSource(sourceData, 'Impaired', false, true)

  if (weaponData) {
    if (findTagOnWeapon(weaponData, 'tg_accurate'))   addAccSource(sourceData, 'Accurate', true, true)
    if (findTagOnWeapon(weaponData, 'tg_inaccurate')) addAccSource(sourceData, 'Inaccurate', false, true)

    activePilot.talents.forEach(talentAndRank => {
      const rank = talentAndRank.rank;
      const talentData = findTalentData(talentAndRank.id)

      switch (talentAndRank.id) {
        case 't_brawler':
          if (rank >= 1) addAccSource(sourceData, talentData.ranks[0].name)
          break;
        case 't_brutal':
          if (rank >= 3) addAccSource(sourceData, talentData.ranks[2].name)
          break;
        case 't_crack_shot':
          if (rank >= 1) addAccSource(sourceData, talentData.ranks[0].name)
          if (rank >= 2) addAccSource(sourceData, talentData.ranks[1].name, false)
          break;
        case 't_combined_arms':
          if (rank >= 3) addAccSource(sourceData, talentData.ranks[2].name)
          break;
        case 't_duelist':
          if (rank >= 1) addAccSource(sourceData, talentData.ranks[0].name)
          break;
        case 't_gunslinger':
          if (rank >= 1) addAccSource(sourceData, talentData.ranks[0].name)
          break;
        case 't_tactician':
          if (rank >= 1) addAccSource(sourceData, talentData.ranks[0].name)
          if (rank >= 2) addAccSource(sourceData, talentData.ranks[1].name)
          break;
        case 't_vanguard':
          if (rank >= 1) addAccSource(sourceData, talentData.ranks[0].name)
          break;
      }
    });
  }


  if (invadeData) {
    if (activeMech.frame === 'mf_goblin') addAccSource(sourceData, 'Liturgicode', true, true)

    const loadout = activeMech.loadouts[0]
    if (loadout) {
      if (loadout.systems.find(system => system.id === 'ms_scanner_swarm')) addAccSource(sourceData, 'Scanner Swarm')
    }
    // if (activeMech.frame === 'mf_goblin') addAccSource(sourceData, 'Scanner Swarm'))
  }

  return sourceData
}

export function getStartingSources(activeMech, activePilot, weaponData, invadeData) {
  var sources = [];

  const sourceData = getAvailableAccuracySources(activeMech, activePilot, weaponData, invadeData)
  sourceData.forEach(source => {
    if (source.default === true) sources.push(source.name)
  });

  console.log('getStartingSources',sources);

  return sources;
}
