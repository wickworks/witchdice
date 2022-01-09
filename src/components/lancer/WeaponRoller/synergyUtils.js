

export function getFailingWeaponSynergies(weaponData, synergies) {
  const failingSynergies = synergies.filter(synergy => {
    // Weapon type? (mimic gun counts as everything)
    if (synergy.weapon_types && synergy.weapon_types[0] !== 'any') {
      if (!synergy.weapon_types.includes(weaponData.type) && weaponData.type !== '???') return true
    }
    // Weapon size?
    if (synergy.weapon_sizes && synergy.weapon_sizes[0] !== 'any') {
      if (!synergy.weapon_sizes.includes(weaponData.mount)) return true
    }
    return false
  })

  return failingSynergies
}

// We only care about synergies that apply to weapons
export function getWeaponSynergies(synergies) {
  if (synergies) {
    return synergies.filter(synergy => synergy.locations.includes('weapon'))
  } else {
    return []
  }
}
