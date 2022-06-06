import React from 'react';
import DiamondRollButton from '../DiamondRollButton.jsx';
import DetailedRollResults from './AttackRollOutput/DetailedRollResults.jsx';

import './ChooseHitMiss.scss';

const ChooseHitMiss = ({
  rollBonusLabel,
  attackData,
  isRerolled,
  setIsRerolled,
  setIsHit,
  setIsChoosingHitMiss,
  changeAccuracyMod,
}) => {

  const toHitData = isRerolled ? attackData.toHitReroll : attackData.toHit;

  const handleChoice = (isHit) => {
    setIsHit(isHit);
    setIsChoosingHitMiss(false);
  }

  // rollBonus={toHitData.flatBonus}
  // rollBonusLabel={rollBonusLabel}
  // currentMod={toHitData.accuracyBonus}
  return (
    <div className="ChooseHitMiss WeaponRollerSetup">
      <DiamondRollButton
        createNewAttackRoll={() => setIsRerolled(!isRerolled)}
        rollResult={toHitData.finalResult}
      />

      <DetailedRollResults
        toHitData={toHitData}
        changeAccuracyMod={changeAccuracyMod}
      />

      <div className="column-container">
        <div className="column difficulty">
          <button
            className='choose-result result-miss'
            onClick={() => handleChoice(false)}
          >
            MISS
          </button>
        </div>

        <div className="column accuracy">
          <button
            className='choose-result result-hit'
            onClick={() => handleChoice(true)}
          >
            HIT
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChooseHitMiss;
