import React, { useState } from 'react';

import './AttackRollOutput.scss';


const AttackRollOutput = ({
  finalResult,
  isCrit,
  isCritForced,
  setIsCritForced
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="AttackRollOutput">
      { isCrit ?
        <div className='die-icon asset d20_frame' onClick={() => setIsExpanded(true)}>
          <div className='asset necrotic' />
        </div>
      :
        <div className='die-icon asset d20' onClick={() => setIsExpanded(true)} />
      }

      <div className='die-icon result-roll'>
        {finalResult}
      </div>
    </div>
  )
}

export default AttackRollOutput;
