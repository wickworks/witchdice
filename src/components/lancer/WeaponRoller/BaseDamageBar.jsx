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

  return (
    <button
      className={`BaseDamageBar ${isActive ? 'active' : ''}`}
      onClick={onClick}
      disabled={!isClickable}
    >
      <div className="base-damage">
        <div>{'[ '}</div>
        { weaponProfile.damage.map((damage, i) =>
          <div className='damage-dice' key={`damage-${i}`}>
            {damage.val}
            <div className={`asset ${damage.type.toLowerCase()}`} />
          </div>
        )}
        <div>{' ]'}</div>
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
