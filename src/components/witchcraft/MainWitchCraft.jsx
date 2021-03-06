import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { CharacterList } from '../shared/CharacterAndMonsterList.jsx';
import NouveauDivider from '../shared/NouveauDivider.jsx';
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

const MainWitchCraft = () => {
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

  const deleteActiveCrafter = () => {
    console.log('deleting crafter ', crafterData);

    const storageName = getStorageName(CRAFTER_PREFIX, crafterID, crafterData.name);

    // remove from localstorage
    localStorage.removeItem(storageName);

    // remove from the current list of crafter entries
    let newData = deepCopy(allCrafterEntries)
    let crafterIndex = -1;
    allCrafterEntries.forEach((entry, i) => {
      if (entry.id === crafterID) {crafterIndex = i;}
    });
    if (crafterIndex >= 0) {
      newData.splice(crafterIndex, 1)
      setAllCrafterEntries(newData);
    }

    setCrafterData(null);
  }

  const createNewProject = (uploadedJson = null) => {
    const fingerprint = getRandomFingerprint();
    let newProjectData = deepCopy(defaultProject);

    console.log('making new project with fingerprint', fingerprint);

    // import data?
    if (uploadedJson) {
      console.log('    > importing from json:', uploadedJson);
      const importedProject = JSON.parse(uploadedJson);
      newProjectData = {...newProjectData, ...importedProject}
    }

    // make it the active one & add it to this crafter
    setProjectID(fingerprint);
    setProjectData(newProjectData)
    updateCrafterData({projectIDs: [...crafterData.projectIDs, fingerprint]})

    // add it to the entries
    let newEntryData = deepCopy(allProjectEntries);
    newEntryData.push({id: fingerprint, name: newProjectData.name});
    setAllProjectEntries(newEntryData);

    // save to localStorage
    saveLocalData(PROJECT_PREFIX, fingerprint, newProjectData.name, newProjectData);
  }

  const setActiveProject = (id) => {
    const loadedProject = loadLocalData(PROJECT_PREFIX, id);
    if (loadedProject) {
      setProjectID(id);
      setProjectData(loadedProject);
    }
  }

  const deleteActiveProject = () => {
    console.log('deleting project ', projectData);
    if (!projectData) return;

    const storageName = getStorageName(PROJECT_PREFIX, projectID, projectData.name);

    // remove from localstorage
    localStorage.removeItem(storageName);

    // remove from the current list of project entries
    let newData = deepCopy(allProjectEntries)
    let projectIndex = -1;
    allProjectEntries.forEach((entry, i) => {
      if (entry.id === projectID) {projectIndex = i;}
    });
    if (projectIndex >= 0) {
      newData.splice(projectIndex, 1)
      setAllProjectEntries(newData);
    }

    setProjectData(null);
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

    // if we're saving a blank name, throw the whole thing away
    if (('name' in changes) && changes.name === '') {
      deleteActiveProject();

    } else {
      updateData(
        projectData, setProjectData, changes,
        PROJECT_PREFIX, projectID,
        allProjectEntries, setAllProjectEntries
      )
    }
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

  var currentProjectEntries = [];
  if (crafterData) {
    const projectIDs = crafterData.projectIDs;
    currentProjectEntries = allProjectEntries
      .filter(entry => projectIDs.indexOf(entry.id) >= 0)
      .sort((a, b) => projectIDs.indexOf(b.id) - projectIDs.indexOf(a.id));
  }

  const settingUpProject =
    (projectData !== null) &&
    (projectData.name.length > 0 && projectData.name !== defaultProject.name) &&
    (projectData.stage === 'preparing' || projectData.stage === 'tuning')

  return (
    <div className='MainWitchCraft'>
      { (crafterData && crafterData.name.length > 0) &&
        <Helmet> <title>{crafterData.name} ~ Witch Dice</title> </Helmet>
      }

      <CharacterList
        characterEntries={allCrafterEntries}
        handleEntryClick={setActiveCrafter}
        activeCharacterID={crafterID}
        createNewCharacter={createNewCrafter}
        deleteActiveCharacter={deleteActiveCrafter}
      />

      { crafterData !== null &&
        <div className='crafter-and-projects'>
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
        </div>
      }

      { settingUpProject &&
        <div className={`setup-and-action ${projectData.stage}`}>
          { projectData.stage === 'preparing' &&
            <CraftSetup
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

          <CraftRoller
            crafterData={crafterData}
            projectData={projectData}
            updateProjectData={updateProjectData}
          />
        </div>
      }

      { (settingUpProject && (projectData.stage === 'tuning')) &&
        <div className='finish-project-container'>
          <button className='finish-project' onClick={handleFinishProject}>
            ~ Finish Project ~
          </button>
        </div>
      }

      { (projectData !== null) && (projectData.stage === 'success' || projectData.stage === 'failure') &&
        <div className='roller-i-hardly-even-knower-container'>
          <ProjectCard
              projectData={projectData}
              updateProjectData={updateProjectData}
            />
        </div>
      }

      <NouveauDivider />

    </div>
  )
}

export default MainWitchCraft ;
