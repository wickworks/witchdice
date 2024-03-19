import React from 'react';
import MechSheet from '../MechSheet/MechSheet.jsx';

import { capitalize } from '../../../utils.js';
import { getCountersFromPilot } from '../MechState/mechStateUtils.js';
import { isNpcFeatureTechAttack } from '../MechSheet/MechMount.jsx';

import {
  getStat,
  getMarkerFromFingerprint,
  getNpcSkillCheckAccuracy,
  setNumbersByTier,
  getActivationType,
} from './npcUtils.js';

import {
  findNpcClassData,
  findNpcFeatureData,
  findNpcTemplateData,
  baselineMount,
  getSystemRecharge,
  getSystemLimited,
  getSystemPerRoundCount,
  getSelfHeat,
  getUsesPerRound,
  hasTag,
} from '../lancerData.js';

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
    hp: activeNpc.currentStats.hp,
    heat: activeNpc.currentStats.heatcap,
    burn: activeNpc.burn,
    overcharge: -1,
    coreEnergy: -1,
    repairs: 0,
    structure: activeNpc.currentStats.structure,
    stress: activeNpc.currentStats.stress,

    conditions: activeNpc.conditions,
    counters: getCountersFromPilot(activeNpc),

    hasIntactCustomPaintJob: false,
  }

  const robotStats = {
    hull: getStat('hull', activeNpc),
    hullAccuracy: getNpcSkillCheckAccuracy('hull', activeNpc),
    engineering: getStat('engineering', activeNpc),
    engineeringAccuracy: getNpcSkillCheckAccuracy('engineering', activeNpc),
    agility: getStat('agility', activeNpc),
    agilityAccuracy: getNpcSkillCheckAccuracy('agility', activeNpc),
    systems: getStat('systems', activeNpc),
    systemsAccuracy: getNpcSkillCheckAccuracy('systems', activeNpc),

    maxHP: getStat('hp', activeNpc),
    maxHeat: getStat('heatcap', activeNpc),
    maxRepairCap: 0,
    maxStructure: getStat('structure', activeNpc),
    maxStress: getStat('stress', activeNpc),

    size: getStat('size', activeNpc),
    armor: getStat('armor', activeNpc),
    evasion: getStat('evade', activeNpc),
    moveSpeed: getStat('speed', activeNpc),
    eDef: getStat('edef', activeNpc),
    saveTarget: getStat('save', activeNpc),
    sensorRange: getStat('sensor', activeNpc),
    techAttackBonus: getStat('systems', activeNpc),
    limitedBonus: 0,
    rangeSynergies: [],

    attackBonus: 0,
    attackBonusRanged: 0,
  }

  const robotInfo = {
    name: `${activeNpc.name}〔${getMarkerFromFingerprint(activeNpc.fingerprint)}〕`,
    id: activeNpc.id,
    cloud_portrait: activeNpc.cloud_portrait,
    frameID: activeNpc.class,
    frameSourceIcon: npcClassData.role.toLowerCase(),
    frameSourceText:
      (activeNpc.tier ? `Tier ${activeNpc.tier} ` : '') +
      activeNpc.templates.map(templateID =>
        capitalize(findNpcTemplateData(templateID).name.toLowerCase())
      ).join(' '),
    frameName: npcClassData.name.toLowerCase(),
  }

  const robotLoadout = {
    frameTraits: getNpcTraits(activeNpc.items, activeNpc.per_round_uses),
    systems: getSystemTraits(activeNpc.items, activeNpc.per_round_uses),
    pilotTraits: [],
    mounts: [...getNpcWeaponAttacks(activeNpc.items), baselineMount],
    invades: getNpcTechAttacks(activeNpc.items),
  }


  // anything the weapon roller setup will need to determine available sources of accuracy/difficulty
  const accuracyAndDamageSourceInputs = {
    frameID: activeNpc.class,
    mechSystems: [],
    npcFeatures: activeNpc.items,
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


function getNpcTraits(items, perRoundState) {
  let featureTraits = []

  items.forEach((item, itemIndex) => {
    const featureData = findNpcFeatureData(item.itemID)
    const recharge = getSystemRecharge(item, featureData)
    const limited = getSystemLimited(item, featureData)
    const perRoundCount = getSystemPerRoundCount(featureData, perRoundState, `${item.itemID}-${itemIndex}`)

    if (featureData.type === 'Trait') {
      featureTraits.push({
        systemIndex: itemIndex,
        name: (item.flavorName || featureData.name).toLowerCase(),
        activation: getActivationType(featureData),
        description: setNumbersByTier([item.description, featureData.effect].filter(str => str).join('<br>'), item.tier),
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

function getSystemTraits(items, perRoundState) {
  let featureTraits = []

  items.forEach((item, itemIndex) => {
    const featureData = findNpcFeatureData(item.itemID)
    const recharge = getSystemRecharge(item, featureData)
    const limited = getSystemLimited(item, featureData)
    const perRoundCount = getSystemPerRoundCount(featureData, perRoundState, `${item.itemID}-${itemIndex}`)
    const selfHeat = getSelfHeat(featureData)

    if (featureData.type === 'Tech' && !isNpcFeatureTechAttack(featureData)) {
      featureTraits.push({
        systemIndex: itemIndex,
        name: (item.flavorName || featureData.name).toLowerCase(),
        activation: `${featureData.tech_type || 'Quick'} Tech`,
        trigger: featureData.trigger,
        description: [featureData.description, featureData.effect].filter(str => str).join('<br>'),
        frequency: getUsesPerRound(featureData),
        range: featureData.range,
        selfHeat: selfHeat,
        isDestructable: !hasTag(featureData, 'tg_indestructible'),
        isDestroyed: item.destroyed,
        isTitleCase: true,
        recharge: recharge,
        limited: limited,
        perRoundCount: perRoundCount,
      })

    } else if (['System', 'Reaction'].includes(featureData.type)) {
      featureTraits.push({
        systemIndex: itemIndex,
        name: (item.flavorName || featureData.name).toLowerCase(),
        activation: getActivationType(featureData),
        trigger: featureData.trigger,
        description: setNumbersByTier([item.description, featureData.effect].filter(str => str).join('<br>'), item.tier),
        frequency: getUsesPerRound(featureData),
        range: featureData.range,
        selfHeat: selfHeat,
        isDestructable: !hasTag(featureData, 'tg_indestructible'),
        isDestroyed: item.destroyed,
        isTitleCase: true,
        recharge: recharge,
        limited: limited,
        perRoundCount: perRoundCount,
      })
    }
  })

  return featureTraits
}

function getNpcWeaponAttacks(items) {
  let weaponAttacks = []

  items.forEach((item, itemIndex) => {
    const featureData = findNpcFeatureData(item.itemID)

    if (featureData.type === 'Weapon') {
      const attackBonus = featureData.attack_bonus ? featureData.attack_bonus[item.tier-1] : 0
      const accuracyBonus = featureData.accuracy ? featureData.accuracy[item.tier-1] : 0

      // make a fascimile of player mounts
      weaponAttacks.push({
        mount_type: featureData.weapon_type,
        lock: false,
        slots: [
          {
             size: featureData.weapon_type,
             weapon: {
                id: item.itemID,
                destroyed: item.destroyed,
                cascading: false,
                loaded: item.loaded || false,
                note: setNumbersByTier(item.description),
                mod: null,
                customDamageType: null,
                maxUseOverride: 0,
                uses: 0,
                selectedProfile: 0,
                flavorName: item.flavorName,

                npcTier: item.tier,
                npcAttackBonus: attackBonus,
                npcAccuracyBonus: accuracyBonus,
             }
          }
        ],
        extra: [],
        bonus_effects: [],
        source: 'npcItems',
        index: itemIndex
      })
    }

  })

  return weaponAttacks
}

function getNpcTechAttacks(items) {
  let techAttacks = []

  items.forEach((item, itemIndex) => {
    const featureData = findNpcFeatureData(item.itemID)

    if (featureData.type === 'Tech' && isNpcFeatureTechAttack(featureData)) {
      const naturalAttackBonus = ('attack_bonus' in featureData) ? featureData.attack_bonus[item.tier-1] : 0
      const naturalAttackAccuracy = ('accuracy' in featureData) ? featureData.accuracy[item.tier-1] : 0

      // const effectWithoutFirstSentence = featureData.effect.slice(featureData.effect.indexOf('.') + 1)
      techAttacks.push({
        name: featureData.name,
        activation: featureData.tech_type ? `${featureData.tech_type} Tech` : "Quick Tech",
        detail: setNumbersByTier(featureData.effect, item.tier),
        recharge: getSystemRecharge(item, featureData),
        systemIndex: itemIndex,
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
