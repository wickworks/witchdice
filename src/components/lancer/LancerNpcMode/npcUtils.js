
import {
  findNpcFeatureData,
  findTagOnData,
  getSystemLimited,
  hasTag
} from '../lancerData.js';


export function getStat(key, npc) {
  let stat = npc.stats[key]
  if (npc.stats.overrides && npc.stats.overrides[key] > 0) {
    stat = npc.stats.overrides[key]
  } else if (npc.stats.bonuses) {
    stat += npc.stats.bonuses[key] || 0
  }
  return stat
}

export function getNpcSkillCheckAccuracy(skill, npc) {
  let accuracy = 0
  npc.items.forEach(feature => {
    const setInCustomDescription = feature.description && feature.description.toLowerCase().includes(skill)

    const featureData = findNpcFeatureData(feature.itemID)
    const effect = featureData.effect ? featureData.effect.toLowerCase() : ''

     // something that is too long probably has something else going on
    const setInFeatureEffect = effect.includes(`${skill} save`) && effect.length < 200

    if (setInFeatureEffect || setInCustomDescription) {
      const value = parseInt(effect.charAt(effect.indexOf('+')+1))
      if (value) {
        if (effect.includes('accuracy')) {
          accuracy += value
        } else if (effect.includes('difficulty')) {
          accuracy -= value
        }
      }
    }
  });
  return accuracy
}

export function getMarkerFromFingerprint(fingerprint) {
  const [ marker ] = fingerprint.indexOf('-') >= 0 ? fingerprint.split('-') : ['X','']
  return marker || 'X'
}

// gets A, B, C, etc depending on how many of these NPCs there are already
export function getMarkerForNpcID(npcID, allNpcs) {
  let alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',]

  // remove all values that we already have
  Object.values(allNpcs)
    .filter(npc => npc.id === npcID)
    .map(npc => getMarkerFromFingerprint(npc.fingerprint))
    .forEach(marker => alphabet.indexOf(marker) >= 0 && alphabet.splice(alphabet.indexOf(marker), 1));

  return alphabet[0] || 'Z'
}

// turns "{1/2/3}" into just 2 for a tier-2 enemy
export function getNumberByTier(bracketedNumbers, npcTier) {
  if (bracketedNumbers[0] !== '{' || bracketedNumbers.slice(-1) !== '}') return bracketedNumbers
  const tierNumbers = bracketedNumbers.substr(1, bracketedNumbers.length-2).slice('/')
  return parseInt(tierNumbers[npcTier-1]) || 0
}

export function setNumbersByTier(effectString, tier) {
  let returnString = effectString
  if (!tier) return returnString

  const matches = effectString.match(/{\d*\/\d*\/\d*}/g)
  if (matches) {
    matches.forEach(tierNumbers => {
      const justNumbers = tierNumbers.slice(1, -1)
      const numberArray = justNumbers.split('/')
      const finalNumber = numberArray[tier-1]
      returnString = returnString.replace(tierNumbers, `<b>${finalNumber}</b>`)
    })
  }
  return returnString
}

export function getActivationType(featureData) {
  let activation = ''
  if (featureData.type === 'Reaction') activation = 'Reaction'
  if (hasTag(featureData, 'tg_protocol')) activation = 'Protocol'
  if (hasTag(featureData, 'tg_quick_action')) activation = 'Quick'
  if (hasTag(featureData, 'tg_full_action')) activation = 'Full'
  return activation
}



// refresh limited uses, etc; modifies in place
export function fullRepairNpc(npc) {
  if (!npc) return

  const healedState = {
    repairAllWeaponsAndSystems: true,
    conditions: [],
    custom_counters: [],
    counter_data: [],
    overshield: 0,
    current_hp: getStat('hp', npc),
    current_heat: 0,
    burn: 0,
    current_structure: getStat('structure', npc),
    current_stress: getStat('stress', npc),
  }
  applyUpdatesToNpc(healedState, npc)
}



// applies the changes to an npc object ~ in place ~
export function applyUpdatesToNpc(mechUpdate, newNpc) {

  Object.keys(mechUpdate).forEach(statKey => {
    console.log('statKey:',statKey, ' : ', mechUpdate[statKey]);
    switch (statKey) {
      // attributes outside of the currentStats
      case 'conditions':
      case 'custom_counters':
      case 'counter_data':
      case 'overshield':
      case 'burn':
        newNpc[statKey] = mechUpdate[statKey]
        break;

      // equipment features
      case 'systemUses':
        newNpc.items[mechUpdate[statKey].index].uses = mechUpdate[statKey].uses
        break;
      case 'systemCharged':
        newNpc.items[mechUpdate[statKey].index].charged = mechUpdate[statKey].charged
        break;
      case 'systemDestroyed':
        newNpc.items[mechUpdate[statKey].index].destroyed = mechUpdate[statKey].destroyed
        break;
      case 'weaponUses':
      case 'weaponLoaded':
      case 'weaponCharged':
      case 'weaponDestroyed':
        // find the item that generates this weapon
        const weaponItems = newNpc.items.filter(item => findNpcFeatureData(item.itemID).type === 'Weapon')
        let weaponItem = weaponItems[mechUpdate[statKey].weaponIndex]
        if (weaponItem) {
          if ('destroyed' in mechUpdate[statKey]) weaponItem.destroyed = mechUpdate[statKey].destroyed
          if ('uses' in mechUpdate[statKey]) weaponItem.uses = mechUpdate[statKey].uses
          if ('loaded' in mechUpdate[statKey]) weaponItem.loaded = mechUpdate[statKey].loaded
        }
        break;
      case 'repairAllWeaponsAndSystems':
        newNpc.items.forEach(item => {
          const featureData = findNpcFeatureData(item.itemID)
          const limited = getSystemLimited(item, featureData)
          if (limited) item.uses = limited.max

          item.destroyed = false
        });
        break;
      // not relavant for npcs
      case 'current_overcharge':
      case 'current_core_energy':
      case 'current_repairs':
        console.log('    not relavant for npcs');
        break;

      default: // change something in currentStats
        // remove the 'current_' for keys that have it
        const keyConversion = {
          'current_hp': 'hp',
          'current_heat': 'heatcap',
          'current_structure': 'structure',
          'current_stress': 'stress',
          'activations': 'activations'
        }
        const convertedKey = keyConversion[statKey] || statKey
        newNpc.currentStats[convertedKey] = mechUpdate[statKey]

        break;
    }
  })
}
