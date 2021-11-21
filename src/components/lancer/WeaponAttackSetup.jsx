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

  const difficultySources = ['Impaired', 'Inaccurate']
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
    if (source === COVER_SOFT)              currentMod += -1
    if (source === COVER_HARD)              currentMod += -2
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
          <button
            className='column-label'
            onClick={() => clickMiscDifficulty()}
            onContextMenu={(e) => clickMiscDifficulty(e)}
          >
            {miscDifficulty < 0 ? miscDifficulty : '-'} Difficulty
          </button>

          <NumberLine
            modArray={[-4,-3,-2,-1]}
            currentMod={currentMod}
          />

          <Sources
            possibleSources={difficultySources}
            currentSources={currentSources}
            clickSource={toggleSource}
            includeCover={true}
          />
        </div>

        <div className="column accuracy">
          <button
            className='column-label'
            onClick={() => clickMiscAccuracy()}
            onContextMenu={(e) => clickMiscAccuracy(e)}
          >
            Accuracy +{miscAccuracy > 0 ? miscAccuracy : ''}
          </button>

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
      <span
        className={currentMod === mod ? 'current' : ''}
        key={mod}
      >
        {Math.abs(mod)}
      </span>
    )}
  </div>
)

const Sources = ({
  possibleSources,
  currentSources,
  clickSource,
  includeCover = false,
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

    { includeCover &&
      <div className="cover">
        <span className='label'>Cover:</span>
        <button
          onClick={() => clickSource(COVER_SOFT)}
          className={currentSources.includes(COVER_SOFT) ? 'current' : ''}
        >
          Soft
        </button>

        <button
          onClick={() => clickSource(COVER_HARD)}
          className={currentSources.includes(COVER_HARD) ? 'current' : ''}
        >
          Hard
        </button>
      </div>
    }
  </div>
)

export default WeaponAttackSetup;
