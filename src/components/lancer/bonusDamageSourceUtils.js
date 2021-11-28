import {
  findFrameData,
  findTalentData,
  findWeaponData,
} from './lancerData.js';

function newSource(name, id, diceString, damageType = '', traitData = null) {
  return {
    name: name,
    id: id,
    diceString: diceString,
    type: damageType,
    trait: traitData,
  }
}

//  ============================================    FRAMES    =======================================================
function findTraitFromFrame(frameData, traitName) {
  const traitData = frameData.traits.find(trait => trait.name === traitName);
  return traitData || null;
}

function newSourceFromFrame(frameData, diceString, damageType = '', traitName = '') {
  return newSource(
    traitName || frameData.name,
    frameData.id,
    diceString,
    damageType,
    findTraitFromFrame(frameData, traitName)
  )
}

function getBonusDamageSourcesFromMech(mechData) {
  var sources = [];

  const frameData = findFrameData(mechData.frame);
  if (!frameData) return sources;

  switch (frameData.id) {
    case 'mf_nelson':
      sources.push( newSourceFromFrame(frameData, '1d6', '', 'Momentum') );
      break;

    case 'mf_deaths_head':
      sources.push( newSource('Mark for Death - Aux', 'mf_deaths_head_aux', '1d6', '') );
      sources.push( newSource('Mark for Death - Main', 'mf_deaths_head_main', '2d6', '') );
      sources.push( newSource('Mark for Death - Heavy', 'mf_deaths_head_heavy', '3d6', '') );
      break;

    case 'mf_mourning_cloak':
      sources.push( newSourceFromFrame(frameData, '1d6', '', 'Hunter') );
      break;

    case 'mf_tokugawa':
      sources.push( newSourceFromFrame(frameData, '3', 'Energy', 'Limit Break') );
      sources.push( newSource('Plasma Sheath', 'mf_tokugawa_dz', '—', 'Burn', findTraitFromFrame(frameData, 'Plasma Sheath')) );
      break;

    default: break;
  }

  return sources;
}

function getToHitBonusFromMech(mechData) {
  var toHitBonus = 0;
  if (mechData.frame === 'mf_deaths_head') toHitBonus += 1;
  return toHitBonus;
}

//  ============================================    TALENTS    =======================================================

const basicAttackEffect = {
  onAttack: '',
  onHit: '',
  onCrit: '',
  requiresLockon: false,
}

function addSourceFromTalent(sources, currentRank, talentData, rank, diceString, damageType = '', attackEffects = {}, customName, customID = '') {
  if (currentRank >= rank) {
    const rankData = talentData.ranks[rank-1];

    // console.log(rankData.name, ' :::: ', rankData);

    sources.push(newSource(
      rankData.name || talentData.name,
      customID || `${talentData.id}_${rank}`,
      diceString,
      damageType,
      {...rankData, ...basicAttackEffect, ...attackEffects}
    ));
  }
}

function newTalentTrait(talentData, rank, attackEffects) {
  return {...talentData.ranks[rank-1], ...basicAttackEffect, ...attackEffects}
}

function getBonusDamageSourcesFromTalents(pilotData) {
  var sources = [];

  pilotData.talents.forEach(talentAndRank => {
    const talentData = findTalentData(talentAndRank.id);
    const rank = talentAndRank.rank;

    if (talentData) {
      switch (talentData.id) {
        case 't_crack_shot':
          addSourceFromTalent(sources,rank, talentData, 2, '1d6', '');
          break;
        case 't_gunslinger':
          addSourceFromTalent(sources,rank, talentData, 3, '2d6', '');
          break;
        case 't_nuclear_cavalier':
          addSourceFromTalent(sources,rank, talentData, 1, '2', 'Heat', {}, 't_nuclear_cavalier');
          addSourceFromTalent(sources,rank, talentData, 2, '1d6', 'Energy', {}, 't_nuclear_cavalier');
          break;
        case 't_walking_armory':
          if (rank >= 1) {
            const thumperEffect = {onAttack: 'Thumper: Knockback 1'}
            sources.push( newSource('THUMPER', 't_walking_armory_1_thumper', '—', 'Explosive', newTalentTrait(talentData,1,thumperEffect)) );

            const shockEffect = {onAttack: 'Shock: Choose one character targeted by your attack; adjacent characters take 1 Energy AP, whether the attack is a hit or miss.'}
            sources.push( newSource('SHOCK', 't_walking_armory_1_shock', '—', 'Energy', newTalentTrait(talentData,1,shockEffect)) );

            const magEffect = {onAttack: 'Mag: Arcing.'}
            sources.push( newSource('MAG', 't_walking_armory_1_mag', '—', 'Kinetic', newTalentTrait(talentData,1,magEffect)) );
          }
          if (rank >= 2) {
            sources.push( newSource('HELLFIRE', 't_walking_armory_2_hellfire', '—', 'Burn', talentData.ranks[1]) );
            // const shockEffect = {onHit: 'One character hit by the attack – your choice – must succeed on a HULL save or be knocked PRONE.'}
            // sources.push( newSource('JAGER', 't_walking_armory_2_jager', '', '', talentData.ranks[1]) );
            // sources.push( newSource('SABOT', 't_walking_armory_2_sabot', '', '', talentData.ranks[1]) );
          }
          break;

        default: break;
      }
    }
  });

  // all all ids to the sources' trait
  sources.forEach(source => {
    if (source.trait) source.trait.id = source.id
  });

  return sources;
}


//  ============================================    WEAPONS    =======================================================

// Honestly, people can just add stuff manually using the generic dice. The on hit // effects will prompt them to.
// function getBonusDamageSourcesFromWeapons(mountedWeaponData) {
//   var sources = [];
//   if (!mountedWeaponData) return sources;
//
//   const weaponData = findWeaponData(mountedWeaponData.id);
//
//   // console.log('mountedWeaponData',mountedWeaponData);
//   // console.log('weaponData',weaponData);
//
//   if (weaponData) {
//     switch (weaponData.id) {
//       // case 'mw_combat_drill':
//       //   sources.push( newSource('Combat Drill Overkill', 'mw_combat_drill', '20d6', 'Variable') );
//       //   break;
//
//       default: break;
//     }
//   }
//
//   return sources;
// }


export {
  getBonusDamageSourcesFromMech,
  getBonusDamageSourcesFromTalents,
  getToHitBonusFromMech,
};
