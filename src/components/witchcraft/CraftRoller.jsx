import React, { useState } from 'react';
import RollBigButton from '../shared/RollBigButton.jsx';
import { deepCopy, getRandomInt } from '../../utils.js';
import {
  getStaminaCostForProject,
  getProjectDC,
  getProjectResult,
  didProjectSucceed,
  getBonusDiceForProject,
  getStaminaForCharacter,
  projectUsedTechnique,
  defaultRollData
} from './data.js';
import './CraftRoller.scss';

const CraftRoller = ({
  crafterData,
  projectData,
  updateProjectData
}) => {
  const bonusDiceCount = getBonusDiceForProject(crafterData, projectData);

  const updateStaminaSpent = (stamina, wasChecked) => {
    if (!wasChecked) stamina += 1;
    updateProjectData({staminaSpent: stamina});
  }

  function getNewRollData() {
    var newRollData = deepCopy(defaultRollData);

    // then roll a d6 for each bonus die
    for (var i = 0; i < bonusDiceCount; i++) {
      const roll = getRandomInt(6);
      newRollData.rolls.push(roll);
      if (roll === 1) { newRollData.flawCount += 1 }
      if (roll === 6) { newRollData.boonCount += 1 }
    }
    // sort the d6s
    newRollData.rolls.sort((a, b) => { return a - b; });

    // then add the d20 roll to the start
    newRollData.rolls.unshift( getRandomInt(20) );


    // add the proficiency bonus
    newRollData.bonuses.push(crafterData.proficiencyBonus);

    return newRollData;
  }

  const handleNewRoll = () => {
    const newRollData = getNewRollData();

    // make a second roll to choose
    if (projectUsedTechnique(projectData, 'insightfulTalent')) {
      const newInsightRollData = getNewRollData();
      updateProjectData({
        rollData: newRollData,
        insightRollData: newInsightRollData,
      });

    // just complete the roll
    } else {
      updateProjectData({
        rollData: newRollData,
        stage: 'tuning'
      });
    }
  }

  const characterStamina = getStaminaForCharacter(crafterData);
  const projectStaminaCost = getStaminaCostForProject(projectData);

  const rollButtonIsDisabled = false; //(projectData.staminaSpent < projectStaminaCost)

  const craftRollSucceeded = didProjectSucceed(projectData, crafterData);

  return (
    <div className='CraftRoller'>
      <h2 className="roll-craft">~ Craft Action ~</h2>


      <div className='stamina-bar'>
        <div className='label'>Stamina</div>

        <div className='checkbox-container'>
          { [...Array(projectStaminaCost)].map(
            (stamina, i) => {
              const isChecked = i < projectData.staminaSpent;
              const isBreak = (i % characterStamina === 0) && (i > 0);
              const groupClass = isBreak ? 'break' : '';
              return (
                <input
                  type="checkbox"
                  className={groupClass}
                  checked={isChecked}
                  onChange={() => updateStaminaSpent(i, isChecked)}
                  key={i}
                />
              )
            }
          )}
        </div>
      </div>

      <div className='controls-and-results'>
        <div className='action-container'>

          <div className='dc'>
            <div className='label'>DC</div>
            <div className='number'>{getProjectDC(projectData)}</div>
          </div>

          { (projectData.rollData.rolls.length === 0) ?
            <RollBigButton
              handleNewRoll={handleNewRoll}
              isDisabled={rollButtonIsDisabled}
            />
          :
            <div className={`success-or-failure ${craftRollSucceeded ? 'success' : 'failure'}`}>
              { craftRollSucceeded ? 'Success!' : 'Back to the drawing board.' }
            </div>
          }

          { projectData.rollData.rolls.length === 0 ?
            <div className='additional-dice'>
              <div className='plus'>+</div>
              <div className='dice-container'>
                { [...Array(bonusDiceCount)].map(
                  (die, i) => (
                    <div className='asset d6' key={i}/>
                  )
                )}
                <div className='bonus'>+{crafterData.proficiencyBonus}</div>
              </div>
            </div>

          :
            <div className={`total ${craftRollSucceeded ? 'success' : 'failure'}`}>
              <div className='label'>Result</div>
              <div className='number'>{getProjectResult(projectData.rollData, crafterData)}</div>
            </div>
          }
        </div>

        <DisplayRolls rollData={projectData.rollData} />

        { (projectData.insightRollData !== null) &&
          <div className='insightful-talent'>
            <div className='label'>
              Insightful Talent roll:
            </div>

            <div className='extra-roll-container'>
              <div className='results-container'>
                <div className='summary'>
                  <span>{ `Result: ${getProjectResult(projectData.insightRollData)} ` }</span>
                  <span>{ `Boons: ${projectData.insightRollData.boonCount} ` }</span>
                  <span>{ `Flaws: ${projectData.insightRollData.flawCount} ` }</span>
                </div>

                <DisplayRolls
                  rollData={projectData.insightRollData}
                />
              </div>

              <button
                className={'switch-rolls'}
                onClick={() => { updateProjectData({
                  rollData: projectData.insightRollData,
                  insightRollData: projectData.rollData,
                }); }}
              >
                Use
              </button>
            </div>

            <button
              className='confirm-insight'
              onClick={() => {
                updateProjectData({
                  insightRollData: null,
                  stage: 'tuning'
                });
              }}
            >
              Continue to fine-tuning.
            </button>
          </div>
        }
      </div>
    </div>
  )
}

const DisplayRolls = ({
  rollData,
}) => {
  return (
    <div className='DisplayRolls'>
      { rollData.rolls.map( (roll, i) => (
        <DisplayDie
          dieType={ i === 0 ? 'd20' : 'd6'}
          roll={roll}
          key={i}
        />
      ))}

      { rollData.bonuses.map( (bonus, i) => (
        <div className='bonus'>+{bonus}</div>
      ))}
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

export default CraftRoller ;
