import React from 'react';
import './BaseDamageBar.scss';

import {
  getTagName,
} from '../lancerData.js';

const BaseDamageBar = ({
  weaponProfile,
  mountType,
}) => {

  let weaponTags = []
  if (weaponProfile.tags) {
    weaponProfile.tags.forEach(tag => {
      weaponTags.push( getTagName(tag) )
    })
  }

  return (
    <div className="BaseDamageBar">
      <div className="base-damage">
        <div>{'[ '}</div>
        { weaponProfile.damage.map((damage, i) =>
          <div className='damage-dice' key={`damage-${i}`}>
            {damage.val}
            <div className={`asset-lancer ${damage.type.toLowerCase()}`} />
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
    </div>
  )
}

export default BaseDamageBar;
