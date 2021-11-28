import React, { useState, useEffect } from 'react';
import EntryList from './EntryList.jsx';
import { deepCopy, getRandomInt } from '../../utils.js';
import './CharacterAndMonsterList.scss';

const CharacterAndMonsterList = ({
  setActiveCharacterID,
  activeCharacterID,
  deleteActiveCharacter,
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
        deleteActiveCharacter={deleteActiveCharacter}
        createNewCharacter={createNewCharacter}
      />

      <MonsterList
        monsterEntries={allMonsterEntries}
        handleEntryClick={setActiveCharacterID}
        deleteActiveCharacter={deleteActiveCharacter}
        activeCharacterID={activeCharacterID}
      />
    </div>
  );
}

const CharacterList = ({
  characterEntries,
  handleEntryClick,
  activeCharacterID,
  deleteActiveCharacter,
  createNewCharacter,
  title = 'Character',
  onTitleClick = null,
}) => {
  characterEntries.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1)

  return (
    <div className="CharacterList">
      <div className="title-bar">
        <button className="title-button" onClick={onTitleClick} disabled={onTitleClick === null}>
          <h2>{title}s</h2>
        </button>
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
        deleteActiveCharacter={deleteActiveCharacter}
      />

      { characterEntries.length === 0 &&
        <button className="new-character first" onClick={createNewCharacter}>
          New {title}
          <div className="asset plus"/>
        </button>
      }
    </div>
  )
}

const MonsterList = ({
  monsterEntries,
  handleEntryClick,
  deleteActiveCharacter,
  activeCharacterID,
}) => {
  const [filter, setFilter] = useState('');
  const [recentMonsters, setRecentMonsters] = useState([]);

  const [scrambleSeed, setScrambleSeed] = useState(0)
  useEffect(() => {
    if (monsterEntries.length > 24) {
      setScrambleSeed( getRandomInt(monsterEntries.length-12) )
    }
  }, [monsterEntries]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // list of recent monsters
  } else if (recentMonsters.length > 0) {

    monsterEntries.forEach((entry, i) => {
      if (recentMonsters.includes(entry.id)) { filteredEntries.push(entry) }
    });

    filteredEntries.sort((a, b) => {
      const recentA = recentMonsters.indexOf(a.id);
      const recentB = recentMonsters.indexOf(b.id);

      if ((recentA >= 0) || (recentB >= 0)) {
        return (recentA > recentB) ? -1 : 1
      } else {
        return (a.name > b.name) ? 1 : -1
      }
    });

  // get a random collection of eight
  } else {
    filteredEntries = deepCopy(monsterEntries);
  }

  // sort, with most recent monsters first
  // filteredEntries.sort((a, b) => {
  //   const recentA = recentMonsters.indexOf(a.id);
  //   const recentB = recentMonsters.indexOf(b.id);
  //
  //   if ((recentA >= 0) || (recentB >= 0)) {
  //     return (recentA > recentB) ? -1 : 1
  //   } else {
  //     return (a.name > b.name) ? 1 : -1
  //   }
  // });

  // if we have no filter or recent monsters, slice out a bunch
  if (filter.length === 0 && recentMonsters.length === 0) {
    filteredEntries = filteredEntries.slice(scrambleSeed);
  }

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
        deleteActiveCharacter={deleteActiveCharacter}
        highlightIDs={recentMonsters}
      />
    </div>
  )
}

export { CharacterAndMonsterList, CharacterList, MonsterList };
