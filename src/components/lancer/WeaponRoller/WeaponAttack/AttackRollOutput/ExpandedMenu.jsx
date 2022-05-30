
import React, { useState } from 'react';
import './ExpandedMenu.scss';


const ExpandedMenu = ({
  isCrit,
  invertCrit,
  setInvertCrit,

  isRerolled,
  setIsRerolled,

  manualRoll,
  setManualRoll,
  manualRollActive,
  setIsEditingRoll,

  finalResult,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleManualRoll = () => {
    if (manualRoll > 0) {
      setManualRoll(0);
      setIsEditingRoll(false);
    } else {
      setManualRoll(finalResult);
      setIsEditingRoll(true);
    }
  }

  return (
    <div className='ExpandedMenu'>
      <button
        className={`kebab ${isExpanded ? 'active' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        ⋮
      </button>

      { isExpanded &&
        <div className='expanded-container'>
          <button
            className={invertCrit ? 'active' : ''}
            onClick={() => setInvertCrit(!invertCrit)}
            title='Toggle critical hit'
          >
            <div className='asset necrotic' />
          </button>

          <button
            className={isRerolled ? 'active' : ''}
            onClick={() => setIsRerolled(!isRerolled)}
            title='Reroll'
          >
            <div className='asset refresh' />
          </button>

          <button
            className={manualRollActive ? 'active' : ''}
            onClick={toggleManualRoll}
            title='Enter manual roll'
          >
            <div className='asset edit' />
          </button>
        </div>
      }
    </div>
  )
}

export default ExpandedMenu;
