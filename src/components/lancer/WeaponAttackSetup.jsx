import React, { useState } from 'react';
import BigRollButton from '../shared/BigRollButton.jsx';

import './WeaponAttackSetup.scss';

const COVER_SOFT = 'Soft Cover'
const COVER_HARD = 'Hard Cover'

const WeaponAttackSetup = ({
  gritBonus,
}) => {
  const [currentSources, setCurrentSources] = useState([]);
  const [manualMod, setManualMod] = useState(0);

  const resetModifiers = () => {
    setCurrentSources([]);
    setManualMod(0);
  }

  var difficultySources = ['Impaired', 'Inaccurate', COVER_HARD, COVER_SOFT]
  var accuracySources = ['Accurate', 'Consume Lock']

  const MANUAL_MOD = `Other (${manualMod > 0 ? '+' : ''}${manualMod})`
  var currentSourcesPlusManual = [...currentSources]
  if (manualMod !== 0)  currentSourcesPlusManual.push(MANUAL_MOD)
  if (manualMod < 0)    difficultySources.push(MANUAL_MOD)
  if (manualMod > 0)    accuracySources.push(MANUAL_MOD)

  const toggleSource = (source) => {
    let newSources = [...currentSources];
    let newMod = currentMod;

    if (source === MANUAL_MOD) {
      setManualMod(0)

    } else {
      const sourceIndex = newSources.indexOf(source);
      if (sourceIndex >= 0) {
        newSources.splice(sourceIndex, 1) // REMOVE source
      } else {
        newSources.push(source);          // ADD source

        // soft and hard cover are mutually exclusive
        if (source === COVER_SOFT && newSources.includes(COVER_HARD)) {
          newSources.splice(newSources.indexOf(COVER_HARD), 1)
        } else if (source === COVER_HARD && newSources.includes(COVER_SOFT)) {
          newSources.splice(newSources.indexOf(COVER_SOFT), 1)
        }
      }
      setCurrentSources(newSources);
    }
  }

  var currentMod = 0;
  currentSourcesPlusManual.forEach(source => {
    if (source === MANUAL_MOD)                   currentMod += manualMod
    else if (source === COVER_HARD)              currentMod += -2
    else if (difficultySources.includes(source)) currentMod += -1
    else if (accuracySources.includes(source))   currentMod +=  1
  })
  currentMod = Math.max(Math.min(currentMod, 9), -9)

  const clickNumberLine = (mod) => {
    var shiftInManualMod = mod - currentMod;
    // click the current number to reset manualMod
    if (shiftInManualMod === 0) { shiftInManualMod = -manualMod; }
    // adjust the current mod to the clicked number
    setManualMod( manualMod + shiftInManualMod )
  }

  // Generates an array like [-4,-3,-2,-1], starting one below the current difficulty
  // const lowestDifficulty = Math.max(Math.min(-4, currentMod-1), -9)
  // const difficultyArray = Array.from({length: 4}, (x, i) => i + lowestDifficulty);
  const difficultyArray = Array.from({length: 9}, (x, i) => i - 9);
  const accuracyArray = Array.from({length: 9}, (x, i) => i + 1);

  return (
    <div className="WeaponAttackSetup">

      <div className="roll-container">
        <BigRollButton
          handleNewRoll={() => {}}
        />
        <div className='grit'>
          +{gritBonus}
          <span className='label'>Grit</span>
        </div>
        { currentMod !== 0 &&
          <button
            className={`accuracy ${currentMod < 0 ? 'actually-difficulty' : ''}`}
            onClick={resetModifiers}
          >
            {currentMod > 0 ? '+' : ''}
            {currentMod}
            <span className='asset d6' />
            <span className='label'>
              {currentMod < 0 ? 'Difficulty' : 'Accuracy'}
            </span>
          </button>
        }
      </div>

      <div className="column-container">
        <div className="column difficulty">
          <div className='column-label'>
            Difficulty
          </div>

          <NumberLine
            modArray={difficultyArray}
            currentMod={currentMod}
            handleClick={clickNumberLine}
          />

          <Sources
            possibleSources={difficultySources}
            currentSources={currentSourcesPlusManual}
            clickSource={toggleSource}
          />
        </div>

        <div className="column accuracy">
          <div className='column-label'>
            Accuracy
          </div>

          <NumberLine
            modArray={accuracyArray}
            currentMod={currentMod}
            handleClick={clickNumberLine}
          />

          <Sources
            possibleSources={accuracySources}
            currentSources={currentSourcesPlusManual}
            clickSource={toggleSource}
          />
        </div>
      </div>
    </div>
  )
}


const NumberLine = ({
  modArray,
  currentMod,
  handleClick,
}) => (
  <div className="NumberLine">
    { modArray.map(mod => {
      var numberClass = 'number';
      if (currentMod === mod) numberClass += ' current'

      var numberHidden = false;
      if (Math.sign(currentMod) === Math.sign(mod)) {
        if (Math.abs(currentMod) - Math.abs(mod) > 2) numberHidden = true;
        if (Math.abs(mod) > 4 && Math.abs(mod) > (Math.abs(currentMod) + 1)) numberHidden = true;
      } else {
        if (Math.abs(mod) > 4) numberHidden = true
      }

      if (numberHidden) numberClass += ' hidden';

      const transform = '-200px';
      return (
        <button
          onClick={() => handleClick(mod)}
          className={numberClass}
          key={mod}
        >
          <span className='sign'>{mod > 0 ? '+' : '-'}</span>
          <span className='count'>{Math.abs(mod)}</span>
        </button>
      )
    })}
  </div>
)

const Sources = ({
  possibleSources,
  currentSources,
  clickSource,
  manualMod,
}) => (
  <div className="Sources">
    { possibleSources.map(source =>
      <button
        onClick={() => clickSource(source)}
        className={currentSources.includes(source) ? 'current' : ''}
        key={source}
      >
        {source}
      </button>
    )}
  </div>
)

export default WeaponAttackSetup;
