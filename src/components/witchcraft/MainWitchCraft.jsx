import React, { useState } from 'react';
import CraftCharacter from './CraftCharacter.jsx';
import { defaultCraftingCharacter } from './data.js';
import { deepCopy } from '../../utils.js';


import './CraftCharacter.scss';

const MainWitchCraft = ({
  renderDiceBag,
  renderPartyPanel
}) => {
  const [characterData, setCharacterData] = useState(defaultCraftingCharacter);

  const updateCharacterData = (attribute, value) => {
    var newData = deepCopy(characterData)
    characterData[value] = attribute;
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
