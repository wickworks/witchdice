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
  'expandedcrit2': 'Crits 18-20',
  'extracritdie1': 'Crits get +1 die',
  'extracritdie2': 'Crits get +2 dice',
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
  desc: '',
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

// scans an attack's damage sources for a specific tag (e.g. improved crit range)
const anyDamageSourceContains = (attackSource, tagname) => {
  for (let i = 0; i < attackSource.damageData.length; i++) {
    const damageSource = attackSource.damageData[i];
    if (damageSource.tags.includes(tagname)) return true
  }
  return false
}

const defaultInitiativeEntry = {
  name: '',
  initiative: 1,
  bonus: 0, // works as tiebreaker
  highlighted: false,
  // firebaseKey: '' // this is added dynamically at the appropriate time
};

export {
  allTags,
  allDamageTypes,
  abilityTypes,
  allConditions,
  actionTypes,
  defaultDamageData,
  defaultAttackData,
  defaultRollData,
  defaultDamageRoll,
  defaultInitiativeEntry,
  anyDamageSourceContains
};
