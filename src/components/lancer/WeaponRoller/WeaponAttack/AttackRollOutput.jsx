import React, { useState } from 'react';

import './AttackRollOutput.scss';

const AttackRollOutput = ({
  toHitData,
  manualRoll,
  setManualRoll,
  isCrit,
  invertCrit,
  setInvertCrit,
  isRerolled,
  setIsRerolled,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingRoll, setIsEditingRoll] = useState(false);

  const finalResult = manualRoll > 0 ? manualRoll : toHitData.finalResult;

  const toggleManualRoll = () => {
    if (manualRoll > 0) {
      setManualRoll(0);
      setIsEditingRoll(false);
    } else {
      setManualRoll(toHitData.finalResult);
      setIsEditingRoll(true);
    }
  }

  const manualRollActive = (isEditingRoll || manualRoll !== 0);

  const accuracyPool = [...toHitData.accuracyRolls]
  accuracyPool.sort((a, b) => { return b - a }); // highest first

  return (
    <div className="AttackRollOutput">

      <div className="final-result-container">
        <button
          className={`die-and-result ${isExpanded ? 'expanded' : 'condensed'} ${manualRollActive ? 'manual' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={isEditingRoll}
        >
          <div className="current-result-container">
            { isCrit ?
              <div className='die-icon asset d20_frame'>
                <div className='asset necrotic' />
              </div>
            :
              <div className='die-icon asset d20' />
            }

            { !manualRollActive &&
              <div className='result'>{finalResult}</div>
            }
          </div>

          <div className="to-hit-container">
            <span className='asset d20' />
            <span className='amount'>{toHitData.baseRoll}</span>
            {accuracyPool.length > 0 &&
              <>
                <span className='plus'>{parseInt(toHitData.accuracyBonus) > 0 ? '+' : '-'}</span>
                <span className='asset d6' />
                <span className='amount'>
                  {accuracyPool[0]}
                </span>
              </>
            }
            {parseInt(toHitData.flatBonus) !== 0 &&
              <>
                <span className='plus'>{parseInt(toHitData.flatBonus) > 0 ? '+' : ''}</span>
                <span className='amount'>
                  {toHitData.flatBonus}
                </span>
              </>
            }
          </div>

        </button>

        { manualRollActive &&
          <input
            className='manual-result'
            type="number"
            value={manualRoll}
            onChange={e => setManualRoll(Math.max(Math.min(e.target.value || 0, 20), 0))}
            onKeyDown={e => {if (e.key === 'Enter') setIsEditingRoll(false)} }
            onBlur={() => setIsEditingRoll(false)}
            onFocus={e => setIsEditingRoll(true)}
            autoFocus
          />
        }
      </div>

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


export default AttackRollOutput;
