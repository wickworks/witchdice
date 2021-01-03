import React, { useState } from 'react';
import NumberInput from '../shared/NumberInput.jsx';
import InitiativeRoller from './InitiativeRoller.jsx';
import { DeleteConfirmation } from '../shared/DeleteButton.jsx';
import { deepCopy, capitalize } from '../../utils.js';
import { defaultInitiativeEntry } from './data.js';
import './InitiativeList.scss';

const InitiativeList = ({
  allInitiativeData,
  addEntry,
  highlightEntry,
  setEntryBonus,
  deleteEntry,
  clearData,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const isEmpty = (allInitiativeData.length === 0)

  // find which inititiative #s have duplicates
  let initiatives = new Set()
  let duplicates = new Set()
  allInitiativeData.forEach((entry) => {
    if (initiatives.has(entry.initiative)) duplicates.add(entry.initiative)
    initiatives.add(entry.initiative)
  });

	return (
		<div className="InitiativeList">
      <h3>Initiative Order</h3>

      <div className={`list-container ${isEmpty && 'empty'}`}>

        { allInitiativeData.map((initiativeData, i) => {
            return (<InitiativeEntry
              initiativeData={initiativeData}
              showBonus={duplicates.has(initiativeData.initiative)}
              setBonus={bonus => setEntryBonus(i, bonus)}
              onDelete={() => deleteEntry(i)}
              onClick={() => highlightEntry(i, !initiativeData.highlighted)}
              key={`${initiativeData.name}-${i}`}
            />)
        })}
      </div>

      { isAdding ?
        <InitiativeAdder
          addEntry={addEntry}
          setIsAdding={setIsAdding}
          entryLength={allInitiativeData.length}
        />
      : isRolling ?
        <InitiativeRoller
          addEntry={addEntry}
          setIsRolling={setIsRolling}
        />
      :
        <div className='add-button-container'>
          <label className='add-roll'>
            <button
              className='asset d20'
              onClick={() => setIsRolling(true)}
            />
            Roll initiative
          </label>

          <label className='add-manual'>
            <button
              className='asset plus'
              onClick={() => setIsAdding(true)}
            />
            Add manually
          </label>
        </div>
      }

      {!isEmpty &&
        <div className="clear-roll-container">

          {!isConfirmingClear ?
            <button className="clear-rolls" onClick={() => setIsConfirmingClear(true)}>
              Clear
            </button>
          :
            <DeleteConfirmation
              name={'initiative order'}
              handleCancel={() => setIsConfirmingClear(false)}
              handleDelete={() => {setIsConfirmingClear(false); clearData()}}
              moreClasses={'clear-confirmation'}
            />
          }
        </div>
      }

		</div>
	);
}

const InitiativeEntry = ({
  initiativeData,
  showBonus,
  setBonus,
  onDelete,
  onClick
}) => {
  const {name, bonus, initiative, highlighted} = initiativeData;

  return (
    <div
      className={`InitiativeEntry ${highlighted ? 'highlighted' : ''}`}
    >
      <div
        className='handle asset list_dot'
        onClick={onClick}
      />
      <div className='character-name'>
        {name}
      </div>
      <div className='initiative-count'>
        {showBonus &&
          <NumberInput
            value={bonus}
            minValue={-20}
            setValue={value => setBonus(value) }
            plusPrefix={true}
          />
        }
        {initiative}
      </div>
      <button
        className='delete-button asset necrotic'
        onClick={e => { onDelete(); e.stopPropagation();} }
      />
    </div>
  );
}

const InitiativeAdder = ({
  addEntry,
  setIsAdding,
  entryLength,
}) => {
  const [addingName, setAddingName] = useState('');
  const [addingInitiative, setAddingInitiative] = useState(1);

  const confirmNewCharacter = () => {
    let initiativeEntry = deepCopy(defaultInitiativeEntry)
    initiativeEntry.name = capitalize(addingName)
    initiativeEntry.initiative = addingInitiative
    initiativeEntry.bonus = 0;

    addEntry(initiativeEntry)

    setAddingName('')
    setAddingInitiative(1)
  }

  return (
    <div className='InitiativeAdder'>
      <input
        type='text'
        className='character-name'
        placeholder='Character name'
        value={addingName}
        onChange={e => setAddingName(e.target.value || '')}
        onBlur={() => {if (addingName === '') setIsAdding(false)} }
        autoFocus
        key={`add-name-${entryLength}`}
      />

      <input
        type="number"
        className='initiative-count'
        value={addingInitiative}
        onChange={e => setAddingInitiative(parseInt(e.target.value) || 0)}
        onKeyDown={e => {if (e.key === 'Enter') confirmNewCharacter()} }
        key={`add-initiative-${entryLength}`}
      />

      <button
        className='confirm-entry'
        onClick={confirmNewCharacter}
        key={`confirm-initiative-${entryLength}`}
      >
        <div className='asset checkmark' />
      </button>
    </div>
  )
}




export default InitiativeList;
