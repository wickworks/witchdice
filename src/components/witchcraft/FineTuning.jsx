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

  // dice: rolls that many dice, adds boons and flaws accordingly
  // roll: adds a specific roll, adds boon or flaw accordingly
  // boonCount: adds this many boons
  // flawCount: adds this many flaws
  // technique: appends technique name
  // techniqueDetails: sets technique detail data
  function updateProject(update) {
    var newRollData = deepCopy(projectData.rollData);

    if (update.dice) {
      for (var i = 0; i < update.dice; i++) {
        const roll = getRandomInt(6);
        newRollData.rolls.push(roll);
        if (roll === 1) { newRollData.flawCount += 1 }
        if (roll === 6) { newRollData.boonCount += 1 }
      }
    }

    if (update.roll) {
      newRollData.rolls.push(update.roll);
      if (update.roll === 1) { newRollData.flawCount += 1 }
      if (update.roll === 6) { newRollData.boonCount += 1 }
    }

    if (update.boonCount) newRollData.boonCount += update.boonCount;
    if (update.flawCount) newRollData.flawCount += update.flawCount;

    var newTechniqueData = deepCopy(projectData.techniques);
    if (update.technique) newTechniqueData.push(update.technique);

    var newTechniqueDetails = deepCopy(projectData.techniqueDetails);
    if (update.techniqueDetails) newTechniqueDetails = {...newTechniqueDetails, ...update.techniqueDetails}

    updateProjectData({
      rollData: newRollData,
      techniques: newTechniqueData,
      techniqueDetails: newTechniqueDetails
    });
  }

  const tier = crafterData.tier;
  const craftRollSucceeded = didProjectSucceed(projectData, crafterData);

  // ======== TECHNIQUE DATA ======== //
  var welcomingWorkshopBonus = 3;
  if (projectData.techniqueDetails.welcomingWorkshopBonus) {
    welcomingWorkshopBonus = parseInt(projectData.techniqueDetails.welcomingWorkshopBonus);
  }

  var blessedRollOne, blessedRollTwo;
  if (projectUsedTechnique(projectData, 'blessedCreation')) {
    blessedRollOne = parseInt(projectData.techniqueDetails.blessedCreationRollOne);
    blessedRollTwo = parseInt(projectData.techniqueDetails.blessedCreationRollTwo);
  }

  const manufacturerCount = getManufacturerCount(projectData);

  const subtextSelection = projectData.techniqueDetails.subtext;

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
        { projectUsedTechnique(projectData, 'desperateMeasures') ?
          <div>Used desparate measures.</div>
        : !craftRollSucceeded &&
          <button onClick={() => updateProject({flawCount: 1, roll: 3, technique: 'desperateMeasures'}) }>
            Use Desperate Measures: +3, +Flaw
          </button>
        }

        { crafterHasTechnique(crafterData, 'inheritedTools') && (tier >= 2) &&
          ( projectUsedTechnique(projectData, 'inheritedTools') ?
            <div>Used inherited tools.</div>
          : !craftRollSucceeded &&
            <button onClick={() => updateProject({dice: (tier >= 4 ? 2 : 1), technique: 'inheritedTools'}) }>
              Use Inherited Tools: +{(tier >= 4 ? 2 : 1)}d6
            </button>
          )
        }

        { crafterHasTechnique(crafterData, 'welcomingWorkshop') &&
          ( projectUsedTechnique(projectData, 'welcomingWorkshop') ?
            <div>Used welcoming workshop.</div>
          :
            <div className='technique-container'>
              <button onClick={() => updateProject({roll: welcomingWorkshopBonus, technique: 'welcomingWorkshop'}) }>
                Use Welcoming Workshop:
              </button>
              <NumberInput
                value={welcomingWorkshopBonus}
                setValue={(value) => updateProject({techniqueDetails: {welcomingWorkshopBonus: value}}) }
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
              <button onClick={() => updateProject({roll: 5, technique: 'comfortZone'}) }>
                Comfort Zone: +5
              </button>
              <button onClick={() => updateProject({boonCount: 1, technique: 'comfortZone'}) }>
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
                onClick={() => updateProject({
                  roll: blessedRollOne,
                  techniqueDetails: { blessedCreationRollOne: -1*blessedRollOne }
                })}
                disabled={blessedRollOne <= 0}
              >
                Additional roll: +{Math.abs(blessedRollOne)}
              </button>
              <button
                onClick={() => updateProject({
                  roll: blessedRollTwo,
                  techniqueDetails: { blessedCreationRollTwo: -1*blessedRollTwo }
                })}
                disabled={blessedRollTwo <= 0}
              >
                Additional roll: +{Math.abs(blessedRollTwo)}
              </button>
            </div>
          :
            <div className='technique-container'>
              <button onClick={() => updateProject({
                roll: 5,
                technique: 'blessedCreation',
                techniqueDetails: {
                  blessedCreationRollOne: getRandomInt(6),
                  blessedCreationRollTwo: getRandomInt(6)
                }
              }) }>
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
              <button onClick={() => updateProject({technique: 'manufacturer'}) }>
                Manufacturer: {manufacturerCount} copies.
              </button>
            </div>
          )
        }

        { crafterHasTechnique(crafterData, 'subtext') &&
          ( projectUsedTechnique(projectData, 'subtext') ?
            <div>Used subtext: {subtextSelection}.</div>
          :
            <div className='technique-container'>
              <div>Subtext:</div>
              <button onClick={() => updateProject({techniqueDetails: {subtext: 'Animated'}, technique: 'subtext'}) }>
                Animated
              </button>
              <button onClick={() => updateProject({techniqueDetails: {subtext: 'Hidden Message'}, technique: 'subtext'}) }>
                Hidden Message
              </button>
              <button onClick={() => updateProject({techniqueDetails: {subtext: 'Emotion'}, technique: 'subtext'}) }>
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
