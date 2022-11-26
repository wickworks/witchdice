import React from 'react';
import Tooltip from '../../shared/Tooltip';

import './MechNumberIcon.scss';

const MechNumberIcon = ({
  maxNumber,
  currentNumber,
  setCurrentNumber,
  icon = '',
  onIconClick = () => {},
  onIconRightClick = () => {},
  iconTooltipData = {},
  extraClass = '',
  leftToRight = true,
  buttonOnly = false,
  showResetButton = false,
}) => {
  const maxNumberForInput = maxNumber ? maxNumber : 30

  return (
    <div className={`MechNumberIcon ${extraClass} ${leftToRight ? 'left-to-right' : 'right-to-left'}`}>
      <button
        className={`main-button ${buttonOnly ? 'contains-number' : ''}`}
        onClick={onIconClick}
        onContextMenu={e => {e.preventDefault(); onIconRightClick();}}
      >
        <div className='icon-container'>
          <div className={`asset ${icon}`} />
          <div className='power-bars-coverup' />
        </div>

        {buttonOnly && currentNumber &&
          <div className='display-number'>{currentNumber}</div>
        }

        <Tooltip
          title={iconTooltipData.title}
          content={iconTooltipData.content}
          flavor={iconTooltipData.hint}
          skipCloseButton={true}
        />
      </button>

      { showResetButton &&
        <button className='reset-button' onClick={onIconRightClick}> ↺ </button>
      }

      { !buttonOnly &&
        <input type='number'
          min={0}
          max={maxNumberForInput}
          value={currentNumber}
          onChange={e => setCurrentNumber(e.target.value || 0)}
        />
      }
    </div>
  );
}




export default MechNumberIcon;
