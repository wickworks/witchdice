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

  overchargeDie = '',
  handleOverchargeClick = () => {},
  overchargeTooltip = {},

  extraClass = '',
  leftToRight = true,
  skipManualInput = false,
}) => {

  const smallTicksClass = maxNumber > 22 ? 'small-ticks' : ''

  return (
    <div className={`MechNumberBar ${extraClass} ${leftToRight ? 'left-to-right' : 'right-to-left'}  ${smallTicksClass}`}>

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
          <div className={`final-icon-container armor ${currentNumber === maxNumber ? 'filled' : ''} ${overshield > 0 ? 'overshield' : ''}`}>
            <div className='asset armor'>
              {armor}
            </div>
          </div>
        }

        {overchargeDie &&
          <button className='final-icon-container overcharge filled' onClick={handleOverchargeClick}>
            {overchargeDie}
            <div className='asset heat' />

            <Tooltip
              title={overchargeTooltip.title}
              content={overchargeTooltip.content}
              flavor={overchargeTooltip.hint}
              skipCloseButton={true}
            />
          </button>
        }
      </div>
    </div>
  );
}




export default MechNumberBar;
