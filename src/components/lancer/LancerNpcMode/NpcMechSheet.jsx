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
  getActivationType
} from './npcUtils.js';

import {
  findNpcClassData,
  findNpcFeatureData,
  findNpcTemplateData,
  baselineMount,
  getSystemRecharge,
  systemHasTag,
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
    frameTraits: getNpcTraits(activeNpc.items),
    systems: getSystemTraits(activeNpc.items),
    pilotTalents: [],
    mounts: [...getNpcWeaponAttacks(activeNpc.items), baselineMount],
    invades: getNpcTechAttacks(activeNpc.items),
  }


  // anything the weapon roller setup will need to determine available sources of accuracy/difficulty
  const accuracyAndDamageSourceInputs = {
    frameID: activeNpc.class,
    mechSystems: [],
    pilotTalents: [],
    isImpaired: false,
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


function getNpcTraits(items) {
  let featureTraits = []

  items.forEach((item, itemIndex) => {
    const featureData = findNpcFeatureData(item.itemID)
    let recharge = getSystemRecharge(item, featureData)

    if (featureData.type === 'Trait') {
      featureTraits.push({
        systemIndex: itemIndex,
        name: (item.flavorName || featureData.name).toLowerCase(),
        activation: getActivationType(featureData),
        description: setNumbersByTier([item.flavorName, featureData.effect].filter(str => str).join('<br>'), item.tier),
        isDestructable: false, // traits aren't destructable; only systems are
        isDestroyed: false,
        isTitleCase: true,
        recharge: recharge,
      })
    }

  })

  return featureTraits
}

function getSystemTraits(items) {
  let featureTraits = []

  items.forEach((item, itemIndex) => {
    const featureData = findNpcFeatureData(item.itemID)
    let recharge = getSystemRecharge(item, featureData)

    if (featureData.type === 'Tech' && !isNpcFeatureTechAttack(featureData)) {
      featureTraits.push({
        systemIndex: itemIndex,
        name: (item.flavorName || featureData.name).toLowerCase(),
        activation: `${item.tech_type || 'Quick'} Tech`,
        trigger: featureData.trigger,
        description: [item.flavorName, featureData.effect].filter(str => str).join('<br>'),
        frequency: featureData.frequency,
        range: featureData.range,
        isDestructable: !systemHasTag(featureData, 'tg_indestructible'),
        isDestroyed: item.destroyed,
        isTitleCase: true,
        recharge: recharge,
      })

    } else if (['System', 'Reaction'].includes(featureData.type)) {
      featureTraits.push({
        systemIndex: itemIndex,
        name: (item.flavorName || featureData.name).toLowerCase(),
        activation: getActivationType(featureData),
        trigger: featureData.trigger,
        description: setNumbersByTier([item.flavorName, featureData.effect].filter(str => str).join('<br>'), item.tier),
        frequency: featureData.frequency,
        range: featureData.range,
        isDestructable: !systemHasTag(featureData, 'tg_indestructible'),
        isDestroyed: item.destroyed,
        isTitleCase: true,
        recharge: recharge,
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

                npcTier: item.tier,
                npcAttackBonus: attackBonus,
                npcAccuracyBonus: accuracyBonus,
             }
          }
        ],
        extra: [],
        bonus_effects: [],
        source: 'npcItems'
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
      // const effectWithoutFirstSentence = featureData.effect.slice(featureData.effect.indexOf('.') + 1)
      techAttacks.push({
        "name": featureData.name,
        "activation": featureData.tech_type ? `${featureData.tech_type} Tech` : "Quick Tech",
        "detail": setNumbersByTier(featureData.effect, item.tier),
      })
    }

  })

  techAttacks.push({
    "name": "Fragment Signal",
    "activation": "Invade",
    "detail": "Target player takes 2 Heat and is Impaired until the end of their next turn.",
  })

  return techAttacks
}

export default NpcMechSheet;
