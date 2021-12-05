import React, { useState } from 'react';

import './MechNumberBar.scss';

const MechNumberBar = ({
  label,
  extraClass,
  maxNumber,
  currentNumber,
  setCurrentNumber,
  leftToRight = true,
}) => {
  const [hoveringNumber, setHoveringNumber] = useState(null);

  // const displayNumber = hoveringNumber !== null ? hoveringNumber : currentNumber

  return (
    <div className={`MechNumberBar ${extraClass}`}>

      <div className='label-container'>
        {label}
        <span className='numerical-count'>
          {currentNumber}
          /
          {maxNumber}
        </span>
      </div>

      <div className={`ticks-container ${leftToRight ? 'left-to-right' : 'right-to-left'}`}>

        <button
          className={`tick ${currentNumber > 0 ? 'filled' : 'empty'}`}
          onClick={() => setCurrentNumber(0)}
          onMouseEnter={() => setHoveringNumber(0)}
          onMouseLeave={() => setHoveringNumber(null)}
        />

        { [...Array(maxNumber)].map((undef, i) => {
          const filledClass = (i < currentNumber) ? 'filled' : 'empty'

          var nearClass = 'not-hovering'
          if (hoveringNumber !== null) {
            var distance = Math.abs(hoveringNumber - (i+1))
            // if (hoveringNumber - i < 0) distance += 2
            nearClass = distance < 6 ? `nearby-${distance}` : 'distant'
          }

          return (
            <button
              className={`tick ${filledClass} ${nearClass}`}
              onClick={() => setCurrentNumber(i+1)}
              onMouseEnter={() => setHoveringNumber(i+1)}
              onMouseLeave={() => setHoveringNumber(null)}
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
