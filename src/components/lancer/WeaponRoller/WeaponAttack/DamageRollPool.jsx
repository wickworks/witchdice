import React from 'react';

import './DamageRollPool.scss';

import {
  getSortedTotalPool,
  getHighestRolls,
} from './damageTotalUtils.js';

import {
  applyDamageMultiplier,
  BASIC_DAMAGE_TYPES,
} from '../../lancerData.js';

const DamageRollPool = ({
  rollData,
  isCrit,
  isBonusDamage = false,
  halveBonusDamage = false,
  damageModifiers,
}) => {

  var totalPool = getSortedTotalPool(rollData, isCrit, damageModifiers)
  var highest = getHighestRolls(totalPool, rollData.keep)

  // remove the highest rolls from the total pool; everything in there will be grey
  highest.forEach(highroll => totalPool.splice(totalPool.indexOf(highroll), 1))


  const convertToBurn = isBonusDamage && damageModifiers.bonusToBurn && BASIC_DAMAGE_TYPES.includes(rollData.type)
  const damageType = convertToBurn ? 'Burn' : rollData.type

  // Bonus damage gets halved once it targets multiple characters
  var multiplier = applyDamageMultiplier(1.0, damageType, damageModifiers);
  if (isBonusDamage && halveBonusDamage) multiplier *= .5;

  if (multiplier !== 1.0) {
    totalPool.forEach((roll, i) =>  totalPool[i] = (totalPool[i] * multiplier));
    highest.forEach((roll, i) =>    highest[i] = (highest[i] * multiplier));
  }

  const discardedString = totalPool.join(', ')
  const usedString = highest.join(', ')

  return (
    <div className={`DamageRollPool ${isBonusDamage ? 'bonus' : ''}`}>
      <span className={`asset ${damageType.toLowerCase()}`} />

      { discardedString &&
        <span className='amount discarded'>
          {`(${discardedString},`}
        </span>
      }

      { usedString &&
        <span className='amount used'>
          {usedString}
        </span>
      }

      { discardedString &&
        <span className='amount discarded'>{')'}</span>
      }

    </div>
  )
}


export default DamageRollPool;
