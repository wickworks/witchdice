import React, { useState } from 'react';
import { deepCopy } from '../../utils.js';
import {
  getTotalFlawBoonStack,
  defaultFlawBoon,
  allFlaws,
  allBoons,
} from './data.js';

import './FineTuning.scss';

const FineTuning = ({
  characterData,
  projectData,
  updateProjectData
}) => {

  const rolls = projectData.rollData.rolls;
  const cancelledCount = projectData.cancelledCount;
  const flawStack = getTotalFlawBoonStack(projectData.rollData.flawCount, projectData);
  const boonStack = getTotalFlawBoonStack(projectData.rollData.boonCount, projectData);

  const handleBoonFlawClick = (wasAlreadyCancelled) => {
    var newCount = cancelledCount;
    if (wasAlreadyCancelled) {newCount -= 1} else {newCount += 1}

    // can't cancel out more than we have of the opposite
    newCount = Math.min(newCount, projectData.rollData.flawCount);
    newCount = Math.min(newCount, projectData.rollData.boonCount);

    updateProjectData('cancelledCount', newCount)
  }

  return (
    <div className='FineTuning'>
      <div className='dice-container'>
        { rolls.map( (roll, i) => (
          <DisplayDie
            dieType={ i === 0 ? 'd20' : 'd6'}
            roll={rolls[i]}
            key={i}
          />
        ))}
        <div className='bonus'>+{characterData.proficiencyBonus}</div>
      </div>

      <div className='flaws-and-boons'>
        <div className='flaws'>
          <div className='icon-container'>
            { [...Array(projectData.rollData.flawCount)].map(
              (flaw, i) => (
                <BoonFlawIcon
                  isBoon={false}
                  isCancelled={i < cancelledCount}
                  handleClick={() => handleBoonFlawClick(i < cancelledCount)}
                  key={i}
                />
              )
            )}
          </div>
          <div className='label-container'>
            { flawStack.map(
              (flawSize, i) => (
                <div className='label'>{allFlaws[flawSize]}</div>
              )
            )}
          </div>
        </div>

        <div className='boons'>
          <div className='icon-container'>
            { [...Array(projectData.rollData.boonCount)].map(
              (boon, i) => (
                <BoonFlawIcon
                  isBoon={true}
                  isCancelled={i < cancelledCount}
                  handleClick={() => handleBoonFlawClick(i < cancelledCount)}
                  key={i}
                />
              )
            )}
          </div>
          <div className='label-container'>
            { boonStack.map(
              (boonSize, i) => (
                <div className='label'>{allBoons[boonSize]}</div>
              )
            )}
          </div>
        </div>

      </div>

      <div className='finish-project-container'>
        <button className='finish-project'>
          ~ Finish Project ~
        </button>
      </div>

    </div>
  )
}

const BoonFlawIcon = ({
  isBoon,
  isCancelled,
  handleClick
}) => {
  var classes = 'asset ';
  classes += isBoon ? 'radiant ' : 'necrotic ';
  classes += isCancelled ? 'cancelled' : '';

  return (
    <div className='BoonFlawIcon' onClick={handleClick}>
      <div className={classes} />
    </div>
  )
}


const DisplayDie = ({
  dieType,
  roll
}) => {
  var boonFlawClass = '';

  if (dieType === 'd6') {
    if (roll === 1) boonFlawClass = 'flaw';
    if (roll === 6) boonFlawClass = 'boon';
  }

  return (
    <div className={`DisplayDie ${boonFlawClass}`}>
      <div className={`asset ${dieType}`} />
      <div className='roll'>{roll}</div>
    </div>
  )
}

export default FineTuning ;
