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
  rangeSynergies,
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
        { weaponProfile.damage && weaponProfile.damage.length > 0 &&
          <div className="base-damage">
            <div className='bracket'>[</div>
            { weaponProfile.damage.map((damage, i) =>
              <DamageDice
                damage={damage}
                manualBaseDamage={manualBaseDamage}
                setManualBaseDamage={setManualBaseDamage}
                manualBaseDamageDisabled={manualBaseDamageDisabled}
                key={`damage-${i}`}
              />
            )}
            <div className='bracket'>]</div>
          </div>
        }

        <div className="base-range">
          <div className='bracket'>[</div>
          { weaponProfile.range.map((range, i) => {
            var rangeVal = parseInt(range.val) || ''
            const rangeType = range.type || ''

            // apply any range synergies
            rangeSynergies.forEach(synergy => {
              if (synergy.range_types.includes(rangeType)) rangeVal += parseInt(synergy.val)
            });


            return (
              <div className='range' key={`range-${i}`}>
                {rangeVal}
                {rangeType && <div className={`asset ${rangeType.toLowerCase()}`} />}
              </div>
            )
          })}
          <div className='bracket'>]</div>
        </div>
      </div>

      <div className="tags">
        {weaponTags.join(', ').toLowerCase()}

        { weaponProfile.profileName && <span className='size'>{weaponProfile.profileName}</span> }
        { mountType && <span className='size'>{mountType}</span> }
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
  const damageVal = damage.val || ''
  const damageType = damage.type || ''

  return ( !isDamageRange(damageVal) ?
    <div className='damage-dice'>
      {damageVal}
      {damageType && <div className={`asset ${damageType.toLowerCase()}`} />}
    </div>
  :
    <div className='manual-damage'>
      <input
        value={manualBaseDamage}
        onChange={e => setManualBaseDamage(parseInt(e.target.value))}
        min="1" // these are probably fine, what else could it be (fusion rifle OR mimic gun)
        max="10"
        type='number'
        disabled={manualBaseDamageDisabled}
      />
      <div className={`asset ${damageType.toLowerCase()}`} />
    </div>
  )
}

export default BaseDamageBar;
