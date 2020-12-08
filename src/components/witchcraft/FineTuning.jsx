import React from 'react';
import NumberInput from '../shared/NumberInput.jsx';
import { deepCopy, getRandomInt } from '../../utils.js';
import {
  crafterHasTechnique,
  projectUsedTechnique,
  didProjectSucceed,
  getTotalFlawBoonStack,
  allFlaws,
  allBoons,
  allDifficulties,
  getManufacturerCount,
} from './data.js';

import './FineTuning.scss';

const FineTuning = ({
  crafterData,
  projectData,
  updateProjectData,
  handleFinishProject
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

    updateProjectData({cancelledCount: newCount})
  }

  // ======== ADD DICE, BONUSES, AND TECHNIQUE DATA ======== //

  function addBonusDice(bonusDiceCount, techniqueName, techniqueData = {}) {
    var newData = deepCopy(projectData.rollData);

    for (var i = 0; i < bonusDiceCount; i++) {
      const roll = getRandomInt(6);
      newData.rolls.push(roll);
      if (roll === 1) { newData.flawCount += 1 }
      if (roll === 6) { newData.boonCount += 1 }
    }

    var newTechniqueData = deepCopy(projectData.techniques);
    if (techniqueName) { newTechniqueData.push(techniqueName) }
    const newTechniqueTempData = {...deepCopy(projectData.techniqueTempData), ...techniqueData};

    updateProjectData({
      rollData: newData,
      techniques: newTechniqueData,
      techniqueTempData: newTechniqueTempData
    });
  }

  function addBonusRoll(roll, techniqueName, techniqueData = {}) {
    var newData = deepCopy(projectData.rollData);

    if (roll > 0) {
      newData.rolls.push(roll);
      if (roll === 1) { newData.flawCount += 1 }
      if (roll === 6) { newData.boonCount += 1 }
    }

    var newTechniqueData = deepCopy(projectData.techniques);
    if (techniqueName) { newTechniqueData.push(techniqueName) }
    const newTechniqueTempData = {...deepCopy(projectData.techniqueTempData), ...techniqueData};

    updateProjectData({
      rollData: newData,
      techniques: newTechniqueData,
      techniqueTempData: newTechniqueTempData
    });
  }

  function addBoon(techniqueName, techniqueData = {}) {
    var newData = deepCopy(projectData.rollData);
    newData.boonCount += 1;

    var newTechniqueData = deepCopy(projectData.techniques);
    if (techniqueName) { newTechniqueData.push(techniqueName) }
    const newTechniqueTempData = {...deepCopy(projectData.techniqueTempData), ...techniqueData};

    updateProjectData({
      rollData: newData,
      techniques: newTechniqueData,
      techniqueTempData: newTechniqueTempData
    });
  }

  function addTechnique(techniqueName, techniqueData = {}) {
    var newTechniqueData = deepCopy(projectData.techniques);
    if (techniqueName) { newTechniqueData.push(techniqueName) }
    const newTechniqueTempData = {...deepCopy(projectData.techniqueTempData), ...techniqueData};

    updateProjectData({
      techniques: newTechniqueData,
      techniqueTempData: newTechniqueTempData
    });
  }

  function setTechniqueTempData(techniqueData) {
    const newTechniqueTempData = {...deepCopy(projectData.techniqueTempData), ...techniqueData};

    updateProjectData({
      techniqueTempData: newTechniqueTempData
    });
  }


  const tier = crafterData.tier;
  const craftRollSucceeded = didProjectSucceed(projectData, crafterData);

  // ======== TECHNIQUE DATA ======== //
  var welcomingWorkshopBonus = 3;
  if (projectData.techniqueTempData.welcomingWorkshopBonus) {
    welcomingWorkshopBonus = parseInt(projectData.techniqueTempData.welcomingWorkshopBonus);
  }

  var blessedRollOne, blessedRollTwo;
  if (projectUsedTechnique(projectData, 'blessedCreation')) {
    blessedRollOne = parseInt(projectData.techniqueTempData.blessedCreationRollOne);
    blessedRollTwo = parseInt(projectData.techniqueTempData.blessedCreationRollTwo);
  }

  const manufacturerCount = getManufacturerCount(projectData);

  const subtextSelection = projectData.techniqueTempData.subtext;

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
            <button onClick={() => addBonusDice((tier >= 4 ? 2 : 1), 'inheritedTools')}>
              Use Inherited Tools: +{(tier >= 4 ? 2 : 1)}d6
            </button>
          )
        }

        { crafterHasTechnique(crafterData, 'welcomingWorkshop') &&
          ( projectUsedTechnique(projectData, 'welcomingWorkshop') ?
            <div>Used welcoming workshop.</div>
          :
            <div className='technique-container'>
              <button onClick={() => addBonusRoll(welcomingWorkshopBonus, 'welcomingWorkshop')}>
                Use Welcoming Workshop:
              </button>
              <NumberInput
                value={welcomingWorkshopBonus}
                setValue={(value) => addTechnique('', {welcomingWorkshopBonus: value}) }
                minValue={1}
                maxValue={6}
                prefix={"+"}
              />
            </div>
          )
        }

        { crafterHasTechnique(crafterData, 'comfortZone') &&
          ( projectUsedTechnique(projectData, 'comfortZone') ?
            <div>Used comfort zone.</div>
          :
            <div className='technique-container'>
              <button onClick={() => addBonusRoll(5, 'comfortZone')}>
                Comfort Zone: +5
              </button>
              <button onClick={() => addBoon('comfortZone')}>
                Comfort Zone: +Boon
              </button>
            </div>
          )
        }

        { crafterHasTechnique(crafterData, 'blessedCreation') &&
          ( projectUsedTechnique(projectData, 'blessedCreation') ?
            <div className='technique-container'>
              <div>Used blessed creation.</div>
              <button
                onClick={() =>
                  addBonusRoll(blessedRollOne, '', {
                    blessedCreationRollOne: -1*blessedRollOne,
                  })
                }
                disabled={blessedRollOne <= 0}
              >
                Additional roll: +{Math.abs(blessedRollOne)}
              </button>
              <button
                onClick={() =>
                  addBonusRoll(blessedRollTwo, '', {
                    blessedCreationRollTwo: -1*blessedRollTwo,
                  })
                }
                disabled={blessedRollTwo <= 0}
              >
                Additional roll: +{Math.abs(blessedRollTwo)}
              </button>
            </div>
          :
            <div className='technique-container'>
              <button
                onClick={() =>
                  addBonusRoll(5, 'blessedCreation', {
                    blessedCreationRollOne: getRandomInt(6),
                    blessedCreationRollTwo: getRandomInt(6)
                  })
                }
              >
                Blessed Creation: +5
              </button>
            </div>
          )
        }

        { (crafterHasTechnique(crafterData, 'manufacturer') && (manufacturerCount > 1)) &&
          ( projectUsedTechnique(projectData, 'manufacturer') ?
            <div>Used manufacturer to make {manufacturerCount} copies.</div>
          :
            <div className='technique-container'>
              <button onClick={() => addBonusRoll(0, 'manufacturer')}>
                Manufacturer: {manufacturerCount} copies.
              </button>
            </div>
          )
        }

        { (crafterHasTechnique(crafterData, 'subtext') && (manufacturerCount > 1)) &&
          ( projectUsedTechnique(projectData, 'subtext') ?
            <div>Used subtext: {subtextSelection}.</div>
          :
            <div className='technique-container'>
              <div>Subtext:</div>
              <button onClick={() => addTechnique('subtext', {subtext: 'Animated'})}>
                Animated
              </button>
              <button onClick={() => addTechnique('subtext', {subtext: 'Hidden Message'})}>
                Hidden Message
              </button>
              <button onClick={() => addTechnique('subtext', {subtext: 'Emotion'})}>
                Emotion
              </button>
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
