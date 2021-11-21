import React, { useState } from 'react';
import WeaponAttack from './WeaponAttack.jsx';
import WeaponAttackSetup from './WeaponAttackSetup.jsx';

import { allTags } from './data.js';

import './WeaponRoller.scss';


const WeaponRoller = ({
  weaponData
}) => {
  const [showAttackSetup, setShowAttackSetup] = useState(true);

  let weaponTags = []
  weaponData.tags.map(tag => {
    const tagData = allTags.find(weapontag => weapontag.id === tag.id);
    weaponTags.push(tagData.name)
  })


  return (
    <div className="WeaponRoller">
      <div className="top-bar">

        <div className="name-and-tags">
          <h3 className='name'>{weaponData.name}</h3>
          <div className="tags">{weaponTags.join(', ')}</div>
        </div>

        <div className="damage-row">
          <div className="base-damage-container">
            {'[ '}
            { weaponData.damage.map((damage, i) =>
              <span key={`damage-${i}`}>
                {damage.val}
                {damage.type}
              </span>
            )}
            {' ]'}
          </div>

          <div className="bonus-damage-container">

            <div className='bonus-damage-other'>
              <button className='asset plus'>
              </button>
              <button className='asset d6'>
              </button>
              Bonus damage
            </div>
          </div>
        </div>

      </div>

      <WeaponAttack />

      {showAttackSetup &&
        <WeaponAttackSetup />
      }


    </div>
  )
}


export default WeaponRoller;
