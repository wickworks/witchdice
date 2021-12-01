import { getIDFromStorageName } from '../../localstorage.js';

import { loadLcpData, LCP_PREFIX, STORAGE_ID_LENGTH } from './lancerLocalStorage.js';

const data = require('lancer-data');
const allWeapons = data.weapons;
const allSkills = data.skills;
const allTags = data.tags;
const allFrames = data.frames;
const allTalents = data.talents;
const allCoreBonuses = data.core_bonuses;
const allSystems = data.systems;
const allMods = data.mods;

var loadedLcpData = {};

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

// this should definitely get rolled into damageModifiers system
const BONUS_TO_BURN_TAGS = ['mf_tokugawa_dz']

// these should probably get rolled into damageModifiers system
const FIRST_ROLL_ONLY_TAGS = ['t_nuclear_cavalier', 't_nuclear_cavalier']

const BASIC_DAMAGE_TYPES = ['Kinetic', 'Explosive', 'Energy', 'Variable']

const LANCER_DAMAGE_TYPES = [
  ...BASIC_DAMAGE_TYPES,
  'Burn',
  'Heat',
]


const DAMAGE_MODIFIERS = {
  double: false,
  half: false,
  average: false,
  bonusToBurn: false,
}

function applyDamageMultiplier(damage, damageType, damageModifiers) {
  var multiplier = 1.0;
  if (damageModifiers.double && BASIC_DAMAGE_TYPES.includes(damageType)) multiplier *= 2.0;
  if (damageModifiers.half) multiplier *= .5;
  return damage * multiplier;
}

const MAX_BONUS = 9; // either added or dice rolled
const GENERIC_BONUS_SOURCE = {
  name: 'Bonus damage',
  diceString: `${MAX_BONUS}d6+${MAX_BONUS}`, // we roll the max because user might increase it post-roll
  type: '',
  id: 'generic',
}

function getGrit(pilot) { return Math.ceil(pilot.level * .5) }

// turns '10d6+4' into {count: 10, dietype: 6, bonus: 4}
const processDiceString = (diceString) => {
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

const findTagData = (tagID) => {
  const tagData = allTags.find(tag => tag.id === tagID);
  return tagData;
}

const findTagOnWeapon = (weaponData, tagID) => {
  if (weaponData.tags) {
    const weaponTag = weaponData.tags.find(weapontag => weapontag.id === tagID);
    return weaponTag;
  }
  return null;
}

const getTagName = (tag) => {
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
const defaultWeaponDamageType = (weaponData) => {

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

function findGameDataFromLcp(gameDataType, gameDataID) {
  var lcpFrameData;

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
     lcpFrameData = loadedLcpData[lcpID].data[gameDataType].find(gamedata => gamedata.id === gameDataID) || lcpFrameData;
  });

  return lcpFrameData;
}

const findFrameData = (frameID) => {
  var frameData = allFrames.find(frame => frame.id === frameID);
  if (!frameData) frameData = findGameDataFromLcp('frames', frameID)
  return frameData ? frameData : findFrameData('missing_frame');
}

const findWeaponData = (weaponID) => {
  var weaponData = allWeapons.find(weapon => weapon.id === weaponID);
  if (!weaponData) weaponData = findGameDataFromLcp('weapons', weaponID)
  return weaponData ? weaponData : findWeaponData('missing_mechweapon');
}

const findTalentData = (talentID) => {
  var talentData = allTalents.find(talent => talent.id === talentID);
  if (!talentData) talentData = findGameDataFromLcp('talents', talentID)
  return talentData ? talentData : blankTalent;
}

const findSkillData = (skillID) => {
  var skillData = allSkills.find(skill => skill.id === skillID);
  if (!skillData) skillData = findGameDataFromLcp('skills', skillID)
  return skillData ? skillData : blankSkill;
}

const findCoreBonusData = (coreBonusID) => {
  var coreBonusData = allCoreBonuses.find(coreBonus => coreBonus.id === coreBonusID);
  if (!coreBonusData) coreBonusData = findGameDataFromLcp('core_bonuses', coreBonusID)
  return coreBonusData ? coreBonusData : findWeaponData('missing_corebonus');
}

const findSystemData = (systemID) => {
  var systemData = allSystems.find(system => system.id === systemID);
  if (!systemData) systemData = findGameDataFromLcp('systems', systemID)
  return systemData ? systemData : findWeaponData('missing_mechsystem');
}

const findModData = (modID) => {
  var modData = allMods.find(system => system.id === modID);
  if (!modData) modData = findGameDataFromLcp('mods', modID)
  return modData ? modData : findModData('missing_weaponmod');
}

export {
  findSkillData,
  getGrit,
  applyDamageMultiplier,
  processDiceString,
  findTagData,
  findTagOnWeapon,
  getTagName,
  defaultWeaponDamageType,
  findFrameData,
  findWeaponData,
  findTalentData,
  findCoreBonusData,
  findSystemData,
  findModData,
  GENERIC_BONUS_SOURCE,
  MAX_BONUS,
  DAMAGE_MODIFIERS,
  BONUS_TO_BURN_TAGS,
  FIRST_ROLL_ONLY_TAGS,
  BASIC_DAMAGE_TYPES,
  LANCER_DAMAGE_TYPES,
}
