import React, { useState } from 'react';
import RollBigButton from '../shared/RollBigButton.jsx';
import { deepCopy, getRandomInt } from '../../utils.js';
import {
  getStaminaCostForProject,
  getProjectDC,
  getBonusDiceForProject,
  getStaminaForCharacter,
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
    updateProjectData('staminaSpent', staminaSpent);
  }

  const handleNewRoll = () => {
    var newData = deepCopy(defaultRollData);

    // all crafting rolls start with a d20
    newData.rolls.push( getRandomInt(20) );
    // then roll a d6 for each bonus die
    for (var i = 0; i < bonusDiceCount; i++) {
      const roll = getRandomInt(6);
      newData.rolls.push(roll);
      if (roll === 1) { newData.flawCount += 1 }
      if (roll === 6) { newData.boonCount += 1 }
    }

    updateProjectData('rollData', newData)
  }

  function getResult() {
    var result = 0;
    result += projectData.rollData.rolls.reduce((a, b) => a + b, 0);
    result += crafterData.proficiencyBonus;
    return result;
  }

  const characterStamina = getStaminaForCharacter(crafterData);
  const projectStaminaCost = getStaminaCostForProject(projectData);

  const rollButtonIsDisabled =
    (projectData.staminaSpent < projectStaminaCost) ||
    (projectData.blueprint.length === 0)


  const craftRollSucceeded = (getResult() >= getProjectDC(projectData));

  return (
    <div className='CraftRoller'>
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
            <div className='label'>Total</div>
            <div className='number'>{getResult()}</div>
          </div>
        }

      </div>
    </div>
  )
}

export default CraftRoller ;
