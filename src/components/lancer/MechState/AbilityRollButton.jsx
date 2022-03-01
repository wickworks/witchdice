import React, { useState } from 'react';
import { getRandomInt } from '../../../utils.js';

import './AbilityRollButton.scss';

const AbilityRollButton = ({
  label,
  extraClass,

  flatBonus = 0,
  accuracy = 0,
}) => {
  const [rolledNumber, setRolledNumber] = useState(null);

  const handleClick = () => {
    if (rolledNumber === null) {
      const roll = getRandomInt(20)
      setRolledNumber(roll)
    } else {
      setRolledNumber(null)
    }
  }

  return (
    <button
      className={`AbilityRollButton ${extraClass} ${rolledNumber !== null ? 'rolled' : ''}`}
      onClick={handleClick}
    >
      <div className='static-label'>{label}</div>

      <div className='hover-info'>
        {rolledNumber !== null ? <>
          <div className='result'>
            {rolledNumber}
          </div>
        </> : <>
          <div className='to-roll-bonuses'>
            <div className='asset d20' />
            { (accuracy !== 0) &&
              <>
                {accuracy > 0 ? '+' : ''}
                {accuracy}
                <div className='asset d6' />
              </>
            }
            { (flatBonus !== 0) &&
              <>+{flatBonus}</>
            }
          </div>
        </>}
      </div>
    </button>
  );
}




export default AbilityRollButton;
