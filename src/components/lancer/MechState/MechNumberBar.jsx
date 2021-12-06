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

          // show the difference between current and the clickable number
          var showNumber
          if (i+1 === currentNumber) {
            showNumber = currentNumber
          } else {
            showNumber = (i+1) - currentNumber
            if (showNumber > 0) showNumber = `+${showNumber}`
          }

          return (
            <button
              className={`tick ${filledClass} ${overshieldClass}`}
              onClick={() => setCurrentNumber(i+1)}
              key={`${label}-tick-${i}`}
              disabled={i+1 === currentNumber}
            >
              <div className='asset dot' />
              <div className='number'>
                {showNumber}
              </div>
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
