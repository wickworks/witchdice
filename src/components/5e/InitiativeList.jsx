import React, { useState } from 'react';
import TextInput from '../shared/TextInput.jsx';
import NumberInput from '../shared/NumberInput.jsx';
import { deepCopy, capitalize } from '../../utils.js';
import './InitiativeList.scss';

const InitiativeList = ({
  // partyConnected
}) => {
  const [allInitiativeData, setAllInitiativeData] = useState([]);

  const [isAdding, setIsAdding] = useState(false);
  const [addingName, setAddingName] = useState('');
  const [addingInitiative, setAddingInitiative] = useState(1);

  const confirmNewCharacter = () => {
    let newData = deepCopy(allInitiativeData)
    newData.push({
      name: capitalize(addingName),
      initiative: addingInitiative
    })

    console.log('presort', newData);

    // sort by initiative
    newData.sort((a, b) => (a.initiative < b.initiative) ? 1 : -1)

    console.log('postsort', newData);

    setAllInitiativeData(newData)

    setAddingName('')
    setAddingInitiative(1)
    // setIsAdding(false)
  }

  const deleteEntry = (index) => {
    let newData = deepCopy(allInitiativeData);
    newData.splice(index, 1);
    setAllInitiativeData(newData);
  }

	return (
		<div className="InitiativeList">

      <div className='list-container'>
        <h3>Initiative Order</h3>

        { allInitiativeData.map((initiativeData, i) => {
            return (<InitiativeEntry
              initiativeData={initiativeData}
              onDelete={() => deleteEntry(i)}
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
