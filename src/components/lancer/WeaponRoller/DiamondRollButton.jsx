import React from 'react';
import BigRollButton from '../../shared/BigRollButton.jsx';

import './DiamondRollButton.scss';


const DiamondRollButton = ({
  gritBonus,
  currentMod,
  createNewAttackRoll,
  rollResult = null,
}) => {

  return (
    <div className="DiamondRollButton">
      <div className='grit'>
        +{gritBonus}
        <span className='label'>Grit</span>
      </div>

      { currentMod !== 0 &&
        <div className={`accuracy ${currentMod < 0 ? 'actually-difficulty' : ''}`}>
          {currentMod > 0 ? '+' : ''}
          {currentMod}
          <span className='asset d6' />
          <span className='label'>
            {currentMod < 0 ? 'Diff' : 'Acc'}
          </span>
        </div>
      }

      <BigRollButton
        handleNewRoll={() => createNewAttackRoll(gritBonus, currentMod)}
        rollResult={rollResult}
        isDisabled={rollResult !== null}
      />

    </div>
  )
}

export default DiamondRollButton;
