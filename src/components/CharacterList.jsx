import React, { useState } from 'react';
import { deepCopy } from '../utils.js';
import { loadCharacterData, getCharacterNameFromStorageName, getCharacterIDFromStorageName } from '../data.js';
import './CharacterList.scss';



const CharacterList = ({setActiveCharacterData}) => {
  // const [allCharacterNames, setAllCharacterNames] = useState(loadedCharacterNames || defaultCharacterNames);
  const [activeCharacterID, setActiveCharacterID] = useState(null);

  let allCharacterEntries = [];
  for ( var i = 0, len = localStorage.length; i < len; ++i ) {
    const key = localStorage.key(i);
    // console.log('localStorage key : ', key);
    // console.log('                item : ', localStorage.getItem(key));
    if (key.startsWith('character-')) {
      const characterName = getCharacterNameFromStorageName(key);
      const characterID = getCharacterIDFromStorageName(key);
      allCharacterEntries.push({id: characterID, name: characterName})
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
    <div className="CharacterList">
      <h2>Select a character...</h2>
      <ul>
        { allCharacterEntries.map((entry, i) => {
          const id = entry.id;
          const name = entry.name;
          const selectedClass = (id === activeCharacterID) ? 'selected' : ''
          return (
            <li className={selectedClass} onClick={() => handleCharacterClick(id)} key={id}>
              {entry.name}
            </li>
          )
        })}
      </ul>
    </div>
  );
}



export default CharacterList;
