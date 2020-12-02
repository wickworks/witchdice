import React, { useState } from 'react';
import { deepCopy } from '../../utils.js';
import './CharacterAndMonsterList.scss';



const CharacterAndMonsterList = ({
  setActiveCharacterID,
  activeCharacterID,
  allCharacterEntries,
  allMonsterEntries,
  createNewCharacter
}) => {

  return (
    <div className="CharacterAndMonsterList">
      <CharacterList
        characterEntries={allCharacterEntries}
        handleEntryClick={setActiveCharacterID}
        activeCharacterID={activeCharacterID}
        createNewCharacter={createNewCharacter}
      />

      <MonsterList
        monsterEntries={allMonsterEntries}
        handleEntryClick={setActiveCharacterID}
        activeCharacterID={activeCharacterID}
      />
    </div>
  );
}

const CharacterList = ({characterEntries, handleEntryClick, activeCharacterID, createNewCharacter}) => {
  characterEntries.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1)

  return (
    <div className="CharacterList">
      <div className="title-bar">
        <h2>Characters</h2>
        {characterEntries.length > 0 &&
          <button className="new-character" onClick={createNewCharacter}>
            New
            <div className="asset plus"/>
          </button>
        }
      </div>

      <EntryList
        entries={characterEntries}
        handleEntryClick={handleEntryClick}
        activeCharacterID={activeCharacterID}
      />

      { characterEntries.length === 0 &&
        <button className="new-character first" onClick={createNewCharacter}>
          New Character
          <div className="asset plus"/>
        </button>
      }
    </div>
  )
}

const MonsterList = ({monsterEntries, handleEntryClick, activeCharacterID}) => {
  const [filter, setFilter] = useState('');
  const [recentMonsters, setRecentMonsters] = useState([]);

  // intercept entry clicks to store in the recent monster list
  const processEntryClick = (id) => {
    let newRecentMonsters = [...recentMonsters];

    // if we don't already have it
    if (newRecentMonsters.indexOf(id) === -1) {
      // trim it down to get it ready for the next one
      if (newRecentMonsters.length === 8) { newRecentMonsters = newRecentMonsters.slice(0,7); }

      newRecentMonsters.push(id);
    }

    setRecentMonsters(newRecentMonsters);

    handleEntryClick(id);
  }

  // filter the mosnter entries
  let filteredEntries = [];
  if (filter.length > 0) {
    const filterLowercase = filter.toLowerCase();
    monsterEntries.forEach((entry, i) => {
      if (entry.name.toLowerCase().includes(filterLowercase)) { filteredEntries.push(entry) }
    });
  } else {
    filteredEntries = deepCopy(monsterEntries);
  }

  // sort, with most recent monsters first
  filteredEntries.sort((a, b) => {
    const recentA = recentMonsters.indexOf(a.id);
    const recentB = recentMonsters.indexOf(b.id);

    if ((recentA >= 0) || (recentB >= 0)) {
      return (recentA > recentB) ? -1 : 1
    } else {
      return (a.name > b.name) ? 1 : -1
    }
  });

  // limit to 8 results
  filteredEntries = filteredEntries.slice(0,8);

  return (
    <div className="MonsterList">
      <div className="title-bar">
        <h2>Monsters</h2>
        <input
          type="text"
          value={filter}
          onChange={ e => setFilter(e.target.value) }
          placeholder='filter'
        />
        {filter.length > 0 &&
          <button className="clear-filter" onClick={() => {setFilter('')}}>
            <div className="asset x" />
          </button>
        }
      </div>

      <EntryList
        entries={filteredEntries}
        handleEntryClick={processEntryClick}
        activeCharacterID={activeCharacterID}
        highlightIDs={recentMonsters}
      />
    </div>
  )
}

const EntryList = ({entries, handleEntryClick, activeCharacterID, highlightIDs = []}) => {

  return (
    <ul className="EntryList">
      { entries.map((entry, i) => {
        const id = entry.id;
        const name = entry.name;
        const selectedClass = (id === activeCharacterID) ? 'selected' : ''
        const highlightClass = (highlightIDs.indexOf(id) >= 0) ? 'highlighted' : ''
        return (
          <li
            className={`${selectedClass} ${highlightClass}`}
            onClick={() => handleEntryClick(id)}
            key={id}
          >
            {name}
          </li>
        )
      })}
    </ul>
  )
}

export { CharacterAndMonsterList, CharacterList, MonsterList };
