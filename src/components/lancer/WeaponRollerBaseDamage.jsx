import React from 'react';
import { MAX_BONUS } from './data.js';

import './WeaponRollerBaseDamage.scss';


const WeaponRollerBaseDamage = ({
  weaponData,
}) => {

  return (
    <div className="WeaponRollerBaseDamage">
      <div className="base-damage">
        <div>{'[ '}</div>
        { weaponData.damage.map((damage, i) =>
          <div className='damage-dice' key={`damage-${i}`}>
            {damage.val}
            <div className={`asset-lancer ${damage.type.toLowerCase()}`} />
          </div>
        )}
        <div>{' ]'}</div>
      </div>
    </div>
  )
}

export default WeaponRollerBaseDamage;
