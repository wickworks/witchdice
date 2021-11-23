

function getSortedTotalPool(rollData, isCrit) {
  var totalPool = [...rollData.rollPool];
  if (isCrit) totalPool.push(...rollData.critPool);
  totalPool.sort((a, b) => { return a - b });

  return totalPool;
}


function getHighestRolls(sortedTotalPool, highestCount) {
  const highest = sortedTotalPool.slice(Math.max(sortedTotalPool.length - highestCount, 0));
  return highest;
}


function summateAllDamageByType(damageData, bonusDamageData, isCrit, halveBonusDamage) {
  var totalsByType = {};

  // BASE damage rolls
  damageData.rolls.forEach(rollData => {
    const totalPool = getSortedTotalPool(rollData, isCrit)
    const highest = getHighestRolls(totalPool, rollData.keep)

    const rollTotal = highest.reduce((partial_sum, a) => partial_sum + a, 0);

    const prevTypeTotal = totalsByType[rollData.type] || 0;
    totalsByType[rollData.type] = prevTypeTotal + rollTotal;
  });

  // BONUS damage rolls
  var bonusTotalsByType = {}; // have to tally these separately so we can optionally halve just bonus damage
  bonusDamageData.rolls.forEach(rollData => {
    const totalPool = getSortedTotalPool(rollData, isCrit)
    const highest = getHighestRolls(totalPool, rollData.keep)

    const rollTotal = highest.reduce((partial_sum, a) => partial_sum + a, 0);

    const prevTypeTotal = bonusTotalsByType[rollData.type] || 0;
    bonusTotalsByType[rollData.type] = prevTypeTotal + rollTotal;
  });

  // Bonus damage gets halved once it targets multiple characters
  if (halveBonusDamage) {
    Object.keys(bonusTotalsByType).forEach(type => bonusTotalsByType[type] = Math.ceil(bonusTotalsByType[type] * .5));
  }

  // Add the bonus damage totals to the base totals
  Object.keys(bonusTotalsByType).forEach(type => {
    const prevTypeTotal = totalsByType[type] || 0;
    totalsByType[type] = prevTypeTotal + bonusTotalsByType[type];
  });

  return totalsByType;
}


function countOverkillTriggers(damageData, bonusDamageData, isCrit) {
  var overkillCount = 0;

  [damageData, bonusDamageData].forEach(deedeeData => {
    deedeeData.rolls.forEach(rollData => {

      const totalPool = getSortedTotalPool(rollData, isCrit)

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
}
