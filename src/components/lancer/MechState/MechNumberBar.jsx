import React, { useState } from 'react';

import './MechNumberBar.scss';

const MechNumberBar = ({
  label,
  extraClass,
  maxNumber,
  currentNumber,
  setCurrentNumber,
  leftToRight = true,
  skipManualInput = false,
}) => {
  // const displayNumber = hoveringNumber !== null ? hoveringNumber : currentNumber

  return (
    <div className={`MechNumberBar ${extraClass} ${leftToRight ? 'left-to-right' : 'right-to-left'}`}>

      <div className='label-container'>
        {!skipManualInput &&
          <div className='numerical-count'>
            <input type='number' min={0} max={maxNumber} value={currentNumber} onChange={e => setCurrentNumber(e.target.value)} />
            /
            {maxNumber}
          </div>
        }
        <div className='label'>
          {skipManualInput && <span>{currentNumber}</span>}
          {label}
        </div>
      </div>

      <div className='ticks-container'>

        <button
          className={`tick zero ${currentNumber > 0 ? 'filled' : 'empty'}`}
          onClick={() => setCurrentNumber(0)}
        />

        { [...Array(maxNumber)].map((undef, i) => {
          const filledClass = (i < currentNumber) ? 'filled' : 'empty'
          return (
            <button
              className={`tick ${filledClass}`}
              onClick={() => setCurrentNumber(i+1)}
              key={`${label}-tick-${i}`}
            >
              <div className='asset dot' />
              <div className='number'>{i+1}</div>
            </button>
          )
        })}
      </div>
    </div>
  );
}




export default MechNumberBar;
