import {
  findFrameData,
  findTalentData,
  findModData,
  findCoreBonusData,
  findSystemData,
  findNpcFeatureData,
  findTagOnData,
  getDefaultWeaponDamageType,
  dealsDamageType,
  getModdedWeaponData,
  HARDCODED_TECH_TALENT_SYNERGIES,
} from '../lancerData.js';

import {
  getSynergiesFor,
  getFailingWeaponSynergies,
} from './synergyUtils.js';

export function getAvailableBonusDamageSources(damageSourceInputs, activeMount, activeWeapon, activeInvadeData) {
  let bonusDamageSources = [
    ...getBonusDamageSourcesFromMech(damageSourceInputs.frameID),
    ...getBonusDamageSourcesFromTalents(damageSourceInputs.pilotTalents),
    ...getBonusDamageSourcesFromCoreBonuses(activeMount),
    ...getBonusDamageSourcesFromMod(activeWeapon),
    ...getBonusDamageSourcesFromSystems(damageSourceInputs.mechSystems, damageSourceInputs.currentHeat, activeWeapon),
    ...getBonusDamageSourcesFromWeapons(activeWeapon),
    ...getBonusDamageSourcesFromNpcFeatures(damageSourceInputs.npcFeatures, activeWeapon)
  ]

  // filter them out by synergy e.g. melee talents only apply to melee weapons
  if (activeWeapon) {
    const weaponData = getModdedWeaponData(activeWeapon)
    bonusDamageSources = bonusDamageSources.filter(source => {
      // const synergies = getSynergiesFor(location, source.trait.synergies)
      const synergies = source.trait.synergies || []

      // console.log('weaponData',weaponData, 'synergies',synergies);
      const failingSynergies = getFailingWeaponSynergies(weaponData, synergies)

      // Only include sources without failing synergies
      return failingSynergies.length === 0;
    })
  }

  if (activeInvadeData) {
    bonusDamageSources = bonusDamageSources.filter(source => {
      if (source.trait && source.trait.synergies) {
        const sourceSynergies = [...source.trait.synergies]

        // nuc cav is missing its tech synergy, so we gotta add it dynamically
        if (HARDCODED_TECH_TALENT_SYNERGIES.some(targetTalent => source.trait.id === targetTalent.id && parseInt(source.trait.rank) === targetTalent.rank)) {
          sourceSynergies.push({detail: source.trait.description, locations: ['tech']})
        }

        const techSynergies = getSynergiesFor('tech', sourceSynergies)

        // Only include sources with any tech synergies
        return techSynergies.length > 0;
      }

      // no synergies
      return false;
    })
  }

  return bonusDamageSources
}


const blankTrait = {
  onAttack: '',
  onHit: '',
  onCrit: '',
  onMiss: '',
  requiresLockon: false,  // only show text & junk if we locked on
  requiresCrit: false,    // only apply damage if we crit
  damageModifiers: {},    // half, double, or average
  isPassive: false,       // doesn't show up in the list, always enabled
  defaultEnabled: false,  // starts enabled
}

function newSource(name, id, diceString, damageType = '', traitData = {} ) {
  return {
    name: name,
    id: id,
    diceString: diceString,
    type: damageType,
    trait: traitData,
  }
}

function newStandardTrait(sourceData, additionalEffect = {}) {
  return {...blankTrait, ...sourceData, ...additionalEffect}
}


//  ============================================    FRAMES    =======================================================
function newFrameTrait(frameData, traitName) {
  const traitData = frameData.traits.find(trait => trait.name === traitName);

  return {...blankTrait, ...traitData, name: frameData.name};
}

function newSourceFromFrame(frameData, diceString, damageType = '', traitName = '') {
  return newSource(
    traitName || frameData.name,
    frameData.id,
    diceString,
    damageType,
    newFrameTrait(frameData, traitName)
  )
}

function getBonusDamageSourcesFromMech(frameID) {
  var sources = [];

  const frameData = findFrameData(frameID);
  if (!frameData) return sources;

  switch (frameID) {
    case 'mf_nelson':
      sources.push( newSourceFromFrame(frameData, '1d6', '', 'Momentum') );
      break;

    case 'mf_deaths_head':
      const synergies = {
        "locations": ["weapon"],
        "weapon_types": ["Rifle","Cannon","Launcher","CQB","Nexus"],
      }

      const auxEffect = { synergies: [{...synergies, "weapon_sizes": ["Auxiliary"]}] }
      sources.push( newSource('Mark for Death', 'mf_deaths_head_aux', '1d6', '', auxEffect) );

      const mainEffect = { synergies: [{...synergies, "weapon_sizes": ["Main"]}] }
      sources.push( newSource('Mark for Death', 'mf_deaths_head_main', '2d6', '', mainEffect) );

      const heavyEffect = { synergies: [{...synergies, "weapon_sizes": ["Heavy"]}] }
      sources.push( newSource('Mark for Death', 'mf_deaths_head_heavy', '3d6', '', heavyEffect) );
      break;

    case 'mf_monarch':
      const silosEffect = {
        ...newFrameTrait(frameData, 'Avenger Silos'),
        onCrit: '1/round, on a critical hit with any ranged weapon, the Monarch may deal 3 explosive to a different character of your choice within range 15 and line of sight.',
        isPassive: true,
      }
      sources.push( newSource('Avenger Silos', 'mf_monarch_silo', '', 'Explosive', silosEffect) );

      const payloadEffect = {
        ...newFrameTrait(frameData, 'Seeking Payload'),
        onAttack: 'Consumed lock: Seeking & the attack’s damage cannot be reduced in any way.',
      }
      sources.push( newSource('Seeking Payload', 'mf_monarch_payload', '', '', payloadEffect) );

      break;


    case 'mf_mourning_cloak':
      sources.push( newSourceFromFrame(frameData, '1d6', '', 'Hunter') );
      break;

    case 'mf_tokugawa':
      sources.push( newSourceFromFrame(frameData, '3', 'Energy', 'Limit Break') );

      const plasmaEffect = {...newFrameTrait(frameData, 'Plasma Sheath'), damageModifiers: { bonusToBurn: true } }
      sources.push( newSource('Plasma Sheath', 'mf_tokugawa_dz', '', 'Burn', plasmaEffect) );
      break;

    default: break;
  }

  // all all ids to the sources' trait
  sources.forEach(source => {
    if (source.trait) source.trait.id = source.id
  });

  return sources;
}

export function getToHitBonusFromMech(frameID) {
  var toHitBonus = 0;
  if (frameID === 'mf_deaths_head') toHitBonus += 1;
  return toHitBonus;
}

//  ============================================    TALENTS    =======================================================

function addSourceFromTalent(sources, currentRank, talentData, rank, diceString, damageType = '', attackEffects = {}, customID = '', customName = '') {
  if (currentRank >= rank) {
    const rankData = talentData.ranks[rank-1];

    // console.log(rankData.name, ' :::: ', rankData);

    sources.push(newSource(
      customName || rankData.name,
      customID || `${talentData.id}_${rank}`,
      diceString,
      damageType,
      newTalentTrait(talentData, rank, attackEffects)
    ));
  }
}

function newTalentTrait(talentData, rank, attackEffects) {
  return {...talentData.ranks[rank-1], ...blankTrait, ...attackEffects, talentData, name: talentData.name, rank: rank}
}

function getBonusDamageSourcesFromTalents(pilotTalents) {
  var sources = [];

  pilotTalents.forEach(talentAndRank => {
    const talentData = findTalentData(talentAndRank.id);
    const rank = talentAndRank.rank;

    if (talentData) {
      switch (talentData.id) {
        case 't_brawler':
          const brawlerSynergies = [{
            "locations": ["improvised_attack"],
          }]
          const brawlerEffect = {
            onHit: 'Brawler: Knockback 2.',
            synergies: brawlerSynergies,
            defaultEnabled: true
          }
          addSourceFromTalent(sources,rank,talentData, 2, '1d6+2', 'Kinetic', brawlerEffect);
          break;

        case 't_brutal':
          const predEffect = { damageModifiers: { maximized: true }, isPassive: true }
          addSourceFromTalent(sources,rank,talentData, 1, '', '', predEffect);

          const cullEffect = { onCrit: 'Cull the Herd: Knockback 1.', isPassive: true }
          addSourceFromTalent(sources,rank,talentData, 2, '', '', cullEffect);
          break;

        case 't_crack_shot':
          const zeroEffect = { requiresCrit: true }
          addSourceFromTalent(sources,rank,talentData, 2, '1d6', '', zeroEffect);

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
          const teethEffect = {
            onCrit: '1/round on a critical hit, your target must pass a SYSTEMS save or become IMPAIRED and SLOWED until the end of their next turn.',
            isPassive: true
          }
          addSourceFromTalent(sources,rank,talentData, 1, '', '', teethEffect);

          const exposeEffect = {
            onCrit: 'When you consume LOCK ON as part of an attack with a NEXUS or DRONE and perform a critical hit, your target becomes SHREDDED until the start of your next turn.',
            requiresLockon: true,
            isPassive: true
          }
          addSourceFromTalent(sources,rank,talentData, 2, '', '', exposeEffect);

          const tidalEffect = {
            onCrit:
              '1/round, when you perform a critical hit with a NEXUS, your target must succeed on a SYSTEMS save or you may choose an additional effect for your attack that lasts until the end of their next turn:<br>' +
              '- HARRYING SWARM: They become IMPAIRED and SLOWED.<br>' +
              '- BLINDING SWARM: They only have line of sight to adjacent squares.<br>'+
              '- VIRULENT SWARM: They become SHREDDED. Any adjacent characters of your choice must also make a SYSTEMS save or become SHREDDED.' +
              '- RESTRICTING SWARM: They take 1 burn each time they take an action or reaction.',
            isPassive: true
          }
          addSourceFromTalent(sources,rank,talentData, 3, '', '', tidalEffect);
          break;

        case 't_duelist':
          const blademasterEffect = { onHit: '1/round, when you hit with a MAIN MELEE weapon, you gain 1 BLADEMASTER DIE.' }
          addSourceFromTalent(sources,rank,talentData, 2, '', '', blademasterEffect);

          // const unstoppableEffect = { onHit: '1/round, when you hit with a melee attack on your turn, you may spend a BLADEMASTER DIE to immediately GRAPPLE or RAM your target as a free action after the attack has been resolved.' }
          // addSourceFromTalent(sources,rank,talentData, 3, '', '', unstoppableEffect);
          break;

        case 't_executioner':
          const cleaveEffect = { onCrit: 'Deal 3 Kinetic damage to all characters and objects of your choice within THREAT, other than the one you just attacked.' }
          addSourceFromTalent(sources,rank,talentData, 2, '', '', cleaveEffect);

          const escapeEffect = { onMiss: '1/round, when you miss with a melee attack, you reroll it against a different target within THREAT and line of sight.' }
          addSourceFromTalent(sources,rank,talentData, 3, '', '', escapeEffect);
          break;

        case 't_gunslinger':
          const heartEffect = { onHit: 'I Kill With My Heart: Armor Piercing (AP).' }
          addSourceFromTalent(sources,rank,talentData, 3, '2d6', '', heartEffect);
          break;

        case 't_hacker':
          const snowCrashEffect = {
            onHit: 'SNOW_CRASH: Your target must choose to either take 2 Heat or be pushed 3 spaces in a direction of your choice.',
            requiresLockon: true,
            isPassive: true
          }
          addSourceFromTalent(sources,rank,talentData, 1, '', '', snowCrashEffect);
          break;

        case 't_heavy_gunner':
          const gunnerSynergies = [{
            "locations": ["weapon"],
            "weapon_types": ["Rifle","Cannon","Launcher","CQB","Nexus"],
            "weapon_sizes": ["Heavy"],
          }]

          const coveringEffect = { damageModifiers: { half: true }, synergies: gunnerSynergies }
          addSourceFromTalent(sources,rank,talentData, 1, '', '', coveringEffect);
          const hammerEffect = { onHit: 'Your target is IMMOBILIZED until the end of their next turn.', synergies: gunnerSynergies }
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

        case 't_juggernaut':
          const juggSynergies = [{
            "locations": ["ram"],
          }]

          const momentumEffect = { onHit: 'Juggernaut: Knockback 2.', synergies: juggSynergies }
          addSourceFromTalent(sources,rank,talentData, 1, '', '', momentumEffect);

          const kineticEffect1 = {
            onHit: '1/round, if you Ram a target into a space occupied by another character, the other character must succeed on a Hull save or be knocked Prone.',
            synergies: juggSynergies
          }
          sources.push( newSource('Mass Transfer: Character', 't_juggernaut_2_character', '', '', newTalentTrait(talentData,2,kineticEffect1)) );

          const kineticEffect2 = {
            onHit: '1/round, if you Ram a target into an obstruction large enough to stop their movement, your target takes 1d6 kinetic damage.',
            synergies: juggSynergies
          }
          sources.push( newSource('Mass Transfer: Obstruction', 't_juggernaut_2_obstruction', '1d6', 'Kinetic', newTalentTrait(talentData,2,kineticEffect2)) );
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
          const lockEffect = { onAttack: 'Before or after you SKIRMISH, you may move 2 spaces. This movement ignores engagement and doesn’t provoke reactions.' }
          addSourceFromTalent(sources,rank,talentData, 2, '', '', lockEffect);
          break;

        case 't_stormbringer':
          const delugeEffect = {
            onHit: '1/round, when you successfully attack with a LAUNCHER and consume LOCK ON, you may also knock your target PRONE.',
            requiresLockon: true,
            defaultActive: true,
          }
          addSourceFromTalent(sources,rank,talentData, 1, '', '', delugeEffect);

          const lightningEffect = { onHit: 'LIGHTNING: You fire a concentrated blast of missiles at that character. They must succeed on a HULL save or be knocked away from you by 3 spaces; the force of firing then knocks you back by 3 spaces, away from the direction of fire.' }
          addSourceFromTalent(sources,rank,talentData, 2, '', '', lightningEffect, 't_stormbringer_2_lightning', 'Lightning');

          const thunderEffect = { onHit: 'THUNDER: You fire a spray of missiles at a Burst 2 area around that target. Characters in the area must succeed on an AGILITY save or be knocked back by 1 space, away from the target. The primary target is unaffected.' }
          addSourceFromTalent(sources,rank,talentData, 2, '', '', thunderEffect, 't_stormbringer_2_thunder', 'Thunder');
          break;

        case 't_walking_armory':
          // The json doesn't include synergies because it's a separate system, but you and I, we know the score.
          // let walkingTalentData = {...talentData}
          // walkingTalentData.synergies = [{
          //   "locations": ["weapon"],
          //   "weapon_types": ["Rifle","Cannon","Launcher","CQB","Nexus"],
          //   "weapon_sizes": ["Main"],
          // }]

          const synergies = [{
            "locations": ["weapon"],
            "weapon_types": ["Rifle","Cannon","Launcher","CQB","Nexus"],
            "weapon_sizes": ["Main"],
          }]

          if (rank >= 1) {
            const thumperEffect = {onHit: 'THUMPER: Knockback 1', description: 'The attack gains Knockback 1 and deals Explosive damage.', synergies}
            sources.push( newSource('THUMPER', 't_walking_armory_1_thumper', '', 'Explosive', newTalentTrait(talentData,1,thumperEffect)) );

            const shockString = 'Choose one character targeted by your attack; adjacent characters take 1 Energy AP, whether the attack is a hit or miss.'
            const shockEffect = {onAttack: 'SHOCK: '+shockString, description: 'The attack deals Energy damage. '+shockString, synergies}
            sources.push( newSource('SHOCK', 't_walking_armory_1_shock', '', 'Energy', newTalentTrait(talentData,1,shockEffect)) );

            const magEffect = {onAttack: 'MAG: Arcing.', description: 'The attack gains Arcing and deals Kinetic damage.', synergies}
            sources.push( newSource('MAG', 't_walking_armory_1_mag', '', 'Kinetic', newTalentTrait(talentData,1,magEffect)) );
          }
          if (rank >= 2) {
            const hellEffect = { damageModifiers: { bonusToBurn: true }, description: 'The attack deals Energy damage and deals any bonus damage as Burn.', synergies}
            sources.push( newSource('HELLFIRE', 't_walking_armory_2_hellfire', '', 'Energy', newTalentTrait(talentData,2,hellEffect)) );

            const jagerString = 'Knockback 2, one character hit by the attack – your choice – must succeed on a HULL save or be knocked PRONE.'
            const jagerEffect = {onHit: 'JAGER: '+jagerString, description: 'The attack gains Knockback 2, deals Explosive damage, and one character hit by the attack – your choice – must succeed on a Hull save or be knocked Prone', synergies}
            sources.push( newSource('JAGER', 't_walking_armory_2_jager', '', 'Explosive', newTalentTrait(talentData,2,jagerEffect)) );

            const sabotEffect = {onHit: 'SABOT: Armor Piercing.', description: 'The attack gains AP and deals Kinetic damage.', synergies}
            sources.push( newSource('SABOT', 't_walking_armory_2_sabot', '', 'Explosive', newTalentTrait(talentData,2,sabotEffect)) );
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

//  ============================================    MODS ARE ASLEEP    =================================================

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
        sources.push( newSource(modData.name, modData.id, modData.added_damage[0].val, modData.added_damage[0].type, newStandardTrait(modData, thermalEffect)) );
        break;

      case 'wm_uncle_class_comp_con':
        // TWO DIFFICULTY
        const uncleEffect = { isPassive: true }
        sources.push( newSource(modData.name, modData.id, '', '', newStandardTrait(modData, uncleEffect)) );
        break;

      case 'wm_shock_wreath':
        const shockEffect = { onHit: 'If target already is suffering from burn, it can additionally only draw line of sight to adjacent spaces until the end of its next turn.' }
        sources.push( newSource(modData.name, modData.id, '1d6', 'Burn', newStandardTrait(modData, shockEffect)) );
        break;

      // case 'wm_stabilizer_mod':
        // +5 range and the Ordnance tag

      // case 'wm_nanocomposite_adaptation':
        // Smart and Seeking

      case 'wm_phase_ready_mod':
        // No line of sight needed, but counts as invisible
        const phaseEffect = { isPassive: true }
        sources.push( newSource(modData.name, modData.id, '', '', newStandardTrait(modData, phaseEffect)) );
        break;

      case 'wm_paracausal_mod':
        // Overkill, and its damage can’t be reduced in any way. No toggleable effect.
        const paraEffect = { isPassive: true }
        sources.push( newSource(modData.name, modData.id, '', '', newStandardTrait(modData, paraEffect)) );
        break;

      // wm_thermal_charge
      default:
        if (modData.added_damage) {
          modData.added_damage.forEach(addedDamage =>
            sources.push( newSource(modData.name, modData.id, addedDamage.val, addedDamage.type, newStandardTrait(modData)) )
          );
        } else {
          sources.push( newSource(modData.name, modData.id, '', '', newStandardTrait(modData)) )
        }

      break;
    }
  }

  // console.log('mod sources:', sources);

  return sources;
}

//  =======================================    SYSTEMS (PC MECHS)  =================================================

function getBonusDamageSourcesFromSystems(systems, currentHeat, activeWeapon) {
  var sources = [];
  if (!systems) return sources;

  systems.forEach(system => {
    const systemData = findSystemData(system.id);
    if (systemData) {
      switch (systemData.id) {
        case 'ms_siege_ram':
          const siegeSynergies = [{
            "locations": ["ram"],
          }]
          const siegeEffect = { synergies: siegeSynergies, defaultEnabled: true }
          sources.push( newSource(systemData.name, systemData.id, '2', 'Kinetic', newStandardTrait(systemData, siegeEffect)) )
          break;

        case 'ms_roland_chamber':
          // is the current weapon loading?
          if (activeWeapon) {
            const activeWeaponData = getModdedWeaponData(activeWeapon)
            const loadingTag = findTagOnData(activeWeaponData, 'tg_loading')
            if (loadingTag) {
              const defaultDamageType = getDefaultWeaponDamageType(activeWeaponData)
              sources.push( newSource(systemData.name, systemData.id, '1d6', defaultDamageType, newStandardTrait(systemData)) )
            }
          }
          break;

        case 'ms_lucifer_class_nhp':
          // does the current weapon deal energy damage?
          if (activeWeapon && currentHeat > 0) {
            const activeWeaponData = getModdedWeaponData(activeWeapon)
            if (dealsDamageType(activeWeaponData, 'energy')) {
              sources.push( newSource(systemData.name, systemData.id, currentHeat, 'Energy', newStandardTrait(systemData)) )
            }
          }
          break;

        default:
          // sources.push( newSource(systemData.name, systemData.id, '', '', newStandardTrait(modData)) )
          break;
      }
    }
  })

  // console.log('system sources:', sources);

  return sources;
}



//  ============================================    CORE BONUSeS    =================================================

function getBonusDamageSourcesFromCoreBonuses(activeMount) {
  var sources = [];
  if (!activeMount) return sources;

  activeMount.bonus_effects.forEach(coreBonusID => {
    const coreBonusData = findCoreBonusData(coreBonusID);

    if (coreBonusData) {
      switch (coreBonusID) {
        case 'cb_overpower_caliber':
          sources.push( newSource(coreBonusData.name, coreBonusData.id, '1d6', '', {...blankTrait, ...coreBonusData}) );
          break;

        default:
          break;
      }
    }
  })

  // all all ids to the sources' trait
  sources.forEach(source => {
    if (source.trait) source.trait.id = source.id
  });

  // console.log('cb sources', sources);

  return sources;
}

//  ============================================    WEAPONS    =======================================================

// Honestly, people can just add stuff manually using the generic dice. The on hit // effects will prompt them to.
function getBonusDamageSourcesFromWeapons(activeWeapon) {
  var sources = [];
  if (!activeWeapon) return sources;

  const weaponData = getModdedWeaponData(activeWeapon);

  // console.log('mountedWeaponData',mountedWeaponData);
  // console.log('weaponData',weaponData);

  if (weaponData) {
    switch (weaponData.id) {
      case 'mw_variable_sword':
        const variableEffect = {requiresCrit: true, isPassive: true }
        sources.push( newSource('Variable Sword', 'mw_variable_sword', '1d6', 'Kinetic', newStandardTrait(weaponData, variableEffect)) )
        break;

      case 'mw_combat_drill':
        const drillEffect = { damageModifiers: { overkillBonusDamage: true } }
        sources.push( newSource('+1d6 Per overkill', 'mw_combat_drill', '', '', newStandardTrait(weaponData, drillEffect)) );
        break;

      default: break;
    }
  }

  return sources;
}


//  =======================================    ITEMS (NPC TRAITS)  =================================================

function getBonusDamageSourcesFromNpcFeatures(npcFeatures, activeWeapon) {
  var sources = [];
  if (!npcFeatures) return sources;


  const activeWeaponData = activeWeapon ? findNpcFeatureData(activeWeapon.id) : null
  const defaultDamageType = getDefaultWeaponDamageType(activeWeaponData)
  const meleeSynergies = [{
    "locations": ["weapon"],
    "weapon_types": ["Melee"],
  }]

  npcFeatures.forEach(item => {
    const featureData = findNpcFeatureData(item.itemID);
    if (featureData) {
      switch (featureData.id) {
        case 'npcf_hunt_specter':
          const huntEffect = { synergies: meleeSynergies }
          sources.push( newSource(featureData.name, featureData.id, '5', defaultDamageType, newStandardTrait(featureData, huntEffect)) )
          break;

        case 'npcf_deadly_veteran':
        case 'npcf_deadly_pirate':
        case 'npcf_deadly_ultra':
          const deadlyEffect = {
            requiresCrit: true,
            onCrit: featureData.effect,
            defaultEnabled: true,
          }
          sources.push( newSource(featureData.name, featureData.id, '1d6', defaultDamageType, newStandardTrait(featureData, deadlyEffect)) )
          break;

        case 'npcf_extra_deadly_ultra':
          break

        default:
          // sources.push( newSource(systemData.name, systemData.id, '', '', newStandardTrait(modData)) )
          break;
      }
    }
  })

  // console.log('npc feature sources:', sources);

  return sources;
}
