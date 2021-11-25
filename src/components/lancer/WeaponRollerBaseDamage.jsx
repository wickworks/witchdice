import React from 'react';
import { MAX_BONUS } from './data.js';

import './WeaponRollerBaseDamage.scss';


const WeaponRollerBaseDamage = ({
  weaponData,
  damageModifiers,
  toggleDamageModifier,
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

      <div className="multipliers">
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

        <button
          className={damageModifiers.half ? 'active' : ''}
          onClick={() => toggleDamageModifier('half')}
        >
          <div className='asset x' />
          <div>.5</div>
        </button>
      </div>
    </div>
  )
}

export default WeaponRollerBaseDamage;
