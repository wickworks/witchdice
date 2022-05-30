import {
  getRandomInt,
  deepCopy
} from '../../../utils.js';

import {
  findTagOnWeapon,
  processDiceString,
  getDefaultWeaponDamageType,
  isDamageRange,
  GENERIC_BONUS_SOURCE
} from '../lancerData.js';

export function createNewTechAttack(invadeData, flatBonus, accuracyMod, consumedLock, isInvade = true) {
  let newAttack = {};

  newAttack.isOverkill = false
  newAttack.isArmorPiercing = false
  newAttack.reliable = { val: 0, type: 'Variable' }
  newAttack.knockback = 0
  newAttack.selfHeat = 0
  newAttack.consumedLock = !!consumedLock

  newAttack.toHit = rollToHit(flatBonus, accuracyMod);
  newAttack.toHitReroll = rollToHit(flatBonus, accuracyMod);

  // always just two heat (WHAT ABOUT NUC CAV?)
  let techDamage = {}
  techDamage.rolls = []
  if (isInvade) {
    techDamage.rolls.push({
      rollPool: [2],
      critPool: [],
      keep: 1,
      dieType: 'flat',
      type: 'Heat',
      id: invadeData.name
    })
  }

  newAttack.damage = techDamage

  // newAttack.onAttack = weaponData.on_attack || '';
  newAttack.onHit = invadeData.detail || '';
  // newAttack.onCrit = weaponData.on_crit || '';

  return newAttack
}

export function createNewAttack(weaponData, flatBonus, accuracyMod, consumedLock, manualBaseDamage, inheritDamage = null) {
  let newAttack = {};

  // Overkill?
  newAttack.isOverkill = !!findTagOnWeapon(weaponData, 'tg_overkill');;

  // Armor piercing?
  newAttack.isArmorPiercing = !!findTagOnWeapon(weaponData, 'tg_ap')

  // Reliable?
  newAttack.reliable = { val: 0, type: 'Variable' };
  const reliableTag = findTagOnWeapon(weaponData, 'tg_reliable')
  if (reliableTag) {
    newAttack.reliable.val = reliableTag.val;
    newAttack.reliable.type = getDefaultWeaponDamageType(weaponData)
  }

  // Knockback?
  newAttack.knockback = 0;
  const knockbackTag = findTagOnWeapon(weaponData, 'tg_knockback')
  if (knockbackTag) newAttack.knockback = knockbackTag.val;

  // Self heat?
  newAttack.selfHeat = 0;
  const selfHeatTag = findTagOnWeapon(weaponData, 'tg_heat_self')
  if (selfHeatTag) newAttack.selfHeat = selfHeatTag.val;

  // consumedLock?
  newAttack.consumedLock = !!consumedLock

  // DID WE HIT?
  newAttack.toHit = rollToHit(flatBonus, accuracyMod);
  newAttack.toHitReroll = rollToHit(flatBonus, accuracyMod);

  // ROLL DAMAGE (or inherit it from the first roll)
  if (inheritDamage) {
    newAttack.damage = deepCopy(inheritDamage)
  } else {
    newAttack.damage = rollDamage(weaponData, newAttack.isOverkill, manualBaseDamage);
  }

  newAttack.onAttack = weaponData.on_attack || '';
  newAttack.onHit = weaponData.on_hit || '';
  newAttack.onCrit = weaponData.on_crit || '';

  return newAttack;
}

// Fills out the to-hit roll for the attack data.
export function rollToHit(flatBonus, accuracyMod) {
  var toHit = {};

  toHit.baseRoll = getRandomInt(20);

  toHit.accuracyMod = accuracyMod
  // toHit.accuracyRolls = [...Array(Math.abs(accuracyMod))];
  toHit.accuracyRolls = [...Array(9)] // roll all 9
  toHit.accuracyRolls.forEach((accuracy, i) => {
    toHit.accuracyRolls[i] = getRandomInt(6)
  })

  toHit.flatBonus = flatBonus

  toHit.accuracyBonus = getTotalAccuracyBonus(toHit)
  toHit.finalResult = getFinalResult(toHit)

  return toHit;
}

function getTotalAccuracyBonus(toHit) {
  const usedRolls = toHit.accuracyRolls.slice(0, Math.abs(toHit.accuracyMod))
  return Math.max(0, ...usedRolls) * Math.sign(toHit.accuracyMod)
}

function getFinalResult(toHit) {
  return toHit.baseRoll + toHit.flatBonus + toHit.accuracyBonus
}

// whatever calls this is responsible for making sure it's mutable and the change is persisted
export function setAccuracyMod(toHit, newMod) {
  toHit.accuracyMod = Math.min(Math.max(-9, newMod), 9)
  toHit.accuracyBonus = getTotalAccuracyBonus(toHit)
  toHit.finalResult = getFinalResult(toHit)
}

// Fills out the damage rolls for the attack data.
export function rollDamage(weaponData, isOverkill, manualBaseDamage) {
  var damageData = {};
  damageData.rolls = [];

  if (weaponData.damage) {
    weaponData.damage.forEach(damageValAndType => {
      // DAMAGE RANGE; use manually-entered value
      if (isDamageRange(damageValAndType.val)) {
        damageData.rolls.push({
          rollPool: [manualBaseDamage],
          critPool: [],
          keep: 1,
          dieType: damageValAndType.val,
          type: damageValAndType.type,
          id: weaponData.id
        })

      // NORMAL damage roll
      } else {
        const damageDice = processDiceString(damageValAndType.val);
        if (damageDice.count > 0 || damageDice.bonus > 0) {
          damageData.rolls.push(...produceRollPools(damageDice, damageValAndType.type, isOverkill, weaponData.id))
        }
      }
    });
  }

  return damageData;
}

// Fills out the damage rolls for the attack data.
export function rollBonusDamage(bonusSourceData, defaultType, isOverkill = false) {
  var rolls = [];

  bonusSourceData.forEach(source => {
    // console.log('rolling bonus source ', source);

    const damageDice = processDiceString(source.diceString);
    const type = source.type || defaultType;
    if (damageDice.count > 0 || damageDice.bonus > 0) {
      rolls.push(...produceRollPools(damageDice, type, isOverkill, source.id))
    }
  });

  return rolls;
}

export function produceRollPools(damageDice, damageType, isOverkill = false, sourceID = '') {
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
export function makeDamageRoll(dieType, rollPool, isOverkill) {
  let roll = getRandomInt(dieType) ;
  rollPool.push(roll)

  if (isOverkill) {
    while (roll === 1) {
      roll = getRandomInt(Math.max(dieType, 3));
      rollPool.push(roll)
    }
  }
}


export function getBonusTraits(bonusSourceData) {
  var traits = [];

  bonusSourceData.forEach(source => {
    if (source.trait) traits.push(source.trait)
  });

  // console.log('getBonusEffects traits', traits);

  return traits;
}

export function getActiveBonusDamageData(bonusDamageData, activeBonusSources, genericBonusDieCount, genericBonusPlus, isOverkill) {
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
        // var overkillCount = 0;
        var i = 0;
        while (i < useDieCount) {
          if (genericData.rollPool[i] === 1) useDieCount += 1
          i += 1
        }
      }
      genericData.rollPool.splice(useDieCount);

      useDieCount = genericBonusDieCount;
      if (isOverkill) {
        // overkillCount = 0;
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

    //  -- EFFECTS ---

    // Add all non-generic sources that are either TOGGLED or PASSIVE
    activeBonusDamageData.traits = bonusDamageData.traits.filter(bonusTrait =>
      activeBonusSources.indexOf(bonusTrait.id) >= 0 || bonusTrait.isPassive
    );
  }

  return activeBonusDamageData
}
