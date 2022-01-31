import React from 'react';

import './DamageModifierBar.scss';

const DamageModifierBar = ({
  damageModifiers,
  toggleDamageModifier,
}) => {
  return (
    <div className="DamageModifierBar">
      <button
        className={damageModifiers.half ? 'active' : ''}
        onClick={() => toggleDamageModifier('half')}
      >
        <div className='asset x' />
        <div>1 / 2</div>
      </button>

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
    </div>
  )
}

export default DamageModifierBar;
