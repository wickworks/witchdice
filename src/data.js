import { deepCopy } from './utils.js';

const allTags = {
  'first': 'First hit',
  'savehalf': 'Save for half',
  'maximized': 'Maximized',
  'reroll1': 'Reroll 1s',
  'reroll2': 'Reroll 1+2s',
  'min2': 'Treat 1s as 2s.',
  'expandedcrit1': 'Crits 19-20',
  'expandedcrit2': 'Crits 18-20'
}

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
  dieCount: 1,
  modifier: 0,
  isSavingThrow: false,
  savingThrowDC: 12,
  name: 'Longsword',
  desc: 'Reach 5ft, one target.',
  damageData: [deepCopy(defaultDamageData)]
};

const initialCharacterName = 'Tuxedo Mask';

// const initialAllAttackData = [deepCopy(defaultAttackData) ];
const initialAllAttackData = [
  {
    dieCount: 2,
    modifier: 4,
    isSavingThrow: false,
    savingThrowDC: 12,
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
    dieCount: 1,
    modifier: 6,
    isSavingThrow: false,
    savingThrowDC: 12,
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

// const initialRollData = [];
// [
//   {
//     attackID: 0,
//     hit: true,
//     critOne: false;
//     critTwo: false;
//     rollOne: 18,
//     rollTwo: 1,
//     damageRollData: [[TYPE, AMOUNT, REROLLED, DAMAGE_ID], ['fire', 6, false, 1]]
//     critRollData: [[TYPE, AMOUNT, REROLLED, DAMAGE_ID], ['fire', 6, false, 1]]
//   }, {
//     ...
//   }
// ]

export {allTags, defaultDamageData, defaultAttackData, initialAllAttackData, initialCharacterName};
