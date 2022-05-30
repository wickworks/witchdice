import React from 'react';

import './DetailedRollResults.scss';

const DetailedRollResults = ({
  toHitData,
  changeAccuracyMod,
}) => {

  // console.log('toHitData',toHitData);

  // find the index of the highest accuracy roll
  const usedAccuracyRolls = toHitData.accuracyRolls.slice(0, Math.abs(toHitData.accuracyMod))
  let highestAccuracyIndex = -1
  let highestAccuracy = 0
  usedAccuracyRolls.forEach((roll, i) => {
    if (roll > highestAccuracy) {
      highestAccuracy = roll
      highestAccuracyIndex = i
    }
  })

  const accuracyRollColor = toHitData.accuracyMod > 0 ? 'black' : 'rust'

  return (
    <div className="DetailedRollResults">
      <AccuracyDifficultyButtons changeAccuracyMod={changeAccuracyMod}/>

      <span className='asset d20' />
      <span className='amount'>{toHitData.baseRoll}</span>
      {parseInt(toHitData.flatBonus) !== 0 &&
        <>
          <span className='plus'>{parseInt(toHitData.flatBonus) > 0 ? '+' : ''}</span>
          <span className='amount'>
            {toHitData.flatBonus}
          </span>
        </>
      }
      {highestAccuracy > 0 &&
        <>
          <span className={`plus ${accuracyRollColor}`}>{parseInt(toHitData.accuracyBonus) > 0 ? '+' : '-'}</span>
          <span className={`asset d6 ${accuracyRollColor}`} />
          <span className='amount grey'>
            (
            {usedAccuracyRolls.map((roll,i) =>
              <span key={`accuracy-roll-${i}`}>
                {i > 0 && ','}
                <span className={i === highestAccuracyIndex ? accuracyRollColor : ''}>
                  {roll}
                </span>
              </span>
            )}
            )
          </span>
        </>
      }
    </div>
  )
}


const AccuracyDifficultyButtons = ({
  changeAccuracyMod,
}) => {

  return (
    <div className='AccuracyDifficultyButtons'>
      <button
        className='asset accuracy'
        onClick={() => changeAccuracyMod(1)}
        disabled={false}
      />
      <button
        className='asset difficulty'
        onClick={() => changeAccuracyMod(-1)}
        disabled={false}
      />
    </div>
  )
}

export default DetailedRollResults;
