import React, { useState } from 'react';

import './MechNumberBar.scss';

const MechNumberBar = ({
  label,
  maxNumber,
  currentNumber,
  setCurrentNumber,
  overshield = 0,
  armor = 0,
  extraClass = '',
  leftToRight = true,
  skipManualInput = false,
}) => {
  // const displayNumber = hoveringNumber !== null ? hoveringNumber : currentNumber

  const handleTickClick = (number) => {
    // if change is 0, that means they clicked the end of the bar; do 1 damage
    if (number > 0 && number === currentNumber) {
      number -= 1;
    }

    setCurrentNumber(number)
  }

  return (
    <div className={`MechNumberBar ${extraClass} ${leftToRight ? 'left-to-right' : 'right-to-left'}`}>

      <div className='ticks-container'>

        <button
          className={`tick zero ${currentNumber > 0 ? 'filled' : 'empty'}`}
          onClick={() => setCurrentNumber(0)}
        />

        { [...Array(maxNumber)].map((undef, i) => {
          const filledClass = (i < currentNumber) ? 'filled' : 'empty'

          const noOvershield = currentNumber-overshield
          const overshieldClass = (i >= noOvershield && overshield > 0) ? 'overshield' : ''
          var showNumber = (i+1)
          if (overshieldClass) {
            if (i >= noOvershield) showNumber = (i-noOvershield+1)
            if (i >= currentNumber) showNumber = (i-overshield+1)
          }
          return (
            <button
              className={`tick ${filledClass} ${overshieldClass}`}
              onClick={() => handleTickClick(i+1)}
              key={`${label}-tick-${i}`}
            >
              <div className='asset dot' />
              <div className='number'>{showNumber}</div>
            </button>
          )
        })}

        {(armor > 0) &&
          <div className={`armor-container ${currentNumber === maxNumber ? 'filled' : ''} ${overshield > 0 ? 'overshield' : ''}`}>
            <div className='armor asset shield-outline'>
              {armor}
            </div>
          </div>
        }
      </div>
    </div>
  );
}




export default MechNumberBar;
