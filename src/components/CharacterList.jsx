import React, { useState } from 'react';
import { deepCopy } from '../utils.js';
import { loadCharacterData } from '../data.js';
import './CharacterList.scss';



const CharacterList = ({setActiveCharacterData}) => {
  // const [allCharacterNames, setAllCharacterNames] = useState(loadedCharacterNames || defaultCharacterNames);
  const [activeCharacterName, setActiveCharacterName] = useState('');

  let allCharacterNames = [];
  for ( var i = 0, len = localStorage.length; i < len; ++i ) {
    const key = localStorage.key(i);
    // console.log('localStorage key : ', key);
    // console.log('                item : ', localStorage.getItem(key));
    if (key.startsWith('character-')) {
      const characterData = JSON.parse(localStorage.getItem(key))
      allCharacterNames.push(characterData.name)
    }
  }

  // console.log('all character names : ', allCharacterNames);

  function handleCharacterClick(name) {
    const loadedCharacter = loadCharacterData(name);

    if (loadedCharacter) {
      setActiveCharacterData(loadedCharacter);
      setActiveCharacterName(name);
    }
  }


  return (
    <div className="CharacterList">
      <h2>Select a character...</h2>
      <ul>
        { allCharacterNames.map((name, i) => {
          const selectedClass = (name === activeCharacterName) ? 'selected' : ''
          return (
            <li className={selectedClass} onClick={() => handleCharacterClick(name)}>
              {name}
            </li>
          )
        })}
      </ul>
    </div>
  );
}



export default CharacterList;
