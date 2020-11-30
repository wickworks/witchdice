import React from 'react';
import { deepCopy } from '../../utils.js';
import {
  getStaminaCostForProject,
  getProjectDC,
  getBonusDiceForProject
} from './data.js';

import './CraftRoller.scss';

const CraftRoller = ({
  characterData,
  projectData,
  updateProjectData
}) => {

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
    console.log('new roll!');
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

        <div className='additional-dice'>
          <div className='plus'>+</div>
          <div className='dice-container'>
            { [...Array(getBonusDiceForProject(characterData, projectData))].map(
              (die, i) => (
                <div className='asset d6' />
              )
            )}
            <div className='proficiency-bonus'>+{characterData.proficiencyBonus}</div>
          </div>
        </div>

      </div>

    </div>
  )
}

export default CraftRoller ;
