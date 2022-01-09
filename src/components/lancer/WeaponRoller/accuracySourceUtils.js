
import {
  findTagOnWeapon,
  findTalentData,
} from '../lancerData.js';


function addAccSourceFromTalent(sources, talentID, rank, isAccuracy = true, defaultOn = false) {
  const talentData = findTalentData(talentID)
  const name = talentData.ranks[rank-1].name
  const desc = talentData.ranks[rank-1].description

  addAccSource(sources, name, talentID, desc, isAccuracy, defaultOn )
}

function addAccSource(sources, name, id, desc, isAccuracy = true, defaultOn = false) {
  sources.push(newAccSource(name, id, desc, isAccuracy, defaultOn))
}

export function newAccSource(name, id, desc, isAccuracy = true, defaultOn = false) {
  return ({
    name: name,
    id: id,
    desc: desc,
    accuracy: isAccuracy,
    default: defaultOn,
  })
}

export function getAvailableAccuracySources(activeMech, activePilot, weaponData, invadeData) {
  let sources = []

  // WEAPON/INVADE-AGNOSTIC
  addAccSource(sources, 'Consume Lock', 'lock_on', 'Any character making an attack against a character with LOCK ON may choose to gain +1 accuracy on that attack and then clear the LOCK ON condition after that attack resolves.')
  addAccSource(sources, 'Prone Target', 'prone', 'Attacks against PRONE targets receive +1 accuracy.')


  if (activeMech.conditions.includes('IMPAIRED')) {
    const desc =  'IMPAIRED characters receive +1 difficulty on all attacks, saves, and skill checks.'
    addAccSource(sources, 'Impaired', 'impaired', desc, false, true)
  }

  if (activeMech.frame === 'mf_tortuga') {
    const desc = 'The Tortuga gains +1 accuracy on all attacks made as reactions (e.g. OVERWATCH).'
    addAccSource(sources, 'Sentinal', 'mf_tortuga', desc)
  }

  if (weaponData) {
    addAccSource(sources, 'Hard Cover', 'cover_hard', 'Hard cover is solid enough to block shots and hide behind, and adds +2 difficulty to any ranged attacks.', false)
    addAccSource(sources, 'Soft Cover', 'cover_soft', 'Any time a target is obscured or obstructed somehow, it has soft cover, adding +1 difficulty to any ranged attacks.', false)

    if (findTagOnWeapon(weaponData, 'tg_accurate'))   addAccSource(sources, 'Accurate', 'tg_accurate', 'Attacks made with this weapon receive +1 accuracy.', true, true)
    if (findTagOnWeapon(weaponData, 'tg_inaccurate')) addAccSource(sources, 'Inaccurate', 'tg_inaccurate', 'Attacks made with this weapon receive +1 difficulty.', false, true)

    activePilot.talents.forEach(talentAndRank => {
      const id = talentAndRank.id;
      const rank = talentAndRank.rank;

      switch (talentAndRank.id) {
        case 't_brawler':
          if (rank >= 1) addAccSourceFromTalent(sources, id, 1)
          break;
        case 't_brutal':
          if (rank >= 3) addAccSourceFromTalent(sources, id, 3)
          break;
        case 't_crack_shot':
          if (rank >= 1) addAccSourceFromTalent(sources, id, 1)
          if (rank >= 2) addAccSourceFromTalent(sources, id, 1, false)
          break;
        case 't_combined_arms':
          if (rank >= 3) addAccSourceFromTalent(sources, id, 3)
          break;
        case 't_duelist':
          if (rank >= 1) addAccSourceFromTalent(sources, id, 1)
          break;
        case 't_gunslinger':
          if (rank >= 1) addAccSourceFromTalent(sources, id, 1)
          break;
        case 't_tactician':
          if (rank >= 1) addAccSourceFromTalent(sources, id, 1)
          if (rank >= 2) addAccSourceFromTalent(sources, id, 2)
          break;
        case 't_vanguard':
          if (rank >= 1) addAccSourceFromTalent(sources, id, 1)
          break;
      }
    });
  }

  if (invadeData) {
    if (activeMech.frame === 'mf_goblin') addAccSource(sources, 'Liturgicode', 'mf_goblin', 'The Goblin gains +1 accuracy on tech attacks.', true, true)

    const loadout = activeMech.loadouts[0]
    if (loadout) {
      if (loadout.systems.find(system => system.id === 'ms_scanner_swarm')) addAccSource(sources, 'Scanner Swarm', 'ms_scanner_swarm', 'You gain +1 accuracy on tech attacks against adjacent characters.')
    }
  }

  return sources
}


export function getStartingSourceIDs(activeMech, activePilot, weaponData, invadeData) {
  const availableSources = getAvailableAccuracySources(activeMech, activePilot, weaponData, invadeData)
  return availableSources.filter(source => source.default === true).map(source => source.id);
}
