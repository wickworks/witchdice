import React, { useState } from 'react';
import Tooltip from '../../shared/Tooltip';
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
  const [hoveringIndex, setHoveringIndex] = useState(null);

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

      <BonusMultipliers
        damageModifiers={damageModifiers}
        toggleDamageModifier={toggleDamageModifier}
      />

      <BonusGenerics
        genericBonusIsActive={genericBonusIsActive}
        genericBonusDieCount={genericBonusDieCount}
        genericBonusPlus={genericBonusPlus}
        toggleGenericBonusDamage={toggleGenericBonusDamage}
        setGenericBonusDieCount={setGenericBonusDieCount}
        setGenericBonusPlus={setGenericBonusPlus}
      />

      { availableBonusSources.map((bonusSource, i) =>
        !bonusSource.trait.isPassive &&
          <BonusSourceButton
            isActive={activeBonusSources.indexOf(bonusSource.id) >= 0}
            toggleBonusDamage={toggleBonusDamage}
            bonusSource={bonusSource}
            isHovering={hoveringIndex === i}
            setIsHovering={isHovering => setHoveringIndex(isHovering ? i : null)}
            key={`${bonusSource.id}-${i}`}
          />
      )}
    </div>
  )
}

const BonusMultipliers = ({
  damageModifiers,
  toggleDamageModifier,
}) => {
  return (
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
  )
}

const BonusGenerics = ({
  genericBonusIsActive,
  genericBonusDieCount,
  genericBonusPlus,
  toggleGenericBonusDamage,
  setGenericBonusDieCount,
  setGenericBonusPlus,
}) => {
  return (
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
  )
}


function getCompendiumHrefForBonusSource(bonusSource) {
  return (
    bonusSource.id.startsWith('t_') ?
      'https://compcon.app/#/compendium/talents'
    : bonusSource.id.startsWith('cb_') ?
    'https://compcon.app/#/compendium/corebonuses'
    :
      `https://compcon.app/#/compendium/search?search=${bonusSource.trait.name}`
    )
}

const BonusSourceButton = ({
  isActive,
  toggleBonusDamage,
  bonusSource,

  isHovering,
  setIsHovering,
}) => {

  return (
    <div
      className='bonus-source-button-container'
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
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
          {bonusSource.diceString && <div className='amount'>{bonusSource.diceString}</div>}
        </div>
        <div className='label'>{bonusSource.name.toLowerCase()}</div>
      </button>
      {isHovering &&
        <Tooltip
          title={bonusSource.name}
          content={bonusSource.trait.effect || bonusSource.trait.description}
          compendiumHref={getCompendiumHrefForBonusSource(bonusSource)}
          onClose={() => setIsHovering(false)}
        />
      }
    </div>
  )
}




export default BonusDamageBar;
