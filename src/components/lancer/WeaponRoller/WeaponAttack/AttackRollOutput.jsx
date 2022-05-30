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
  const [isEditingRoll, setIsEditingRoll] = useState(false);

  const finalResult = manualRoll > 0 ? manualRoll : toHitData.finalResult;

  const manualRollActive = (isEditingRoll || manualRoll !== 0);

  const accuracyPool = [...toHitData.accuracyRolls]
  accuracyPool.sort((a, b) => { return b - a }); // highest first

  return (
    <div className="AttackRollOutput">

      <div className="result-container">
        { isCrit ?
          <div className='die-icon asset d20_frame'>
            <div className='asset necrotic' />
          </div>
        :
          <div className='die-icon asset d20' />
        }

        { manualRollActive ?
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
        :
          <div className='result'>{finalResult}</div>
        }
      </div>

      <ExpandedMenu
        isCrit={isCrit}
        invertCrit={invertCrit}
        setInvertCrit={setInvertCrit}
        isRerolled={isRerolled}
        setIsRerolled={setIsRerolled}
        manualRoll={manualRoll}
        setManualRoll={setManualRoll}
        manualRollActive={manualRollActive}
        setIsEditingRoll={setIsEditingRoll}
        finalResult={toHitData.finalResult}
      />
    </div>
  )
}

const DetailedRollResults = ({
  toHitData,
  accuracyPool,
}) => {


  return (
    <div className="DetailedRollResults">
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
  )
}

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


export default AttackRollOutput;
