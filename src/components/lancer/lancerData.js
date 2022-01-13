import { getIDFromStorageName } from '../../localstorage.js';

import { loadLcpData, LCP_PREFIX, STORAGE_ID_LENGTH } from './lancerLocalStorage.js';

const data = require('lancer-data');
const allActions = data.actions;
const allWeapons = data.weapons;
const allSkills = data.skills;
const allTags = data.tags;
const allFrames = data.frames;
const allTalents = data.talents;
const allCoreBonuses = data.core_bonuses;
const allSystems = data.systems;
const allMods = data.mods;
export const allStatuses = data.statuses;

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

export const OVERCHARGE_SEQUENCE = ['1','1d3','1d6','1d6+4']

// these should probably get rolled into damageModifiers system
export const FIRST_ROLL_ONLY_TAGS = ['t_nuclear_cavalier', 't_nuclear_cavalier']

export const BASIC_DAMAGE_TYPES = ['Kinetic', 'Explosive', 'Energy', 'Variable']

export const LANCER_DAMAGE_TYPES = [
  ...BASIC_DAMAGE_TYPES,
  'Burn',
  'Heat',
]

export const DAMAGE_MODIFIERS = {
  double: false,
  half: false,
  average: false,
  bonusToBurn: false,
  maximized: false, // Only used by the brutal talent & works on nat 20s
}

export function applyDamageMultiplier(damage, damageType, damageModifiers) {
  var multiplier = 1.0;
  if (damageModifiers.double && BASIC_DAMAGE_TYPES.includes(damageType)) multiplier *= 2.0;
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
  return String(dieType).includes('-')
}

export const findTagData = (tagID) => {
  const tagData = allTags.find(tag => tag.id === tagID);
  return tagData;
}

export const findTagOnWeapon = (weaponData, tagID) => {
  if (weaponData.tags) {
    const weaponTag = weaponData.tags.find(weapontag => weapontag.id === tagID);
    return weaponTag;
  }
  return null;
}

export const getTagName = (tag) => {
  const tagData = findTagData(tag.id)

  if (tagData) {
    const tagVal = tag.val || 0;
    const tagString = tagData.name.replace('{VAL}', tagVal)
    return tagString;

  } else {
    return tag.id
  }
}

// Gets the type of damage dealt by the weapon, or Variable if multiple or none.
export const defaultWeaponDamageType = (weaponData) => {

  var damageType = '';
  if (weaponData.damage) {
    weaponData.damage.forEach(damageValAndType => {
      // is this one of the types that bonus damage can normally become?
      if (BASIC_DAMAGE_TYPES.includes(damageValAndType.type)) {
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


var loadedLcpData = {};
function findGameDataFromLcp(gameDataType, gameDataID) {
  var lcpGameData;

  // First, load up any LCPs from localstorage that we haven't gotten yet
  for ( var i = 0, len = localStorage.length; i < len; ++i ) {
    const key = localStorage.key(i);
    if (key.startsWith(`${LCP_PREFIX}-`)) {
      const lcpID = getIDFromStorageName(LCP_PREFIX, key, STORAGE_ID_LENGTH);
      if (!loadedLcpData[lcpID]) {
        const lcpData = loadLcpData(lcpID);
        loadedLcpData[lcpID] = lcpData;
      }
    }
  }

  // Then look through the loaded lcp content
  Object.keys(loadedLcpData).forEach(lcpID => {
    const lcpAllDataForDataType = loadedLcpData[lcpID].data[gameDataType];
    if (lcpAllDataForDataType) lcpGameData = lcpAllDataForDataType.find(gamedata => gamedata.id === gameDataID) || lcpGameData;
  });

  return lcpGameData;
}

export const findFrameData = (frameID) => {
  var frameData = allFrames.find(frame => frame.id === frameID);
  if (!frameData) frameData = findGameDataFromLcp('frames', frameID)
  return frameData ? frameData : findFrameData('missing_frame');
}

export const findWeaponData = (weaponID) => {
  var weaponData = allWeapons.find(weapon => weapon.id === weaponID);
  if (!weaponData) weaponData = findGameDataFromLcp('weapons', weaponID)
  return weaponData ? weaponData : findWeaponData('missing_mechweapon');
}

export const findTalentData = (talentID) => {
  var talentData = allTalents.find(talent => talent.id === talentID);
  if (!talentData) talentData = findGameDataFromLcp('talents', talentID)
  return talentData ? talentData : blankTalent;
}

export const findSkillData = (skillID) => {
  var skillData = allSkills.find(skill => skill.id === skillID);
  if (!skillData) skillData = findGameDataFromLcp('skills', skillID)
  return skillData ? skillData : blankSkill;
}

export const findCoreBonusData = (coreBonusID) => {
  var coreBonusData = allCoreBonuses.find(coreBonus => coreBonus.id === coreBonusID);
  if (!coreBonusData) coreBonusData = findGameDataFromLcp('core_bonuses', coreBonusID)
  return coreBonusData ? coreBonusData : findWeaponData('missing_corebonus');
}

export const findSystemData = (systemID) => {
  var systemData = allSystems.find(system => system.id === systemID);
  if (!systemData) systemData = findGameDataFromLcp('systems', systemID)
  return systemData ? systemData : findWeaponData('missing_mechsystem');
}

export const findModData = (modID) => {
  var modData = allMods.find(mod => mod.id === modID);
  if (!modData) modData = findGameDataFromLcp('mods', modID)
  return modData ? modData : findModData('missing_weaponmod');
}

export const findStatusData = (statusName) => {
  var statusData = allStatuses.find(status => status.name === statusName);
  // if (!statusData) statusData = findGameDataFromLcp('statuses', statusName) // new lcps can't really add new statuses
  return statusData ? statusData : blankStatus;
}


export const findActionData = (actionID) => {
  var actionData = allActions.find(action => action.id === actionID);
  // if (!actionData) actionData = findGameDataFromLcp('actiones', actionName) // new lcps can't really add new actions
  return actionData ? actionData : blankAction;
}
