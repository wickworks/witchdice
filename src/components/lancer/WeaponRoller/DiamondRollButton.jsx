import React from 'react';
import BigRollButton from '../../shared/BigRollButton.jsx';

import './DiamondRollButton.scss';


const DiamondRollButton = ({
  rollBonus = null,
  rollBonusLabel,
  currentMod,
  createNewAttackRoll,
  rollResult = null,
}) => {
  const isShowingResult = rollResult !== null;
  let accuracyMod = currentMod || 0

  return (
    <div className="DiamondRollButton">
      { rollBonus !== null &&
        <div className='grit'>
          {rollBonus >= 0 ? '+' : ''}{rollBonus}
          <span className='label'>{rollBonusLabel}</span>
        </div>
      }

      { accuracyMod !== 0 &&
        <div className={`accuracy ${accuracyMod < 0 ? 'actually-difficulty' : ''}`}>
          {accuracyMod > 0 ? '+' : ''}

          {!isShowingResult && accuracyMod}

          <span className='asset d6' />

          {isShowingResult && <strong>{accuracyMod}</strong>}

          <span className='label'>
            {!isShowingResult ?
              accuracyMod < 0 ? 'Diff' : 'Acc'
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
