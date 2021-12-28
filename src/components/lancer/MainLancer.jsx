import React, { useState, useEffect } from 'react';
import { FileList, PlainList } from './FileAndPlainList.jsx';
import EntryList from '../shared/EntryList.jsx';
import PilotDossier from './PilotDossier.jsx';
import MechSheet from './MechSheet.jsx';
import SquadPanel from './MechState/SquadPanel/SquadPanel.jsx';
import { CharacterList } from '../shared/CharacterAndMonsterList.jsx';

import PromisifyFileReader from 'promisify-file-reader'
import { parseContentPack } from './contentPackParser.js';

import compendiaJonesJson from './pilot_data/YOURGRACE.json';

import {
  saveLcpData,
  loadLcpData,
  deleteLcpData,
  savePilotData,
  loadPilotData,
  deletePilotData,
  saveMechStateToLocalStorage,
  PILOT_PREFIX,
  LCP_PREFIX,
  STORAGE_ID_LENGTH,
} from './lancerLocalStorage.js';

import { deepCopy } from '../../utils.js';
import { getIDFromStorageName } from '../../localstorage.js';

import './MainLancer.scss';

const coreLcpEntry = {
  name: 'Core Data',
  id: 'core'
}

const MainLancer = ({
  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,

  partyConnected,
  partyRoom,
}) => {
  const [allLcpEntries, setAllLcpEntries] = useState([coreLcpEntry]);
  const [activeLcpID, setActiveLcpID] = useState(coreLcpEntry.id);
  const [isShowingLcpList, setIsShowingLcpList] = useState(false);

  const [allPilotEntries, setAllPilotEntries] = useState([]);
  const [activePilotID, setActivePilotID] = useState(null);
  const [activeMechID, setActiveMechID] = useState(null);

  const activePilot = allPilotEntries.find(pilot => pilot.id === activePilotID);
  const allMechEntries = activePilot ? activePilot.mechs : [];
  const activeMech = allMechEntries.find(mech => mech.id === activeMechID);

  // =============== INITIALIZE ==================
  useEffect(() => {

    // Save some dummy data (it's my OC, okay? I can have this)
    savePilotData(compendiaJonesJson)

    let pilotEntries = [];
    let lcpEntries = [coreLcpEntry];

    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
      const key = localStorage.key(i);
      // console.log('localStorage key : ', key);
      // console.log('                item : ', localStorage.getItem(key));

      if (key.startsWith(`${PILOT_PREFIX}-`)) {
        const pilotID = getIDFromStorageName(PILOT_PREFIX, key, STORAGE_ID_LENGTH);
        const pilotData = loadPilotData(pilotID);
        if (pilotData) pilotEntries.push(pilotData);
      }

      if (key.startsWith(`${LCP_PREFIX}-`)) {
        const lcpID = getIDFromStorageName(LCP_PREFIX, key, STORAGE_ID_LENGTH);
        const lcpData = loadLcpData(lcpID);

        let newEntry = {...coreLcpEntry}
        newEntry.name = lcpData.manifest.name;
        newEntry.id = lcpData.id;

        lcpEntries.push(newEntry);
      }
    }

    setAllPilotEntries(pilotEntries);
    setAllLcpEntries(lcpEntries);

    // if we were looking at a pilot, restore tham and their first mech
    const oldSelectedID = localStorage.getItem("lancer-selected-character");
    if (oldSelectedID) {
      const newActivePilot = pilotEntries.find(pilot => pilot.id.startsWith(oldSelectedID));
      if (newActivePilot) {
        setActivePilotID(newActivePilot.id)
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // always select the last mech from a pilot
  useEffect(() => {
    if (activePilot && activePilot.mechs.length > 0) {
      const lastMechIndex = activePilot.mechs.length - 1
      setActiveMechID(activePilot.mechs[lastMechIndex].id);
    }
  }, [activePilotID]); // eslint-disable-line react-hooks/exhaustive-deps


  // =============== PILOT FILES ==================
  const uploadPilotFile = e => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      createNewPilot( JSON.parse(e.target.result) )
    };
  }

  const createNewPilot = (pilot) => {
    // sanity-check the pilot file
    if (!pilot || !pilot.id || !pilot.mechs) return

    let newData = deepCopy(allPilotEntries);

    // remove any existing pilots of this ID
    let pilotIndex = allPilotEntries.findIndex(entry => entry.id === pilot.id);
    if (pilotIndex >= 0) newData.splice(pilotIndex, 1)

    // store the entry & set it to active
    newData.push(pilot);
    setAllPilotEntries(newData);
    setActivePilot(pilot.id)

    // save to localstorage
    savePilotData(pilot)
  }

  const setActivePilot = (pilotID) => {
    setActivePilotID(pilotID);

    const newActivePilot = allPilotEntries.find(pilot => pilot.id === activePilotID);
    if (newActivePilot && newActivePilot.mechs.length > 0) setActiveMechID(newActivePilot.mechs[0]);

    localStorage.setItem("lancer-selected-character", pilotID.slice(0,STORAGE_ID_LENGTH));
  }

  const deleteActivePilot = () => {
    deletePilotData(activePilot)
    localStorage.setItem("lancer-selected-character", '');

    // remove from the current list of pilot entries
    let pilotIndex = allPilotEntries.findIndex(entry => entry.id === activePilot.id);
    if (pilotIndex >= 0) {
      let newData = deepCopy(allPilotEntries)
      newData.splice(pilotIndex, 1)
      setAllPilotEntries(newData);
    }

    setActivePilotID(null);
    setActiveMechID(null);
  }


  const updateMechState = (newMechData) => {
    let newPilotData = deepCopy(activePilot);
    const pilotIndex = allPilotEntries.findIndex(entry => entry.id === activePilot.id);
    const mechIndex = activePilot.mechs.findIndex(mech => mech.id == activeMechID)

    if (mechIndex >= 0 && pilotIndex >= 0) {
      Object.keys(newMechData).forEach(statKey => {
        newPilotData.mechs[mechIndex][statKey] = parseInt(newMechData[statKey])
      });

      // update it in localstorage
      savePilotData(newPilotData)

      // update it in the list of pilot entries
      if (pilotIndex >= 0) {
        let newEntryData = [...allPilotEntries] // doesn't need to be a deep copy
        newEntryData[pilotIndex] = newPilotData
        setAllPilotEntries(newEntryData);
      }

    } else {
      console.error('Could not find mech or pilot to save it!', newMechData)
    }
  }

  // =============== LCP FILES ==================
  async function parseLcpFile(e) {
    console.log('parsing lcp file......');
    const fileData = await PromisifyFileReader.readAsBinaryString(e.target.files[0])
    var contentPack;
    try {
      return await parseContentPack(fileData)
      console.log('Parsed content pack:', contentPack);
    } catch (e) {
      console.log('ERROR parsing content pack:', e.message);
    }

    return contentPack;
  }

  const uploadLcpFile = (e) => {
    console.log('uploding lcp file......');
    parseLcpFile(e).then(contentPack => createNewLcp(contentPack));
  }

  const createNewLcp = (contentPack) => {
    let newData = deepCopy(allLcpEntries);

    // remove any existing lcp entries of this ID
    let lcpIndex = allLcpEntries.findIndex(entry => entry.id === contentPack.id);
    if (lcpIndex >= 0) newData.splice(lcpIndex, 1)

    console.log('making entry for content pack : ',contentPack);
    let newEntry = {...coreLcpEntry}
    newEntry.name = contentPack.manifest.name;
    newEntry.id = contentPack.id;

    // store the entry & set it to active
    newData.push(newEntry);
    setAllLcpEntries(newData);
    setActiveLcpID(newEntry.id)

    // save to localstorage
    saveLcpData(contentPack)
  }

  const deleteActiveLcp = () => {
    // remove from the current list of crafter entries
    let lcpName = '';
    let lcpIndex = allLcpEntries.findIndex(entry => entry.id === activeLcpID);
    if (lcpIndex >= 0) {
      console.log('allLcpEntries[lcpIndex]', allLcpEntries[lcpIndex]);
      lcpName = allLcpEntries[lcpIndex].name

      let newData = deepCopy(allLcpEntries)
      newData.splice(lcpIndex, 1)
      setAllLcpEntries(newData);
    }

    deleteLcpData(activeLcpID, lcpName)

    setActiveLcpID(coreLcpEntry.id);
  }


  return (
    <div className='MainLancer'>

      <div className='wip-container'>
        <p>
          Hi! Thanks for checking out the Witchdice Lancer tool.
          It is a WIP, so expect bugs and missing features.
          You can send me feedback & bugs via
          <a
            href='https://docs.google.com/forms/d/e/1FAIpQLScs5LFyqCURtVjQDzrscMZhWXC45xZl4sUdLLMig0QQ3fO5GA/viewform'
            target="_blank"
            rel="noopener noreferrer"
          >
            google form
          </a>
          or
          <a
            href='https://twitter.com/wickglyph'
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>,
          and see the current to-do list on
          <a
            href='https://trello.com/b/e24TNiu1/witchdice'
            target="_blank"
            rel="noopener noreferrer"
          >
            Trello.
          </a>
        </p>
      </div>

      <div className='lcp-container'>
        {isShowingLcpList ?
          <FileList
            title='Lancer Content Pack'
            extraClass='content-packs'
            acceptFileType='.lcp'
            allFileEntries={allLcpEntries}
            setActiveFileID={setActiveLcpID}
            activeFileID={activeLcpID}
            deleteActiveFile={deleteActiveLcp}
            onFileUpload={uploadLcpFile}
            onTitleClick={() => setIsShowingLcpList(false)}
          >
            Upload a Lancer content pack (.lcp)
          </FileList>
        :
          <button className='lcp-list-collapsed' onClick={() => setIsShowingLcpList(true)}>
            { allLcpEntries.map((lcpEntry, i) =>
              <span key={lcpEntry.id}> — {lcpEntry.name}</span>
            )}
            <span>—</span>
          </button>
        }
      </div>


      <FileList
        title='Pilot'
        extraClass='pilots'
        allFileEntries={allPilotEntries}
        setActiveFileID={setActivePilot}
        activeFileID={activePilotID}
        deleteActiveFile={deleteActivePilot}
        onFileUpload={uploadPilotFile}
        onFilePaste={parsedJson => createNewPilot(parsedJson)}
      >
        Upload a pilot data file (.json) from
        <a href="https://compcon.app" target="_blank" rel="noopener noreferrer">COMP/CON</a>.
      </FileList>

      { activePilot &&
        <>
          <PilotDossier
            activePilot={activePilot}
          />

          <PlainList title='Mech' extraClass='mechs'>
            <EntryList
              entries={allMechEntries}
              handleEntryClick={setActiveMechID}
              activeCharacterID={activeMechID}
              deleteEnabled={false}
            />
          </PlainList>
        </>
      }

      { activeMech &&
        <MechSheet
          activeMech={activeMech}
          activePilot={activePilot}
          updateMechState={updateMechState}

          setPartyLastAttackKey={setPartyLastAttackKey}
          setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
          setRollSummaryData={setRollSummaryData}
        />
      }

      { partyConnected &&
        <SquadPanel
          activeMech={activeMech}
          activePilot={activePilot}

          partyConnected={partyConnected}
          partyRoom={partyRoom}
        />
      }
    </div>
  )
}

export default MainLancer;
