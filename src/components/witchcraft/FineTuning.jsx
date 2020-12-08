import React, { useState } from 'react';
import NumberInput from '../shared/NumberInput.jsx';
import { deepCopy, getRandomInt } from '../../utils.js';
import {
  crafterHasTechnique,
  projectUsedTechnique,
  didProjectSucceed,
  getTotalFlawBoonStack,
  allFlaws,
  allBoons,
} from './data.js';

import './FineTuning.scss';

const FineTuning = ({
  crafterData,
  projectData,
  updateProjectData,
  handleFinishProject
}) => {
  const [welcomingWorkshopBonus, setWelcomingWorkshopBonus] = useState(3);

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

    updateProjectData({cancelledCount: newCount})
  }

  function addBonusDice(bonusDiceCount, techniqueName = '') {
    var newData = deepCopy(projectData.rollData);

    for (var i = 0; i < bonusDiceCount; i++) {
      const roll = getRandomInt(6);
      newData.rolls.push(roll);
      if (roll === 1) { newData.flawCount += 1 }
      if (roll === 6) { newData.boonCount += 1 }
    }

    var newTuningData = deepCopy(projectData.techniques);
    if (techniqueName) { newTuningData.push(techniqueName); }

    updateProjectData({
      rollData: newData,
      techniques: newTuningData
    });
  }

  function addBonusRoll(roll, techniqueName = '') {
    var newData = deepCopy(projectData.rollData);

    newData.rolls.push(roll);
    if (roll === 1) { newData.flawCount += 1 }
    if (roll === 6) { newData.boonCount += 1 }

    var newTuningData = deepCopy(projectData.techniques);
    if (techniqueName) { newTuningData.push(techniqueName); }

    updateProjectData({
      rollData: newData,
      techniques: newTuningData
    });
  }

  const tier = crafterData.tier;
  const craftRollSucceeded = didProjectSucceed(projectData, crafterData);

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
        <div className='bonus'>+{crafterData.proficiencyBonus}</div>
      </div>

      <div className='flaws-and-boons'>
        <div className='flaws'>
          <div className='icon-container'>
            { projectData.rollData.flawCount > 0 ?
              [...Array(projectData.rollData.flawCount)].map(
                (flaw, i) => (
                  <BoonFlawIcon
                    isBoon={false}
                    isCancelled={i < cancelledCount}
                    handleClick={() => handleBoonFlawClick(i < cancelledCount)}
                    key={i}
                  />
                )
              )
            :
              <hr />
            }
          </div>
          <div className='label-container'>
            { flawStack.length > 0 ?
              flawStack.map(
                (flawSize, i) => (
                  <div className='label' key={i}>{allFlaws[flawSize]}</div>
                )
              )
            :
              <div className='label'>Flawless</div>
            }
          </div>
        </div>

        <div className='boons'>
          <div className='icon-container'>
            { projectData.rollData.boonCount > 0 ?
              [...Array(projectData.rollData.boonCount)].map(
                (boon, i) => (
                  <BoonFlawIcon
                    isBoon={true}
                    isCancelled={i < cancelledCount}
                    handleClick={() => handleBoonFlawClick(i < cancelledCount)}
                    key={i}
                  />
                )
              )
            :
              <hr />
            }
          </div>
          <div className='label-container'>
            { boonStack.length > 0 ?
              boonStack.map(
                (boonSize, i) => (
                  <div className='label' key={i}>{allBoons[boonSize]}</div>
                )
              )
            :
              <div className='label'>No boons</div>
            }
          </div>
        </div>
      </div>

      <div className='add-dice-container'>
        { crafterHasTechnique(crafterData, 'inheritedTools') && (tier >= 2) &&
          ( projectUsedTechnique(projectData, 'inheritedTools') ?
            <div>Used inherited tools.</div>
          : !craftRollSucceeded &&
            <button
              className='add-dice'
              onClick={() => addBonusDice((tier >= 4 ? 2 : 1), 'inheritedTools')}>
              Add Inherited Tools: +{(tier >= 4 ? 2 : 1)}d6
            </button>
          )
        }

        { crafterHasTechnique(crafterData, 'welcomingWorkshop') &&
          ( projectUsedTechnique(projectData, 'welcomingWorkshop') ?
            <div>Used welcoming workshop.</div>
          :
            <div className='welcoming-workshop-container'>
              <button
                className='add-dice'
                onClick={() => addBonusRoll(welcomingWorkshopBonus, 'welcomingWorkshop')}>
                Add Welcoming Workshop:
              </button>
              <NumberInput
                value={welcomingWorkshopBonus}
                setValue={(value) => { setWelcomingWorkshopBonus(value) }}
                minValue={1}
                maxValue={6}
                prefix={"+"}
              />
            </div>
          )
        }
      </div>

      <div className='finish-project-container'>
        <button className='finish-project' onClick={handleFinishProject}>
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
