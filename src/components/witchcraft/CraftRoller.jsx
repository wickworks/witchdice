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

  const updateStaminaSpent = (increase) => {
    var staminaSpent = projectData.staminaSpent;
    if (increase) {
      staminaSpent = staminaSpent + 1;
    } else {
      staminaSpent = staminaSpent - 1;
    }
    updateProjectData({staminaSpent: staminaSpent});
  }

  function getNewRollData() {
    var newRollData = deepCopy(defaultRollData);

    // all crafting rolls start with a d20
    newRollData.rolls.push( getRandomInt(20) );
    // then roll a d6 for each bonus die
    for (var i = 0; i < bonusDiceCount; i++) {
      const roll = getRandomInt(6);
      newRollData.rolls.push(roll);
      if (roll === 1) { newRollData.flawCount += 1 }
      if (roll === 6) { newRollData.boonCount += 1 }
    }

    return newRollData;
  }

  const handleNewRoll = () => {
    const newRollData = getNewRollData();

    const newBonusData = [crafterData.proficiencyBonus];

    if (projectUsedTechnique(projectData, 'insightfulTalent')) {
      const newInsightRollData = getNewRollData();

      updateProjectData({
        rollData: newRollData,
        insightRollData: newInsightRollData,
        bonusData: newBonusData,
      });

    // just complete the roll
    } else {
      // add the proficiency bonus
      updateProjectData({
        rollData: newRollData,
        bonusData: newBonusData,
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
                  onChange={() => updateStaminaSpent(!isChecked)}
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
              <div className='number'>{getProjectResult(projectData, crafterData)}</div>
            </div>
          }
        </div>

        <DisplayRolls rolls={projectData.rollData.rolls} bonuses={projectData.bonusData} />

        { (projectData.insightRollData !== null) &&
          <>
            <DisplayRolls
              rolls={projectData.insightRollData.rolls}
              bonuses={projectData.bonusData}
              switchable={true}
              handleSwitch={() => {
                updateProjectData({
                  rollData: projectData.insightRollData,
                  insightRollData: projectData.rollData,
                });
              }}
            />

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
          </>
        }
      </div>
    </div>
  )
}

const DisplayRolls = ({
  rolls, bonuses,
  switchable, handleSwitch
}) => {
  return (
    <div className='DisplayRolls'>
      { switchable &&
        <button className={'switch-rolls'} onClick={handleSwitch}>
          Use this roll
        </button>
      }

      { rolls.map( (roll, i) => (
        <DisplayDie
          dieType={ i === 0 ? 'd20' : 'd6'}
          roll={rolls[i]}
          key={i}
        />
      ))}

      { bonuses.map( (bonus, i) => (
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
