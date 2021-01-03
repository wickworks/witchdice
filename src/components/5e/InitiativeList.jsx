import React, { useState } from 'react';
import TextInput from '../shared/TextInput.jsx';
import NumberInput from '../shared/NumberInput.jsx';
import { deepCopy, capitalize } from '../../utils.js';
import { defaultInitiativeEntry } from './data.js';
import './InitiativeList.scss';

const InitiativeList = ({
  allInitiativeData,
  addInitiativeEntry,
  deleteInitiativeEntry,
}) => {

  const [isAdding, setIsAdding] = useState(false);
  const [addingName, setAddingName] = useState('');
  const [addingInitiative, setAddingInitiative] = useState(1);

  const confirmNewCharacter = () => {
    let initiativeEntry = deepCopy(defaultInitiativeEntry)
    initiativeEntry.name = capitalize(addingName)
    initiativeEntry.initiative = addingInitiative

    addInitiativeEntry(initiativeEntry)

    setAddingName('')
    setAddingInitiative(1)
    // setIsAdding(false)
  }

	return (
		<div className="InitiativeList">

      <div className='list-container'>
        <h3>Initiative Order</h3>

        { allInitiativeData.map((initiativeData, i) => {
            return (<InitiativeEntry
              initiativeData={initiativeData}
              onDelete={() => deleteInitiativeEntry(i)}
              key={`${initiativeData.name}-${i}`}
            />)
        })}

        { isAdding ?
          <div className='adding-container'>
            <input
              type='text'
              className='character-name'
              value={addingName}
              onChange={e => setAddingName(e.target.value || '')}
              onBlur={() => {if (addingName === '') setIsAdding(false)} }
              autoFocus
              key={`add-name-${allInitiativeData.length}`}
            />

            <input
              type="number"
              className='initiative-count'
              value={addingInitiative}
              onChange={e => setAddingInitiative(parseInt(e.target.value) || 0)}
              onKeyDown={e => {if (e.key === 'Enter') confirmNewCharacter()} }
              key={`add-initiative-${allInitiativeData.length}`}
            />

            <button
              className='confirm-entry'
              onClick={confirmNewCharacter}
              key={`confirm-initiative-${allInitiativeData.length}`}
            >
              <div className='asset checkmark' />
            </button>
          </div>
        :
          <button
            className='new-entry asset plus'
            onClick={() => setIsAdding(true)}
          >
            <span>Add character to initiative order</span>
          </button>
        }
      </div>

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
        className='delete-button asset trash'
        onClick={onDelete}
      />
    </div>
  );
}


export default InitiativeList;
