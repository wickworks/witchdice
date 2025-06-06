import React, { useState, useEffect } from 'react';
import { FileList, PlainList } from '../FileAndPlainList.jsx';
import EntryList from '../../shared/EntryList.jsx';
import LoadinDots from '../../shared/LoadinDots.jsx';
import CollapsibleSection from '../../shared/CollapsibleSection.jsx';
import { CharacterList } from '../../shared/CharacterAndMonsterList.jsx';
import PilotDossier from './PilotDossier.jsx';
import Bonds from '../Bonds/Bonds.jsx';
import BondButton from './BondButton.jsx';
import PlayerMechSheet from './PlayerMechSheet.jsx';
import JumplinkPanel from '../JumplinkPanel.jsx';

import {
  savePilotData,
  loadPilotData,
  deletePilotData,
  PILOT_PREFIX,
  STORAGE_ID_LENGTH,
  SELECTED_CHARACTER_KEY,
  LANCER_SQUAD_MECH_KEY,
} from '../lancerLocalStorage.js';

import { deepCopy } from '../../../utils.js';
import { getIDFromStorageName } from '../../../localstorage.js';
import { createSquadMech } from '../SquadPanel/squadUtils.js';
import { applyUpdatesToPlayer } from './playerUtils.js';

import compendiaJonesJson from './YOURGRACE.json';
import './LancerPlayerMode.scss';

const PILOT_SHARE_CODE_URL = 'https://api.compcon.app/share?code='

const LancerPlayerMode = ({
  setTriggerRerender,
  triggerRerender,

  partyConnected,
  partyRoom,
  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
  setDistantDicebagData,

  skipDicebagJumplink,
}) => {
  const [allPilotEntries, setAllPilotEntries] = useState([]);
  const [activePilotID, setActivePilotID] = useState(localStorage.getItem(SELECTED_CHARACTER_KEY));
  const [activeMechID, setActiveMechID] = useState(null);

  const [isViewingBond, setIsViewingBond] = useState(false);
  const [isUploadingNewFile, setIsUploadingNewFile] = useState(false);
  const [isWaitingOnSharecodeResponse, setIsWaitingOnSharecodeResponse] = useState(false);

  const [pilotSectionOpen, setPilotSectionOpen] = useState(true);

  // const activePilot = allPilotEntries.find(pilot => pilot.id === activePilotID);
  const activePilot = activePilotID && loadPilotData(activePilotID); // load the pilot data from local storage
  const allMechEntries = activePilot ? activePilot.mechs : [];
  const activeMech = allMechEntries.find(mech => mech.id === activeMechID);

  // =============== INITIALIZE ==================
  useEffect(() => {

    let pilotEntries = [];

    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
      const key = localStorage.key(i);
      // console.log('localStorage key : ', key);
      // console.log('                item : ', localStorage.getItem(key));

      if (key.startsWith(`${PILOT_PREFIX}-`)) {
        const pilotID = getIDFromStorageName(PILOT_PREFIX, key, STORAGE_ID_LENGTH);
        const pilotData = loadPilotData(pilotID);
        if (pilotData) pilotEntries.push(pilotData);
      }
    }

    // Save some dummy data (it's my OC, okay? I can have this)
    if (pilotEntries.length === 0) {
      savePilotData(compendiaJonesJson)
      pilotEntries.push({name: 'Compendia Jones', id: compendiaJonesJson.id})
    }

    setAllPilotEntries(pilotEntries.map(pilot => ({name: pilot.name, id: pilot.id})));

    // if we were looking at a pilot, restore tham and their first mech
    const oldSelectedID = localStorage.getItem(SELECTED_CHARACTER_KEY);
    if (oldSelectedID) {
      const newActivePilot = pilotEntries.find(pilot => pilot.id.startsWith(oldSelectedID));
      if (newActivePilot) {
        setActivePilot(newActivePilot.id)
      }
    }
  }, []);

  // =============== CHANGE MECH OR BOND ==================

  const changeMech = (newMechID, pilot = activePilot) => {
    setActiveMechID(newMechID)
    setMechAsActive(newMechID, pilot) // saves to localstorage that this is the active one

    setIsViewingBond(false)

    // We trigger a full rerender when we change the mech so the squad panel can pick up changes to LANCER_SQUAD_MECH_KEY
    setTriggerRerender(!triggerRerender)
  }

  // activate this one and deactivate the rest
  const setMechAsActive = (mechID, pilot) => {
    if (mechID && pilot) {
      const newPilotData = deepCopy(pilot);

      var changedActiveStatus = false // only save if we changed something
      pilot.mechs.forEach((mech, i) => {
        const newMechData = newPilotData.mechs[i]
        const isThisMechNowActive = newMechData.id === mechID
        changedActiveStatus = changedActiveStatus || newMechData.active !== isThisMechNowActive
        applyUpdatesToPlayer({ active: isThisMechNowActive }, newPilotData, newMechData)
      })

      if (changedActiveStatus) savePilotData(newPilotData) // update it in localstorage
    }
  }

  const onBondButtonClick = () => {
    setIsViewingBond(true)
    setActiveMechID(null)
  }

  // =============== MAINTAIN SQUAD MECH JSON ==================
  if (partyConnected && activeMech && activePilot) {
    const squadMech = createSquadMech(activeMech, activePilot)
    localStorage.setItem(LANCER_SQUAD_MECH_KEY, JSON.stringify(squadMech));
  }

  // =============== PILOT FILES ==================
  const uploadPilotFile = e => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      createNewPilot( JSON.parse(e.target.result) )
    };
  }

  const fetchShareCode = (shareCode) => {
    if (!shareCode) return
    console.log('Fetching pilot via share code:', shareCode);

    const fetchHeader = { 'x-api-key': import.meta.env.VITE_COMPCON_API_KEY }
    fetch(PILOT_SHARE_CODE_URL+shareCode, { headers: fetchHeader } )
    .then(
      response => response.json()
    ).then(data => {
      console.log('DATA FROM COMPCON::');
      console.log(data)
      const pilotFetchUrl = data.presigned
      return fetch(pilotFetchUrl)
    }).then(
      response => response.json()
    ).then(pilotData => {
      console.log('DATA FROM S3::');
      console.log(pilotData)
      createNewPilot(pilotData, shareCode)
      setIsWaitingOnSharecodeResponse(false)
    }).catch(() => {
      console.log('Failed to fetch pilot via share code.');
      setIsWaitingOnSharecodeResponse(false)
    });

    setIsWaitingOnSharecodeResponse(true)
  }

  const createNewPilot = (pilot, viaShareCode = null) => {
    if (!pilot || !pilot.id || !pilot.mechs) return // sanity-check the pilot file

    let newPilotEntries = [...allPilotEntries]

    // remove any existing pilots of this ID
    let preserveBondData = null
    let pilotIndex = allPilotEntries.findIndex(entry => entry.id === pilot.id);
    if (pilotIndex >= 0) {
      // PRESERVE bond data; players should be able to use COMPCON to update mechs without clearing thier local bond stuff
      if (viaShareCode) {
        const old = loadPilotData(activePilotID)
        preserveBondData = {
          bondId:old.bondId, xp:old.xp, stress:old.stress, burdens:old.burdens, bondPowers:old.bondPowers, bondAnswers:old.bondAnswers, minorIdeal:old.minorIdeal
        }
      }
      deletePilotData(allPilotEntries[pilotIndex].id, allPilotEntries[pilotIndex].name)
      newPilotEntries.splice(pilotIndex, 1)
    }

    // add the sharecode to this pilot if we have one
    if (viaShareCode) pilot.shareCode = viaShareCode
    // preserve bond data
    if (preserveBondData) pilot = {...pilot, ...preserveBondData}

    // store the entry & set it to active
    newPilotEntries.push({name: pilot.name, id: pilot.id});
    setAllPilotEntries(newPilotEntries);

    // save to localstorage
    savePilotData(pilot)

    // we have to set the active pilot **after** saving it to localstorage
    setActivePilot(pilot.id)
    setTriggerRerender(!triggerRerender)
  }

  const setActivePilot = (pilotID) => {
    const newActivePilot = pilotID && loadPilotData(pilotID)

    if (newActivePilot) {
      setActivePilotID(pilotID);

      // select the first active mech
      if (newActivePilot && newActivePilot.mechs.length > 0) {
        // look for the active mech
        const activeMechs = newActivePilot.mechs.filter(mech => mech.active)
        const activeMech = activeMechs.length > 0 ? activeMechs[0] : newActivePilot.mechs[newActivePilot.mechs.length - 1]
        changeMech(activeMech.id, newActivePilot);
      } else {
        changeMech(null)
      }


      localStorage.setItem(SELECTED_CHARACTER_KEY, pilotID.slice(0,STORAGE_ID_LENGTH));
    }
  }

  const deleteActivePilot = () => {
    if (!activePilot) return

    deletePilotData(activePilot.id, activePilot.name)
    localStorage.setItem(SELECTED_CHARACTER_KEY, '');

    // remove from the current list of pilot entries
    let pilotIndex = allPilotEntries.findIndex(entry => entry.id === activePilot.id);
    if (pilotIndex >= 0) {
      let newData = [...allPilotEntries]
      newData.splice(pilotIndex, 1)
      setAllPilotEntries(newData);
    }

    setActivePilotID(null);
    changeMech(null);
  }

  const exportActivePilot = () => {
    if (!activePilot) return

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activePilot));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", activePilot.callsign.toUpperCase() + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  const onClickJumplink = (link) => {
    if (['pilot','bond'].includes(link)) setPilotSectionOpen(true)
  }

  let jumplinks = ['pilot']
  if (activeMechID) {
    jumplinks.push('mech','weapons')
  }
  if (isViewingBond) jumplinks.push('bond')
  if (partyConnected) jumplinks.push('squad')
  // jumplinks.push('clocks')
  if (!skipDicebagJumplink) jumplinks.push('dicebag')

  return (
    <div className='LancerPlayerMode'>

      { activePilot &&
        <JumplinkPanel
          jumplinks={jumplinks}
          partyConnected={partyConnected}
          onClickJumplink={onClickJumplink}
        />
      }

      <CollapsibleSection title='Pilot' parentControlledOpen={pilotSectionOpen} setParentControlledOpen={setPilotSectionOpen}>

        {isWaitingOnSharecodeResponse ?
          <LoadinDots />
        :
          <FileList
            title='Pilot'
            extraClass='pilots'
            onFileUpload={uploadPilotFile}
            onFilePaste={parsedJson => createNewPilot(parsedJson)}
            onShareCodePaste={fetchShareCode}
            shareCodeLength={6}
            isUploadingNewFile={isUploadingNewFile}
            setIsUploadingNewFile={setIsUploadingNewFile}
            instructions={
              <>
                Upload a pilot data file (.json) from
                <a href="https://compcon.app" target="_blank" rel="noopener noreferrer">COMP/CON</a>.
              </>
            }
          >
            <CharacterList
              title={'Pilot'}
              characterEntries={allPilotEntries}
              handleEntryClick={setActivePilot}
              activeCharacterID={activePilotID}
              deleteActiveCharacter={deleteActivePilot}
              exportActiveCharacter={exportActivePilot}
              refreshActiveCharacter={
                (activePilot && activePilot.shareCode) ?
                  (() => fetchShareCode(activePilot.shareCode))
                :
                  null
              }
              createNewCharacter={() => setIsUploadingNewFile(true)}
            />

          </FileList>
        }

        { activePilot &&
          <>
            <div className={`jumplink-anchor ${pilotSectionOpen ? '' : 'collapsed'}`} id='pilot' />

            <PilotDossier
              activePilot={activePilot}
              setDistantDicebagData={setDistantDicebagData}
            />

            <div className='mechlist-or-bonds'>
              <PlainList title='Mech' extraClass='mechs'>
                <EntryList
                  entries={allMechEntries}
                  handleEntryClick={changeMech}
                  activeCharacterID={activeMechID}
                  deleteEnabled={false}
                />
              </PlainList>
              <BondButton
                onClick={onBondButtonClick}
                isViewingBond={isViewingBond}
                bondID={activePilot.bondId}
              />
            </div>

          </>
        }

        { isViewingBond &&
          <>
            <div className={`jumplink-anchor ${pilotSectionOpen ? '' : 'collapsed'}`} id='bond' />
            <Bonds
              activePilot={activePilot}
              setTriggerRerender={setTriggerRerender}
              triggerRerender={triggerRerender}
              setRollSummaryData={setRollSummaryData}
            />
          </>
        }
      </CollapsibleSection>


      { activeMech &&
        <div>
          <div className='jumplink-anchor' id='mech' />
          <PlayerMechSheet
            activePilot={activePilot}
            activeMech={activeMech}

            setTriggerRerender={setTriggerRerender}
            triggerRerender={triggerRerender}

            setPartyLastAttackKey={setPartyLastAttackKey}
            setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
            setRollSummaryData={setRollSummaryData}
            setDistantDicebagData={setDistantDicebagData}
          />
        </div>
      }
    </div>
  );
}




export default LancerPlayerMode;
