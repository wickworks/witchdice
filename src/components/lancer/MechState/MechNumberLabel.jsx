import React, { useState } from 'react';
import Tooltip from '../../shared/Tooltip';

import './MechNumberLabel.scss';

const MechNumberLabel = ({
  label = '',
  maxNumber,
  currentNumber,
  setCurrentNumber,
  icon = '',
  onIconClick = () => {},
  iconTooltipData = {},
  extraClass = '',
  leftToRight = true,
}) => {
  const maxNumberForInput = maxNumber ? maxNumber : 20

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
        {icon &&
          <button onClick={onIconClick}>
            <div className={`asset ${icon}`} />

            <Tooltip
              title={iconTooltipData.title}
              content={iconTooltipData.content}
              flavor={iconTooltipData.hint}
              skipCloseButton={true}
            />
          </button>
        }
      </div>
    </div>
  );
}




export default MechNumberLabel;
