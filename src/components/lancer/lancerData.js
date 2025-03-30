import { getIDFromStorageName } from '../../localstorage.js';
import { deepCopy, capitalize, snakeToCamel } from '../../utils.js';
import { getNumberByTier } from './LancerNpcMode/npcUtils.js';
import { loadLcpData, LCP_PREFIX, STORAGE_ID_LENGTH } from './lancerLocalStorage.js';

import allStatuses from '@massif/lancer-data/lib/statuses.json';

import lancer_data from '@massif/lancer-data';
import dustgrave_data from '@massif/dustgrave-data';
import ktb_data from '@massif/ktb-data';
import long_rim_data from '@massif/long-rim-data';
import osr_data from '@massif/osr-data';
import ows_data from '@massif/ows-data';
import sotw_data from '@massif/sotw-data';
import ssmr_data from '@massif/ssmr-data';
import wallflower_data from '@massif/wallflower-data';

// converts the lcp's data array into a hash by the data's ID
function hashLcpData(lcpData) {
  //console.log('hashing LCP data ', lcpData.lcp_manifest);
  const hashedLcpData = {}
  Object.keys(lcpData).forEach(dataType => {
    if (Array.isArray(lcpData[dataType])) {
      hashedLcpData[dataType] = Object.fromEntries(lcpData[dataType].map(data => [data.id || data.name, data]))
    }
  })
  return hashedLcpData
}

const data = [
	lancer_data,
	dustgrave_data,
	ktb_data,
	long_rim_data,
	osr_data,
	ows_data,
	sotw_data,
	ssmr_data,
	wallflower_data,
].map(
  lcpData => hashLcpData(lcpData)
).reduce(
  (totalData, lcpData) => {
    return {
      actions: {...(totalData.actions) || {}, ...(lcpData.actions || {})},
      weapons: {...(totalData.weapons) || {}, ...(lcpData.weapons || {})},
      skills: {...(totalData.skills) || {}, ...(lcpData.skills || {})},
      pilot_gear: {...(totalData.pilot_gear) || {}, ...(lcpData.pilot_gear || {})},
      tags: {...(totalData.tags) || {}, ...(lcpData.tags || {})},
      frames: {...(totalData.frames) || {}, ...(lcpData.frames || {})},
      talents: {...(totalData.talents) || {}, ...(lcpData.talents || {})},
      core_bonuses: {...(totalData.core_bonuses) || {}, ...(lcpData.core_bonuses || {})},
      systems: {...(totalData.systems) || {}, ...(lcpData.systems || {})},
      mods: {...(totalData.mods) || {}, ...(lcpData.mods || {})},
      npc_classes: {...(totalData.npc_classes) || {}, ...(lcpData.npc_classes || {})},
      npc_features: {...(totalData.npc_features) || {}, ...(lcpData.npc_features || {})},
      npc_templates: {...(totalData.npc_templates) || {}, ...(lcpData.npc_templates || [])},
      bonds: {...(totalData.bonds) || {}, ...(lcpData.bonds || {})},
    }
  },
  {}
);

export const allActions = data.actions;
const allWeapons = data.weapons;
const allSkills = data.skills;
const allPilotGear = data.pilot_gear;
const allTags = data.tags;
const allFrames = data.frames;
const allTalents = data.talents;
const allCoreBonuses = data.core_bonuses;
const allSystems = data.systems;
const allMods = data.mods;
const allNpcClasses = data.npc_classes;
const allNpcFeatures = data.npc_features;
const allNpcTemplates = data.npc_templates;
export const allBonds = data.bonds;
// const allStatuses = data.statuses; // for some reason this was returning junk??

const blankTalent = {
  "id": "missing_talent",
  "name": "UNKNOWN TALENT",
  "icon": "",
  "terse": "",
  "description": "",
  "ranks": [
    {
      "name": "1",
      "description": "",
      "synergies": [],
      "actions": []
    },
    {
      "name": "2",
      "description": "",
      "synergies": []
    },
    {
      "name": "3",
      "description": "",
      "actions": []
    }
  ]
}

const blankSkill = {
  "id": "unknown_skill",
  "name": "UNKNOWN SKILL",
  "description": "",
  "detail": "",
  "family": ""
}

const blankPilotGear = {
  "id": "unknown_pilot_gear",
  "name": "UNKNOWN PILOT GEAR",
  "type": "Gear",
  "description": "",
}

const blankStatus = {
  "name": "unknown_status",
  "icon": "unknown",
  "type": "Status",
  "terse": "Unknown status.",
  "effects": "Unknown status."
}

const blankAction = {
  "id": "act_unknown",
  "name": "UNKNOWN ACTION",
  "activation": "",
  "terse": "",
  "detail": "",
}

const blankNpcClass = {
  "id": "npcc_unknown",
  "name": "UNKNOWN NPC",
  "role": "",
  "info": {"flavor": '', "tactics": ''},
  "stats": {
    "armor": [0,0,0],
    "hp": [0,0,0],
    "evade": [0,0,0],
    "edef": [0,0,0],
    "heatcap": [0,0,0],
    "speed": [0,0,0],
    "sensor": [0,0,0],
    "save": [0,0,0],
    "hull": [0,0,0],
    "agility": [0,0,0],
    "systems": [0,0,0],
    "engineering": [0,0,0],
    "size": [0,0,0],
    "activations": [0,0,0]

  },
  "base_features": [],
  "optional_features": [],
  "power": 0,
}

const blankNpcFeature = {
  "id": "npcf_unknown",
  "name": "UNKNOWN NPC SYSTEM",
  "origin": {
    "type": "Class",
    "name": "UNKNOWN NPC",
    "base": true
  },
  "locked": false,
  "type": "System",
  "effect": "",
  "tags": []
}

const blankNpcTemplate = {
  "id": "npct_unknown",
  "name": "UNKNOWN NPC TEMPLATE",
  "description": "",
  "base_features": [],
  "optional_features": [],
  "power": 0
}

const blankBond = {
  "id": "bond-unknown",
  "name": "UNKNOWN BOND",
  "major_ideals": [],
  "minor_ideals": [],
  "questions": [],
  "powers": [],
}

var loadedLcpData = {};
export function findAllGameDataFromUploadedLcp(gameDataType) {
  // First, load into memory any LCPs from localstorage that we haven't gotten yet
  for ( var i = 0, len = localStorage.length; i < len; ++i ) {
    const key = localStorage.key(i)
    if (key.startsWith(`${LCP_PREFIX}-`)) {
      const lcpID = getIDFromStorageName(LCP_PREFIX, key, STORAGE_ID_LENGTH);

      if (!loadedLcpData[lcpID]) {
        const lcp = loadLcpData(lcpID)
        const hashedLcp = {...lcp, data: hashLcpData(lcp.data)}
        loadedLcpData[lcpID] = hashedLcp
      }
    }
  }

  // then collect data from all the lcps which have data of this type
  let allGameDataOfType = {}
  Object.keys(loadedLcpData).map(lcpID =>
    loadedLcpData[lcpID].data[gameDataType]
  ).filter(
    gameData => gameData && Object.keys(gameData).length > 0
  ).forEach(gameData =>
    Object.assign(allGameDataOfType, gameData)
  )

  return allGameDataOfType;
}

export function findAllGameData(gameDataType) {
  return {...data[gameDataType], ...findAllGameDataFromUploadedLcp(snakeToCamel(gameDataType))}
}

function findGameDataFromUploadedLcp(gameDataType, gameDataID) {
  const allGameDataOfType = findAllGameDataFromUploadedLcp(gameDataType)

  // var lcpGameData
  // allGameDataOfType.forEach(gameDataOfType =>
  //   lcpGameData = gameDataOfType[gameDataID] || lcpGameData
  // )

  return allGameDataOfType[gameDataID]
}

export const findFrameData = (frameID) => {
  var frameData = allFrames[frameID]
  if (!frameData) frameData = findGameDataFromUploadedLcp('frames', frameID)
  return frameData ? frameData : findFrameData('missing_frame')
}

// unless it's player-specific things should use getModdedWeaponData instead
export const findWeaponData = (weaponID) => {
  var weaponData = allWeapons[weaponID]
  if (!weaponData) weaponData = findGameDataFromUploadedLcp('weapons', weaponID)
  if (!weaponData) weaponData = baselineWeapons.find(baselineWeapon => baselineWeapon.id === weaponID)
  return weaponData ? weaponData : findWeaponData('missing_mechweapon')
}

export const findTalentData = (talentID) => {
  var talentData = allTalents[talentID]
  if (!talentData) talentData = findGameDataFromUploadedLcp('talents', talentID)
  return talentData ? talentData : blankTalent
}

export const findSkillData = (skillID) => {
  var skillData = allSkills[skillID]
  if (!skillData) skillData = findGameDataFromUploadedLcp('skills', skillID)
  return skillData ? skillData : blankSkill
}

export const findPilotGearData = (pilotGearID) => {
  var pilotGearData = allPilotGear[pilotGearID]
  if (!pilotGearData) pilotGearData = findGameDataFromUploadedLcp('pilotGear', pilotGearID)
  return pilotGearData ? pilotGearData : blankPilotGear
}

export const findCoreBonusData = (coreBonusID) => {
  var coreBonusData = allCoreBonuses[coreBonusID]
  if (!coreBonusData) coreBonusData = findGameDataFromUploadedLcp('coreBonuses', coreBonusID)
  return coreBonusData ? coreBonusData : findWeaponData('missing_corebonus')
}

export const findSystemData = (systemID) => {
  var systemData = allSystems[systemID]
  if (!systemData) systemData = findGameDataFromUploadedLcp('systems', systemID)
  return systemData ? systemData : findWeaponData('missing_mechsystem')
}

export const findModData = (modID) => {
  var modData = allMods[modID]
  if (!modData) modData = findGameDataFromUploadedLcp('mods', modID)
  return modData ? modData : findModData('missing_weaponmod')
}

export const findStatusData = (statusName) => {
  var statusData = allStatuses.find(status => status.name.toUpperCase() === statusName.toUpperCase())
  if (!statusData) statusData = findAllGameDataFromUploadedLcp('statuses')[statusName.toUpperCase()]
  return statusData ? statusData : blankStatus
}
export const findAllStatusData = () => {
  return [...allStatuses, ...Object.values(findAllGameDataFromUploadedLcp('statuses'))]
}

export const findActionData = (actionID) => {
  var actionData = allActions[actionID]
  // if (!actionData) actionData = findGameDataFromUploadedLcp('actions', actionID) // new lcps can't really add new actions
  return actionData ? actionData : blankAction
}

export const findNpcClassData = (npcClassID) => {
  var npcClassData = allNpcClasses[npcClassID]
  if (!npcClassData) npcClassData = findGameDataFromUploadedLcp('npcClasses', npcClassID)
  return npcClassData ? npcClassData : blankNpcClass
}

export const findNpcFeatureData = (npcFeatureID) => {
  var npcFeatureData = allNpcFeatures[npcFeatureID]
  if (!npcFeatureData) npcFeatureData = findGameDataFromUploadedLcp('npcFeatures', npcFeatureID)
  return npcFeatureData ? npcFeatureData : blankNpcFeature
}

export const findNpcTemplateData = (npcTemplateID) => {
  var npcTemplateData = allNpcTemplates[npcTemplateID]
  if (!npcTemplateData) npcTemplateData = findGameDataFromUploadedLcp('npcTemplates', npcTemplateID)
  return npcTemplateData ? npcTemplateData : blankNpcTemplate
}

export const findTagData = (tagID) => {
  var tagData = allTags[tagID]
  if (!tagData) tagData = findGameDataFromUploadedLcp('tags', tagID)
  return tagData ? tagData : null
}

export const findBondData = (bondID) => {
  var bondData = allBonds[bondID]
  if (!bondData) bondData = findGameDataFromUploadedLcp('bonds', bondID)
  return bondData ? bondData : blankBond
}

export const OVERCHARGE_SEQUENCE = ['1','1d3','1d6','1d6+4']

// these should probably get rolled into damageModifiers system
export const FIRST_ROLL_ONLY_TAGS = ['t_nuclear_cavalier']

// These should have the "tech" synergy but we gotta add it ourselves
export const HARDCODED_TECH_TALENT_SYNERGIES = [{id: 't_nuclear_cavalier', rank: 1}]

// special-case systems that should get a 'used' checkbox
const EXPENDABLE_SYSTEM_IDS = ['ms_custom_paint_job', 'ms_armament_redundancy']

const BASIC_DAMAGE_TYPES = ['Kinetic', 'Explosive', 'Energy', 'Variable']

export const LANCER_DAMAGE_TYPES = [
  ...BASIC_DAMAGE_TYPES,
  'Burn',
  'Heat',
]

export function isBasicDamageType(type) {
  if (type) {
    const lowerType = type.toLowerCase()
    return BASIC_DAMAGE_TYPES.some(basicType => basicType.toLowerCase() === lowerType)
  }
  return false
}


export const DAMAGE_MODIFIERS = {
  double: false,
  half: false,
  average: false,
  bonusToBurn: false,
  maximized: false, // Only used by the brutal talent & works on nat 20s
  overkillBonusDamage: false, // Only used by combat drill; overkills set generic die count
}

export function applyDamageMultiplier(damage, damageType, damageModifiers) {
  var multiplier = 1.0;
  if (damageModifiers.double && isBasicDamageType(damageType)) multiplier *= 2.0;
  if (damageModifiers.half) multiplier *= .5;
  return damage * multiplier;
}

export const MAX_BONUS = 9; // either added or dice rolled
export const GENERIC_BONUS_SOURCE = {
  name: 'Bonus damage',
  diceString: `${MAX_BONUS}d6+${MAX_BONUS}`, // we roll the max because user might increase it post-roll
  type: '',
  id: 'generic',
}

export function getGrit(pilot) { return Math.ceil(pilot.level * .5) }

// turns '10d6+4' into {count: 10, dietype: 6, bonus: 4}
export const processDiceString = (diceString) => {
  var dice = String(diceString)

  var count = 0;
  var dietype = '';
  var bonus = 0;

  if (dice) {
    const bonusIndex = dice.indexOf('+');
    const dieIndex = dice.indexOf('d');

    // if it has neither d or +, just try to parse it as an int
    if (bonusIndex < 0 && dieIndex < 0) {
      bonus = parseInt(dice);

    } else {
      // slice off the bonus
      if (bonusIndex >= 0) {
        bonus = parseInt(dice.slice(bonusIndex+1))
        dice = dice.slice(0, bonusIndex)
      }

      // parse the die count and type
      if (dieIndex >= 0) {
        count = parseInt(dice.slice(0, dieIndex));
        dietype = parseInt(dice.slice(dieIndex+1));
      }
    }
  }

  return {count: count, dietype: dietype, bonus: bonus}
}

export function isDamageRange(dieType) {
  return String(dieType).includes('-') || String(dieType).includes('???')
}

export const findTagOnData = (data, tagID) => {
  if (data.tags) {
    return data.tags.find(weapontag => weapontag.id === tagID)
  }
  return null;
}

export const hasTag = (systemData, tagID) => {
  return !!findTagOnData(systemData, tagID)
}

export const dealsDamageType = (weaponData, checkDamageType) => {
  let itDoes = false
  if (weaponData) {
    let checkDamageArrays = []
    if (weaponData.damage) checkDamageArrays.push(weaponData.damage)
    if (weaponData.profiles) {
      weaponData.profiles.forEach(profile => {
        if (profile.damage) checkDamageArrays.push(profile.damage)
      })
    }
    checkDamageArrays.forEach(damageArray => {
      if (damageArray.some((damage) =>
        damage.type && ['variable', checkDamageType].includes(damage.type.toLowerCase())
      )) {
        itDoes = true
      }
    })
  }
  return itDoes
}

export const getSystemLimited = (system, systemData, limitedBonus = 0) => {
  const limitedTag = systemData.tags && systemData.tags.find(tag => tag.id === 'tg_limited')
  let limited = null

  if (limitedTag) {
    // if the value is a die, take the highest possible value of that. people can roll and set accordingly
    const limitedDice = processDiceString(limitedTag.val)
    const limitedMaxValue = limitedDice.count * parseInt(limitedDice.dietype || 0) + limitedDice.bonus

    limited = {
      current: system.uses || 0,
      max: limitedMaxValue + limitedBonus,
      icon: 'generic-item'
    }
  }
  return limited
}

export const getSystemRecharge = (system, systemData) => {
  const rechargeTag = systemData.tags && systemData.tags.find(tag => tag.id === 'tg_recharge')
  let recharge = null

  if (rechargeTag) {
    recharge = {
      charged: system.charged,
      rollTarget: rechargeTag.val,
    }
  }

  // aka jury-rig Custom Paint Job to have a checkbox
  if (EXPENDABLE_SYSTEM_IDS.includes(systemData.id)) {
    recharge = {
      charged: !!system.uses,
      rollTarget: 0,
    }
  }

  return recharge
}


export const getSystemPerRoundCount = (systemData, perRoundState, source) => {
  let perRound = null
  let isReaction = false

  // per-round tags
  let usesPerRound = getUsesPerRound(systemData)

  // "use" property
  if (!usesPerRound && systemData.use) {
    if (systemData.use.toLowerCase() == 'encounter') usesPerRound = '1/scene'
  }

  // systems
  if (!usesPerRound && systemData.actions) {
    systemData.actions.forEach(action => {
      if (parseInt(action.frequency) > 0) usesPerRound = action.frequency
      if (action.activation === 'Reaction') isReaction = true
    })
  }

  // talents
  if (!usesPerRound && systemData.ranks) {
    const rank = parseInt(source.slice(-1)) // HACK: RANK IS LAST CHAR
    systemData.ranks.forEach((rankData,i) => {
      if (rank > i) {
        if (rankData.actions) {
          rankData.actions.forEach(action => {

            if (parseInt(action.frequency) > 0) usesPerRound = action.frequency
            if (action.activation === 'Reaction') isReaction = true
          })
        }
        // TODO: figure out how to give each range of duelist its own per-round counter
        // if (!usesPerRound && rankData.description.toLowerCase().includes('1/round')) usesPerRound = '1/round'
      }
    });
  }

  // frame traits
  if (!usesPerRound && systemData.description) {
    if (systemData.description.toLowerCase().includes('1/round')) usesPerRound = '1/round'
    if (systemData.description.toLowerCase().includes('1/scene')) usesPerRound = '1/scene'
  }

  // core bonuses
  if (!usesPerRound && systemData.effect) {
    if (systemData.effect.toLowerCase().includes('1/round')) usesPerRound = '1/round'
  }

  // npc items
  if (!usesPerRound && systemData.type) {
    const isRecharge = systemData.tags && systemData.tags.find(tag => tag.id === 'tg_recharge')
    if (systemData.type === 'Reaction' && !isRecharge) isReaction = true
  }

  // reactions default to being once per round
  if (!usesPerRound && isReaction) usesPerRound = '1/round'

  if (usesPerRound) {
    const perRoundMaxValue = parseInt(usesPerRound.charAt(0))
    const splitInterval = usesPerRound.split('/')
    const interval = splitInterval.length <= 1 ? 'round' : splitInterval[1]
    const currentUses = (perRoundState && perRoundState[source]) || 0
    perRound = {
      current: currentUses || 0,
      max: perRoundMaxValue,
      source: source,
      interval: interval
    }
  }

  return perRound
}

export const getSelfHeat = (systemData) => {
  let selfHeat = ''
  const heatTag = findTagOnData(systemData, 'tg_heat_self')
  if (heatTag) selfHeat = getTagName(heatTag, true)
  return selfHeat
}

export const getTagName = (tag, forceCapitalize = false) => {
  const tagData = findTagData(tag.id)
  let tagString = ''

  if (tagData) {
    const tagVal = tag.val || 0;
    tagString = tagData.name.replace('{VAL}', tagVal)
  } else {
    tagString = tag.id
  }

  if (forceCapitalize) tagString = capitalize(tagString, true)
  return tagString
}

export const getUsesPerRound = (featureData) => {
  const roundTag = findTagOnData(featureData, 'tg_round')
  if (roundTag) return `${roundTag.val}/round`
  return ''
}

export function getAllWeaponRanges(weaponData) {
  if (!weaponData) return []
  return [
    weaponData.range,
    weaponData.profiles && weaponData.profiles.map(profile => profile.range)
  ].filter(range => !!range).flat(2)
}

export function getModdedWeaponData(weapon) {
  if (!weapon) return null
  let weaponData

  // Baseline ram / improvise / grapple
  if (weapon.id.startsWith('act_')) {
    weaponData = deepCopy(baselineWeapons.find(baseline => baseline.id === weapon.id))

  // NPC weapons
  } else if (weapon.id.toLowerCase().includes('npcf_') || weapon.id.toLowerCase().includes('npc_')) {
    let featureData = findNpcFeatureData(weapon.id)
    weaponData = deepCopy(featureData)

    // select the correct tier of damage
    // (npcs only ever have one kind of damage)
    weaponData.damage && weaponData.damage.forEach(damageObject => {
      damageObject.val = damageObject.damage[weapon.npcTier-1]
    });

    // modify any tag values by tier
    weaponData.tags && weaponData.tags.forEach(tagObject => {
      if ('val' in tagObject) {
        tagObject.val = getNumberByTier(tagObject.val, weapon.npcTier)
      }
    });

    // split up eg "Main Cannon" into "Main" and "Cannon"
    if (weaponData.weapon_type) {
      [weaponData.mount, weaponData.type] = weaponData.weapon_type.split(' ')
    }

    // Say what the effect will be ahead of time.
    weaponData.effect = [weaponData.effect, weaponData.on_hit].filter(effect => effect).join(' ')

  // Normal weapon
  } else {
    weaponData = deepCopy( findWeaponData(weapon.id) );

    // Now we actually MODIFY the weaponData to add any tags from mods.
    // Much easier than doing it dynamically later.
    if (weapon.mod) {
      const modData = findModData(weapon.mod.id)
      if (modData.added_tags) weaponData.tags = [...(weaponData.tags || []), ...modData.added_tags]
    }
  }

  // Also mark it as, y'know, destroyed
  if (weapon.destroyed) weaponData.destroyed = true

  return weaponData;
}

// Gets the type of damage dealt by the weapon, or Variable if multiple or none.
export const getDefaultWeaponDamageType = (weaponData) => {

  var damageType = '';
  if (weaponData && weaponData.damage) {
    weaponData.damage.forEach(damageValAndType => {
      // is this one of the types that bonus damage can normally become?
      if (damageValAndType.type && isBasicDamageType(damageValAndType.type)) {
        // assign it to the first one we see
        if (damageType === '') {
          damageType = damageValAndType.type

        // if we see another type, switch it back to variable
        } else if (damageType !== damageValAndType.type) {
          damageType = 'Variable'
        }
      }
    });
  }

  return damageType || 'Variable';
}

// Get a list of ALL damage types dealt by the weapon
export const getAllWeaponDamageTypes = (weaponData) => {
  var damageTypes = [];
  if (weaponData.damage) {
    damageTypes = weaponData.damage.map(damageValAndType => damageValAndType.type)
  }
  return damageTypes;
}

export const baselineWeapons = [
  {
    id: 'act_ram',
    name: 'Ram',
    mount: 'Quick Action',
    type: 'Melee',
    damage: [],
    range: [{type: 'Threat', val: '1'}],
    effect: findActionData('act_ram').detail,
    on_hit: "Prone.<br>Knockback 1.",
  },
  {
    id: 'act_grapple',
    name: 'Grapple',
    mount: 'Quick Action',
    type: 'Melee',
    damage: [],
    range: [{type: 'Threat', val: '1'}],
    effect: findActionData('act_grapple').detail,
    on_hit: "Engaged.<br>No boosts or reactions.<br>Smaller character is immobilized.",
  },
  {
    id: 'act_improvised_attack',
    name: 'Improvised Attack',
    mount: 'Full Action',
    type: 'Melee',
    damage: [{type: 'Kinetic', val: '1d6'}],
    range: [{type: 'Threat', val: '1'}],
    effect: findActionData('act_improvised_attack').detail,
  }
]

export const baselineMount = {
  mount_type: 'Baseline',
  slots: [
    {
      size: 'Quick Action',
      weapon: { id: 'act_ram' }
    },
    {
      size: 'Quick Action',
      weapon: { id: 'act_grapple' }
    },
    {
      size: 'Full Action',
      weapon: { id: 'act_improvised_attack' }
    }
  ],
  extra: [],
  bonus_effects: []
}
