import React, { useState, useEffect } from 'react';
import { CharacterList } from '../shared/CharacterAndMonsterList.jsx';
import CraftCharacter from './CraftCharacter.jsx';
import ProjectList from './ProjectList.jsx';
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
  didProjectSucceed,
  buildFinishedDescription
} from './data.js';

import './MainWitchCraft.scss';

const CRAFTER_PREFIX = 'crafter';
const PROJECT_PREFIX = 'project';

const MainWitchCraft = ({
  renderDiceBag,
  renderPartyPanel
}) => {
  const [allCrafterEntries, setAllCrafterEntries] = useState([]);
  const [allProjectEntries, setAllProjectEntries] = useState([]);

  const [crafterID, setCrafterID] = useState(null);
  const [projectID, setProjectID] = useState(null);
  const [crafterData, setCrafterData] = useState(null);
  const [projectData, setProjectData] = useState(null);


  // =============== INITIALIZE ==================

  useEffect(() => {
    let crafterEntries = [];
    let projectEntries = [];
    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
      const key = localStorage.key(i);
      if (key.startsWith(`${CRAFTER_PREFIX}-`)) {
        const crafterName = getNameFromStorageName(CRAFTER_PREFIX, key);
        const crafterID = getIDFromStorageName(CRAFTER_PREFIX, key);
        crafterEntries.push({id: crafterID, name: crafterName})
      }
      if (key.startsWith(`${PROJECT_PREFIX}-`)) {
        const projectName = getNameFromStorageName(PROJECT_PREFIX, key);
        const projectID = getIDFromStorageName(PROJECT_PREFIX, key);
        projectEntries.push({id: projectID, name: projectName})
      }
    }

    setAllCrafterEntries(crafterEntries);
    setAllProjectEntries(projectEntries);
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


  const createNewProject = () => {
    const fingerprint = getRandomFingerprint();
    const name = 'Project';
    let newProjectData = deepCopy(defaultProject);

    console.log('making new project with fingerprint', fingerprint);

    // make it the active one & add it to this crafter
    setProjectID(fingerprint);
    setProjectData(newProjectData)
    updateCrafterData({projectIDs: [...crafterData.projectIDs, fingerprint]})

    // add it to the entries
    let newData = deepCopy(allProjectEntries);
    newData.push({id: fingerprint, name: name});
    setAllProjectEntries(newData);

    // save to localStorage
    saveLocalData(PROJECT_PREFIX, fingerprint, name, newProjectData);
  }

  const setActiveProject = (id) => {
    const loadedProject = loadLocalData(PROJECT_PREFIX, id);
    if (loadedProject) {
      setProjectID(id);
      setProjectData(loadedProject);
    }
  }

  // =============== UPDATE CRAFTER / PROJECT DATA ===================

  // changes are in the form {name: 'Gemini Storm'}
  const updateCrafterData = (changes) => {
    console.log('update crafter data', changes);

    updateData(
      crafterData, setCrafterData, changes,
      CRAFTER_PREFIX, crafterID,
      allCrafterEntries, setAllCrafterEntries
    )
  }

  const updateProjectData = (changes) => {
    console.log('update project data', changes);

    updateData(
      projectData, setProjectData, changes,
      PROJECT_PREFIX, projectID,
      allProjectEntries, setAllProjectEntries
    )
  }


  function updateData(
    currentData, setData, changes,
    storagePrefix, storageID,
    allEntries, setAllEntries
  ) {

    var newData = {...deepCopy(currentData), ...changes}
    setData(newData);

    // update the localstorage
    saveLocalData(storagePrefix, storageID, newData.name, newData);

    // update the entry
    let newEntryData = deepCopy(allEntries);
    let characterIndex = -1;
    allEntries.forEach((entry, i) => {
      if (entry.id === storageID) {characterIndex = i;}
    });
    if (characterIndex >= 0) {
      newEntryData[characterIndex].name = newData.name;
      setAllEntries(newEntryData);
    }
  }

  const handleFinishProject = () => {
    const desc = buildFinishedDescription(projectData, crafterData);

    const craftRollSucceeded = didProjectSucceed(projectData, crafterData);
    const stage = craftRollSucceeded ? 'success' : 'failure';

    updateProjectData({
      desc: desc,
      stage: stage
    });
  }

  const currentProjectEntries =
    (crafterData !== null) ?
      allProjectEntries.filter(entry =>
        crafterData.projectIDs.indexOf(entry.id) >= 0
      )
    : []

  const settingUpProject =
    (projectData !== null) &&
    (projectData.stage === 'preparing' || projectData.stage === 'tuning')

  return (
    <div className='MainWitchCraft'>
      <CharacterList
        characterEntries={allCrafterEntries}
        handleEntryClick={setActiveCrafter}
        activeCharacterID={crafterID}
        createNewCharacter={createNewCrafter}
      />

      { crafterData !== null &&
        <>
          <CraftCharacter
            crafterData={crafterData}
            updateCrafterData={updateCrafterData}
          />

          <ProjectList
            activeProjectID={projectID}
            projectEntries={currentProjectEntries}
            handleProjectClick={setActiveProject}
            handleAddProject={createNewProject}
            updateProjectData={updateProjectData}
          />
        </>
      }

      { settingUpProject &&
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
              { settingUpProject &&
                <CraftRoller
                  crafterData={crafterData}
                  projectData={projectData}
                  updateProjectData={updateProjectData}
                />
              }

              { projectData.stage === 'tuning' &&
                <FineTuning
                  crafterData={crafterData}
                  projectData={projectData}
                  updateProjectData={updateProjectData}
                  handleFinishProject={handleFinishProject}
                />
              }

              { (projectData.stage === 'success' || projectData.stage === 'failure') &&
                <ProjectCard
                  projectData={projectData}
                  updateProjectData={updateProjectData}
                />
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
