import React, { useState, useEffect, useRef } from 'react';
import DiceBookmarks from './DiceBookmarks';
import DieButton from './DieButton';
import SummaryModeSwitcher from './SummaryModeSwitcher';
import SummaryModeDescription from './SummaryModeDescription';
import PercentileOption from './PercentileOption';
import TextInput from '../TextInput.jsx';
import { deepCopy, getRandomInt } from '../../../utils.js';
import {
  blankDice,
  diceDataIntoToRollData,
  getRollDescription,
  sortedDice,
  parseDieType,
  processRollData,
  getPlainDescriptionOfRoll,
} from './DiceBagData.js';
import './DiceBag.scss';

const DiceBag = ({
  addNewDicebagPartyRoll,
  distantDicebagData,
}) => {
  const diceBagRef = useRef(null)

  const [firstDieRolled, setFirstDieRolled] = useState('');     // for the rolled icon up top
  const [previousDiceData, setPreviousDiceData] = useState({}); // for re-rolling the last set

  const [diceData, setDiceData] = useState({...blankDice});     // dice-to-roll
  const [rollData, setRollData] = useState([]);                 // roll results

  const [summaryMode, setSummaryMode] = useState('total');      // 'total' / 'keep-low' / 'keep-high' / 'count-low' / 'count-high'
  const [summaryModeValue, setSummaryModeValue] = useState(1)   // how many to keep/count

  const [percentileMode, setPercentileMode] = useState(false);
  const [defaultVariableDieType, setDefaultVariableDieType] = useState('x')

  const [isAnnotationActive, setIsAnnotationActive] = useState(false);
  const [annotation, setAnnotation] = useState('');
  const [postRollMessage, setPostRollMessage] = useState(null);

  const [lastAnnotation, setLastAnnotation] = useState(''); // cache the last annotation & message for any updates
  const [lastPostRollMessage, setLastPostRollMessage] = useState(null);

  const percentileAvailable = (diceData['10'] === 2);

  const clearCurrentDiceData = () => {
    let clearedData = {...blankDice};
    delete clearedData['x'] // remove the default x
    clearedData[defaultVariableDieType] = 0; // 'x' : 0, for use by the variable die types
    setDiceData(clearedData);
  }

  const clearCurrentRoll = () => {
    setFirstDieRolled('')
    setRollData([])
    setPreviousDiceData({})
    clearCurrentMetadata()
  }

  const cacheCurrentMetadata = () => {
    setLastAnnotation(annotation)
    setLastPostRollMessage(() => postRollMessage)
  }

  const clearCurrentMetadata = () => {
    setAnnotation('')
    setPostRollMessage(null)
  }

  const updateDiceDataCount = (dieType, newCount) => {
    let newData = {...diceData}
    newData[dieType] = newCount
    setDiceData(newData)

    // if we've just started queueing up a new roll, clear the old annotation
    if (JSON.stringify(diceData) === JSON.stringify(blankDice) && firstDieRolled !== '') {
      clearCurrentMetadata()
    }
  }

  const updateDiceDataType = (dieType, newType) => {
    if (dieType !== newType) {
      let newData = {...diceData}

      let oldCount = diceData[dieType]   // preserve the old type's count
      if (newType === 'x') oldCount = 0
      newData[newType] = oldCount

      delete newData[dieType]             // remove the old type
      setDiceData(newData)                // update the dice data with the new type
      setDefaultVariableDieType(newType)  // cache our dX so they don't have to re-enter it each roll

    }
  }

  const handleRoll = () => {
    let results = [];

    let rollDice = deepCopy(diceData);

    // hijack d10s in percentile mode
    if (percentileAvailable && percentileMode) {
      rollDice['10'] = 0;
      rollDice['100'] = 1;
    }

    let rolledAtLeastOneDie = false;

    sortedDice(rollDice).forEach(dieType => {
      const rollCount = Math.abs(rollDice[dieType])
      const rollSign = Math.sign(rollDice[dieType])

      for (let rollID = 0; rollID < rollCount; rollID++) {
        const dieTypeNumber = parseDieType(dieType);

        // roll em!
        if (dieType !== 'plus' && dieType.length > 0) {
          const result = getRandomInt(dieTypeNumber);
          const dieIcon = dieType.startsWith('x') ? 'dx' : `d${dieTypeNumber}`;

          results.push({dieType: dieIcon, result: result * rollSign})

          if (!rolledAtLeastOneDie) {
            rolledAtLeastOneDie = true;
            setFirstDieRolled(dieIcon);
          }
        }
      }
    });

    if (rollDice['plus'] !== 0) {
      results.push( {dieType: 'plus', result: parseInt(rollDice['plus'])} )
    }

    // store the results that we rolled
    setRollData(results)
    // store the dice that **were** rolled, in case we want to reroll
    setPreviousDiceData({...diceData})
    // reset current to-roll dice
    clearCurrentDiceData()
    // cache the current annotation so we can use it for updates
    cacheCurrentMetadata()
    // clear the that annotation and post-roll message function
    clearCurrentMetadata()
  }

  const handleAnnotationToggle = () => {
    if (isAnnotationActive) {
      setIsAnnotationActive(false)
      setAnnotation('')
    } else {
      setIsAnnotationActive(true)
    }
  }

  const updateAnnotation = (newAnnotation) => {
    if (newAnnotation) {
      setAnnotation(newAnnotation)
    } else {
      setAnnotation('')
      setIsAnnotationActive(false)
    }
  }

  // what is the highest type of die we're queueing up to roll?
  let rollDieType = '';
  sortedDice(diceData).forEach(dieType => {
    if (rollDieType === '' && diceData[dieType] > 0) {
      if (dieType.startsWith('x')) {
        rollDieType = 'x'
      } else if (dieType !== 'plus') {
        rollDieType = dieType
      }
    }
  });

  // summarize what we're going to roll
  const toRollString = getRollDescription(diceDataIntoToRollData(diceData), summaryMode, summaryModeValue)

  // summarize the results
  const resultTotal = processRollData(rollData, summaryMode, summaryModeValue)
  const resultSummary = getRollDescription(rollData, summaryMode, summaryModeValue)

  // add it to the party roll panel
  useEffect(() => {
    const rollMessage = lastPostRollMessage ? lastPostRollMessage(resultTotal, rollData) : ''
    // console.log('rollMessage',rollMessage);
    addNewDicebagPartyRoll(rollData, summaryMode, summaryModeValue, lastAnnotation, rollMessage, true);
  }, [rollData]);

  // update something about the last roll on the party roll panel — IF we're not busy queueing up a new roll
  useEffect(() => {
    if (rollDieType.length === 0) {
      const rollMessage = lastPostRollMessage ? lastPostRollMessage(resultTotal, rollData) : ''
      // console.log('rollMessage',rollMessage);
      addNewDicebagPartyRoll(rollData, summaryMode, summaryModeValue, lastAnnotation, rollMessage, false);
    }
  }, [summaryMode, summaryModeValue]);

  // If somewhere else has commanded us to queue up a dice roll, do so
  useEffect(() => {
    if (distantDicebagData) {
      setDiceData(distantDicebagData.diceData)
      setSummaryMode(distantDicebagData.summaryMode)

      if (distantDicebagData.annotation) {
        setAnnotation(distantDicebagData.annotation)
        setIsAnnotationActive(true)
      }

      if (distantDicebagData.postRollMessage) {
        // console.log('distantDicebagData.postRollMessage',distantDicebagData.postRollMessage);
        setPostRollMessage(() => distantDicebagData.postRollMessage)
      }

      // scroll down to us
      diceBagRef.current.scrollIntoView({behavior: "smooth"})
      // diceBagRef.current.scrollIntoView()
    }
  }, [distantDicebagData]);

  // have we queued up something complicated?
  const isComplexRoll = toRollString.length > 14

  return (
    <div className="bookmarks-and-bag">
      <DiceBookmarks
        currentDice={(rollDieType.length > 0) ? diceData : previousDiceData}
        summaryMode={summaryMode}
        summaryModeValue={summaryModeValue}
        percentileMode={percentileMode}
        setCurrentDice={setDiceData}
        setSummaryMode={setSummaryMode}
        setPercentileMode={setPercentileMode}
      />

      <div className="DiceBag">
        <div className='jumplink-anchor' id='dicebag' ref={diceBagRef} />

        <div className='bag-container'>
          <div className='rolling-surface'>

            { (rollDieType.length > 0) ?
              <div className='pre-roll'>
                <button
                  className='reset'
                  aria-label='Clear queued dice.'
                  onClick={() => { clearCurrentDiceData(); clearCurrentMetadata(); } }
                  key='reset'
                >
                  <div className='asset x' />
                </button>

                <button
                  className='roll'
                  onClick={handleRoll}
                  aria-labelledby='roll-action'
                >
                  <div className={`asset d${rollDieType}`} />
                </button>

                <div className='action' id='roll-action'>
                  {percentileAvailable ?
                    <PercentileOption
                      percentileMode={percentileMode}
                      setPercentileMode={setPercentileMode}
                    />
                  :
                    <div className={`to-roll-summary ${isComplexRoll ? 'complex' : ''}`}>
                      {!isComplexRoll &&
                        <span className='verb'>{'Roll '}</span>
                      }
                      {toRollString}
                    </div>
                  }
                </div>
              </div>

            : firstDieRolled ?
              <div className='post-roll'>
                <button
                  className='reset'
                  aria-label='Clear current roll.'
                  onClick={clearCurrentRoll}
                  key='reset'
                >
                  <div className='asset x' />
                </button>

                <button className='result-total' onClick={() => setDiceData(previousDiceData)} key='reroll'>
                  <div className={`asset ${firstDieRolled}`} />
                  <div>{resultTotal}</div>
                </button>

                { (resultSummary.length > 3) &&
                  <div className='result-summary'> {resultSummary} </div>
                }
              </div>
            :
              <>
                <div className='starting-roll'>
                  <div className={`asset d6`} />
                </div>
              </>
            }



            { isAnnotationActive ?
              <TextInput
                textValue={annotation}
                setTextValue={updateAnnotation}
                placeholder='( roll annotation )'
                startsOpen={true}
                maxLength={32}
                key={annotation}
              />
            :
              <>
                {/*<label className={`activate-annotation ${isAnnotationActive ? 'toggled' : ''}`}>
                  <input
                    type='checkbox'
                    onChange={handleAnnotationToggle}
                  />
                  <div className='asset edit' />
                </label>*/}
              </>
            }
          </div>

          <div className='die-button-container'>
            { sortedDice(diceData).map((dieType, i) => {

              return (
                <DieButton
                  dieType={dieType}
                  dieCount={diceData[dieType]}
                  setDieCount={(newCount) => updateDiceDataCount(dieType, newCount)}
                  setDieType={(newType) => updateDiceDataType(dieType, newType)}
                  key={`diebutton-${i}`}
                />
              )
            })}
          </div>

          <div className='summary-mode-container'>
            <SummaryModeSwitcher
                summaryMode={summaryMode}
                setSummaryMode={setSummaryMode}
              />

            <SummaryModeDescription
              summaryMode={summaryMode}
              summaryModeValue={summaryModeValue}
              setSummaryModeValue={setSummaryModeValue}
            />

          </div>
        </div>
      </div>
    </div>
  );
}

export default DiceBag;
