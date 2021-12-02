import React from 'react';
import { MAX_BONUS } from '../lancerData.js';

import './BonusDamageBar.scss';


const BonusDamageBar = ({
  genericBonusDieCount,
  setGenericBonusDieCount,
  genericBonusPlus,
  setGenericBonusPlus,
  genericBonusIsActive,

  availableBonusSources,
  activeBonusSources,
  toggleBonusDamage,

  damageModifiers,
  toggleDamageModifier,
}) => {

  const toggleGenericBonusDamage = () => {
    if (genericBonusIsActive) {
      setGenericBonusPlus(0);
      setGenericBonusDieCount(0);
    } else {
      setGenericBonusDieCount(1);
    }
  }

  return (
    <div className="BonusDamageBar">

      <div className='generic-source-container'>
        <button
          className={`generic-source ${genericBonusIsActive ? 'active' : 'inactive'}`}
          onClick={() => setGenericBonusDieCount(Math.min(genericBonusDieCount + 1, MAX_BONUS))}
        >
          <div className='amount-container'>
            {genericBonusDieCount ?
              <div className='amount'>{genericBonusDieCount}d6</div>
            :
              <div className='asset d6' />
            }
          </div>
        </button>

        <button
          className={`generic-source ${genericBonusIsActive ? 'active' : 'inactive'}`}
          onClick={() => setGenericBonusPlus(Math.min(genericBonusPlus + 1, MAX_BONUS))}
        >
          <div className='amount-container'>
            {genericBonusPlus ?
              <div className='amount'>+{genericBonusPlus}</div>
            :
              <div className='asset plus' />
            }
          </div>
        </button>

        <button
          className={`generic-reset ${genericBonusIsActive ? 'active' : 'inactive'}`}
          onClick={toggleGenericBonusDamage}
        >
          <div className='label'>Bonus damage</div>
        </button>
      </div>

      { availableBonusSources.map((bonusSource, i) =>
        !bonusSource.trait.isPassive &&
          <BonusSourceButton
            isActive={activeBonusSources.indexOf(bonusSource.id) >= 0}
            toggleBonusDamage={toggleBonusDamage}
            bonusSource={bonusSource}
            key={`${bonusSource.id}-${i}`}
          />
      )}

      <div className="multipliers-container">
        <button
          className={damageModifiers.half ? 'active' : ''}
          onClick={() => toggleDamageModifier('half')}
        >
          <div className='asset x' />
          <div>1 / 2</div>
        </button>

        <button
          className={damageModifiers.double ? 'active' : ''}
          onClick={() => toggleDamageModifier('double')}
        >
          <div className='asset x' />
          <div>2</div>
        </button>

        <button
          className={damageModifiers.average ? 'active' : ''}
          onClick={() => toggleDamageModifier('average')}
        >
          <div>Avg</div>
        </button>
      </div>
    </div>
  )
}


const BonusSourceButton = ({
  isActive,
  toggleBonusDamage,
  bonusSource,
}) => {
  return (
    <button
      className={`bonus-source ${isActive ? 'active' : 'inactive'}`}
      onClick={() => toggleBonusDamage(bonusSource.id)}
    >
      <div className='amount-container'>
        { bonusSource.type ?
          <div className={`asset ${bonusSource.type.toLowerCase()}`} />
        :
          <div className='asset dot' />
        }
        <div className='amount'>{bonusSource.diceString}</div>
      </div>
      <div className='label'>{bonusSource.name.toLowerCase()}</div>
    </button>
  )
}




export default BonusDamageBar;
