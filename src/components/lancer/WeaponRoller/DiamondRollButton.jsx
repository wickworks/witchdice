import React from 'react';
import BigRollButton from '../../shared/BigRollButton.jsx';

import './DiamondRollButton.scss';


const DiamondRollButton = ({
  rollBonus,
  rollBonusLabel,
  currentMod,
  createNewAttackRoll,
  rollResult = null,
}) => {

  const isShowingResult = rollResult !== null;

  return (
    <div className="DiamondRollButton">
      <div className='grit'>
        +{rollBonus}
        <span className='label'>{rollBonusLabel}</span>
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
        handleNewRoll={() => createNewAttackRoll(rollBonus, currentMod)}
        rollResult={rollResult}
        isDisabled={isShowingResult}
      />

    </div>
  )
}

export default DiamondRollButton;
