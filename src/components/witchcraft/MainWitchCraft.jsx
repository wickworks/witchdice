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
  getProjectDC,
  getProjectResult,
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
    updateCrafterData('projectIDs', [...crafterData.projectIDs, fingerprint])

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


  // can either make a single change with (attribute, value)
  // or muliple with ( {attribute: XXX, value: YYY} )
  const updateCrafterData = (changes, value) => {
    console.log('update crafter data', changes, '    ', value);

    var newData = deepCopy(crafterData)
    // multiple changes
    if (value === undefined) {
      changes.forEach((change) => {
        newData[change.attribute] = change.value;
      });
    // a single change
    } else {
      newData[changes] = value;
    }
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

  // can either make a single change with (attribute, value)
  // or muliple with ( {attribute: XXX, value: YYY} )
  const updateProjectData = (changes, value) => {
    console.log('update project data', changes, '    ', value);

    var newData = deepCopy(projectData)
    // multiple changes
    if (value === undefined) {
      changes.forEach((change) => {
        newData[change.attribute] = change.value;
      });
    // a single change
    } else {
      newData[changes] = value;
    }
    setProjectData(newData);

    // update the localstorage
    saveLocalData(PROJECT_PREFIX, projectID, newData.blueprint, newData);

    // update the entry
    let newEntryData = deepCopy(allProjectEntries);
    let characterIndex = -1;
    allProjectEntries.forEach((entry, i) => {
      if (entry.id === projectID) {characterIndex = i;}
    });
    if (characterIndex >= 0) {
      newEntryData[characterIndex].name = newData.blueprint;
      setAllProjectEntries(newEntryData);
    }
  }

  const handleFinishProject = () => {
    const desc = buildFinishedDescription(projectData, crafterData);

    const craftRollSucceeded = (getProjectResult(projectData, crafterData) >= getProjectDC(projectData));
    const stage = craftRollSucceeded ? 'success' : 'failure';

    updateProjectData([
      {attribute: 'desc', value: desc},
      {attribute: 'stage', value: stage},
    ]);
  }

  const currentProjectEntries =
    (crafterData !== null) ?
      allProjectEntries.filter(entry =>
        crafterData.projectIDs.indexOf(entry.id) >= 0
      )
    : []

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
          />
        </>
      }

      { (projectData !== null &&
        (projectData.stage === 'preparing' ||
        projectData.stage === 'tuning')) &&
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
              { (projectData.stage === 'preparing' || projectData.stage === 'tuning') &&
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

              { projectData.stage === 'finished' &&
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
