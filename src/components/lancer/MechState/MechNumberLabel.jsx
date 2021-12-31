import React, { useState } from 'react';

import './MechNumberLabel.scss';

const MechNumberLabel = ({
  label = '',
  maxNumber,
  currentNumber,
  setCurrentNumber,
  extraClass = '',
  leftToRight = true,
}) => {
  const maxNumberForInput = maxNumber ? maxNumber : 20

  return (
    <div className={`MechNumberLabel ${extraClass} ${leftToRight ? 'left-to-right' : 'right-to-left'}`}>
      <div className='label'>
        {label}
      </div>

      <div className='numerical-count'>
        <input type='number' min={0} max={maxNumberForInput} value={currentNumber} onChange={e => setCurrentNumber(e.target.value || 0)} />
        /{maxNumber}
      </div>
    </div>
  );
}




export default MechNumberLabel;
