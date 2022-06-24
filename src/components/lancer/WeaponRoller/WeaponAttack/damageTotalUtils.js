import {
  applyDamageMultiplier,
  isDamageRange,
  FIRST_ROLL_ONLY_TAGS,
  isBasicDamageType,
} from '../../lancerData.js';

function getSortedTotalPool(rollData, isCrit, damageModifiers) {
  var totalPool = [...rollData.rollPool];

  // Crit dice don't matter if we're averaged or maximized
  if (isCrit && !damageModifiers.average && !damageModifiers.maximized) {
    totalPool.push(...rollData.critPool);
  }

  totalPool.sort((a, b) => { return a - b });

  // inject average/maximized data right into any kind of summation we're doing
  if (rollData.dieType) {
    if (damageModifiers.average && !isDamageRange(rollData.dieType)) {
      var averageRoll = Math.ceil(rollData.dieType * .5);
      if (rollData.dieType === 6) averageRoll += .5
      totalPool = totalPool.map(roll => averageRoll);

    } else if (damageModifiers.maximized && isCrit) {
      totalPool = totalPool.map(roll => rollData.dieType);
    }
  }
  // BY THE WAY, I KNOW EVERYING e.g. it makes no architectural sense to put this here, but boy is it convenient

  return totalPool;
}


function getHighestRolls(sortedTotalPool, highestCount) {
  const highest = sortedTotalPool.slice(Math.max(sortedTotalPool.length - highestCount, 0));
  return highest;
}

function pullOutCritGatedBonusDamage(bonusDamageData, isCrit) {
  if (isCrit) return bonusDamageData // we crit, don't have to do any gating.

  // pull out all rolls which required crits
  let critlessRolls = []
  let critlessTraits = []
  bonusDamageData.rolls.forEach((roll, i) => {
    const trait = bonusDamageData.traits[i]
    if (trait && !trait.requiresCrit) {
      critlessRolls.push(roll)
      critlessTraits.push(trait)
    }
  })

  const critGatedBonusDamageRolls = {
    rolls: critlessRolls,
    traits: critlessTraits
  }

  return critGatedBonusDamageRolls
}

function pullOutFirstRollBonusDamage(bonusDamageData) {
  var trimmedBonusDamageRolls = [];
  var firstBonusDamageRolls = [];

  bonusDamageData.rolls.forEach(bonusRoll => {
    if (FIRST_ROLL_ONLY_TAGS.includes(bonusRoll.id)) {
      firstBonusDamageRolls.push(bonusRoll)
    } else {
      trimmedBonusDamageRolls.push(bonusRoll)
    }
  });

  return [trimmedBonusDamageRolls, firstBonusDamageRolls]
}

// modifies given baseTotalsByType by adding the bonus totals to it
function addBonusDamageToBaseDamage(baseTotalsByType, bonusTotalsByType, convertToBurn = false) {
  Object.keys(bonusTotalsByType).forEach(type => {
    const convertedType = convertToBurn && isBasicDamageType(type) ? 'Burn' : type
    const prevTypeTotal = baseTotalsByType[convertedType] || 0;
    baseTotalsByType[convertedType] = prevTypeTotal + bonusTotalsByType[type];
  });
}

function summateAllDamageByType(damageData, bonusDamageData, isCrit, halveBonusDamage, damageModifiers, isFirstRoll) {

  // BASE damage rolls
  var totalsByType = summateRollsByType(damageData.rolls, isCrit, damageModifiers);

  // if any of these bonus damage sources require crits and we didn't get one, pull it out
  const critGatedBonusDamageRolls =  pullOutCritGatedBonusDamage(bonusDamageData, isCrit);

  // separate normal bonus damage and sources that only apply to the first roll (aka NucCav)
  const [trimmedBonusDamageRolls, firstBonusDamageRolls] = pullOutFirstRollBonusDamage(critGatedBonusDamageRolls);

  // BONUS damage rolls (have to tally these separately so we can optionally halve non-first-roll bonus damage)
  var bonusTotalsByType = summateRollsByType(trimmedBonusDamageRolls, isCrit, damageModifiers);
  var firstBonusTotalsByType = summateRollsByType(firstBonusDamageRolls, isCrit, damageModifiers);

  if (halveBonusDamage) {
    Object.keys(bonusTotalsByType).forEach(type => bonusTotalsByType[type] = Math.ceil(bonusTotalsByType[type] * .5));
  }

  // Add the bonus damage totals to the base totals
  addBonusDamageToBaseDamage(totalsByType, bonusTotalsByType, damageModifiers.bonusToBurn);
  if (isFirstRoll) addBonusDamageToBaseDamage(totalsByType, firstBonusTotalsByType, damageModifiers.bonusToBurn);

  // Halve/double damage from multiplier
  Object.keys(totalsByType).forEach(type => {
    totalsByType[type] = applyDamageMultiplier(totalsByType[type], type, damageModifiers);
  });

  // Make sure we round up all final numbers
  Object.keys(totalsByType).forEach(type => {
    totalsByType[type] = Math.ceil(totalsByType[type]);
  });

  return totalsByType;
}

function getReliableDamage(attackData, damageModifiers) {
  if ('reliable' in attackData) {
    var reliableDamage = attackData.reliable.val;
    reliableDamage = applyDamageMultiplier(reliableDamage, attackData.reliable.type, damageModifiers)

    // some reliable amount?
    if (reliableDamage > 0) return {[attackData.reliable.type]: Math.ceil(reliableDamage)}
  }

  return {}
}

function summateRollsByType(damageDataRolls, isCrit, damageModifiers) {
  var totalsByType = {};
  damageDataRolls.forEach(rollData => {
    const totalPool = getSortedTotalPool(rollData, isCrit, damageModifiers)
    const highest = getHighestRolls(totalPool, rollData.keep)

    const rollTotal = highest.reduce((partial_sum, a) => partial_sum + a, 0);

    const prevTypeTotal = totalsByType[rollData.type] || 0;
    totalsByType[rollData.type] = prevTypeTotal + rollTotal;
  });
  return totalsByType;
}


function countOverkillTriggers(damageData, bonusDamageData, isCrit, damageModifiers) {
  var overkillCount = 0;

  [damageData, bonusDamageData].forEach(deedeeData => {
    deedeeData.rolls.forEach(rollData => {

      const totalPool = getSortedTotalPool(rollData, isCrit, damageModifiers)

      if (totalPool.length > 1) { // Skip "+1" die rolls
        overkillCount += totalPool.reduce((a, v) => (v === 1 ? a + 1 : a), 0);
      }

    });
  });

  return overkillCount;
}


export {
  getSortedTotalPool,
  getHighestRolls,
  summateAllDamageByType,
  getReliableDamage,
  countOverkillTriggers,
  pullOutCritGatedBonusDamage,
  pullOutFirstRollBonusDamage,
}
