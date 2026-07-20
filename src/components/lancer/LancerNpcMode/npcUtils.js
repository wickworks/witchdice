
import {
  findNpcFeatureData,
  getSystemLimited,
  hasTag
} from '../lancerData.js';


export function getStat(key, npc) {
  let stat = npc.combat_data.stats.max[key] // V3
  // V3 UPDATE: it doesn't compile the bonuses for us; we have to do it ourselves
  if ('features' in npc) {
    for (const feature of npc.features) {
      if ('data' in feature && 'bonuses' in feature.data) {
        for (const bonus of feature.data.bonuses) {
          if (bonus.id == key) {
            stat += bonus.val || 0
            if (bonus.overwrite == true) { return bonus.val } // return immediately for overrides
          }
        }
      }
    }
  }


  return stat
}

export function getNpcSkillCheckAccuracy(skill, npc) {
  let accuracy = 0
  npc.features.forEach(feature => {
    const featureData = findNpcFeatureData(feature)
    const effectText = getEffectText(featureData).toLowerCase()
    // something that is too long probably has something else going on
    const setInFeatureEffect = effectText.includes(`${skill} save`) && featureData.effectText < 200
    const setInCustomDescription = feature.description && feature.description.toLowerCase().includes(skill)

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
  const tierNumbers = bracketedNumbers.substr(1, bracketedNumbers.length-2).split('/')
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

export function getEffectText(featureData, tier) {
  let effectTexts = [
    featureData.flavorDescription,
    featureData.description,
    featureData.effect
  ]
  if (featureData.actions) effectTexts = effectTexts.concat(featureData.actions.map(action => action.detail));
  return setNumbersByTier(effectTexts.filter(str => str).join('<br>'), tier)
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
    hp: getStat('hp', npc),
    heat: 0,
    burn: 0,
    structure: getStat('structure', npc),
    stress: getStat('stress', npc),
  }
  applyUpdatesToNpc(healedState, npc)
}



// applies the changes to an npc object ~ in place ~
export function applyUpdatesToNpc(mechUpdate, newNpc) {
  // V3 UPDATE: I don't care anymore, battering ram these keys in
  newNpc.combat_data = newNpc.combat_data || {}
  newNpc.combat_data.stats = newNpc.combat_data.stats || {}
  newNpc.combat_data.stats.current = newNpc.combat_data.stats.current || {}
  newNpc.combat_data.stats.max = newNpc.combat_data.stats.max || {}

  console.log('newNpc', newNpc);


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

      case 'systemPerRoundCount':
        var perRoundState = newNpc.per_round_uses || {}
        if (mechUpdate[statKey].source) {
          perRoundState[mechUpdate[statKey].source] = Math.max(mechUpdate[statKey].uses || 0, 0)
        }
        newNpc.per_round_uses = perRoundState // in case it was new
        break;
      case 'resetPerRoundCounts':
        newNpc.per_round_uses = {}
        break;

      case 'weaponCharged':
      case 'weaponLoaded':
      case 'weaponDestroyed':
      case 'weaponUses':
      case 'weaponModUses': // NPCs don't have weapon mods so this won't do anything
        let weaponItem = newNpc.items[mechUpdate[statKey].mountIndex]
        if (weaponItem) {
          if ('destroyed' in mechUpdate[statKey]) weaponItem.destroyed = mechUpdate[statKey].destroyed
          if ('uses' in mechUpdate[statKey]) weaponItem.uses = mechUpdate[statKey].uses
          if ('loaded' in mechUpdate[statKey]) weaponItem.loaded = mechUpdate[statKey].loaded
        }
        break;
      case 'repairAllWeaponsAndSystems':
        newNpc.features = newNpc.features || [] // V3 UPDATE: dropped features
        newNpc.features.forEach(feature => {
          const featureData = findNpcFeatureData(feature)
          const limited = getSystemLimited(feature, featureData)
          if (limited) feature.uses = limited.max

          feature.destroyed = false
        });
        break;
      // not relavant for npcs
      case 'overcharge':
      case 'corePower':
      case 'repairCapacity':
        console.log('    not relavant for npcs');
        break;

      default: // change something in current stats
        newNpc.combat_data.stats.current[statKey] = mechUpdate[statKey]

        break;
    }
  })
}
