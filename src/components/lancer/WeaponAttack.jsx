import React, { useState } from 'react';
import HitCheckbox from '../shared/HitCheckbox.jsx';

import './WeaponAttack.scss';


const WeaponAttack = ({
  attackData,
}) => {
  const [isHit, setIsHit] = useState(true);

  const isCrit = isHit && attackData.toHit.finalResult >= 20;

  var damageElements = [];

  return (
    <div className="WeaponAttack">
      <div className="damage-container">

        <HitCheckbox
          isHit={isHit}
          handleHitClick={() => setIsHit(!isHit)}
        />

        <div className='asset d20' />

        <div className='result-roll'>
          {attackData.toHit.finalResult}
        </div>

        <div className="damage-line">
          { attackData.damage.rolls.map((damageRoll, i) =>
            <div
              className='damage-roll'
              onClick={() => {}}
              key={i}
            >
              <div className={`asset ${'fire'}`} />
              <div className='amount'>{damageRoll.roll}</div>
            </div>
          )}
        </div>

        <div className="subtotal-container">
          { Object.keys(attackData.damage.totalsByType).map((type, i) =>
            <div className='subtotal' key={type}>
              <div className='amount'>{attackData.damage.totalsByType[type]}</div>
              <div className={`asset ${'fire'}`} />
            </div>
          )}
        </div>
      </div>

      <div className="effects-container">
        {isHit &&
          <div>{attackData.onHit}</div>
        }
        {isCrit &&
          <div>{attackData.onCrit}</div>
        }
      </div>
    </div>
  )
}


export default WeaponAttack;
