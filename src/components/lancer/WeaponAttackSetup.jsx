import React, { useState } from 'react';
import BigRollButton from '../shared/BigRollButton.jsx';

import './WeaponAttackSetup.scss';

const COVER_SOFT = 'Soft Cover'
const COVER_HARD = 'Hard Cover'

const WeaponAttackSetup = ({
}) => {
  const [currentSources, setCurrentSources] = useState([]);
  const [miscDifficulty, setMiscDifficulty] = useState(0);
  const [miscAccuracy, setMiscAccuracy] = useState(0);

  const difficultySources = ['Impaired', 'Inaccurate', COVER_HARD, COVER_SOFT]
  const accuracySources = ['Accurate', 'Consume Lock']

  const toggleSource = (source) => {
    let newSources = [...currentSources];
    let newMod = currentMod;

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

  const clickMiscAccuracy = (e) => {
    var newAccuracy = miscAccuracy;
    if (e) { // right click
      newAccuracy -= 1;
      e.preventDefault();
    } else { // left click
      newAccuracy += 1;
    }

    newAccuracy = Math.min(Math.max(newAccuracy, 0), 9);
    setMiscAccuracy(newAccuracy);
  }

  const clickMiscDifficulty = (e) => {
    var newDifficulty = miscDifficulty;
    if (e) { // right click
      newDifficulty += 1;
      e.preventDefault();
    } else { // left click
      newDifficulty -= 1;
    }

    newDifficulty = Math.min(Math.max(newDifficulty, -9), 0);
    setMiscDifficulty(newDifficulty);
  }

  var currentMod = 0;
  currentSources.forEach(source => {
    if (accuracySources.includes(source))   currentMod +=  1
    if (difficultySources.includes(source)) currentMod += -1
    if (source === COVER_HARD)              currentMod += -1 // hard cover grants 2 diff total
  })
  currentMod += miscDifficulty;
  currentMod += miscAccuracy;

  return (
    <div className="WeaponAttackSetup">

      <BigRollButton
        handleNewRoll={() => {}}
      />

      <div className="column-container">
        <div className="column difficulty">
          <div className='column-label'>
            Difficulty
          </div>

          <NumberLine
            modArray={[-4,-3,-2,-1]}
            currentMod={currentMod}
          />

          <Sources
            possibleSources={difficultySources}
            currentSources={currentSources}
            clickSource={toggleSource}
          />
        </div>

        <div className="column accuracy">
          <div className='column-label'>
            Accuracy
          </div>

          <NumberLine
            modArray={[1,2,3,4]}
            currentMod={currentMod}
          />

          <Sources
            possibleSources={accuracySources}
            currentSources={currentSources}
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
}) => (
  <div className="NumberLine">
    { modArray.map(mod =>
      <div
        className={currentMod === mod ? 'number current' : 'number'}
        key={mod}
      >
        <span className='sign'>{mod > 0 ? '+' : '-'}</span>
        {Math.abs(mod)}
      </div>
    )}
  </div>
)

const Sources = ({
  possibleSources,
  currentSources,
  clickSource,
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
