import React, { useState, useEffect } from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
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


  const [diceData, setDiceData] = useState({...blankDice}); // dice-to-roll
  const [summaryMode, setSummaryMode] = useState('sum');   // 'sum' / 'low' / 'high'
  const [rollData, setRollData] = useState([]);

  const [lastDieRolled, setLastDieRolled] = useState('');

  const updateDiceData = (dieType, dieCount) => {
    let newData = {...diceData}
    newData[dieType] = dieCount
    setDiceData(newData);
  }

  const handleRoll = () => {
    let results = [];

    Object.keys(diceData).forEach((dieType, i) => {
      for (let rollID = 0; rollID < diceData[dieType]; rollID++) {
        const result = getRandomInt(parseInt(dieType));
        results.push( {dieType: `d${dieType}`, result: result} )
        setLastDieRolled(dieType);
      }
    });

    // store what was rolled
    setRollData(results)
    // reset current to-roll dice
    setDiceData({...blankDice});
  }

  // add it to the party roll panel
  useEffect(() => {
    addNewDicebagPartyRoll(rollData, summaryMode, true);
  }, [rollData]); // eslint-disable-line react-hooks/exhaustive-deps

  // update it on the party roll panel
  useEffect(() => {
    addNewDicebagPartyRoll(rollData, summaryMode, false);
  }, [summaryMode]); // eslint-disable-line react-hooks/exhaustive-deps


  // summarize the results
  let runningTotal = 0;
  let highest = 0;
  let lowest = 999999;
  let resultList = [];
  rollData.forEach((roll) => {
      resultList.push(roll.result)
      runningTotal += roll.result
      highest = Math.max(highest, roll.result)
      lowest = Math.min(lowest, roll.result)
  });

  let resultTotal = 0;
  let resultSummary = '';
  if (summaryMode === 'sum') {
    resultTotal = runningTotal;
    resultSummary = resultList.join(' + ');
  } else if (summaryMode === 'low') {
    resultTotal = lowest;
    resultSummary = resultList.join(', ')
  } else if (summaryMode === 'high') {
    resultTotal = highest;
    resultSummary = resultList.join(', ')
  }

  // what is the highest type of die we're queueing up to roll?
  let rollDieType = '';
  Object.keys(diceData).forEach((dieType) => {
    if (diceData[dieType] > 0) { rollDieType = dieType;}
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


        <RadioGroup
          name='summary-mode'
          className='summary-mode'
          selectedValue={summaryMode}
          onChange={(value) => { setSummaryMode(value) }}
        >
          <label className={`mode-container ${summaryMode === 'sum' ? 'selected' : ''}`} key='mode-sum'>
            <Radio value='sum' id='mode-sum' />
            Sum
          </label>

          <label className={`mode-container ${summaryMode === 'high' ? 'selected' : ''}`} key='mode-high'>
            <Radio value='high' id='mode-high' />
            High
          </label>

          <label className={`mode-container ${summaryMode === 'low' ? 'selected' : ''}`} key='mode-low'>
            <Radio value='low' id='mode-low' />
            Low
          </label>
        </RadioGroup>
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
