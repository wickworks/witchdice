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

  const displayNumber = hoveringNumber !== null ? hoveringNumber : currentNumber

  return (
    <div className={`MechNumberBar ${extraClass}`}>

      <div className='label-container'>
        {label}
        <span className='numerical-count'>
          {displayNumber}
          /
          {maxNumber}
        </span>
      </div>

      <div className={`ticks-container ${leftToRight ? 'left-to-right' : 'right-to-left'}`}>

        { [...Array(maxNumber+1)].map((undef, i) => {
          const filledClass = (currentNumber > 0 && i <= currentNumber) ? 'filled' : 'empty'

          const distance = Math.abs(currentNumber - i)
          const nearClass = distance < 6 ? `nearby-${distance}` : ''

          return (
            <button
              className={`tick ${filledClass} ${nearClass}`}
              onClick={() => setCurrentNumber(i)}
              onMouseEnter={() => setHoveringNumber(i)}
              onMouseLeave={() => setHoveringNumber(null)}
              key={`${label}-tick-${i}`}
            >
              <div className='asset dot' />
              {/*<div className='number'>{i}</div>*/}
            </button>
          )
        })}
      </div>
    </div>
  );
}




export default MechNumberBar;
