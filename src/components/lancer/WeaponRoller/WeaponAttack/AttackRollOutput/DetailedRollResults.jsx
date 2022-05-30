import React from 'react';

import './DetailedRollResults.scss';

const DetailedRollResults = ({
  toHitData,
}) => {

  console.log('toHitData',toHitData);
  // console.log('accuracyPool',accuracyPool);

  // find the index of the highest accuracy roll
  let highestAccuracyIndex = -1
  let highestAccuracy = 0
  toHitData.accuracyRolls.forEach((roll, i) => {
    if (roll > highestAccuracy) {
      highestAccuracy = roll
      highestAccuracyIndex = i
    }
  })


  return (
    <div className="DetailedRollResults">
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
      {toHitData.accuracyRolls.length > 0 &&
        <>
          <span className='plus'>{parseInt(toHitData.accuracyBonus) > 0 ? '+' : '-'}</span>
          <span className='asset d6' />
          <span className='amount grey'>
            (
            {toHitData.accuracyRolls.map((roll,i) =>
              <span key={`accuracy-roll-${i}`}>
                {i > 0 && ','}
                <span className={i === highestAccuracyIndex ? 'black' : ''}>
                  {roll}
                </span>
              </span>
            )}
            )
          </span>
        </>
      }
      <AccuracyDifficultyButtons changeAccuracy={()=>{}}/>
    </div>
  )
}


const AccuracyDifficultyButtons = ({
  changeAccuracy,
}) => {

  return (
    <div className='AccuracyDifficultyButtons'>
      <button
        className='asset accuracy'
        onClick={() => changeAccuracy(1)}
        disabled={false}
      />
      <button
        className='asset difficulty'
        onClick={() => changeAccuracy(-1)}
        disabled={false}
      />
    </div>
  )
}

export default DetailedRollResults;
