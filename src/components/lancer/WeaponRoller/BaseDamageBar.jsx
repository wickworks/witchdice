import React from 'react';
import './BaseDamageBar.scss';

import {
  getTagName,
  isDamageRange,
} from '../lancerData.js';

// A weapon profile is a subset of weaponData, and handles weapons
// that have multiple modes of firing (e.g. DD)
const BaseDamageBar = ({
  weaponProfile,
  mountType,
  isActive,
  isClickable,
  onClick,

  manualBaseDamage,
  setManualBaseDamage,
  manualBaseDamageDisabled,
}) => {

  let weaponTags = weaponProfile.tags ? weaponProfile.tags.map(tagID => getTagName(tagID)) : []

  return (
    <button
      className={`BaseDamageBar ${isActive ? 'active' : ''}`}
      onClick={onClick}
      disabled={!isClickable}
    >
      <div className="damage-and-range">
        { weaponProfile.damage &&
          <div className="base-damage">
            <div className='bracket'>{'[ '}</div>
            { weaponProfile.damage.map((damage, i) =>
              <DamageDice
                damage={damage}
                manualBaseDamage={manualBaseDamage}
                setManualBaseDamage={setManualBaseDamage}
                manualBaseDamageDisabled={manualBaseDamageDisabled}
                key={`damage-${i}`}
              />
            )}
            <div className='bracket'>{' ]'}</div>
          </div>
        }

        <div className="base-range">
          <div className='bracket'>{'[ '}</div>
          { weaponProfile.range.map((range, i) =>
            <div className='range' key={`range-${i}`}>
              {range.val}
              <div className={`asset ${range.type.toLowerCase()}`} />
            </div>
          )}
          <div className='bracket'>{' ]'}</div>
        </div>
      </div>

      <div className="tags">
        {weaponTags.join(', ').toLowerCase()}

        { mountType &&
          <span className='size'>{mountType}</span>
        }
      </div>
    </button>
  )
}

const DamageDice = ({
  damage,
  manualBaseDamage,
  setManualBaseDamage,
  manualBaseDamageDisabled,
}) => {

  return ( !isDamageRange(damage.val) ?
    <div className='damage-dice'>
      {damage.val}
      <div className={`asset ${damage.type.toLowerCase()}`} />
    </div>
  :
    <div className='manual-damage'>
      <input
        value={manualBaseDamage}
        onChange={e => setManualBaseDamage(parseInt(e.target.value))}
        min="1" // these are probably fine, what else could it be
        max="6"
        type='number'
        disabled={manualBaseDamageDisabled}
      />
      <div className={`asset ${damage.type.toLowerCase()}`} />
    </div>
  )
}

export default BaseDamageBar;
