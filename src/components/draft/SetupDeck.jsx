import React, { useState } from 'react';
import { findAllGameData, findNpcClassData } from '../lancer/lancerData.js';
import './SetupDeck.scss';

const SetupDeck = ({
  setNewNpcDeck,
}) => {
  const [checkedNpcs, setCheckedNpcs] = useState([])
  const [duplicateCount, setDuplicateCount] = useState(4)

  const totalNpcDeck = []
  checkedNpcs.forEach(npcKey => {
    for (let i = 0; i < duplicateCount; i++) {
      totalNpcDeck.push(npcKey)
    }
  });


  const allNpcClasses = findAllGameData('npc_classes')

  const isNpcActive = (npcKey) => {
    return (checkedNpcs.indexOf(npcKey) >= 0)
  }

  const toggleNpc = (npcKey) => {
    let newCheckedNpcs = [...checkedNpcs]
    if (isNpcActive(npcKey)) {
      newCheckedNpcs = newCheckedNpcs.filter(filterKey => filterKey != npcKey)
    } else {
      newCheckedNpcs.push(npcKey)
    }
    setCheckedNpcs(newCheckedNpcs)
  }

  return (
    <div className='SetupDeck panel'>
      <h3>Setup NPC Deck</h3>
      <div className='count'>
        Duplicate count
        <input
          type="number"
          value={duplicateCount}
          onChange={e => setDuplicateCount(Math.max(e.target.value || 0, 1))}
        />
      </div>
      <div className='count'>
        Total cards: {duplicateCount * checkedNpcs.length}
      </div>
      <ul>
        { Object.keys(allNpcClasses).map(npcKey =>
          <li key={npcKey}>
            <label>
              <input
                type="checkbox"
                checked={isNpcActive(npcKey)}
                onChange={() => toggleNpc(npcKey)}
              />
              {findNpcClassData(npcKey).name}
            </label>
          </li>
        )}
      </ul>

      <button onClick={() => setNewNpcDeck(totalNpcDeck)}>
        Finalize Deck
      </button>
    </div>
  )
}

export default SetupDeck ;
