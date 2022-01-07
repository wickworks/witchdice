
import {
  findTagOnWeapon,
} from '../lancerData.js';

function newAccSource(name, isAccuracy, defaultOn ) {
  return ({
    name: name,
    accuracy: isAccuracy,
    default: defaultOn
  })
}

export function getCharacterSpecificSourceData(activeMech, activePilot, weaponData, invadeData) {
  let sourceData = []

  if (invadeData) {
    if (activeMech.frame === 'mf_goblin') sourceData.push(newAccSource('Liturgicode', true, true))

    const loadout = activeMech.loadouts[0]
    if (loadout) {
      if (loadout.systems.find(system => system.id === 'ms_scanner_swarm')) sourceData.push(newAccSource('Scanner Swarm', true, false))
    }
    // if (activeMech.frame === 'mf_goblin') sourceData.push(newAccSource('Scanner Swarm', true, false))
  }

  return sourceData
}

export function getStartingSources(activeMech, activePilot, weaponData, invadeData) {
  var sources = [];

  if (weaponData) {
    if (findTagOnWeapon(weaponData, 'tg_accurate'))   sources.push('Accurate')
    if (findTagOnWeapon(weaponData, 'tg_inaccurate')) sources.push('Inaccurate')
  }

  if (invadeData) {
    // ???? goblin and hive swarm ????
  }

  const sourceData = getCharacterSpecificSourceData(activeMech, activePilot, weaponData, invadeData)
  sourceData.forEach(source => {
    if (source.default === true) sources.push(source.name)
  });

  if (activeMech.conditions.includes('IMPAIRED')) sources.push('Impaired')

  return sources;
}
