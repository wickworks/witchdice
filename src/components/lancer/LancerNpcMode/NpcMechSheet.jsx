import React from 'react';
import MechSheet from '../MechSheet/MechSheet.jsx';

import { capitalize } from '../../../utils.js';
import { getCountersFromPilot } from '../MechState/mechStateUtils.js';
import { isNpcFeatureTechAttack } from '../MechSheet/MechMount.jsx';
import {getAllTemplateIds} from '../lancerData.js';

import {
  getStat,
  getMarkerFromFingerprint,
  getNpcSkillCheckAccuracy,
  setNumbersByTier,
  getActivationType,
  getEffectText,
} from './npcUtils.js';

import {
  findNpcClassData,
  findNpcFeatureData,
  findNpcTemplateData,
  getNpcName,
  baselineMount,
  getSystemRecharge,
  getSystemLimited,
  getSystemPerRoundCount,
  getSelfHeat,
  getUsesPerRound,
  hasTag,
} from '../lancerData.js';
import { act } from 'react';

const NpcMechSheet = ({
  activeNpc,

  setTriggerRerender,
  triggerRerender,

  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
  setDistantDicebagData,

  updateNpcState
}) => {
  const npcClassData = findNpcClassData(activeNpc.class)

  // console.log('activeNpc',activeNpc);
  // console.log('npcClassData',npcClassData);

  const robotState = {
    overshield: activeNpc.overshield,
    hp: activeNpc.combat_data.stats.current.hp,
    heat: activeNpc.combat_data.stats.current.heat,
    burn: activeNpc.burn,
    overcharge: -1,
    corePower: -1,
    repairs: 0,
    structure: activeNpc.combat_data.stats.current.structure,
    stress: activeNpc.combat_data.stats.current.stress,

    conditions: activeNpc.conditions,
    counters: getCountersFromPilot(activeNpc),

    hasIntactCustomPaintJob: false,
  }

  const robotStats = {
    hull: getStat('hull', activeNpc),
    hullAccuracy: getNpcSkillCheckAccuracy('hull', activeNpc),
    engineering: getStat('eng', activeNpc),
    engineeringAccuracy: getNpcSkillCheckAccuracy('engineering', activeNpc),
    agility: getStat('agi', activeNpc),
    agilityAccuracy: getNpcSkillCheckAccuracy('agility', activeNpc),
    systems: getStat('sys', activeNpc),
    systemsAccuracy: getNpcSkillCheckAccuracy('systems', activeNpc),

    maxHP: getStat('hp', activeNpc),
    maxHeat: getStat('heatcap', activeNpc), // not "heat", apparently
    maxRepairCap: 0,
    maxStructure: getStat('structure', activeNpc),
    maxStress: getStat('stress', activeNpc),

    size: getStat('sizes', activeNpc),
    armor: getStat('armor', activeNpc),
    evasion: getStat('evasion', activeNpc),
    moveSpeed: getStat('speed', activeNpc),
    eDef: getStat('edef', activeNpc),
    saveTarget: getStat('saveTarget', activeNpc),
    sensorRange: getStat('sensorRange', activeNpc),
    techAttackBonus: getStat('sys', activeNpc),
    limitedBonus: 0,
    rangeSynergies: [],

    attackBonus: 0,
    attackBonusRanged: 0,
  }

  const robotInfo = {
    name: `${getNpcName(activeNpc)}〔${getMarkerFromFingerprint(activeNpc.fingerprint)}〕`,
    id: activeNpc.id,
    cloud_portrait: activeNpc.cloud_portrait,
    hasMultipleLoadouts: false,
    frameID: activeNpc.class.id,
    frameSourceIcon: npcClassData.role.toLowerCase(),
    frameSourceText:
      (activeNpc.tier ? `Tier ${activeNpc.tier} ` : '') +
      getAllTemplateIds(activeNpc).map(templateID =>
        capitalize(findNpcTemplateData(templateID).name.toLowerCase())
      ).join(' '),
    frameName: npcClassData.name.toLowerCase(),
  }

  const robotLoadout = {
    frameTraits: getNpcTraits(activeNpc.features, activeNpc.per_round_uses, activeNpc.tier),
    systems: getSystemTraits(activeNpc.features, activeNpc.per_round_uses, activeNpc.tier),
    pilotTraits: [],
    mounts: [...getNpcWeaponAttacks(activeNpc.features, activeNpc.tier), baselineMount],
    invades: getNpcTechAttacks(activeNpc.features, activeNpc.tier),
  }


  // anything the weapon roller setup will need to determine available sources of accuracy/difficulty
  const accuracyAndDamageSourceInputs = {
    frameID: activeNpc.class,
    mechSystems: [],
    npcFeatures: activeNpc.features,
    pilotTalents: [],
    isImpaired: false,
    currentHeat: robotState.heat, // may replace this with the rest of state if we ever need it
  }

  // =============== MECH STATE ==================



  return (
    <MechSheet
      robotState={robotState}
      robotStats={robotStats}
      robotInfo={robotInfo}
      robotLoadout={robotLoadout}
      updateMechState={updateNpcState}

      accuracyAndDamageSourceInputs={accuracyAndDamageSourceInputs}

      setPartyLastAttackKey={setPartyLastAttackKey}
      setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
      setRollSummaryData={setRollSummaryData}
      setDistantDicebagData={setDistantDicebagData}
    />
  );
}


function getNpcTraits(features, perRoundState, tier) {
  let featureTraits = []

  features.forEach((feature, featureIndex) => {
    const featureData = findNpcFeatureData(feature)
    const recharge = getSystemRecharge(feature, featureData)
    const limited = getSystemLimited(feature, featureData)
    const perRoundCount = getSystemPerRoundCount(featureData, perRoundState, `${feature.id}-${featureIndex}`)

    if (featureData.type === 'Trait') {
      featureTraits.push({
        systemIndex: featureIndex,
        name: (featureData.flavorName || featureData.name).toLowerCase(),
        activation: getActivationType(featureData),
        description: getEffectText(featureData, tier),
        frequency: getUsesPerRound(featureData),
        isDestructable: false, // traits aren't destructable; only systems are
        isDestroyed: false,
        isTitleCase: true,
        recharge: recharge,
        limited: limited,
        perRoundCount: perRoundCount,
      })
    }
  })

  return featureTraits
}

function getSystemTraits(features, perRoundState, tier) {
  let featureTraits = []


  features.forEach((feature, featureIndex) => {
    const featureData = findNpcFeatureData(feature)
    const recharge = getSystemRecharge(feature, featureData)
    const limited = getSystemLimited(feature, featureData)
    const perRoundCount = getSystemPerRoundCount(featureData, perRoundState, `${feature.id}-${featureIndex}`)
    const selfHeat = getSelfHeat(featureData)

    if (featureData.type === 'Tech' && !isNpcFeatureTechAttack(featureData)) {
      featureTraits.push({
        systemIndex: featureIndex,
        name: (featureData.flavorName || featureData.name).toLowerCase(),
        activation: `${featureData.tech_type || 'Quick'} Tech`,
        trigger: featureData.trigger,
        description: getEffectText(featureData, tier),
        frequency: getUsesPerRound(featureData),
        range: featureData.range,
        selfHeat: selfHeat,
        isDestructable: !hasTag(featureData, 'tg_indestructible'),
        isDestroyed: featureData.destroyed,
        isTitleCase: true,
        recharge: recharge,
        limited: limited,
        perRoundCount: perRoundCount,
      })

    } else if (['System', 'Reaction'].includes(featureData.type)) {
      featureTraits.push({
        systemIndex: featureIndex,
        name: (featureData.flavorName || featureData.name).toLowerCase(),
        activation: getActivationType(featureData),
        trigger: featureData.trigger,
        description: getEffectText(featureData, tier),
        frequency: getUsesPerRound(featureData),
        range: featureData.range,
        selfHeat: selfHeat,
        isDestructable: !hasTag(featureData, 'tg_indestructible'),
        isDestroyed: featureData.destroyed,
        isTitleCase: true,
        recharge: recharge,
        limited: limited,
        perRoundCount: perRoundCount,
      })
    }
  })

  return featureTraits
}

function getNpcWeaponAttacks(features, tier) {
  let weaponAttacks = []

  features.forEach((feature, featureIndex) => {
    const featureData = findNpcFeatureData(feature)

    if (featureData.type === 'Weapon') {
      const attackBonus = featureData.attack_bonus ? featureData.attack_bonus[tier-1] : 0
      const accuracyBonus = featureData.accuracy


      // make a fascimile of player mounts
      weaponAttacks.push({
        mount_type: featureData.weapon_type,
        lock: false,
        slots: [
          {
             size: featureData.weapon_type,
             weapon: {
                id: feature.id,
                data: featureData, // pack in the NPC data to the fascimile PC mount
                destroyed: feature.destroyed,
                cascading: false,
                loaded: feature.loaded || false,
                note: getEffectText(featureData, tier),
                mod: null,
                customDamageType: null,
                maxUseOverride: 0,
                uses: 0,
                selectedProfile: 0,
                flavorName: featureData.flavorName,

                npcTier: tier,
                npcAttackBonus: attackBonus,
                npcAccuracyBonus: accuracyBonus,
             }
          }
        ],
        extra: [],
        bonus_effects: [],
        source: 'features',
        index: featureIndex
      })
    }

  })

  return weaponAttacks
}

function getNpcTechAttacks(features, tier) {
  let techAttacks = []

  features.forEach((feature, featureIndex) => {
    const featureData = findNpcFeatureData(feature)

    if (featureData.type === 'Tech' && isNpcFeatureTechAttack(featureData)) {
      const naturalAttackBonus = ('attack_bonus' in featureData) ? featureData.attack_bonus[tier-1] : 0
      const naturalAttackAccuracy = ('accuracy' in featureData) ? featureData.accuracy[tier-1] : 0

      // const effectWithoutFirstSentence = featureData.effect.slice(featureData.effect.indexOf('.') + 1)
      techAttacks.push({
        name: featureData.name,
        activation: featureData.tech_type ? `${featureData.tech_type} Tech` : "Quick Tech",
        detail: getEffectText(featureData, tier),
        recharge: getSystemRecharge(feature, featureData),
        systemIndex: featureIndex,
        attack_bonus: naturalAttackBonus,
        accuracy: naturalAttackAccuracy,
      })
    }

  })

  techAttacks.push({
    name: "Fragment Signal",
    activation: "Invade",
    detail: "Target player takes 2 Heat and is Impaired until the end of their next turn.",
  })

  return techAttacks
}

export default NpcMechSheet;
