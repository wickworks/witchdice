
import { getAllWeaponRanges, getAllWeaponDamageTypes } from '../lancerData.js'

export function getPassingWeaponSynergies(weaponData, synergies) {
  const failingSynergies = getFailingWeaponSynergies(weaponData, synergies)
  return synergies.filter(synergy => !failingSynergies.includes(synergy))
}

export function getFailingWeaponSynergies(weaponData, synergies) {
  const failingSynergies = synergies.filter(synergy => {
    // Weapon size?
    if (synergy.weapon_sizes && synergy.weapon_sizes[0] !== 'any') {
      if (!synergy.weapon_sizes.includes(weaponData.mount)) return true // failed
    }

    // Damage type?
    if (synergy.damage_types && synergy.damage_types[0] !== 'any') {
      if (!getAllWeaponDamageTypes(weaponData).some(damageType => synergy.damage_types.includes(damageType))) return true // failed
    }

    // Weapon type? (mimic gun counts as everything)
    if (synergy.weapon_types && synergy.weapon_types[0] !== 'any') {
      // get all the possible ranges from the base and/or profiles
      const weaponRanges = getAllWeaponRanges(weaponData)
      const isRanged = weaponRanges.some(range => range.type === 'Range')
      const isMelee = weaponData.type === 'Melee' // weaponRanges.some(range => range.type === 'Threat')

      // needs to have at least one thing that matches this type
      const hasMatchedType = synergy.weapon_types.some(checkForType => {
        // All ranged weapons
        if (checkForType === 'Ranged' && isRanged) return true
        // All melee weapons
        if (checkForType === 'Melee' && isMelee) return true
        // Rifle, CQB, etc
        if (checkForType === weaponData.type || weaponData.type === '???') return true

        return false;
      })

      if (!hasMatchedType) return true // failed
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
