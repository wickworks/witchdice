import React, { useState } from 'react';
import { deepCopy } from '../utils.js';
import { loadCharacterData, getCharacterNameFromStorageName, getCharacterIDFromStorageName } from '../data.js';
import './CharacterAndMonsterList.scss';



const CharacterAndMonsterList = ({setActiveCharacterData}) => {
  // const [allCharacterNames, setAllCharacterNames] = useState(loadedCharacterNames || defaultCharacterNames);
  const [activeCharacterID, setActiveCharacterID] = useState(null);

  let allCharacterEntries = [];
  let allMonsterEntries = [];
  for ( var i = 0, len = localStorage.length; i < len; ++i ) {
    const key = localStorage.key(i);
    // console.log('localStorage key : ', key);
    // console.log('                item : ', localStorage.getItem(key));
    if (key.startsWith('character-')) {
      const characterName = getCharacterNameFromStorageName(key);
      const characterID = getCharacterIDFromStorageName(key);

      // first chunk of IDs are monsters
      if (characterID < 200000) {
        allMonsterEntries.push({id: characterID, name: characterName})

      } else {
        allCharacterEntries.push({id: characterID, name: characterName})
      }
    }
  }

  allCharacterEntries.sort((a, b) => (a.name > b.name) ? 1 : -1)

  // console.log('all character names : ', allCharacterNames);

  function handleCharacterClick(id) {
    const loadedCharacter = loadCharacterData(id);

    if (loadedCharacter) {
      setActiveCharacterData(loadedCharacter);
      setActiveCharacterID(id);
    }
  }


  return (
    <div className="CharacterAndMonsterList">
      <CharacterList
        characterEntries={allCharacterEntries}
        setActiveCharacterData={handleCharacterClick}
        activeCharacterID={activeCharacterID}
      />


      <MonsterList
        monsterEntries={allMonsterEntries}
        setActiveCharacterData={handleCharacterClick}
        activeCharacterID={activeCharacterID}
        maxEntries={Math.min(8,allCharacterEntries.length)}
      />
    </div>
  );
}

const CharacterList = ({characterEntries, setActiveCharacterData, activeCharacterID}) => {

  return (
    <div className="CharacterList">
      <div className="title-bar">
        <h2>Characters</h2>
        <button>
          New
          <div className="asset plus" />
        </button>
      </div>

      <EntryList
        entries={characterEntries}
        handleEntryClick={setActiveCharacterData}
        activeCharacterID={activeCharacterID}
      />
    </div>
  )
}

const MonsterList = ({monsterEntries, setActiveCharacterData, activeCharacterID}) => {
  const [filter, setFilter] = useState('');

  // filter the mosnter entries
  let filteredEntries = [];
  if (filter.length > 0) {

    // set up the same kind of loose pattern matching that Atom has
    let filterRegEx = '.*'
    for (var i = 0; i < filterRegEx.length; i++) {
      filterRegEx = `${filterRegEx}.*${filterRegEx.charAt(i)}`;
    }

    monsterEntries.forEach((entry, i) => {
      if (entry.name.match(filterRegEx)) {filteredEntries.push(entry)}
    });

  } else {
    // should scramble the order of this somehow so it's not always the same first 8
    filteredEntries = monsterEntries;
  }

  // limit to 8 results
  filteredEntries = filteredEntries.slice(8);

  return (
    <div className="MonsterList">
      <div className="title-bar">
        <h2>Monster</h2>
        <input
          type="text"
          value={filter}
          onChange={ e => setFilter(e.target.value) }
          placeholder='filter'
        />
      </div>

      <EntryList
        entries={filteredEntries}
        handleEntryClick={setActiveCharacterData}
        activeCharacterID={activeCharacterID}
      />
    </div>
  )
}

const EntryList = ({entries, handleEntryClick, activeCharacterID}) => {

  return (
    <ul className="EntryList">
      { entries.map((entry, i) => {
        const id = entry.id;
        const name = entry.name;
        const selectedClass = (id === activeCharacterID) ? 'selected' : ''
        return (
          <li className={selectedClass} onClick={() => handleEntryClick(id)} key={id}>
            {entry.name}
          </li>
        )
      })}
    </ul>
  )
}

export default CharacterAndMonsterList;
