import React, { useState } from 'react';
import Clock, { blankClock } from '../../shared/SquadClockPanel/Clock.jsx';
import QAndA from './QAndA.jsx';
import Ideals from './Ideals.jsx';
import BondPowers from './BondPowers.jsx';
import { findBondData } from '../lancerData.js';
import { savePilotData } from '../lancerLocalStorage.js';
import { deepCopy } from '../../../utils.js';
import { getRandomFingerprint } from '../../../localstorage.js';
import './BondSheet.scss';

// COMP/CON is ambivalent about the ordering or number of burdens; we want there to be three slots
function initializeLocalBurdens(pilot) {
  let initialBurdens = []

  if (pilot.burdens) {
    let minorBurdens = pilot.burdens.filter(burden => burden.segments < 6)
    let majorBurdens = pilot.burdens.filter(burden => burden.segments >= 6)

    // add the minor burdens, any empty burdens as padding to bring it up to 3, then major burdens
    initialBurdens.push(...minorBurdens)
    let emptyBurdenCount = 3 - minorBurdens.length - majorBurdens.length
    let emptyBurdens = [...Array(emptyBurdenCount)].forEach(i => initialBurdens.push(blankClock))
    initialBurdens.push(...majorBurdens)
  } else {
    initialBurdens = [blankClock, blankClock, blankClock]
  }

  return initialBurdens
}

// update the pilot to match the new local copy -- remove any empty burdens
function convertLocalBurdensToPilotFormat(newBurdensData) {
  return newBurdensData.filter(burdenClock => burdenClock.id)
}

const Bonds = ({
  activePilot,
  setIsChoosingNewBond,
  triggerRerender,
  setTriggerRerender,
}) => {
  // maintain an extra copy of the burdens in order to maintain ordering - minor - minor - major
  const [localBurdens, setLocalBurdens] = useState(initializeLocalBurdens(activePilot))

  const bondData = findBondData(activePilot.bondId)

  // Ensure that the bondanswers array is always 2 entries
  const bondAnswers =
    activePilot.bondAnswers ?
      [activePilot.bondAnswers[0] || '', activePilot.bondAnswers[1] || '']
    :
      ['','']

  // =============== PILOT STATE ==================

  const updateBondState = (newBondData) => {
    let newPilotData = deepCopy(activePilot);

    Object.keys(newBondData).forEach(statKey => {
      // console.log('statKey',statKey, ':', newBondData[statKey]);
      switch (statKey) {
        case 'xp':
        case 'stress':
        case 'bondAnswers':
        case 'minorIdeal':
        case 'bondPowers':
          newPilotData[statKey] = newBondData[statKey]
          break;

        case 'burdens':
          const newLocalBurdens = deepCopy(localBurdens); // update the local copy of burdens as well
          const burdenIndex = newBondData[statKey].burdenIndex
          const burdenToUpdate = newLocalBurdens[burdenIndex]

          // clear it?
          if ('clearBurden' in newBondData[statKey]) {
            newLocalBurdens[burdenIndex] = deepCopy(blankClock)

          } else {
            // is this a new burden?
            if (!burdenToUpdate.id) {
              burdenToUpdate.id = `${getRandomFingerprint()}-${getRandomFingerprint()}`
              burdenToUpdate.segments = burdenIndex < 2 ? 4 : 8 // major or minor?
            }
            // update the stuff we want to about it
            if ('progress' in newBondData[statKey]) burdenToUpdate.progress = newBondData[statKey].progress
            if ('segments' in newBondData[statKey]) burdenToUpdate.segments = newBondData[statKey].segments
            if ('title' in newBondData[statKey])    burdenToUpdate.title = newBondData[statKey].title
          }

          // save both the local and pilot copies of the burdens
          setLocalBurdens(newLocalBurdens)
          newPilotData.burdens = convertLocalBurdensToPilotFormat(newLocalBurdens)
        }
    });

    // update it in localstorage
    savePilotData(newPilotData)
    setTriggerRerender(!triggerRerender)
  }

  return (
    <div className='BondSheet'>
      <h2>
        <span className='pilot-name'>{activePilot.name},</span>
        <button onClick={() => setIsChoosingNewBond(true)}>
          {bondData.name}
        </button>
      </h2>
      <div className='columns'>
        <div className='clocks-column'>
          <Clock
            progress={activePilot.xp}
            setProgress={progress => updateBondState({ xp: progress }) }
            maxSegments={8}
            onReset={() => updateBondState({ xp: 0 }) }
            typeLabel='XP'
          />
          <Clock
            progress={activePilot.stress}
            setProgress={progress => updateBondState({ stress: progress }) }
            maxSegments={8}
            onReset={() => updateBondState({ stress: 0 }) }
            typeLabel='Stress'
          />

          {[...Array(3)].map((_, i) =>
            <Clock
              progress={localBurdens[i].progress}
              setProgress={progress => updateBondState({ burdens: {burdenIndex: i, progress: progress} }) }
              maxSegments={localBurdens[i].segments}
              setMaxSegments={maxSegments => updateBondState({ burdens: {burdenIndex: i, segments: maxSegments, progress: Math.min(maxSegments, localBurdens[i].progress)} }) }
              onReset={() => updateBondState({ burdens: {burdenIndex: i, progress: 0} }) }
              onFinish={() => updateBondState({ burdens: {burdenIndex: i, clearBurden: true} }) }
              typeLabel={i < 2 ? 'Minor Burden' : 'Major Burden'}
              userLabel={localBurdens[i].title}
              setUserLabel={title => updateBondState({ burdens: {burdenIndex: i, title: title} }) }
              inputEnabled={true}
              key={`burden-${i}`}
            />
          )}
        </div>

        <div className='text-column'>
          <QAndA
            questionData={bondData.questions[0]}
            answer={bondAnswers[0]}
            setAnswer={answer => updateBondState({ bondAnswers: [answer, bondAnswers[1]]}) }
          />
          <QAndA
            questionData={bondData.questions[1]}
            answer={bondAnswers[1]}
            setAnswer={answer => updateBondState({ bondAnswers: [bondAnswers[0], answer]}) }
          />
          <Ideals
            bondData={bondData}
            minorIdeal={activePilot.minorIdeal || ''}
            setMinorIdeal={minorIdeal => updateBondState({ minorIdeal: minorIdeal}) }
          />
          <BondPowers
            bondData={bondData}
            pilotBondPowers={activePilot.bondPowers || []}
            setPilotBondPowers={bondPowers => updateBondState({ bondPowers: bondPowers}) }
          />
        </div>
      </div>
    </div>
  );
}

export default Bonds ;
