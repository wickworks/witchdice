import React, { useState } from 'react';
import { deepCopy, getRandomInt } from '../../utils.js';
import {
  getStaminaCostForProject,
  getProjectDC,
  getBonusDiceForProject,
  defaultRollData
} from './data.js';

import './CraftRoller.scss';

const CraftRoller = ({
  characterData,
  projectData,
  updateProjectData
}) => {
  const bonusDiceCount = getBonusDiceForProject(characterData, projectData);

  const updateStaminaSpent = (increase) => {
    var staminaSpent = projectData.staminaSpent;
    if (increase) {
      staminaSpent = staminaSpent + 1;
    } else {
      staminaSpent = staminaSpent - 1;
    }
    updateProjectData('staminaSpent', staminaSpent);
  }

  function handleNewRoll() {
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
    result += characterData.proficiencyBonus;
    return result;
  }

  return (
    <div className='CraftRoller'>
      <div className='stamina-bar'>
        <div className='label'>Stamina</div>

        { [...Array(getStaminaCostForProject(projectData))].map(
          (stamina, i) => {
            const isChecked = i < projectData.staminaSpent;
            return (
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => updateStaminaSpent(!isChecked)}
                key={i}
              />
            )
          }
        )}
      </div>

      <div className='controls-and-results'>
        <div className='dc'>
          <div className='label'>DC</div>
          <div className='number'>{getProjectDC(projectData)}</div>
        </div>

        <div className="new-roll-container">
          <button className="new-roll" onClick={() => handleNewRoll()}>
              <div className='asset d20' />
          </button>
        </div>

        { projectData.rollData.rolls.length === 0 ?
          <div className='bonus'>
            <div className='plus'>+</div>
            <div className='dice-container'>
              { [...Array(bonusDiceCount)].map(
                (die, i) => (
                  <div className='asset d6' key={i}/>
                )
              )}
              <div className='proficiency-bonus'>+{characterData.proficiencyBonus}</div>
            </div>
          </div>
        :
          <div className='total'>
            <div className='label'>Total</div>
            <div className='number'>{getResult()}</div>
          </div>
        }

      </div>
    </div>
  )
}

export default CraftRoller ;
