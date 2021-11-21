import React, { useState } from 'react';
import HitCheckbox from '../shared/HitCheckbox.jsx';

import './WeaponAttack.scss';


const WeaponAttack = ({
}) => {

  const isHit = true;
  const rollResult = 15;

  var diceElements = [];
  diceElements.push(
    <div
      className='damage-roll'
      key='404'
      onClick={() => {}}
    >
      <div className={`asset ${'fire'}`} />
      <div className='amount'>{5}</div>
    </div>
  );

  return (
    <div className="WeaponAttack">
      <div className="damage-container">

        <HitCheckbox
          isHit={isHit}
          handleHitClick={() => {}}
        />

        <div className='asset d20' />

        <div className='result-roll'>
          {rollResult}
        </div>

        <div className="damage-line">
          {diceElements}
        </div>

        <div className="subtotal-container">
          <div className='subtotal'>
            <div className='amount'>{5}</div>
            <div className={`asset ${'fire'}`} />
          </div>
        </div>
      </div>

      <div className="effects-container">
        <div>Immobilized</div>
        <div>Impaired</div>
      </div>
    </div>
  )
}


export default WeaponAttack;
