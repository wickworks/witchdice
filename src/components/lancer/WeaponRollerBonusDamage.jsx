import React from 'react';
import { MAX_BONUS } from './data.js';

import './WeaponRollerBonusDamage.scss';


const WeaponRollerBonusDamage = ({
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

  return (
    <div className="WeaponRollerBonusDamage">

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
          onClick={() => { setGenericBonusPlus(0); setGenericBonusDieCount(0); }}
          disabled={!genericBonusIsActive}
        >
          <div className='label'>Bonus damage</div>
        </button>
      </div>



      { availableBonusSources.map((bonusSource, i) =>
        <button
          className={`bonus-source ${activeBonusSources.indexOf(bonusSource.id) >= 0 ? 'active' : 'inactive'}`}
          onClick={() => toggleBonusDamage(bonusSource.id)}
          key={`${bonusSource.id}-${i}`}
        >
          <div className='amount-container'>
            { bonusSource.type ?
              <div className={`asset-lancer ${bonusSource.type.toLowerCase()}`} />
            :
              <div className='asset dot' />
            }
            <div className='amount'>{bonusSource.diceString}</div>
          </div>
          <div className='label'>{bonusSource.name.toLowerCase()}</div>
        </button>
      )}
    </div>
  )
}

export default WeaponRollerBonusDamage;
