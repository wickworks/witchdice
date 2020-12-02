import React, { useState, useEffect } from 'react';
import { CharacterList } from '../shared/CharacterAndMonsterList.jsx';
import CraftCharacter from './CraftCharacter.jsx';
import CraftSetup from './CraftSetup.jsx';
import CraftRoller from './CraftRoller.jsx';
import FineTuning from './FineTuning.jsx';
import ProjectCard from './ProjectCard.jsx';
import { deepCopy } from '../../utils.js';
import {
  loadLocalData,
  saveLocalData,
  getStorageName,
  getNameFromStorageName,
  getIDFromStorageName,
  getRandomFingerprint,
} from '../../localstorage.js';
import {
  defaultCraftingCharacter,
  defaultProject,
  buildFinishedDescription
} from './data.js';

import './MainWitchCraft.scss';

const CRAFTER_PREFIX = 'crafter';

const MainWitchCraft = ({
  renderDiceBag,
  renderPartyPanel
}) => {
  const [allCrafterEntries, setAllCrafterEntries] = useState([]);

  const [crafterID, setCrafterID] = useState(null);
  const [crafterData, setCrafterData] = useState(null);
  const [projectData, setProjectData] = useState(null);


  // =============== INITIALIZE ==================

  useEffect(() => {
    let crafterEntries = [];
    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
      const key = localStorage.key(i);
      if (key.startsWith(`${CRAFTER_PREFIX}-`)) {
        const crafterName = getNameFromStorageName(CRAFTER_PREFIX, key);
        const crafterID = getIDFromStorageName(CRAFTER_PREFIX, key);
        crafterEntries.push({id: crafterID, name: crafterName})
      }
    }
    setAllCrafterEntries(crafterEntries);
  }, []);

  // =============== ADD/EDIT/DELETE CHARACTER FUNCTIONS ==================

  const createNewCrafter = () => {
    const fingerprint = getRandomFingerprint();
    const name = 'Crafter';
    let newCrafterData = deepCopy(defaultCraftingCharacter);

    console.log('making new crafter with fingerprint', fingerprint);

    // make it the active one
    setCrafterID(fingerprint);
    setCrafterData(newCrafterData)

    // add it to the entries
    let newData = deepCopy(allCrafterEntries);
    newData.push({id: fingerprint, name: name});
    setAllCrafterEntries(newData);

    // save to localStorage
    saveLocalData(CRAFTER_PREFIX, fingerprint, name, newCrafterData);
  }

  const setActiveCrafter = (id) => {
    const loadedCrafter = loadLocalData(CRAFTER_PREFIX, id);

    if (loadedCrafter) {
      setCrafterID(id);
      setCrafterData(loadedCrafter);
    }

    // clear the project
    setProjectData(null);
  }

  // =============== UPDATE CRAFTER / PROJECT DATA ===================


  const updateCrafterData = (attribute, value) => {
    // validation
    if (attribute === 'name' && value === '') { value = 'Crafter' }

    // set the new state
    var newData = deepCopy(crafterData)
    newData[attribute] = value;
    setCrafterData(newData);

    // update the localstorage
    saveLocalData(CRAFTER_PREFIX, crafterID, newData.name, newData);

    // update the entry
    let newEntryData = deepCopy(allCrafterEntries);
    let characterIndex = -1;
    allCrafterEntries.forEach((entry, i) => {
      if (entry.id === crafterID) {characterIndex = i;}
    });
    if (characterIndex >= 0) {
      newEntryData[characterIndex].name = newData.name;
      setAllCrafterEntries(newEntryData);
    }
  }

  const updateProjectData = (attribute, value) => {
    var newData = deepCopy(projectData)
    newData[attribute] = value;
    setProjectData(newData);
  }

  const handleFinishProject = () => {
    //setProjectData(defaultProject);
    const desc = buildFinishedDescription(projectData, crafterData);
    updateProjectData('desc', desc);
  }

  return (
    <div className='MainWitchCraft'>
      <CharacterList
        characterEntries={allCrafterEntries}
        handleEntryClick={setActiveCrafter}
        activeCharacterID={crafterID}
        createNewCharacter={createNewCrafter}
      />

      { crafterData !== null &&
        <CraftCharacter
          crafterData={crafterData}
          updateCrafterData={updateCrafterData}
        />
      }

      { projectData !== null &&
        <CraftSetup
          crafterData={crafterData}
          projectData={projectData}
          updateProjectData={updateProjectData}
        />
      }


      <div className='gameplay-container'>
        {renderDiceBag()}

        <div className='roller-i-hardly-even-knower-container'>

          { projectData !== null &&
            <>
              <CraftRoller
                crafterData={crafterData}
                projectData={projectData}
                updateProjectData={updateProjectData}
              />

              { projectData.rollData.rolls.length > 0 &&
                <>
                  <FineTuning
                    crafterData={crafterData}
                    projectData={projectData}
                    updateProjectData={updateProjectData}
                    handleFinishProject={handleFinishProject}
                  />

                  <ProjectCard
                    projectData={projectData}
                    updateProjectData={updateProjectData}
                  />
                </>
              }
            </>
          }
        </div>

        {renderPartyPanel()}
      </div>
    </div>
  )
}

export default MainWitchCraft ;
