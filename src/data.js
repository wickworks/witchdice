import { deepCopy } from './utils.js';

const CURRENT_VERSION = '0.2';

const allTags = {
  'once': 'Once per turn',
  'savehalf': 'Save for half',
  'triggeredsave': 'Requires save',
  'condition': 'Applies condition',
  'maximized': 'Maximized',
  'reroll1': 'Reroll 1s',
  'reroll2': 'Reroll 1+2s',
  'min2': 'Treat 1s as 2s.',
  'expandedcrit1': 'Crits 19-20',
  'expandedcrit2': 'Crits 18-20'
}

const allDamageTypes = [
  'slashing',
  'piercing',
  'bludgeoning',
  'fire',
  'cold',
  'lightning',
  'thunder',
  'acid',
  'poison',
  'psychic',
  'necrotic',
  'radiant',
  'force'
]

const abilityTypes = [
  "Dex",
  "Con",
  "Wis",
  "Cha",
  "Str",
  "Int"
]

const allConditions = [
  "Blinded",
  "Charmed",
  "Deafened",
  "Diseased",
  "Frightened",
  "Grappled",
  "Incapacitated",
  "Invisible",
  "Paralyzed",
  "Petrified",
  "Poisoned",
  "Prone",
  "Restrained",
  "Stunned",
  "Unconscious",
  "Exhaustion"
]

// ======================== DATA STRUCTURES =======================

const defaultDamageData = {
  dieCount: 1,
  dieType: 6,
  modifier: 0,
  damageType: 'slashing',
  name: '',
  tags: [],
  enabled: true,

  // only relevant for applied condition
  condition: ''
};

const defaultAttackData = {
  isActive: true,
  dieCount: 1,
  modifier: 0,
  isSavingThrow: false,
  savingThrowDC: 12,
  savingThrowType: 0, //Dex
  name: 'Longsword',
  desc: 'Reach 5ft, one target.',
  damageData: []
};

const defaultRollData = {
  attackID: 0,
  hit: true,
  attackBonus: 0,
  rollOne: 0,
  rollTwo: 0,
  damageRollData: [],
  critRollData: [],
  gatedByRollID: -1
};
// damageRollData: [ [TYPE, AMOUNT, REROLLED, DAMAGE_ID], [], ...]


// ======================== SAVE / LOAD TO LOCALSTORAGE =======================

function getCharacterStorageName(id, name) {
  return `character-${id}-${name}`;
}

function getCharacterNameFromStorageName(storageName) {
  return storageName.slice(17); // cuts out the "character-XXXXXX-"
}

function getCharacterIDFromStorageName(storageName) {
  return parseInt(storageName.slice(10,16)); // cuts out the "character-" and "-NAME"
}

function saveCharacterData(id, newName, newAllAttackData) {
  // console.log('saving character ', newName, '   ', id);

  const characterData = {
    id: id,
    name: newName,
    allAttackData: newAllAttackData
  }

  const storageName = getCharacterStorageName(id, newName);
  localStorage.setItem(storageName, JSON.stringify(characterData));
  localStorage.setItem("version", CURRENT_VERSION);

  // has the name changed? if so, delete the old one
  for ( var i = 0, len = localStorage.length; i < len; ++i ) {
    const key = localStorage.key(i);
    if (key && key.startsWith('character-')) {
      const characterID = getCharacterIDFromStorageName(key)
      const characterName = getCharacterNameFromStorageName(key)

      if (characterID === id && characterName !== newName) {
        console.log('Character name changed from "',characterName,'" to "',newName,'"; updating key names');
        localStorage.removeItem(key)
      }
    }
  }
}

function loadCharacterData(id) {
  // find the key with this ID
  let storageName = null;
  for ( var i = 0, len = localStorage.length; i < len; ++i ) {
    const key = localStorage.key(i);
    const characterID = getCharacterIDFromStorageName(key)
    if (characterID === id) {
      storageName = key;
    }
  }

  // load up that character's data and set it to be active
  if (storageName) {
    const loadedCharacter = localStorage.getItem(storageName);

    if (loadedCharacter) {
      const characterData = JSON.parse(loadedCharacter);
      return characterData;
    }
  }

  console.log('Tried to load character id [', id, '], but failed!');
  return null;
}

// generates a random 6-digit int from 200000 to 999999 (monster IDs are ordered)
function getRandomFingerprint() {
  let rand = Math.random();
  rand = rand * 799999
  rand = rand + 200000
  return Math.floor(rand)
}

export {
  CURRENT_VERSION,
  allTags,
  allDamageTypes,
  abilityTypes,
  allConditions,
  defaultDamageData,
  defaultAttackData,
  defaultRollData,
  loadCharacterData,
  saveCharacterData,
  getCharacterNameFromStorageName,
  getCharacterIDFromStorageName,
  getRandomFingerprint,
};
