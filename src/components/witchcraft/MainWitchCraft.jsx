import React, { useState } from 'react';
import CraftCharacter from './CraftCharacter.jsx';
import CraftSetup from './CraftSetup.jsx';
import { deepCopy } from '../../utils.js';
import {
  defaultCraftingCharacter,
  defaultProject
} from './data.js';


import './CraftCharacter.scss';

const MainWitchCraft = ({
  renderDiceBag,
  renderPartyPanel
}) => {
  const [characterData, setCharacterData] = useState(defaultCraftingCharacter);
  const [projectData, setProjectData] = useState(defaultProject);

  const updateCharacterData = (attribute, value) => {
    var newData = deepCopy(characterData)
    newData[attribute] = value;
    setCharacterData(newData);
  }

  const updateProjectData = (attribute, value) => {
    var newData = deepCopy(projectData)
    newData[attribute] = value;
    setProjectData(newData);
  }

  return (
    <div className='MainWitchCraft'>
      WITCH + CRAFT

      <CraftCharacter
        characterData={characterData}
        updateCharacterData={updateCharacterData}
      />

      <CraftSetup
        characterData={characterData}
        projectData={projectData}
        updateProjectData={updateProjectData}
      />

      <div className='gameplay-container'>
        {renderDiceBag()}

        {renderPartyPanel()}
      </div>
    </div>
  )
}

export default MainWitchCraft ;
