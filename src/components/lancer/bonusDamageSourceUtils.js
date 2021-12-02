import {
  findFrameData,
  findTalentData,
  findWeaponData,
  findModData,
} from './lancerData.js';


const blankTrait = {
  onAttack: '',
  onHit: '',
  onCrit: '',
  onMiss: '',
  requiresLockon: false,
  damageModifiers: {},
  noButton: false,
}

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
      sources.push( newSource('Plasma Sheath', 'mf_tokugawa_dz', '', 'Burn', findTraitFromFrame(frameData, 'Plasma Sheath')) );
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

function addSourceFromTalent(sources, currentRank, talentData, rank, diceString, damageType = '', attackEffects = {}, customID = '') {
  if (currentRank >= rank) {
    const rankData = talentData.ranks[rank-1];

    // console.log(rankData.name, ' :::: ', rankData);

    sources.push(newSource(
      rankData.name || talentData.name,
      customID || `${talentData.id}_${rank}`,
      diceString,
      damageType,
      newTalentTrait(talentData, rank, attackEffects)
    ));
  }
}

function newTalentTrait(talentData, rank, attackEffects) {
  return {...talentData.ranks[rank-1], ...blankTrait, ...attackEffects}
}

function getBonusDamageSourcesFromTalents(pilotData) {
  var sources = [];

  pilotData.talents.forEach(talentAndRank => {
    const talentData = findTalentData(talentAndRank.id);
    const rank = talentAndRank.rank;

    if (talentData) {
      switch (talentData.id) {
        case 't_crack_shot':
          addSourceFromTalent(sources,rank,talentData, 2, '1d6', '');
          if (rank >= 3) {
            const watchEffect = { onCrit:
              'Your target must pass a Hull save or you may choose and additional effect for your attack:<br>' +
              '- HEADSHOT: They only have line of sight to adjacent spaces until the end of their next turn.<br>' +
              '- LEG SHOT: They become IMMOBILIZED until the end of their next turn.<br>'+
              '- BODY SHOT: They are knocked PRONE.'
            }
            sources.push( newSource('Watch This', 't_crack_shot_3', '', '', newTalentTrait(talentData,3,watchEffect)) );
          }
          break;

        case 't_centimane':
          const teethEffect = { onCrit: 'Your target must pass a SYSTEMS save or become IMPAIRED and SLOWED until the end of their next turn.' }
          addSourceFromTalent(sources,rank,talentData, 1, '', '', teethEffect);

          const exposeEffect = { onCrit: 'When you consume LOCK ON as part of an attack with a NEXUS or DRONE and perform a critical hit, your target becomes SHREDDED until the start of your next turn.' }
          addSourceFromTalent(sources,rank,talentData, 2, '', '', exposeEffect);

          const tidalEffect = { onCrit:
            '1/round, when you perform a critical hit with a NEXUS, your target must succeed on a SYSTEMS save or you may choose an additional effect for your attack that lasts until the end of their next turn:<br>' +
            '- HARRYING SWARM: They become IMPAIRED and SLOWED.<br>' +
            '- BLINDING SWARM: They only have line of sight to adjacent squares.<br>'+
            '- VIRULENT SWARM: They become SHREDDED. Any adjacent characters of your choice must also make a SYSTEMS save or become SHREDDED.' +
            '- RESTRICTING SWARM: They take 1 burn each time they take an action or reaction.'
          }
          addSourceFromTalent(sources,rank,talentData, 3, '', '', tidalEffect);
          break;

        case 't_duelist':
          const blademasterEffect = { onHit: '1/round, when you hit with a MAIN MELEE weapon, you gain 1 BLADEMASTER DIE.' }
          addSourceFromTalent(sources,rank,talentData, 2, '', '', blademasterEffect);
          break;

        case 't_executioner':
          const cleaveEffect = { onCrit: 'Deal 3 Kinetic damage to all characters and objects of your choice within THREAT�, other than the one you just attacked.' }
          addSourceFromTalent(sources,rank,talentData, 2, '', '', cleaveEffect);

          const escapeEffect = { onMiss: '1/round, when you miss with a melee attack, you reroll it against a different target within THREAT and line of sight.' }
          addSourceFromTalent(sources,rank,talentData, 3, '', '', escapeEffect);
          break;

        case 't_gunslinger':
          const heartEffect = { onHit: 'I Kill With My Heart: Armor Piercing (AP).' }
          addSourceFromTalent(sources,rank,talentData, 3, '2d6', '', heartEffect);
          break;

        case 't_heavy_gunner':
          const coveringEffect = { damageModifiers: { half: true } }
          addSourceFromTalent(sources,rank,talentData, 1, '', '', coveringEffect);
          const hammerEffect = { onHit: 'Your target is IMMOBILIZED until the end of their next turn.' }
          addSourceFromTalent(sources,rank,talentData, 2, '', '', hammerEffect);
          break;

        case 't_hunter':
          const lungeEffect = { onAttack: 'You may fly up to 3 spaces directly toward a targeted character before the attack. This movement ignores engagement and doesn’t provoke reactions.' }
          addSourceFromTalent(sources,rank,talentData, 1, '', '', lungeEffect);
          break;

        case 't_infiltrator':
          const ambushEffect = { onHit: 'Your target must succeed on a HULL save or become SLOWED, IMPAIRED, and unable to take reactions until the end of their next turn.' }
          addSourceFromTalent(sources,rank,talentData, 2, '', '', ambushEffect);
          break;

        case 't_nuclear_cavalier':
          addSourceFromTalent(sources,rank,talentData, 1, '2', 'Heat', {}, 't_nuclear_cavalier');
          addSourceFromTalent(sources,rank,talentData, 2, '1d6', 'Energy', {}, 't_nuclear_cavalier');
          break;

        case 't_siege_specialist':
          const impactEffect = { onAttack: '1/round, before rolling an attack with a CANNON, all characters adjacent to you must succeed on a HULL save or be knocked back by 1 space and knocked PRONE. You are then pushed 1 space in any direction.' }
          addSourceFromTalent(sources,rank,talentData, 2, '', '', impactEffect);
          const collateralEffect = { onCrit:
            '1/round, when you perform a critical hit on a character or object with a CANNON, you may choose to cause an explosion of secondary munitions, causing a Burst 2 explosion around your target.' +
            'Characters within the affected area must either drop PRONE as a reaction, or take 2 Explosive and be knocked back by 2 spaces from the center of the attack.'
          }
          addSourceFromTalent(sources,rank,talentData, 3, '', '', collateralEffect);
          break;

        case 't_skirmisher':
          const lockEffect = { onAttack: '1Before or after you SKIRMISH, you may move 2 spaces. This movement ignores engagement and doesn’t provoke reactions.' }
          addSourceFromTalent(sources,rank,talentData, 2, '', '', lockEffect);
          break;

        case 't_stormbringer':
          const delugeEffect = {
            onCrit: '1/round, when you successfully attack with a LAUNCHER and consume LOCK ON, you may also knock your target PRONE.',
            requiresLockon: true
          }
          addSourceFromTalent(sources,rank,talentData, 1, '', '', delugeEffect);

          const bendingEffect = { onHit:
            '1/round, when you hit a character or object with a LAUNCHER, you can choose one of the following effects:<br>' +
            '- LIGHTNING: You fire a concentrated blast of missiles at that character. They must succeed on a HULL save or be knocked away from you by 3 spaces; the force of firing then knocks you back by 3 spaces, away from the direction of fire.<br>' +
            '- THUNDER: You fire a spray of missiles at a Burst 2 area around that target. Characters in the area must succeed on an AGILITY save or be knocked back by 1 space, away from the target. The primary target is unaffected.<br>'
          }
          addSourceFromTalent(sources,rank,talentData, 2, '', '', bendingEffect);
          break;

        case 't_walking_armory':
          if (rank >= 1) {
            const thumperEffect = {onHit: 'Thumper: Knockback 1'}
            sources.push( newSource('THUMPER', 't_walking_armory_1_thumper', '—', 'Explosive', newTalentTrait(talentData,1,thumperEffect)) );

            const shockEffect = {onAttack: 'Shock: Choose one character targeted by your attack; adjacent characters take 1 Energy AP, whether the attack is a hit or miss.'}
            sources.push( newSource('SHOCK', 't_walking_armory_1_shock', '—', 'Energy', newTalentTrait(talentData,1,shockEffect)) );

            const magEffect = {onAttack: 'Mag: Arcing.'}
            sources.push( newSource('MAG', 't_walking_armory_1_mag', '—', 'Kinetic', newTalentTrait(talentData,1,magEffect)) );
          }
          if (rank >= 2) {
            const hellEffect = { damageModifiers: { bonusToBurn: true } }
            sources.push( newSource('HELLFIRE', 't_walking_armory_2_hellfire', '—', 'Energy', newTalentTrait(talentData,2,hellEffect)) );

            const jagerEffect = {onHit: 'Jager: Knockback 2, one character hit by the attack – your choice – must succeed on a HULL save or be knocked PRONE.'}
            sources.push( newSource('JAGER', 't_walking_armory_2_jager', '—', 'Explosive', newTalentTrait(talentData,2,jagerEffect)) );

            const sabotEffect = {onHit: 'Sabot: Armor Piercing.'}
            sources.push( newSource('SABOT', 't_walking_armory_2_sabot', '—', 'Explosive', newTalentTrait(talentData,2,sabotEffect)) );
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

function getPassiveTraitsFromTalents(pilotData) {
  var sources = [];

  pilotData.talents.forEach(talentAndRank => {
    const talentData = findTalentData(talentAndRank.id);
    const rank = talentAndRank.rank;

    if (talentData) {
      switch (talentData.id) {
        case 't_brutal':
          addSourceFromTalent(sources,rank,talentData, 2, '', '', {onCrit: 'Cull The Herd: Knockback 1.'});
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


//  ============================================    MODS ARE ASLEEP    =================================================
function newModTrait(modData, modEffect = {}) {
  return {...blankTrait, ...modData, ...modEffect}
}

// function addSourceFromMod(sources, modData, modEffect = {}) {
//
//
//   modData.added_damage.forEach(damage =>
//     sources.push( newSource(modData.name, modData.id, damage.val, damage.type, newModTrait(modEffect)) )
//   );
//
//   sources.push(newSource(
//     modData.name,
//     modData.id,
//     diceString,
//     damageType,
//     newModTrait(modEffect)
//   ));
// }

function getBonusDamageSourcesFromMod(activeWeapon) {
  var sources = [];
  if (!activeWeapon) return sources;
  const mod = activeWeapon.mod
  if (!mod) return sources;

  const modData = findModData(mod.id);

  if (modData) {
    switch (modData.id) {
      case 'wm_thermal_charge':
        const thermalEffect = { onHit: 'Expended a thermal charge.' }
        // addSourceFromMod(sources, modData, thermalEffect)
        sources.push( newSource(modData.name, modData.id, modData.added_damage[0].val, modData.added_damage[0].type, newModTrait(modData, thermalEffect)) );
        break;

      // case 'wm_uncle_class_comp_con':
        // TWO DIFFICULTY

      case 'wm_shock_wreath':
        const shockEffect = { onHit: 'If target already is suffering from burn, it can additionally only draw line of sight to adjacent spaces until the end of its next turn.' }
        sources.push( newSource(modData.name, modData.id, '1d6', 'Burn', newModTrait(modData, shockEffect)) );
        break;

      // case 'wm_stabilizer_mod':
        // +5 range and the Ordnance tag

      // case 'wm_nanocomposite_adaptation':
        // Smart and Seeking

      case 'wm_paracausal_mod':
        // Overkill, and its damage can’t be reduced in any way. No toggleable effect.
        const paraEffect = { noButton: true }
        sources.push( newSource(modData.name, modData.id, '', '', newModTrait(modData, paraEffect)) );
        break;

      // wm_thermal_charge
      default:
        if (modData.added_damage) {
          modData.added_damage.forEach(addedDamage =>
            sources.push( newSource(modData.name, modData.id, addedDamage.val, addedDamage.type, newModTrait(modData)) )
          );
        } else {
          sources.push( newSource(modData.name, modData.id, '', '', newModTrait(modData)) )
        }

      break;
    }
  }

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
  getBonusDamageSourcesFromMod,
  getToHitBonusFromMech,
};
