
import {
  allDamageTypes,
  allConditions,
} from '../data.js';

// returns an array of damage type IDs in the order that they appear in the desc
function getDamageTypesFromDesc(desc) {
  let damageTypesWithIndex = [];

  allDamageTypes.forEach((type, i) => {
    const damageindex = desc.indexOf(type);
    if (damageindex >= 0) {
      damageTypesWithIndex.push([damageindex, type]);
    }
  });

  // earlier indices come first
  damageTypesWithIndex.sort((a, b) => (a[0] > b[0]) ? 1 : -1)

  // now reduce 'em down without the indices
  let damageTypesOrdered = [];
  damageTypesWithIndex.forEach((typeAndIndex, i) => {
    damageTypesOrdered.push(typeAndIndex[1])
  });

  return damageTypesOrdered;
}

function getConditionFromDesc(desc) {
  desc = desc.toLowerCase();
  let appliedCondition = null;

  allConditions.forEach((condition, i) => {
    if (desc.indexOf(condition.toLowerCase()) >= 0) {
      appliedCondition = condition;
    }
  })

  return appliedCondition;
}

// turns '10d6' into {count: 10, dietype: 6}
function getCountAndTypeFromDiceString(dice) {
  const count = parseInt(dice.slice(0, dice.indexOf('d')));
  const dietype = parseInt(dice.slice(dice.indexOf('d')+1));
  return {count: count, dietype: dietype}
}


export {
  getDamageTypesFromDesc,
  getConditionFromDesc,
  getCountAndTypeFromDiceString,
}
