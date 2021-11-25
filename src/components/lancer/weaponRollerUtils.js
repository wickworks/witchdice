import {
  getRandomInt,
  deepCopy
} from '../../utils.js';

import {
  processDiceString,
  GENERIC_BONUS_SOURCE
} from './data.js';

// Fills out the to-hit roll for the attack data.
function rollToHit(flatBonus, accuracyMod) {
  var toHit = {};

  toHit.baseRoll = getRandomInt(20);

  toHit.accuracyRolls = [...Array(Math.abs(accuracyMod))];
  toHit.accuracyRolls.map((accuracy, i) => {
    toHit.accuracyRolls[i] = getRandomInt(6)
  });
  toHit.accuracyBonus = Math.max(0, ...toHit.accuracyRolls) * Math.sign(accuracyMod)

  toHit.flatBonus = flatBonus

  toHit.finalResult = toHit.baseRoll + toHit.flatBonus + toHit.accuracyBonus

  return toHit;
}

// Fills out the damage rolls for the attack data.
function rollDamage(weaponData, isOverkill = false) {
  var damageData = {};

  damageData.rolls = [];
  weaponData.damage.forEach(damageValAndType => {
    const damageDice = processDiceString(damageValAndType.val);
    if (damageDice.count > 0 || damageDice.bonus > 0) {
      damageData.rolls.push(...produceRollPools(damageDice, damageValAndType.type, isOverkill, weaponData.id))
    }
  });

  return damageData;
}

// Fills out the damage rolls for the attack data.
function rollBonusDamage(bonusSourceData, defaultType, isOverkill = false) {
  var damageData = {};

  damageData.rolls = [];
  bonusSourceData.forEach(source => {
    const damageDice = processDiceString(source.diceString);
    const type = source.type || defaultType;
    if (damageDice.count > 0 || damageDice.bonus > 0) {
      damageData.rolls.push(...produceRollPools(damageDice, type, isOverkill, source.id))
    }
  });

  return damageData;
}


function produceRollPools(damageDice, damageType, isOverkill = false, sourceID = '') {
  let rolls = []; // for damageData.rolls

  // ROLLS
  let rollPool = [];
  let critPool = [];

  if (damageDice.count > 0) {
    [...Array(damageDice.count)].forEach(rollIndex => {
      makeDamageRoll(damageDice.dietype, rollPool, isOverkill);
      makeDamageRoll(damageDice.dietype, critPool, isOverkill);
    })
    rolls.push({
      rollPool: rollPool,
      critPool: critPool,
      keep: damageDice.count,
      dieType: damageDice.dietype,
      type: damageType,
      id: sourceID
    });
  }

  // PLUSES TO ROLLS -- they get their own micro-pool
  if (damageDice.bonus !== 0) {
    rolls.push({
      rollPool: [damageDice.bonus],
      critPool: [],
      keep: 1,
      dieType: 0,
      type: damageType,
      id: sourceID
    });
  }

  return rolls;
}

// Adds to the given roll/critPool with a random damage roll, including overkill triggers
function makeDamageRoll(dieType, rollPool, isOverkill) {
  let roll = getRandomInt(dieType) ;
  rollPool.push(roll)

  if (isOverkill) {
    while (roll === 1) {
      roll = getRandomInt(Math.max(dieType, 3));
      rollPool.push(roll)
    }
  }
}

function getActiveBonusDamageData(bonusDamageData, activeBonusSources, genericBonusDieCount, genericBonusPlus, isOverkill) {
  var activeBonusDamageData = {};

  if (bonusDamageData) {
    activeBonusDamageData = deepCopy(bonusDamageData);

    // Add all toggled non-generic sources
    activeBonusDamageData.rolls = bonusDamageData.rolls.filter(bonusRoll =>
      activeBonusSources.indexOf(bonusRoll.id) >= 0
    );

    // Take only the first X rolls from the generic bonus damage (we can tell it's the roll from the presence of a critpool)
    if (genericBonusDieCount) {
      const genericData = deepCopy(
        bonusDamageData.rolls.find(bonusRoll => (bonusRoll.id === GENERIC_BONUS_SOURCE.id) && bonusRoll.critPool.length > 0)
      );
      genericData.keep = genericBonusDieCount

      // This hack is made considerably more ugly by the existence of Overkill
      var useDieCount = genericBonusDieCount;
      if (isOverkill) {
        var overkillCount = 0;
        var i = 0;
        while (i < useDieCount) {
          if (genericData.rollPool[i] === 1) useDieCount += 1
          i += 1
        }
      }
      genericData.rollPool.splice(useDieCount);

      useDieCount = genericBonusDieCount;
      if (isOverkill) {
        overkillCount = 0;
        i = 0;
        while (i < useDieCount) {
          if (genericData.critPool[i] === 1) useDieCount += 1
          i += 1
        }
      }
      genericData.critPool.splice(useDieCount);

      // use this modified generic damage
      activeBonusDamageData.rolls.push(genericData);
    }

    // Adjust the flat bonus similarly (we can tell it's the plus from the lack of a critpool)
    if (genericBonusPlus) {
      const genericData = deepCopy(
        bonusDamageData.rolls.find(bonusRoll => (bonusRoll.id === GENERIC_BONUS_SOURCE.id) && bonusRoll.critPool.length === 0)
      );
      genericData.rollPool[0] = genericBonusPlus;
      activeBonusDamageData.rolls.push(genericData);
    }
  }

  return activeBonusDamageData
}


export {
  rollToHit,
  rollDamage,
  rollBonusDamage,
  produceRollPools,
  makeDamageRoll,
  getActiveBonusDamageData,
}
