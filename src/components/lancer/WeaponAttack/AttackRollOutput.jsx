import React, { useState } from 'react';

import './AttackRollOutput.scss';


const AttackRollOutput = ({
  rollResult,
  manualRoll,
  setManualRoll,
  isCrit,
  invertCrit,
  setInvertCrit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingRoll, setIsEditingRoll] = useState(false);

  const finalResult = manualRoll > 0 ? manualRoll : rollResult;

  const toggleManualRoll = () => {
    if (manualRoll > 0) {
      setManualRoll(0);
      setIsEditingRoll(false);
    } else {
      setManualRoll(rollResult);
      setIsEditingRoll(true);
    }
  }

  const manualRollActive = (isEditingRoll || manualRoll !== 0);


  return (
    <div className="AttackRollOutput">
      <button
        className={`die-and-result ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={isEditingRoll}
      >
        { isCrit ?
          <div className='die-icon asset d20_frame'>
            <div className='asset necrotic' />
          </div>
        :
          <div className='die-icon asset d20' />
        }

        {manualRollActive ?
          <input
            type="number"
            value={manualRoll}
            onChange={e => setManualRoll(Math.max(Math.min(e.target.value || 0, 20), 0))}
            onKeyDown={e => {if (e.key === 'Enter') setIsEditingRoll(false)} }
            onBlur={() => setIsEditingRoll(false)}
            onFocus={() => setIsEditingRoll(true)}
            autoFocus
          />
        :
          <div className='result'>{finalResult}</div>
        }
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


export default AttackRollOutput;
