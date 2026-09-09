import {
  findNpcFeatureData,
  getSystemLimited,
  hasTag
} from '../lancerData';


export function getStat(key: string, npc: any) {
  let stat = npc.stats[key]
  if (npc.stats.overrides && npc.stats.overrides[key] > 0) {
    stat = npc.stats.overrides[key]
  } else if (npc.stats.bonuses) {
    stat += npc.stats.bonuses[key] || 0
  }
  return stat
}

export function getNpcSkillCheckAccuracy(skill: string, npc: any) {
  let accuracy = 0
  npc.items.forEach((feature: any) => {
    const featureData = findNpcFeatureData(feature.itemID)
    const effect = [featureData.effect, feature.description].filter(text => text).join(' ').toLowerCase()
    const setInFeatureEffect = effect.includes(`${skill} save`) && featureData.effect < 200
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

export function getMarkerFromFingerprint(fingerprint: string) {
  const [ marker ] = fingerprint.indexOf('-') >= 0 ? fingerprint.split('-') : ['X','']
  return marker || 'X'
}

export function getMarkerForNpcID(npcID: string, allNpcs: Record<string, any>) {
  let alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',]

  Object.values(allNpcs)
    .filter(npc => npc.id === npcID)
    .map(npc => getMarkerFromFingerprint(npc.fingerprint))
    .forEach(marker => alphabet.indexOf(marker) >= 0 && alphabet.splice(alphabet.indexOf(marker), 1));

  return alphabet[0] || 'Z'
}

export function getNumberByTier(bracketedNumbers: string, npcTier: number): string | number {
  if (bracketedNumbers[0] !== '{' || bracketedNumbers.slice(-1) !== '}') return bracketedNumbers
  const tierNumbers = bracketedNumbers.substr(1, bracketedNumbers.length-2).split('/')
  return parseInt(tierNumbers[npcTier-1]) || 0
}

export function setNumbersByTier(effectString: string, tier?: number) {
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

export function getActivationType(featureData: any) {
  let activation = ''
  if (featureData.type === 'Reaction') activation = 'Reaction'
  if (hasTag(featureData, 'tg_protocol')) activation = 'Protocol'
  if (hasTag(featureData, 'tg_quick_action')) activation = 'Quick'
  if (hasTag(featureData, 'tg_full_action')) activation = 'Full'
  return activation
}



export function fullRepairNpc(npc: any) {
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



export function applyUpdatesToNpc(mechUpdate: Record<string, any>, newNpc: any) {

  Object.keys(mechUpdate).forEach(statKey => {
    switch (statKey) {
      case 'conditions':
      case 'custom_counters':
      case 'counter_data':
      case 'overshield':
      case 'burn':
        newNpc[statKey] = mechUpdate[statKey]
        break;

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
        newNpc.per_round_uses = perRoundState
        break;
      case 'resetPerRoundCounts':
        newNpc.per_round_uses = {}
        break;

      case 'weaponCharged':
      case 'weaponLoaded':
      case 'weaponDestroyed':
      case 'weaponUses':
      case 'weaponModUses':
        let weaponItem = newNpc.items[mechUpdate[statKey].mountIndex]
        if (weaponItem) {
          if ('destroyed' in mechUpdate[statKey]) weaponItem.destroyed = mechUpdate[statKey].destroyed
          if ('uses' in mechUpdate[statKey]) weaponItem.uses = mechUpdate[statKey].uses
          if ('loaded' in mechUpdate[statKey]) weaponItem.loaded = mechUpdate[statKey].loaded
        }
        break;
      case 'repairAllWeaponsAndSystems':
        newNpc.items.forEach((item: any) => {
          const featureData = findNpcFeatureData(item.itemID)
          const limited = getSystemLimited(item, featureData)
          if (limited) item.uses = limited.max

          item.destroyed = false
        });
        break;
      case 'current_overcharge':
      case 'current_core_energy':
      case 'current_repairs':
        console.log('    not relavant for npcs');
        break;

      default:
        const keyConversion: Record<string, string> = {
          'current_hp': 'hp',
          'current_heat': 'heatcap',
          'current_structure': 'structure',
          'current_stress': 'stress',
          'activations': 'activations'
        }
        const convertedKey = keyConversion[statKey] || statKey
        newNpc.currentStats = newNpc.currentStats || {}
        newNpc.currentStats[convertedKey] = mechUpdate[statKey]

        break;
    }
  })
}
