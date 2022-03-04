import React from 'react';
import { getRandomInt } from '../../../utils.js';

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
      summaryMode: 'high',
      annotation: `${extraClass.toUpperCase()} save`
    });
  }

  return (
    <button
      className={`AbilityRollButton ${extraClass}`}
      onClick={handleClick}
    >
      <div className='static-label'>{label}</div>
    </button>
  );
}




export default AbilityRollButton;
