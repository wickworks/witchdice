import React, { useState } from 'react';

import './MechNumberBar.scss';

const MechNumberBar = ({
  label,
  extraClass,
  maxNumber,
  currentNumber,
  leftToRight = true,
}) => {


  return (
    <div className={`MechNumberBar ${extraClass}`}>

      <div className='label-container'>
        {label}
      </div>

      <div className={`ticks-container ${leftToRight ? 'left-to-right' : 'right-to-left'}`}>

        { [...Array(maxNumber)].map((undef, i) =>
          <button
            className={`tick hp-${i} ${(i+1) <= currentNumber ? 'filled' : 'empty'}`}
            key={`${label}-tick-${i}`}
          >{i}</button>
        )}
      </div>
    </div>
  );
}




export default MechNumberBar;
