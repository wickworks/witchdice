import React, { useState } from 'react';
import { getRandomInt } from '../utils.js';
import './DiceBag.scss';

const blankDice = {
  '4': 0,
  '6': 0,
  '8': 0,
  '10': 0,
  '12': 0,
  '20': 0,
}

const DiceBag = ({addNewDicebagPartyRoll}) => {

  const [diceData, setDiceData] = useState({...blankDice});

  const [resultSummary, setResultSummary] = useState('');
  const [resultTotal, setResultTotal] = useState('');
  const [lastDieRolled, setLastDieRolled] = useState('');

  const updateDiceData = (dieType, dieCount) => {
    let newData = {...diceData}
    newData[dieType] = dieCount
    setDiceData(newData);
  }

  const handleRoll = () => {
    let runningResults = [];
    let runningTotal = 0;
    let actionRollData = [];  // for the party panel

    Object.keys(diceData).forEach((dieType, i) => {
      for (let rollID = 0; rollID < diceData[dieType]; rollID++) {
        const result = getRandomInt(parseInt(dieType));
        runningResults.push(result)
        runningTotal += result;

        actionRollData.push( {dieType: `d${dieType}`, result: result} )
        setLastDieRolled(dieType);
      }
    });

    setResultSummary(runningResults.join(' + '));
    setResultTotal(runningTotal);
    setDiceData({...blankDice});

    // add it to the party roll panel
    addNewDicebagPartyRoll(actionRollData);
  }

  let rollDieType = '';
  let totalDiceRolled = 0;
  Object.keys(diceData).forEach((dieType) => {
    if (diceData[dieType] > 0) {
      rollDieType = dieType;
      totalDiceRolled = totalDiceRolled + diceData[dieType];
    }
  });

  return (
    <div className="DiceBag">
      <h2>Dice Bag</h2>

      <hr className='pumpkin-bar' />
      <div className='bag-container'>

        <div className='rolling-surface'>

          { (rollDieType.length > 0) ?
            <div className='pre-roll'>
              <button className='roll' onClick={handleRoll}>
                <div className={`asset d${rollDieType}`} />
              </button>
              <div  className='action'>~ Roll ~</div>
            </div>
          : lastDieRolled ?
            <div className='post-roll'>
              <div className='result-total'>
                <div className={`asset d${lastDieRolled}`} />
                {resultTotal}
              </div>
              { resultSummary.length > 4 &&
                <div className='result-summary'> {resultSummary} </div>
              }
            </div>
          :
            <div className='starting-roll'>
              <div className={`asset d6`} />
            </div>
          }
        </div>

        <div className='die-button-container'>
          { Object.keys(diceData).map((dieType, i) => {

            return (
              <DieButton
                dieType={dieType}
                dieCount={diceData[dieType]}
                setDieCount={(newCount) => updateDiceData(dieType, newCount)}
                key={i}
              />
            )
          })}
        </div>

      </div>
      <hr className='pumpkin-bar' />

    </div>
  );
}


const DieButton = (props) => {
  const { dieType, dieCount, setDieCount } = props;

  function handleClick(e, leftMouse) {
    let newDieCount = dieCount;

    if (leftMouse && !e.shiftKey) {
      newDieCount += 1;
    } else {
      newDieCount -= 1;
      e.preventDefault()
    }

    newDieCount = Math.min(newDieCount, 99);
    newDieCount = Math.max(newDieCount, 0);
    setDieCount(newDieCount)
  }

  const dieClass = dieCount > 0 ? 'will-roll' : '';

  return (
    <button className={`DieButton ${dieClass}`}
      onClick={(e) => handleClick(e, true)}
      onContextMenu={(e) => handleClick(e, false)}
    >
      {(dieCount > 0) &&
        <div className='roll-count'>{dieCount}</div>
      }
      <div className={`asset d${dieType}`} />
    </button>
  )
}

export default DiceBag;
