import React, { useState } from 'react';
import InitiativeRoller from './InitiativeRoller.jsx';
import { deepCopy, capitalize } from '../../utils.js';
import { defaultInitiativeEntry } from './data.js';
import './InitiativeList.scss';

const InitiativeList = ({
  allInitiativeData,
  addInitiativeEntry,
  deleteInitiativeEntry,
  clearInitiativeData,
}) => {

  const [isAdding, setIsAdding] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const isEmpty = (allInitiativeData.length === 0)

	return (
		<div className="InitiativeList">
      <h3>Initiative Order</h3>

      <div className={`list-container ${isEmpty && 'empty'}`}>

        { allInitiativeData.map((initiativeData, i) => {
            return (<InitiativeEntry
              initiativeData={initiativeData}
              onDelete={() => deleteInitiativeEntry(i)}
              key={`${initiativeData.name}-${i}`}
            />)
        })}
      </div>

      { isAdding ?
        <InitiativeAdder
          addInitiativeEntry={addInitiativeEntry}
          setIsAdding={setIsAdding}
          entryLength={allInitiativeData.length}
        />
      : isRolling ?
        <InitiativeRoller
          addInitiativeEntry={addInitiativeEntry}
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
          <button className="clear-rolls" onClick={clearInitiativeData}>
            Clear
          </button>
        </div>
      }

		</div>
	);
}

const InitiativeEntry = ({initiativeData, onDelete}) => {
  const {name, initiative} = initiativeData;

  return (
    <div className='InitiativeEntry'>
      <div className='handle asset list_dot' />
      <div className='character-name'>
        {name}
      </div>
      <div className='initiative-count'>
        {initiative}
      </div>
      <button
        className='delete-button asset necrotic'
        onClick={onDelete}
      />
    </div>
  );
}

const InitiativeAdder = ({
  addInitiativeEntry,
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

    addInitiativeEntry(initiativeEntry)

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
