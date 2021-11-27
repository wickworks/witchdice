import React from 'react';
import DiamondRollButton from '../DiamondRollButton.jsx';

import './ChooseHitMiss.scss';

const ChooseHitMiss = ({
  attackData,
  isRerolled,
  setIsRerolled,
  setIsHit,
  setIsChoosingHitMiss
}) => {

  const toHitData = isRerolled ? attackData.toHitReroll : attackData.toHit;

  const handleChoice = (isHit) => {
    setIsHit(isHit);
    setIsChoosingHitMiss(false);
  }

  return (
    <div className="ChooseHitMiss WeaponRollerSetup">
      <DiamondRollButton
        gritBonus={toHitData.flatBonus}
        currentMod={toHitData.accuracyBonus}
        createNewAttackRoll={() => setIsRerolled(!isRerolled)}
        rollResult={toHitData.finalResult}
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
