import React, { useState } from 'react';
import Tooltip from '../../shared/Tooltip';

import './MechNumberBar.scss';

const MechNumberBar = ({
  label,
  maxNumber,
  currentNumber,
  setCurrentNumber,

  overshield = 0,
  armor = 0,
  burn = 0,

  dotIcon = 'dot',
  zeroIcon = '',

  extraClass = '',
  leftToRight = true,
  skipManualInput = false,
  showAbsoluteValues = false,
}) => {

  const smallTicksClass = maxNumber > 28 ? 'small-ticks' : ''

  const burnTarget = (currentNumber - burn)
  const zeroTickBurnClass = (currentNumber > 0 && burn > 0 && burnTarget <= 0) ? 'burn-target' : ''
  const leftRightClass = leftToRight ? 'left-to-right' : 'right-to-left'
  const absValuesClass = showAbsoluteValues ? 'absolute-values' : ''

  return (
    <div className={`MechNumberBar ${extraClass} ${leftRightClass} ${smallTicksClass} ${absValuesClass}`}>

      <div className='ticks-container'>

        <button
          className={`tick zero ${currentNumber > 0 ? 'filled' : 'empty'} ${zeroTickBurnClass}`}
          onClick={() => setCurrentNumber(0)}
        >
          {zeroIcon && <div className={`asset ${zeroIcon}`} />}
          <div className='number'>0</div>
        </button>

        { [...Array(maxNumber || 0)].map((undef, i) => {
          const distanceFromCurrent = (i+1) - currentNumber

          const filledClass = (i < currentNumber) ? 'filled' : 'empty'

          const noOvershield = currentNumber-overshield
          const overshieldClass = (i >= noOvershield && overshield > 0) ? 'overshield' : ''

          const burnClass = (distanceFromCurrent < 0 && (i+1) === burnTarget) ? 'burn-target' : ''

          // show the difference between current and the clickable number
          var showNumber
          if (showAbsoluteValues) {
            showNumber = (i+1)
          } else {
            if (i+1 === currentNumber) {
              showNumber = currentNumber
            } else {
              showNumber = distanceFromCurrent
              if (showNumber > 0) showNumber = `+${showNumber}`
            }
          }

          return (
            <button
              className={`tick ${filledClass} ${overshieldClass} ${burnClass}`}
              onClick={() => setCurrentNumber(i+1)}
              key={`${label}-tick-${i}`}
              disabled={i+1 === currentNumber}
            >
              <div className={`asset ${dotIcon}`} />
              <div className='asset burn' />
              <div className='number'>{showNumber}</div>
            </button>
          )
        })}

        {(armor > 0) &&
          <div className={`armor-container armor ${currentNumber === maxNumber ? 'filled' : ''} ${overshield > 0 ? 'overshield' : ''}`}>
            <div className='asset armor'>
              {armor}
            </div>
          </div>
        }
      </div>
    </div>
  );
}




export default MechNumberBar;
