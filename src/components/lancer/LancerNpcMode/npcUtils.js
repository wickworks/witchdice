
export function getStat(key, npc) {
  let stat = npc.stats[key]
  if (npc.stats.overrides && npc.stats.overrides[key] > 0) {
    stat = npc.stats.overrides[key]
  } else if (npc.stats.bonuses) {
    stat += npc.stats.bonuses[key] || 0
  }
  return stat
}

export function getMarkerFromFingerprint(fingerprint) {
  const [marker, number] = fingerprint.indexOf('-') >= 0 ? fingerprint.split('-') : ['X','']
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
  console.log('getNumberByTier',bracketedNumbers, npcTier);

  if (bracketedNumbers[0] !== '{' || bracketedNumbers.slice(-1) !== '}') return bracketedNumbers
  const tierNumbers = bracketedNumbers.substr(1, bracketedNumbers.length-2).slice('/')

  console.log('    tierNumbers',tierNumbers);
  return parseInt(tierNumbers[npcTier-1]) || 0
}
