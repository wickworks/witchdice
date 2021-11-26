import React from 'react';
import BigRollButton from '../../shared/BigRollButton.jsx';

import './DiamondRollButton.scss';


const DiamondRollButton = ({
  gritBonus,
  currentMod,
  createNewAttackRoll,
  rollResult = null,
}) => {

  const isShowingResult = rollResult !== null;

  return (
    <div className="DiamondRollButton">
      <div className='grit'>
        +{gritBonus}
        <span className='label'>Grit</span>
      </div>

      { currentMod !== 0 &&
        <div className={`accuracy ${currentMod < 0 ? 'actually-difficulty' : ''}`}>
          {currentMod > 0 ? '+' : ''}

          {!isShowingResult && currentMod}

          <span className='asset d6' />

          {isShowingResult && <strong>{currentMod}</strong>}

          <span className='label'>
            {!isShowingResult ?
              currentMod < 0 ? 'Diff' : 'Acc'
            :
              ''
            }
          </span>
        </div>
      }

      <BigRollButton
        handleNewRoll={() => createNewAttackRoll(gritBonus, currentMod)}
        rollResult={rollResult}
        isDisabled={isShowingResult}
      />

    </div>
  )
}

export default DiamondRollButton;
