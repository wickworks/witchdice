import React, { useState } from 'react';

import './MechNumberLabel.scss';

const MechNumberLabel = ({
  label = '',
  maxNumber,
  currentNumber,
  setCurrentNumber,
  icon = '',
  extraClass = '',
  leftToRight = true,
}) => {
  const maxNumberForInput = maxNumber ? maxNumber : 99

  return (
    <div className={`MechNumberLabel ${extraClass} ${leftToRight ? 'left-to-right' : 'right-to-left'}`}>

      <div className='numerical-count'>
        <input type='number' min={0} max={maxNumberForInput} value={currentNumber} onChange={e => setCurrentNumber(e.target.value)} />
        {maxNumber &&
          <>/{maxNumber}</>
        }
      </div>

      <div className='label'>
        {label && label}
        {icon && <span className={`asset ${icon}`} />}
      </div>
    </div>
  );
}




export default MechNumberLabel;
