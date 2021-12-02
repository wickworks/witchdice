import React from 'react';
import './BaseDamageBar.scss';

import {
  getTagName,
} from '../lancerData.js';

const BaseDamageBar = ({
  weaponProfile,
  mountType,
  isActive,
  isClickable,
  onClick,
}) => {

  let weaponTags = []
  if (weaponProfile.tags) {
    weaponProfile.tags.forEach(tag => {
      weaponTags.push( getTagName(tag) )
    })
  }

  // console.log('weaponProfile',weaponProfile);

  return (
    <button
      className={`BaseDamageBar ${isActive ? 'active' : ''}`}
      onClick={onClick}
      disabled={!isClickable}
    >
      <div className="damage-and-range">
        <div className="base-damage">
          <div className='bracket'>{'[ '}</div>
          { weaponProfile.damage.map((damage, i) =>
            <div className='damage-dice' key={`damage-${i}`}>
              {damage.val}
              <div className={`asset ${damage.type.toLowerCase()}`} />
            </div>
          )}
          <div className='bracket'>{' ]'}</div>
        </div>

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

export default BaseDamageBar;
