import React, { useState } from 'react';
import { getRandomInt, deepCopy } from '../../utils.js';
import { defaultInitiativeEntry } from './data.js';
import BigRollButton from '../shared/BigRollButton.jsx'
import './InitiativeRoller.scss';

const InitiativeRoller = ({
  addInitiativeEntry,
}) => {
  const [addingName, setAddingName] = useState('');
  const [addingBonus, setAddingBonus] = useState(0);

  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);

  const handleRoll = () => {
    let roll = 0;
    if (advantage && !disadvantage) {
      roll = Math.max(getRandomInt(20), getRandomInt(20))
    } else if (advantage && !disadvantage) {
      roll = Math.min(getRandomInt(20), getRandomInt(20))
    } else {
      roll = getRandomInt(20)
    }
    roll += addingBonus

    let newEntry = deepCopy(defaultInitiativeEntry)
    newEntry.name = addingName
    newEntry.initiative = roll

    addInitiativeEntry(newEntry)

    setAddingName('')
    setAddingBonus(0)
  }

	return (
		<div className="InitiativeRoller">

      <div className='roller-container'>
        <h3>~ Roll Initiative ~</h3>

        <input
          type='text'
          className='character-name'
          placeholder='Character name'
          value={addingName}
          onChange={e => setAddingName(e.target.value || '')}
        />

        <div className='dice-container'>
          <div className='bonus-container'>
            <div>Bonus</div>

            <input
              type="number"
              className='bonus'
              value={addingBonus}
              onChange={e => setAddingBonus(parseInt(e.target.value) || 0)}
            />
          </div>

          <BigRollButton
            handleNewRoll={handleRoll}
            isDisabled={!addingName}
          />

          <div className='advantage-container'>
            <label>
              <input
                name="advantage"
                type="checkbox"
                checked={advantage}
                onChange={() => setAdvantage(!advantage)}
              />
              Advantage
            </label>

            <label>
              <input
                name="disadvantage"
                type="checkbox"
                checked={disadvantage}
                onChange={() => setDisadvantage(!disadvantage)}
              />
              Disadvantage
            </label>
          </div>

        </div>
      </div>

		</div>
	);
}

export default InitiativeRoller;
