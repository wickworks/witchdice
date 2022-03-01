import React, { useState } from 'react';
import { getRandomInt } from '../../../utils.js';

import './AbilityRollButton.scss';

const AbilityRollButton = ({
  label,
  extraClass,

  flatBonus = 0,
  accuracy = 0,

  addNewDicebagPartyRoll,
}) => {
  const [rolledNumber, setRolledNumber] = useState(null);

  const handleClick = () => {
    if (rolledNumber === null) {

      let rollData = [];
      rollData.push({dieType: 'd20', result: getRandomInt(20), sign: 1})

      for (let rollID = 0; rollID < Math.abs(accuracy); rollID++) {
        rollData.push({dieType: 'd6', result: getRandomInt(6), sign: Math.sign(accuracy)})
      }

      if (flatBonus !== 0) {
        rollData.push({dieType: 'plus', result: Math.abs(flatBonus), sign: Math.sign(flatBonus)})
      }

      addNewDicebagPartyRoll(rollData, 'high', true);

      const total = rollData.reduce((runningTotal, roll) =>
        runningTotal + (roll.result * roll.sign)
      , 0)
      setRolledNumber(total)


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
