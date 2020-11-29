import React, { useState } from 'react';
import CraftCharacter from './CraftCharacter.jsx';
import { deepCopy } from '../../utils.js';
import { defaultCraftingCharacter } from './data.js';


import './CraftCharacter.scss';

const MainWitchCraft = ({
  renderDiceBag,
  renderPartyPanel
}) => {
  const [characterData, setCharacterData] = useState(defaultCraftingCharacter);

  const updateCharacterData = (attribute, value) => {
    var newData = deepCopy(characterData)
    console.log('setting character', attribute, 'to', value);
    newData[attribute] = value;
    console.log('new data:', newData);
    setCharacterData(newData);
  }

  return (
    <div className='MainWitchCraft'>
      WITCH + CRAFT

      <CraftCharacter
        characterData={characterData}
        updateCharacterData={updateCharacterData}
      />

      <div className='gameplay-container'>
        {renderDiceBag()}

        {renderPartyPanel()}
      </div>
    </div>
  )
}

export default MainWitchCraft ;
