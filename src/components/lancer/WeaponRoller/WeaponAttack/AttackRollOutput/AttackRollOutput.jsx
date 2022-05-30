import React, { useState } from 'react';
import ExpandedMenu from './ExpandedMenu.jsx';
import DetailedRollResults from './DetailedRollResults.jsx';

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

  // const accuracyPool = [...toHitData.accuracyRolls]
  // accuracyPool.sort((a, b) => { return b - a }); // highest first

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

      <DetailedRollResults
        toHitData={toHitData}
      />
    </div>
  )
}




export default AttackRollOutput;
