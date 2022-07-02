import React, { useState, useEffect } from 'react';
import { FileList } from '../FileAndPlainList.jsx';
import { CharacterList } from '../../shared/CharacterAndMonsterList.jsx';
import { ActiveNpcBox, CondensedNpcBox } from './ActiveNpcBox.jsx';
import EncounterControls from './EncounterControls.jsx';
import NpcMechSheet from './NpcMechSheet.jsx';
import NpcRoster from './NpcRoster.jsx';
import JumplinkPanel from '../JumplinkPanel.jsx';
import identityid from './identityid.png';

import { deepCopy, capitalize } from '../../../utils.js';
import { randomWords } from '../../../random_words.js';

import {
  saveEncounterData,
  loadEncounterData,
  deleteEncounterData,
  ENCOUNTER_PREFIX,
  STORAGE_ID_LENGTH,
  NPC_LIBRARY_NAME,
} from '../lancerLocalStorage.js';

import {
  getIDFromStorageName,
  getRandomFingerprint,
} from '../../../localstorage.js';

import { findNpcFeatureData, } from '../lancerData.js';
import { getStat, getMarkerForNpcID, fullRepairNpc, applyUpdatesToNpc } from './npcUtils.js';

import './LancerNpcMode.scss';

const emptyEncounter = {
  id: '',
  name: '',
  active: [],
  reinforcements: [],
  casualties: [],
  allNpcs: {},
  roundCount: 1,
}

const SELECTED_ENCOUNTER_KEY = "lancer-selected-encounter"

const NPC_CLOUD_URL = 'https://api.compcon.app/cloud-resources'
const EXAMPLE_IDENTITYID = 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
const IDENTITYID_KEY = 'lancer-user-identityid'

const LancerNpcMode = ({
  setTriggerRerender,
  triggerRerender,

  partyConnected,
  partyRoom,
  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
  setDistantDicebagData,
}) => {
  //
  const [allEncounterEntries, setAllEncounterEntries] = useState([])
  const [npcLibrary, setNpcLibrary] = useState({})

  const [activeEncounterID, setActiveEncounterID] = useState(null)
  const [activeNpcFingerprint, setActiveNpcFingerprint] = useState(null)

  const [isUploadingNewFile, setIsUploadingNewFile] = useState(false);
  const [isWaitingOnSharecodeResponse, setIsWaitingOnSharecodeResponse] = useState(false);
  const [lastIdentityID, setLastIdentityID] = useState(localStorage.getItem(IDENTITYID_KEY))

  const activeEncounter = activeEncounterID && loadEncounterData(activeEncounterID);
  const activeNpc = (activeEncounter && activeNpcFingerprint) && activeEncounter.allNpcs[activeNpcFingerprint];

  // console.log('activeEncounter',activeEncounter);

  // =============== INITIALIZE ==================
  useEffect(() => {
    let encounterEntries = [];

    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
      const key = localStorage.key(i);
      if (key.startsWith(`${ENCOUNTER_PREFIX}-`)) {
        const encounterID = getIDFromStorageName(ENCOUNTER_PREFIX, key, STORAGE_ID_LENGTH);
        const encounterData = loadEncounterData(encounterID);
        if (encounterData) encounterEntries.push(encounterData);
      }

      // load the npc library into memory
      if (key === NPC_LIBRARY_NAME) setNpcLibrary( JSON.parse(localStorage.getItem(NPC_LIBRARY_NAME)) )
    }

    // // If we have no encounters, make a new one
    // if (encounterEntries.length === 0) {
    //   const newEncounter = buildNewEncounter()
    //   encounterEntries.push(newEncounter)
    //   setActiveEncounterID(newEncounter.id)
    //   saveEncounterData(newEncounter)
    // }

    setAllEncounterEntries(encounterEntries.map(encounter => ({name: encounter.name, id: encounter.id})));

    // if we were looking at a encounter, restore it
    const oldSelectedID = localStorage.getItem(SELECTED_ENCOUNTER_KEY);
    // console.log('sel id :',oldSelectedID);
    if (oldSelectedID) {
      const newActiveEncounter = encounterEntries.find(encounter => encounter.id.startsWith(oldSelectedID));
      if (newActiveEncounter) {
        setActiveEncounterID(newActiveEncounter.id)
      }
    }
  }, []);


  // =============== NPC ROSTER ==================

  const createNewNpcs = (npcList) => {
    let newNpcLibrary = {...npcLibrary}

    npcList.forEach(npc => {
      // sanity-check the npc file
      if (!npc || !npc.id || !npc.class) {
        console.error("Uploaded file doesn't look like an NPC! ::")
        console.log(npc);
      } else {
        newNpcLibrary[npc.id] = npc;
      }
    });

    // save the whole library to state & localstorage
    setNpcLibrary(newNpcLibrary)
    localStorage.setItem(NPC_LIBRARY_NAME, JSON.stringify(newNpcLibrary));
  }

  const deleteNpc = (npc) => {
    let newNpcLibrary = {...npcLibrary}
    delete newNpcLibrary[npc.id]

    // save the whole library to state & localstorage
    setNpcLibrary(newNpcLibrary)
    localStorage.setItem(NPC_LIBRARY_NAME, JSON.stringify(newNpcLibrary));
  }

  const deleteAllNpcsWithLabel = (label) => {
    let newNpcLibrary = {...npcLibrary}
    const idsToDelete = Object.values(newNpcLibrary).filter(npc => npc.labels.includes(label)).map(npc => npc.id)
    idsToDelete.forEach(npcID => delete newNpcLibrary[npcID])

    // save the whole library to state & localstorage
    setNpcLibrary(newNpcLibrary)
    localStorage.setItem(NPC_LIBRARY_NAME, JSON.stringify(newNpcLibrary));
  }

  const uploadNpcFile = e => {
    const fileName = e.target.files[0].name

    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {

      console.log('fileName',fileName);

      // compcon backups — have a lot of stuff we don't need
      if (fileName.endsWith('.compcon')) {
        const compconBackup = JSON.parse(e.target.result)
        const npcFile = compconBackup.find(backupFile => backupFile.filename.startsWith('npcs'))
        const npcArray = JSON.parse(npcFile.data)

        // create ALL the new npcs & save them to localstorage
        if (npcArray && npcArray.length > 0) {
          let newNpcLibrary = {...npcLibrary}
          npcArray.forEach(npc => newNpcLibrary[npc.id] = npc);
          setNpcLibrary(newNpcLibrary)
          localStorage.setItem(NPC_LIBRARY_NAME, JSON.stringify(newNpcLibrary));
        }

      // single json npc; just create it
      } else {
        createNewNpcs( [JSON.parse(e.target.result)] )
      }
    };
  }

  const importAllNpcsFromUserID = (userID) => {
    if (!userID) return
    console.log('Fetching npcs via share code:', userID);

    let params = `?uid=${userID}&itemType=npc`

    const fetchHeader = { 'x-api-key': process.env.REACT_APP_COMPCON_API_KEY }
    fetch(NPC_CLOUD_URL+params, { headers: fetchHeader } )
    .then(
      response => response.json()
    ).then(data => {
      console.log('DATA FROM COMPCON::');
      console.log(data)
      return Promise.all(data.map(url => fetch(url)))
    }).then(responses =>
      Promise.all(responses.map(response => response.json()))
    ).then(data => {
      console.log('PARSED NPCS FROM S3::')
      console.log(data)
      createNewNpcs(data)
      setIsWaitingOnSharecodeResponse(false)
    }).catch(() => {
      console.log('Failed to fetch npcs via identityID.');
      setIsWaitingOnSharecodeResponse(false)
    });

    localStorage.setItem(IDENTITYID_KEY, userID);
    setLastIdentityID(userID)
    setIsWaitingOnSharecodeResponse(true)
    setIsUploadingNewFile(false)
  }

  const addNpcToEncounter = (npcId) => {
    const npc = npcLibrary[npcId]

    if (npc) {
      let newNpc = deepCopy(npc)
      fullRepairNpc(newNpc)

      // need a new id so we can tell instances apart
      newNpc.fingerprint = `${getMarkerForNpcID(newNpc.id, activeEncounter.allNpcs)}-${getRandomFingerprint()}`

      let newEncounter = deepCopy(activeEncounter)
      newEncounter.reinforcements.push(newNpc.fingerprint)
      newEncounter.allNpcs[newNpc.fingerprint] = newNpc

      saveEncounterData(newEncounter)
      setTriggerRerender(!triggerRerender)
    }
  }

  const removeNpcFromEncounter = (npcFingerprint) => {
    let newEncounter = deepCopy(activeEncounter)

    // drop the data
    delete newEncounter.allNpcs[npcFingerprint]

    // remove it from all statuses
    newEncounter.active = newEncounter.active.filter(id => id !== npcFingerprint)
    newEncounter.reinforcements = newEncounter.reinforcements.filter(id => id !== npcFingerprint)
    newEncounter.casualties = newEncounter.casualties.filter(id => id !== npcFingerprint)

    saveEncounterData(newEncounter)
    setTriggerRerender(!triggerRerender)
  }


  // =============== ENCOUNTERS ==================

  function buildNewEncounter() {
    let newEncounter = deepCopy(emptyEncounter)
    newEncounter.id = `${getRandomFingerprint()}`
    newEncounter.name = capitalize(`${randomWords({exactly: 1, maxLength: 5})} ${randomWords(1)}`)

    return newEncounter
  }

  const createNewEncounter = () => {
    let newEncounter = buildNewEncounter()
    setActiveEncounterID(newEncounter.id)

    let encounterEntries = [...allEncounterEntries]
    encounterEntries.push({name: newEncounter.name, id: newEncounter.id})
    setAllEncounterEntries(encounterEntries)

    saveEncounterData(newEncounter)
  }

  const deleteActiveEncounter = () => {
    if (!activeEncounter) return

    deleteEncounterData(activeEncounter)
    localStorage.setItem(SELECTED_ENCOUNTER_KEY, '');

    // remove from the current list of encounter entries
    let encounterIndex = allEncounterEntries.findIndex(entry => entry.id === activeEncounter.id);
    if (encounterIndex >= 0) {
      let newData = [...allEncounterEntries]
      newData.splice(encounterIndex, 1)
      setAllEncounterEntries(newData);
    }

    setActiveEncounterID(null);
    setActiveNpcFingerprint(null);
  }

  const setActiveEncounter = (encounterID) => {
    const newActiveEncounter = encounterID && loadEncounterData(encounterID)
    if (newActiveEncounter) {
      setActiveEncounterID(encounterID);
      localStorage.setItem(SELECTED_ENCOUNTER_KEY, encounterID.slice(0,STORAGE_ID_LENGTH));
    }
  }

  const setNpcStatus = (npcFingerprint, status) => {
    let newEncounter = {...activeEncounter}

    // remove it from all previous statuses
    newEncounter.active = newEncounter.active.filter(id => id !== npcFingerprint)
    newEncounter.reinforcements = newEncounter.reinforcements.filter(id => id !== npcFingerprint)
    newEncounter.casualties = newEncounter.casualties.filter(id => id !== npcFingerprint)

    // add it to the new list
    newEncounter[status].push(npcFingerprint)

    saveEncounterData(newEncounter)
    setTriggerRerender(!triggerRerender)

    // if it was selected, deselect it
    if (activeNpcFingerprint === npcFingerprint) setActiveNpcFingerprint(null)
  }

  const setCurrentRound = (newRound) => {
    let newEncounter = {...activeEncounter}
    newEncounter.roundCount = newRound

    // reset all npc activations
    if (newRound > activeEncounter.roundCount) {
      Object.keys(newEncounter.allNpcs).forEach(fingerprint => {
        let npc = newEncounter.allNpcs[fingerprint]
        npc.currentStats['activations'] = getStat('activations', npc)
      })
    }

    saveEncounterData(newEncounter)
    setTriggerRerender(!triggerRerender)
  }

  const restartEncounter = () => {
    let newEncounter = deepCopy(activeEncounter)

    // Reset round counter
    newEncounter.roundCount = 1

    // Heal all NPCs
    Object.keys(newEncounter.allNpcs).forEach(fingerprint => {
      const npc = newEncounter.allNpcs[fingerprint]
      fullRepairNpc(npc)
    })

    // Move them all back to "reinforcements"
    newEncounter.reinforcements.push(...newEncounter.active)
    newEncounter.reinforcements.push(...newEncounter.casualties)
    newEncounter.active = []
    newEncounter.casualties = []

    saveEncounterData(newEncounter)
    setTriggerRerender(!triggerRerender)
  }

  const setEncounterName = (newName) => {
    let newEncounter = {...activeEncounter}
    newEncounter.name = newName

    let newEncounterEntries = deepCopy(allEncounterEntries)
    let oldEntry = newEncounterEntries.find(entry => entry.id === newEncounter.id)
    oldEntry.name = newEncounter.name

    saveEncounterData(newEncounter)
    setAllEncounterEntries(newEncounterEntries)
    setTriggerRerender(!triggerRerender)
  }

  const updateNpcState = (newMechData, npcFingerprint = null) => {
    // default to the current fingerprint if none is given
    if (!npcFingerprint) npcFingerprint = activeNpcFingerprint

    let newEncounterData = {...activeEncounter}
    let newNpc = deepCopy(newEncounterData.allNpcs[npcFingerprint])

    if (newNpc) {
      applyUpdatesToNpc(newMechData, newNpc)

      // console.log('newNpc',newNpc);
      newEncounterData.allNpcs[newNpc.fingerprint] = newNpc

      saveEncounterData(newEncounterData)
      setTriggerRerender(!triggerRerender)
    }
  }


  const npcListActive = activeEncounter && activeEncounter.active.map(fingerprint => activeEncounter.allNpcs[fingerprint])
  const npcListReinforcements = activeEncounter && activeEncounter.reinforcements.map(fingerprint => activeEncounter.allNpcs[fingerprint])
  const npcListCasualties = activeEncounter && activeEncounter.casualties.map(fingerprint => activeEncounter.allNpcs[fingerprint])

  // =============== JUMPLINKS ==================

  let jumplinks = []
  if (!activeEncounter) {
    jumplinks.push('roster')
  } else {
    jumplinks.push('encounter')
    if (activeNpc) {
      jumplinks.push('npc')
      jumplinks.push('weapons')
    }
  }
  // jumplinks.push('clocks','squad')
  jumplinks.push('dicebag')

  return (
    <div className='LancerNpcMode'>
      <JumplinkPanel jumplinks={jumplinks} partyConnected={partyConnected} />

      <div className='encounter-management'>
        <div className='jumplink-anchor' id='roster' />
        <div className='encounter-and-roster-container'>

          <FileList
            title='NPC'
            extraClass='npcs'
            acceptFileType='application/JSON,.compcon'
            onFileUpload={uploadNpcFile}
            onShareCodePaste={importAllNpcsFromUserID}
            shareCodeLength={EXAMPLE_IDENTITYID.length}
            shareCodeName={'comp/con identityid'}
            isUploadingNewFile={isUploadingNewFile}
            setIsUploadingNewFile={setIsUploadingNewFile}
            instructions={
              <>
                Options for importing NPCs:
                <ul>
                  <li>Upload a single npc data file (.json)</li>
                  <li>Upload a full data backup (.compcon)</li>
                  <li>
                    Enter your <span className='hover-help'>COMP/CON
                    IDENTITYID<img alt="Location on COMP/CON Account for identity ID" src={identityid}/></span> to import
                    all npcs saved in your cloud account.
                  </li>
                  {lastIdentityID &&
                    <li>
                      <button className='reimport' onClick={() => importAllNpcsFromUserID(lastIdentityID)}>
                        <span>Reimport from your cloud account.</span>
                        <span className='asset refresh' />
                      </button>
                    </li>
                  }
                </ul>
              </>
            }
          >
            <NpcRoster
              npcLibrary={npcLibrary}
              addNpcToEncounter={addNpcToEncounter}
              deleteNpc={deleteNpc}
              deleteAllNpcsWithLabel={deleteAllNpcsWithLabel}
              setIsUploadingNewFile={setIsUploadingNewFile}
              hasActiveEncounter={!!activeEncounter}
              isWaitingOnSharecodeResponse={isWaitingOnSharecodeResponse}
            />
          </FileList>

          <div className='encounter-list-and-info'>
            <CharacterList
              title='Encounter'
              characterEntries={allEncounterEntries}
              handleEntryClick={setActiveEncounter}
              activeCharacterID={activeEncounterID}
              deleteActiveCharacter={deleteActiveEncounter}
              createNewCharacter={createNewEncounter}
            />

            { activeEncounter &&
              <EncounterControls
                activeEncounter={activeEncounter}
                setEncounterName={setEncounterName}
                restartEncounter={restartEncounter}
              />
            }
          </div>
        </div>

        <div className='jumplink-anchor' id='encounter' />
        { activeEncounter &&
          <div className='active-npc-boxes-container'>
            <CondensedNpcBox
              label={'~ Reinforcements ~'}
              npcList={npcListReinforcements}
              setNpcStatus={setNpcStatus}
              activeNpcFingerprint={activeNpcFingerprint}
              removeNpcFromEncounter={removeNpcFromEncounter}
            />
            <CondensedNpcBox
              label={'~ Casualties ~'}
              npcList={npcListCasualties}
              setNpcStatus={setNpcStatus}
              activeNpcFingerprint={activeNpcFingerprint}
              removeNpcFromEncounter={removeNpcFromEncounter}
            />
            <ActiveNpcBox
              label={'Active Combatants'}
              npcList={npcListActive}
              setNpcStatus={setNpcStatus}
              setActiveNpcFingerprint={setActiveNpcFingerprint}
              activeNpcFingerprint={activeNpcFingerprint}
              updateNpcState={updateNpcState}
              currentRound={activeEncounter.roundCount}
              setCurrentRound={setCurrentRound}
            />
          </div>
        }
      </div>

      { activeNpc && <>
        <div className='jumplink-anchor' id='npc' />
        <NpcMechSheet
          activeNpc={activeNpc}
          updateNpcState={updateNpcState}

          setTriggerRerender={setTriggerRerender}
          triggerRerender={triggerRerender}
          setPartyLastAttackKey={setPartyLastAttackKey}
          setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
          setRollSummaryData={setRollSummaryData}
          setDistantDicebagData={setDistantDicebagData}
        />
      </>}
    </div>
  );
}




export default LancerNpcMode;
