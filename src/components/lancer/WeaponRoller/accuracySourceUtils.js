
import {
  findTagOnData,
  findTalentData,
  findCoreBonusData,
  findModData,
} from '../lancerData.js';

import {
  getSynergiesFor,
  getFailingWeaponSynergies,
} from './synergyUtils.js';


function addAccSourceFromTalent(sources, weaponData, talentData, rank, accBonus = 1, defaultOn = false) {
  const name = talentData.ranks[rank-1].name
  const desc = talentData.ranks[rank-1].description

  const synergies = getSynergiesFor('weapon', talentData.ranks[rank-1].synergies)
  const failingSynergies = getFailingWeaponSynergies(weaponData, synergies)

  if (failingSynergies.length === 0) {
    addAccSource(sources, name, `${talentData.id}-${rank}`, desc, accBonus, defaultOn )
  }
}

function addAccSource(sources, name, id, desc, accBonus = 1, defaultOn = false) {
  sources.push(newAccSource(name, id, desc, accBonus, defaultOn))
}

export function newAccSource(name, id, desc, accBonus = 1, defaultOn = false) {
  return ({
    name: name,
    id: id,
    desc: desc,
    accBonus: accBonus,
    default: defaultOn,
  })
}

// activeMech.frame
// activeMech.loadouts[0].systems
// if (activeMech.conditions.includes('IMPAIRED')) {
// activePilot.talents
export function getAvailableAccuracySources(
  frameID,
  mechSystems,
  pilotTalents,
  isImpaired,
  weaponData,
  invadeData,
  weaponMod,
  weaponNpcAccuracy,
  mountBonusEffects
) {
  let sources = []

  // WEAPON/INVADE-AGNOSTIC
  addAccSource(sources, 'Consume Lock', 'lock_on', 'Any character making an attack against a character with LOCK ON may choose to gain +1 accuracy on that attack and then clear the LOCK ON condition after that attack resolves.')
  addAccSource(sources, 'Prone Target', 'prone', 'Attacks against PRONE targets receive +1 accuracy.')

  if (frameID === 'mf_tortuga') {
    const desc = 'The Tortuga gains +1 accuracy on all attacks made as reactions (e.g. OVERWATCH).'
    addAccSource(sources, 'Sentinal', 'mf_tortuga', desc)
  }

  if (frameID === 'mf_standard_pattern_i_everest') {
    const desc = 'You gain +1 Accuracy on all attacks, checks, and saves; additionally, 1/turn, you can BOOST as a free action.'
    addAccSource(sources, 'Core Power: Hyperspec Fuel Injector', 'mf_standard_pattern_i_everest', desc)
  }

  if (weaponData) {
    // -- COVER --
    addAccSource(sources, 'Hard Cover', 'cover_hard', 'Hard cover is solid enough to block shots and hide behind, and adds +2 difficulty to any ranged attacks.', -2)
    addAccSource(sources, 'Soft Cover', 'cover_soft', 'Any time a target is obscured or obstructed somehow, it has soft cover, adding +1 difficulty to any ranged attacks.', -1)

    // -- WEAPON TAGS --
    if (findTagOnData(weaponData, 'tg_accurate'))   addAccSource(sources, 'Accurate', 'tg_accurate', 'Attacks made with this weapon receive +1 accuracy.', 1, true)
    if (findTagOnData(weaponData, 'tg_inaccurate')) addAccSource(sources, 'Inaccurate', 'tg_inaccurate', 'Attacks made with this weapon receive +1 difficulty.', -1, true)

    // -- (initialize engagement) --
    let ignoresEngaged = false
    if (weaponData.id === 'mw_bristlecrown_flechette_launcher') ignoresEngaged = true;

    // -- WEAPON TALENTS --
    pilotTalents && pilotTalents.forEach(talentAndRank => {
      const talentData = findTalentData(talentAndRank.id)
      const rank = talentAndRank.rank;

      switch (talentAndRank.id) {
        case 't_brawler':
          if (rank >= 1) addAccSourceFromTalent(sources, weaponData, talentData, 1)
          break;
        case 't_brutal':
          if (rank >= 3) addAccSourceFromTalent(sources, weaponData, talentData, 3)
          break;
        case 't_crack_shot':
          if (rank >= 1) addAccSourceFromTalent(sources, weaponData, talentData, 1)
          if (rank >= 2) addAccSourceFromTalent(sources, weaponData, talentData, 2, -1)
          break;
        case 't_combined_arms':
          if (rank >= 2) ignoresEngaged = true
          if (rank >= 3) addAccSourceFromTalent(sources, weaponData, talentData, 3)
          break;
        case 't_duelist':
          if (rank >= 1) addAccSourceFromTalent(sources, weaponData, talentData, 1)
          break;
        case 't_gunslinger':
          if (rank >= 1) addAccSourceFromTalent(sources, weaponData, talentData, 1)
          break;
        case 't_tactician':
          if (rank >= 1) addAccSourceFromTalent(sources, weaponData, talentData, 1)
          if (rank >= 2) addAccSourceFromTalent(sources, weaponData, talentData, 2)
          break;
        case 't_vanguard':
          if (rank >= 1) addAccSourceFromTalent(sources, weaponData, talentData, 1)
          break;
        default:
          break;
      }
    });

    // if (isImpaired) {
      const desc =  'IMPAIRED characters receive +1 difficulty on all attacks, saves, and skill checks.'
      addAccSource(sources, 'Impaired', 'impaired', desc, -1, isImpaired)
    // }

    // -- ENGAGEMENT --
    if (weaponData.type !== 'Melee' && !ignoresEngaged) {
      const desc = 'If a character moves adjacent to a hostile character, they both gain the ENGAGED status for as long as they remain adjacent to one another. Ranged attacks made by an ENGAGED character receive +1 difficulty.'
      addAccSource(sources, 'Engaged', 'engaged', desc, -1)
    }

    // -- MOUNT BONUS EFFECTS I.E. CORE BONUSES --
    mountBonusEffects && mountBonusEffects.forEach(effectID => {
      const cbData = findCoreBonusData(effectID)
      switch (effectID) {
        case 'cb_auto_stabilizing_hardpoints':
          addAccSource(sources, cbData.name, cbData.id, 'Weapons attached to this mount gain +1 Accuracy.', 1, true)
          break;
        default:
          break;
      }
    })

    // -- WEAPON MODS --
    if (weaponMod) {
      const modData = findModData(weaponMod.id)
      switch (weaponMod.id) {
        case 'wm_uncle_class_comp_con':
          addAccSource(sources, modData.name, weaponMod.id, '1/turn, you can attack at +2 difficulty with UNCLE’s weapon as a free action.', -2, true)
          break;
        default:
          break;
      }
    }

    // -- MECH SYSTEMS --
    if (mechSystems && mechSystems.find(system => system.id === 'ms_core_siphon')) {
      addAccSource(sources, 'Core Siphon (First)', 'ms_core_siphon_first', 'When you activate this protocol, you gain +1 accuracy on your first attack roll this turn...', 1)
      addAccSource(sources, 'Core Siphon (Other)', 'ms_core_siphon_other', '...but receive +1 difficulty on all other attack rolls until the end of the turn.', -1)
    }

    // NPC sources
    if (!!weaponNpcAccuracy) {
      addAccSource(sources, weaponData.name, weaponData.id, '', weaponNpcAccuracy, true)
    }
  }

  if (invadeData) {
    if (frameID === 'mf_goblin') addAccSource(sources, 'Liturgicode', 'mf_goblin', 'The Goblin gains +1 accuracy on tech attacks.', 1, true)

    if (mechSystems && mechSystems.find(system => system.id === 'ms_scanner_swarm')) {
      addAccSource(sources, 'Scanner Swarm', 'ms_scanner_swarm', 'You gain +1 accuracy on tech attacks against adjacent characters.')
    }
  }

  return sources
}


// const availableSources = getAvailableAccuracySources(activeMech, activePilot, weaponData, invadeData, weaponMod)
export function getStartingSourceIDs(availableSources) {
  const startingSources = availableSources.filter(source => source.default === true).map(source => source.id)
  return startingSources;
}
