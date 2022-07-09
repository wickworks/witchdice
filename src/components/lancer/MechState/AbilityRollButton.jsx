import React from 'react';

import {
  blankDice,
} from '../../shared/DiceBag/DiceBagData.js';

import './AbilityRollButton.scss';

const AbilityRollButton = ({
  label,
  extraClass,

  flatBonus = 0,
  accuracy = 0,

  setDistantDicebagData,
}) => {

  const handleClick = () => {
    let diceData = {...blankDice}
    diceData['20'] = 1
    diceData['6'] = accuracy
    diceData['plus'] = flatBonus

    setDistantDicebagData({
      diceData: diceData,
      summaryMode: 'highest',
      annotation: `${extraClass.toUpperCase()} save`
    });
  }

  return (
    <button
      className={`AbilityRollButton ${extraClass}`}
      onClick={handleClick}
    >
      <div className='static-label'>{label}</div>
      <div className='check-values'>
        {accuracy > 0 ?
          <>{accuracy} <span className='asset accuracy' /></>
        : accuracy < 0 ?
          <>{Math.abs(accuracy)} <span className='asset difficulty' /></>
        :
          ''
        }
        {flatBonus >= 0 ? `+${flatBonus}` : flatBonus}
      </div>
    </button>
  );
}




export default AbilityRollButton;
