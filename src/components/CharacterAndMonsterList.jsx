import React, { useState, useEffect } from 'react';
import { deepCopy } from '../utils.js';
import {
  loadCharacterData,
  getCharacterNameFromStorageName,
  getCharacterIDFromStorageName,
  saveCharacterData,
  getRandomFingerprint,
  defaultAttackData
} from '../data.js';
import './CharacterAndMonsterList.scss';



const CharacterAndMonsterList = ({setActiveCharacterData, activeCharacterID}) => {

  // setAllCharacterEntries(characterEntries)
  // setAllMonsterEntries(monsterEntries)

  // console.log('all character names : ', allCharacterNames);


  function handleEntryClick(id) {

  }


  return (
    <div className="CharacterAndMonsterList">
      <CharacterList
        characterEntries={allCharacterEntries}
        handleEntryClick={handleEntryClick}
        activeCharacterID={activeCharacterID}
        newCharacter={newCharacter}
        activeCharacterName={activeCharacterName}
      />

      <MonsterList
        monsterEntries={allMonsterEntries}
        handleEntryClick={handleEntryClick}
        activeCharacterID={activeCharacterID}
        activeCharacterName={activeCharacterName}
      />
    </div>
  );
}

const CharacterList = ({characterEntries, handleEntryClick, activeCharacterID, activeCharacterName, newCharacter}) => {

  characterEntries.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1)

  return (
    <div className="CharacterList">
      <div className="title-bar">
        <h2>Characters</h2>
        <button className="new-character" onClick={newCharacter}>
          New
          <div className="asset plus"/>
        </button>
      </div>

      <EntryList
        entries={characterEntries}
        handleEntryClick={handleEntryClick}
        activeCharacterID={activeCharacterID}
        activeCharacterName={activeCharacterName}
      />
    </div>
  )
}

const MonsterList = ({monsterEntries, handleEntryClick, activeCharacterID, activeCharacterName}) => {
  const [filter, setFilter] = useState('');
  const [recentMonsters, setRecentMonsters] = useState([]);

  // intercept entry clicks to store in the recent monster list
  const processEntryClick = (id) => {
    let newRecentMonsters = [...recentMonsters];

    // remove all previous instance of this id
    // newRecentMonsters = newRecentMonsters.filter(function(recentID){
    // 	return id !== recentID;
    // });

    if (newRecentMonsters.indexOf(id) === -1) { newRecentMonsters.push(id); }

    newRecentMonsters = newRecentMonsters.slice(0,8);
    setRecentMonsters(newRecentMonsters);

    handleEntryClick(id);
  }

  // // filter the mosnter entries
  let filteredEntries = [];
  if (filter.length > 0) {
    const filterLowercase = filter.toLowerCase();
    monsterEntries.forEach((entry, i) => {
      if (entry.name.toLowerCase().includes(filterLowercase)) { filteredEntries.push(entry) }
    });
  } else {
    filteredEntries = monsterEntries;
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
        <button className="clear-filter" onClick={() => {setFilter('')}}>
          <div className="asset x" />
        </button>
      </div>

      <EntryList
        entries={filteredEntries}
        handleEntryClick={processEntryClick}
        activeCharacterID={activeCharacterID}
        activeCharacterName={activeCharacterName}
      />
    </div>
  )
}

const EntryList = ({entries, handleEntryClick, activeCharacterID, activeCharacterName}) => {

  return (
    <ul className="EntryList">
      { entries.map((entry, i) => {
        const id = entry.id;
        const name = entry.name;
        const selectedClass = (id === activeCharacterID) ? 'selected' : ''
        return (
          <li className={selectedClass} onClick={() => handleEntryClick(id)} key={id}>
            {id === activeCharacterID ? activeCharacterName : entry.name}
          </li>
        )
      })}
    </ul>
  )
}

export default CharacterAndMonsterList;
