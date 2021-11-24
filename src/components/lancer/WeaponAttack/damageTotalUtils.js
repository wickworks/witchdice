
function getSortedTotalPool(rollData, isCrit, isAverage) {
  var totalPool = [...rollData.rollPool];
  if (isCrit && !isAverage) totalPool.push(...rollData.critPool);
  totalPool.sort((a, b) => { return a - b });

  // inject average data right into any kind of summation we're doing
  if (isAverage && rollData.dieType) {
    var averageRoll = Math.ceil(rollData.dieType * .5);
    if (rollData.dieType === 6) averageRoll += .5

    totalPool = totalPool.map(roll => averageRoll);
  }
  // BY THE WAY, I KNOW EVERYING e.g. it makes no architectural sense to put this here, but boy is it convenient

  return totalPool;
}


function getHighestRolls(sortedTotalPool, highestCount) {
  const highest = sortedTotalPool.slice(Math.max(sortedTotalPool.length - highestCount, 0));
  return highest;
}

function pullOutFirstRollBonusDamage(bonusDamageData) {
  const FIRST_ROLL_ONLY_TAGS = ['t_nuclear_cavalier']

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

function summateAllDamageByType(damageData, bonusDamageData, isCrit, halveBonusDamage, damageModifiers, isFirstRoll) {

  // BASE damage rolls
  var totalsByType = summateRollsByType(damageData.rolls, isCrit, damageModifiers.average);

  // separate normal bonus damage and sources that only apply to the first roll (aka NucCav)
  const [trimmedBonusDamageRolls, firstBonusDamageRolls] = pullOutFirstRollBonusDamage(bonusDamageData);

  // BONUS damage rolls (have to tally these separately so we can optionally halve just bonus damage)
  var bonusTotalsByType = summateRollsByType(trimmedBonusDamageRolls, isCrit, damageModifiers.average);
  var firstBonusTotalsByType = summateRollsByType(firstBonusDamageRolls, isCrit, damageModifiers.average);

  if (halveBonusDamage) {
    Object.keys(bonusTotalsByType).forEach(type => bonusTotalsByType[type] = Math.ceil(bonusTotalsByType[type] * .5));
  }

  // Add the bonus damage totals to the base totals
  Object.keys(bonusTotalsByType).forEach(type => {
    const prevTypeTotal = totalsByType[type] || 0;
    totalsByType[type] = prevTypeTotal + bonusTotalsByType[type];
  });
  if (isFirstRoll) {
    Object.keys(firstBonusTotalsByType).forEach(type => {
      const prevTypeTotal = totalsByType[type] || 0;
      totalsByType[type] = prevTypeTotal + firstBonusTotalsByType[type];
    });
  }

  // Halve/double damage from multiplier
  var multiplier = 1.0;
  if (damageModifiers.double) multiplier *= 2.0;
  if (damageModifiers.half) multiplier *= .5;
  if (multiplier !== 1.0) {
    Object.keys(totalsByType).forEach(type => {
      totalsByType[type] = totalsByType[type] * multiplier;
    });
  }

  // Make sure we round up all final numbers
  Object.keys(totalsByType).forEach(type => {
    totalsByType[type] = Math.ceil(totalsByType[type]);
  });

  return totalsByType;
}

function summateRollsByType(damageDataRolls, isCrit, isAverage) {
  var totalsByType = {};
  damageDataRolls.forEach(rollData => {
    const totalPool = getSortedTotalPool(rollData, isCrit, isAverage)
    const highest = getHighestRolls(totalPool, rollData.keep)

    const rollTotal = highest.reduce((partial_sum, a) => partial_sum + a, 0);

    const prevTypeTotal = totalsByType[rollData.type] || 0;
    totalsByType[rollData.type] = prevTypeTotal + rollTotal;
  });
  return totalsByType;
}


function countOverkillTriggers(damageData, bonusDamageData, isCrit, isAverage) {
  var overkillCount = 0;

  [damageData, bonusDamageData].forEach(deedeeData => {
    deedeeData.rolls.forEach(rollData => {

      const totalPool = getSortedTotalPool(rollData, isCrit, isAverage)

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
  countOverkillTriggers,
  pullOutFirstRollBonusDamage,
}
