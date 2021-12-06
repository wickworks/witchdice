import React, { useState } from 'react';

import './MechNumberBar.scss';

const MechNumberBar = ({
  label,
  maxNumber,
  currentNumber,
  setCurrentNumber,
  bonusNumber = 0, // i.e. overshield
  extraClass = '',
  leftToRight = true,
  skipManualInput = false,
}) => {
  // const displayNumber = hoveringNumber !== null ? hoveringNumber : currentNumber

  return (
    <div className={`MechNumberBar ${extraClass} ${leftToRight ? 'left-to-right' : 'right-to-left'}`}>

      <div className='ticks-container'>

        <button
          className={`tick zero ${currentNumber > 0 ? 'filled' : 'empty'}`}
          onClick={() => setCurrentNumber(0)}
        />

        { [...Array(maxNumber)].map((undef, i) => {
          const filledClass = (i < currentNumber) ? 'filled' : 'empty'
          const bonusClass = (i >= currentNumber-bonusNumber) ? 'bonus' : ''
          return (
            <button
              className={`tick ${filledClass} ${bonusClass}`}
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
