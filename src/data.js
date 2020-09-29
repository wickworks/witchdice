import { deepCopy } from './utils.js';

const CURRENT_VERSION = '0.2';

const allTags = {
  'once': 'Once per turn',
  'savehalf': 'Save for half',
  'maximized': 'Maximized',
  'reroll1': 'Reroll 1s',
  'reroll2': 'Reroll 1+2s',
  'min2': 'Treat 1s as 2s.',
  'expandedcrit1': 'Crits 19-20',
  'expandedcrit2': 'Crits 18-20'
}

const abilityTypes = ["Dex", "Con", "Wis", "Cha", "Str", "Int"]


const defaultDamageData = {
  dieCount: 1,
  dieType: 6,
  modifier: 0,
  damageType: 'slashing',
  name: '',
  tags: [],
  enabled: true
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
  damageData: [deepCopy(defaultDamageData)]
};

// const defaultAllAttackData = [deepCopy(defaultAttackData) ];
const defaultAllAttackData = [
  {
    isActive: true,
    dieCount: 2,
    modifier: 4,
    isSavingThrow: false,
    savingThrowDC: 12,
    savingThrowType: 0, //Dex
    name: 'Longsword',
    desc: 'Reach 5ft, one target.',
    damageData: [
      {
        dieCount: 1,
        dieType: 8,
        modifier: 4,
        damageType: 'slashing',
        name: '',
        tags: [],
        enabled: true
      },{
        dieCount: 6,
        dieType: 6,
        modifier: 0,
        damageType: 'slashing',
        name: 'sneak attack',
        tags: ['first'],
        enabled: true
      }
    ]


  },{
    isActive: true,
    dieCount: 1,
    modifier: 6,
    isSavingThrow: false,
    savingThrowDC: 12,
    savingThrowType: 0, //Dex
    name: 'Thrown rose',
    desc: 'Reach 30ft, one target.',
    damageData: [
    {
      dieCount: 1,
      dieType: 4,
      modifier: 0,
      damageType: 'piercing',
      name: '',
      tags: [],
      enabled: true
    },{
      dieCount: 2,
      dieType: 6,
      modifier: 0,
      damageType: 'fire',
      name: 'flaming',
      tags: ['reroll2'],
      enabled: true
    }]
  }
];

const defaultCharacterList = [
  {
    name: 'Tuxedo Mask',
    allAttackData: deepCopy(defaultAllAttackData)
  },
  {
    name: 'Makato Kino',
    allAttackData: deepCopy(defaultAllAttackData)
  }
]

function characterNameToStorageName(name) {
  return `character-${name.toLowerCase().replace(' ','-')}`
}

function saveCharacterData(newName, newAllAttackData) {
  const characterData = {
    name: newName,
    allAttackData: newAllAttackData
  }

  // TODO: has the name changed? if so, delete the old one

  const storageName = characterNameToStorageName(newName);
  localStorage.setItem(storageName, JSON.stringify(characterData));
  localStorage.setItem("version", CURRENT_VERSION);
}

function loadCharacterData(name) {
  // load up that character's data and set it to be active
  const storageName = characterNameToStorageName(name);
  const loadedCharacter = localStorage.getItem(storageName);

  if (loadedCharacter) {
    const characterData = JSON.parse(loadedCharacter);
    return characterData;

  } else {
    console.log('Tried to load character [', name, '], but failed!');
    return null;
  }
}

// const initialRollData = [];
// [
//   {
//     attackID: 0,
//     hit: true,
//     rollOne: 18,
//     rollTwo: 1,
//     attackBonus: 4,
//     damageRollData: [[TYPE, AMOUNT, REROLLED, DAMAGE_ID], ['fire', 6, false, 1]]
//     critRollData: [[TYPE, AMOUNT, REROLLED, DAMAGE_ID], ['fire', 6, false, 1]]
//   }, {
//     ...
//   }
// ]

export {
  CURRENT_VERSION,
  allTags,
  abilityTypes,
  defaultDamageData,
  defaultAttackData,
  defaultAllAttackData,
  defaultCharacterList,
  loadCharacterData,
  saveCharacterData
};
