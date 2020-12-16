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
  'plus': 0,
}

const DiceBag = ({addNewDicebagPartyRoll}) => {
  const [diceData, setDiceData] = useState({...blankDice}); // dice-to-roll
  const [rollData, setRollData] = useState([]);             // roll results
  const [summaryMode, setSummaryMode] = useState('total');  // 'total' / 'low' / 'high'

  const [lastDieRolled, setLastDieRolled] = useState('');   // for the rolled icon up top

  const updateDiceData = (dieType, dieCount) => {
    let newData = {...diceData}
    newData[dieType] = dieCount
    setDiceData(newData);
  }

  const handleRoll = () => {
    let results = [];

    Object.keys(diceData).forEach((dieType, i) => {
      for (let rollID = 0; rollID < diceData[dieType]; rollID++) {
        if (dieType !== 'plus') {
          const result = getRandomInt(parseInt(dieType));
          const dieIcon = `d${dieType}`;
          results.push( {dieType: dieIcon, result: result} )
          setLastDieRolled(dieIcon);
        }
      }
    });

    if (diceData['plus'] > 0) {
      results.push( {dieType: 'plus', result: parseInt(diceData['plus'])} )
    }

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


  // what is the highest type of die we're queueing up to roll?
  let rollDieType = '';
  Object.keys(diceData).forEach((dieType) => {
    if (diceData[dieType] > 0 && dieType !== 'plus') { rollDieType = dieType;}
  });

  // summarize the results
  let runningTotal = 0;
  let highest = 0;
  let lowest = 999999;
  let addModifier = 0;
  let resultList = [];
  rollData.forEach((roll) => {
    if (roll.dieType !== 'plus') {
      resultList.push(roll.result)
      runningTotal += roll.result
      highest = Math.max(highest, roll.result)
      lowest = Math.min(lowest, roll.result)
    } else {
      addModifier = roll.result; // modifier is handled different in different roll modes
    }
  });

  let resultTotal = 0;
  let resultSummary = '';
  if (summaryMode === 'total') {
    resultTotal = runningTotal + addModifier;
    resultSummary = resultList.join(' + ');
  } else if (summaryMode === 'low') {
    resultTotal = lowest + addModifier;
    resultSummary = resultList.join(', ')
  } else if (summaryMode === 'high') {
    resultTotal = highest + addModifier;
    resultSummary = resultList.join(', ')
  }
  if (addModifier) resultSummary = `( ${resultSummary} ) + ${addModifier}`

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
                <div className={`asset ${lastDieRolled}`} />
                {resultTotal}
              </div>
              { resultSummary.length > 3 &&
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
          { Object.keys(diceData).reverse().map((dieType, i) => {

            return (
              <DieButton
                dieType={dieType}
                dieCount={diceData[dieType]}
                setDieCount={(newCount) => updateDiceData(dieType, newCount)}
                key={`diebutton-${i}`}
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
          <label className={`mode-container ${summaryMode === 'total' ? 'selected' : ''}`} key='mode-total'>
            <Radio value='total' id='mode-total' />
            Total
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


const DieButton = ({
  dieType,
  dieCount,
  setDieCount
}) => {

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

  let dieClass = dieCount > 0 ? 'will-roll' : '';
  let dieIcon = `d${dieType}`;
  if (dieType === 'plus') {
    dieIcon = 'plus';
    dieClass += ' last'
  }

  return (
    <button className={`DieButton ${dieClass}`}
      onClick={(e) => handleClick(e, true)}
      onContextMenu={(e) => handleClick(e, false)}
    >
      {(dieCount > 0) &&
        <div className='roll-count'>{dieCount}</div>
      }
      <div className={`asset ${dieIcon}`} />
    </button>
  )
}

export default DiceBag;
