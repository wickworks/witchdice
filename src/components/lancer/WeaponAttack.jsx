import React, { useState } from 'react';
import HitCheckbox from '../shared/HitCheckbox.jsx';

import './WeaponAttack.scss';


const WeaponAttack = ({
  attackData,
}) => {
  const [isHit, setIsHit] = useState(true);

  const isCrit = isHit && attackData.toHit.finalResult >= 20;

  const isReliable = !isHit && attackData.damage.reliable.val > 0

  var effectsList = [];
  if (isHit && attackData.onHit) effectsList.push(attackData.onHit)
  if (isCrit && attackData.onCrit) effectsList.push(attackData.onHit)
  if (isReliable) effectsList.push('Reliable')

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

        { isHit ?
          <>
            <div className="damage-line">
              { attackData.damage.rolls.map((damageRoll, i) =>
                <div
                  className='damage-roll'
                  onClick={() => {}}
                  key={i}
                >
                  <div className={`asset-lancer ${damageRoll.type.toLowerCase()}`} />
                  <div className='amount'>{damageRoll.roll}</div>
                </div>
              )}
            </div>

            <div className="subtotal-container">
              { Object.keys(attackData.damage.totalsByType).map((type, i) =>
                <div className='subtotal' key={type}>
                  <div className='amount'>{attackData.damage.totalsByType[type]}</div>
                  <div className={`asset-lancer ${type.toLowerCase()}`} />
                </div>
              )}
            </div>
          </>
        : isReliable ?
          <>
            <div className="miss-line" />
            <div className="subtotal-container">
              <div className='subtotal'>
                <div className='amount'>{attackData.damage.reliable.val}</div>
                <div className={`asset-lancer ${attackData.damage.reliable.type.toLowerCase()}`} />
              </div>
            </div>
          </>
        :
          <div className="miss-line" />
        }
      </div>

      <div className="effects-container">
        { effectsList.map((effect, i) =>
          <div key={i}>
            {effect}
          </div>
        )}
      </div>
    </div>
  )
}


export default WeaponAttack;
