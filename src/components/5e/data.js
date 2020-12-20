// import { deepCopy } from './utils.js';


const allTags = {
  'savehalf': 'Save for half',
  'triggeredsave': 'Triggers save',
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


const actionTypes = ['attack', 'save', 'ability']
const defaultAttackData = {
  isActive: true,
  dieCount: 1,
  modifier: 0,
  name: 'Longsword',
  desc: 'Reach 5ft, one target.',
  damageData: [],
  type: 'attack', // attack | save | ability | info

  savingThrowDC: 12,
  savingThrowType: 0, //Dex
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

const defaultDamageRoll = {
  type: 'fire',
  amount: 0,
  rerolledAmount: 0,
  rerolled: false,
  sourceID: 0, //the damage source ID that we belong to
}




export {
  allTags,
  allDamageTypes,
  abilityTypes,
  allConditions,
  actionTypes,
  defaultDamageData,
  defaultAttackData,
  defaultRollData,
  defaultDamageRoll
};
