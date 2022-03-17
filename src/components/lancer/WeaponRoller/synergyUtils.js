
import { getAllWeaponRanges } from '../lancerData.js'

export function getFailingWeaponSynergies(weaponData, synergies) {

  const failingSynergies = synergies.filter(synergy => {
    // Weapon size?
    if (synergy.weapon_sizes && synergy.weapon_sizes[0] !== 'any') {
      if (!synergy.weapon_sizes.includes(weaponData.mount)) return true // failed
    }

    // Weapon type? (mimic gun counts as everything)
    if (synergy.weapon_types && synergy.weapon_types[0] !== 'any') {

      // get all the possible ranges from the base and/or profiles
      const weaponRanges = getAllWeaponRanges(weaponData)

      // All ranged weapons
      if (synergy.weapon_types.includes('Ranged')) {
        if (!weaponRanges.some(range => range.type === 'Range')) return true // failed
      }

      // All melee weapons
      if (synergy.weapon_types.includes('Melee')) {
        if (!weaponRanges.some(range => range.type === 'Threat')) return true // failed
      }

      // Rifle, CQB, etc
      if (!synergy.weapon_types.includes(weaponData.type) && weaponData.type !== '???') return true // failed
    }

    return false // this didn't fail
  })

  return failingSynergies
}

// convience function to get synergies that include a single location
export function getSynergiesFor(targetLocation, synergies) {
  return getSynergiesForAll([targetLocation], synergies)
}

// get synergies that match ALL the given locations
export function getSynergiesForAll(targetLocations, synergies) {
  if (synergies) {
    return synergies.filter(synergy =>
      targetLocations.every(location => synergy.locations.includes(location))
    )
  } else {
    return []
  }
}

// get synergies that match ANY of the given locations
export function getSynergiesForAny(targetLocations, synergies) {
  if (synergies) {
    return synergies.filter(synergy =>
      targetLocations.some(location => synergy.locations.includes(location))
    )
  } else {
    return []
  }
}
