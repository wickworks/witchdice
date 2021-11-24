import React from 'react';

import './DamageRollPool.scss';

import {
  getSortedTotalPool,
  getHighestRolls,
} from './damageTotalUtils.js';

const DamageRollPool = ({
  rollData,
  isCrit,
  isBonusDamage = false,
  halveBonusDamage = false,
  damageModifiers,
}) => {

  var totalPool = getSortedTotalPool(rollData, isCrit, damageModifiers.average)
  var highest = getHighestRolls(totalPool, rollData.keep)

  // remove the highest rolls from the total pool; everything in there will be grey
  highest.forEach(highroll => totalPool.splice(totalPool.indexOf(highroll), 1))

  // Bonus damage gets halved once it targets multiple characters
  var multiplier = 1.0;
  if (damageModifiers.double) multiplier *= 2;
  if (damageModifiers.half) multiplier *= .5;
  if (isBonusDamage && halveBonusDamage) multiplier *= .5;

  if (multiplier !== 1.0) {
    totalPool.forEach((roll, i) =>  totalPool[i] = (totalPool[i] * multiplier));
    highest.forEach((roll, i) =>    highest[i] = (highest[i] * multiplier));
  }

  const damageType = (isBonusDamage && damageModifiers.bonusToBurn) ? 'Burn' : rollData.type

  const discardedString = totalPool.join(', ')
  const usedString = highest.join(', ')

  return (
    <div className={`DamageRollPool ${isBonusDamage ? 'bonus' : ''}`}>
      <span className={`asset-lancer ${damageType.toLowerCase()}`} />

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
