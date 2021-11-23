import React from 'react';

import './DamageRollPool.scss';

import {
  getSortedTotalPool,
  getHighestRolls,
} from './damageUtils.js';

const DamageRollPool = ({
  rollData,
  isCrit,
  isBonusDamage = false,
  halveBonusDamage = false,
}) => {

  var totalPool = getSortedTotalPool(rollData, isCrit)
  var highest = getHighestRolls(totalPool, rollData.keep)

  // remove the highest rolls from the total pool; everything in there will be grey
  highest.forEach(highroll => totalPool.splice(totalPool.indexOf(highroll), 1))

  // Bonus damage gets halved once it targets multiple characters
  if (isBonusDamage && halveBonusDamage) {
    totalPool.forEach((roll, i) => totalPool[i] = (totalPool[i] * .5));
    highest.forEach((roll, i) => highest[i] = (highest[i] * .5));
  }

  const discardedString = totalPool.join(', ')
  const usedString = highest.join(', ')

  return (
    <div className={`DamageRollPool ${isBonusDamage ? 'bonus' : ''}`}>
      <span className={`asset-lancer ${rollData.type.toLowerCase()}`} />

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
