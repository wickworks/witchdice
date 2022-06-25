import { getIDFromStorageName } from '../../localstorage.js';
import { capitalize } from '../../utils.js';

import { loadLcpData, LCP_PREFIX, STORAGE_ID_LENGTH } from './lancerLocalStorage.js';

// converts the lcp's data array into a hash by the data's ID
function hashLcpData(lcpData) {
  const hashedLcpData = {}
  Object.keys(lcpData).forEach(dataType => {
    if (Array.isArray(lcpData[dataType])) {
      hashedLcpData[dataType] = Object.fromEntries(lcpData[dataType].map(data => [data.id || data.name, data]))
    }
  })
  return hashedLcpData
}

const data = hashLcpData(require('lancer-data'));
const allActions = data.actions;
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
// const allStatuses = data.statuses; // for some reason this was returning junk??
const allStatuses = require('lancer-data/lib/statuses.json')

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
export function findAllGameDataFromLcp(gameDataType) {
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

function findGameDataFromLcp(gameDataType, gameDataID) {
  const allGameDataOfType = findAllGameDataFromLcp(gameDataType)

  // var lcpGameData
  // allGameDataOfType.forEach(gameDataOfType =>
  //   lcpGameData = gameDataOfType[gameDataID] || lcpGameData
  // )

  return allGameDataOfType[gameDataID]
}

export const findFrameData = (frameID) => {
  var frameData = allFrames[frameID]
  if (!frameData) frameData = findGameDataFromLcp('frames', frameID)
  return frameData ? frameData : findFrameData('missing_frame')
}

export const findWeaponData = (weaponID) => {
  var weaponData = allWeapons[weaponID]
  if (!weaponData) weaponData = findGameDataFromLcp('weapons', weaponID)
  if (!weaponData) weaponData = baselineWeapons.find(baselineWeapon => baselineWeapon.id === weaponID)
  return weaponData ? weaponData : findWeaponData('missing_mechweapon')
}

export const findTalentData = (talentID) => {
  var talentData = allTalents[talentID]
  if (!talentData) talentData = findGameDataFromLcp('talents', talentID)
  return talentData ? talentData : blankTalent
}

export const findSkillData = (skillID) => {
  var skillData = allSkills[skillID]
  if (!skillData) skillData = findGameDataFromLcp('skills', skillID)
  return skillData ? skillData : blankSkill
}

export const findPilotGearData = (pilotGearID) => {
  var pilotGearData = allPilotGear[pilotGearID]
  if (!pilotGearData) pilotGearData = findGameDataFromLcp('pilot_gear', pilotGearID)
  return pilotGearData ? pilotGearData : blankPilotGear
}

export const findCoreBonusData = (coreBonusID) => {
  var coreBonusData = allCoreBonuses[coreBonusID]
  if (!coreBonusData) coreBonusData = findGameDataFromLcp('core_bonuses', coreBonusID)
  return coreBonusData ? coreBonusData : findWeaponData('missing_corebonus')
}

export const findSystemData = (systemID) => {
  var systemData = allSystems[systemID]
  if (!systemData) systemData = findGameDataFromLcp('systems', systemID)
  return systemData ? systemData : findWeaponData('missing_mechsystem')
}

export const findModData = (modID) => {
  var modData = allMods[modID]
  if (!modData) modData = findGameDataFromLcp('mods', modID)
  return modData ? modData : findModData('missing_weaponmod')
}

export const findAllStatusData = () => {
  return [...allStatuses, ...Object.values(findAllGameDataFromLcp('statuses'))]
}

export const findStatusData = (statusName) => {
  var statusData = allStatuses.find(status => status.name.toUpperCase() === statusName.toUpperCase())
  if (!statusData) statusData = findAllGameDataFromLcp('statuses')[statusName.toUpperCase()]
  return statusData ? statusData : blankStatus
}

export const findActionData = (actionID) => {
  var actionData = allActions[actionID]
  // if (!actionData) actionData = findGameDataFromLcp('actions', actionID) // new lcps can't really add new actions
  return actionData ? actionData : blankAction
}

export const findNpcClassData = (npcClassID) => {
  var npcClassData = allNpcClasses[npcClassID]
  if (!npcClassData) npcClassData = findGameDataFromLcp('npcClasses', npcClassID)
  return npcClassData ? npcClassData : blankNpcClass
}

export const findNpcFeatureData = (npcFeatureID) => {
  var npcFeatureData = allNpcFeatures[npcFeatureID]
  if (!npcFeatureData) npcFeatureData = findGameDataFromLcp('npcFeatures', npcFeatureID)
  return npcFeatureData ? npcFeatureData : blankNpcFeature
}

export const findNpcTemplateData = (npcTemplateID) => {
  var npcTemplateData = allNpcTemplates[npcTemplateID]
  if (!npcTemplateData) npcTemplateData = findGameDataFromLcp('npcTemplates', npcTemplateID)
  return npcTemplateData ? npcTemplateData : blankNpcTemplate
}

export const findTagData = (tagID) => {
  var tagData = allTags[tagID]
  if (!tagData) tagData = findGameDataFromLcp('tags', tagID)
  return tagData ? tagData : null
}

export const findBondData = (bondID) => {
  // no core bonds
  var bondData = findGameDataFromLcp('bonds', bondID)
  return bondData ? bondData : blankBond
}


export const OVERCHARGE_SEQUENCE = ['1','1d3','1d6','1d6+4']

// these should probably get rolled into damageModifiers system
export const FIRST_ROLL_ONLY_TAGS = ['t_nuclear_cavalier']

// These should have the "tech" synergy but we gotta add it ourselves
export const HARDCODED_TECH_TALENT_SYNERGIES = [{id: 't_nuclear_cavalier', rank: 1}]

// special-case systems that should get a 'used' checkbox
const EXPENDABLE_SYSTEM_IDS = ['ms_custom_paint_job']

const BASIC_DAMAGE_TYPES = ['Kinetic', 'Explosive', 'Energy', 'Variable']

export const LANCER_DAMAGE_TYPES = [
  ...BASIC_DAMAGE_TYPES,
  'Burn',
  'Heat',
]

export function isBasicDamageType(type) {
  const lowerType = type.toLowerCase()
  return BASIC_DAMAGE_TYPES.some(basicType => basicType.toLowerCase() === lowerType)
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

export const getSystemLimited = (system, systemData, limitedBonus) => {
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

export function getAllWeaponRanges(weaponData) {
  if (!weaponData) return []
  return [
    weaponData.range,
    weaponData.profiles && weaponData.profiles.map(profile => profile.range)
  ].filter(range => !!range).flat(2)
}

// Gets the type of damage dealt by the weapon, or Variable if multiple or none.
export const getDefaultWeaponDamageType = (weaponData) => {

  var damageType = '';
  if (weaponData && weaponData.damage) {
    weaponData.damage.forEach(damageValAndType => {
      // is this one of the types that bonus damage can normally become?
      if (isBasicDamageType(damageValAndType.type)) {
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
    on_hit: "Prone.<br>Knockback 1 (optional).",
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
