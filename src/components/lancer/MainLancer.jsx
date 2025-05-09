import React, { useState, useEffect } from 'react';
import { FileList } from './FileAndPlainList.jsx';
import { CharacterList } from '../shared/CharacterAndMonsterList.jsx';
import NouveauDivider from '../shared/NouveauDivider.jsx';
import LancerPlayerMode from './LancerPlayerMode/LancerPlayerMode.jsx';
import LancerNpcMode from './LancerNpcMode/LancerNpcMode.jsx';
import SquadPanel from './SquadPanel/SquadPanel.jsx';

import PromisifyFileReader from 'promisify-file-reader'
import { parseContentPack } from './contentPackParser.js';

import {
  saveLcpData,
  loadLcpData,
  deleteLcpData,
  LCP_PREFIX,
  STORAGE_ID_LENGTH,
  LANCER_SQUAD_MECH_KEY,
} from './lancerLocalStorage.js';

import { deepCopy } from '../../utils.js';
import { getIDFromStorageName } from '../../localstorage.js';

import './MainLancer.scss';

const coreLcpEntry = {
  name: 'LANCER Core',
  id: 'core'
}
const coreLcpEntries = [
  coreLcpEntry,
  {name: "LANCER: Dustgrave", id: 'dustgrave'},
  {name: "Lancer KTB Data", id: 'ktb'},
  {name: "Lancer Long Rim Data", id: 'longrim'},
  {name: "Operation Solstice Rain Data", id: 'solticerain'},
  {name: "Operation Winter Scar Data", id: 'winterscar'},
  {name: "Shadow of the Wolf Data", id: 'shadowofthewolf'},
  {name: "Siren's Song, A Mountain's Remorse", id: 'sirenssong'},
  {name: "Lancer Wallflower Data", id: 'wallflower'},
]

const GAME_MODE_PLAYER = 1
const GAME_MODE_NPC = 2

const SETTINGS_LANCER_GAME_MODE = 'settings-lancer-game-mode';

// save which game mode we're in
function saveGameModeToLocalStorage(gameMode) {
  localStorage.setItem(SETTINGS_LANCER_GAME_MODE, JSON.stringify(gameMode))
}

// Returns a hash of currently-enabled pages
function loadGameModeFromLocalStorage() {
  let gameMode = GAME_MODE_PLAYER
  const savedString = localStorage.getItem(SETTINGS_LANCER_GAME_MODE)
  if (savedString) gameMode = parseInt(savedString)
  return gameMode;
}

const MainLancer = ({
  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
  setDistantDicebagData,

  partyConnected,
  partyRoom,

  skipDicebagJumplink = false,
}) => {
  const [allLcpEntries, setAllLcpEntries] = useState(coreLcpEntries);
  const [activeLcpID, setActiveLcpID] = useState(coreLcpEntry.id);
  const [isShowingLcpList, setIsShowingLcpList] = useState(false);
  const [isUploadingNewLcpFile, setIsUploadingNewLcpFile] = useState(false);

  const [triggerRerender, setTriggerRerender] = useState(false);
  const [gameMode, setGameMode] = useState(loadGameModeFromLocalStorage());

  const changeGameMode = (newGameMode) => {
    setGameMode(newGameMode)
    saveGameModeToLocalStorage(newGameMode)
    // when we switch to NPC mode, clear the squadpanel's ability to add a mech
    if (newGameMode === GAME_MODE_NPC) localStorage.removeItem(LANCER_SQUAD_MECH_KEY);
  }

  // =============== LCP FILES ==================
  async function parseLcpFile(e) {
    console.log('parsing lcp file......');
    const fileData = await PromisifyFileReader.readAsBinaryString(e.target.files[0])
    var contentPack;
    try {
      return await parseContentPack(fileData)
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

    setTriggerRerender(!triggerRerender)
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

  // =============== INITIALIZE ==================
  useEffect(() => {
    let lcpEntries = [...coreLcpEntries];

    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
      const key = localStorage.key(i);
      if (key.startsWith(`${LCP_PREFIX}-`)) {
        const lcpID = getIDFromStorageName(LCP_PREFIX, key, STORAGE_ID_LENGTH);
        const lcpData = loadLcpData(lcpID);

        let newEntry = {...coreLcpEntry}
        newEntry.name = lcpData.manifest.name;
        newEntry.id = lcpData.id;

        lcpEntries.push(newEntry);
      }
    }

    setAllLcpEntries(lcpEntries);
  }, []);

  return (
    <div className='MainLancer'>

      <div className='game-mode-and-lcp-container'>
        <div className='game-mode-switcher'>
          <button
            onClick={() => changeGameMode(GAME_MODE_PLAYER)}
            className={gameMode === GAME_MODE_PLAYER ? 'active' : ''}
          >
            Player
          </button>
          <button
            onClick={() => changeGameMode(GAME_MODE_NPC)}
            className={gameMode === GAME_MODE_NPC ? 'active' : ''}
          >
            GM
          </button>
        </div>

        <div className={`lcp-container ${isShowingLcpList ? 'expanded' : ''}`}>
          {isShowingLcpList ?
            <FileList
              title='Lancer Content Pack'
              extraClass='content-packs'
              acceptFileType='.lcp'
              onFileUpload={uploadLcpFile}
              isUploadingNewFile={isUploadingNewLcpFile}
              setIsUploadingNewFile={setIsUploadingNewLcpFile}
              instructions={<>Upload a Lancer content pack (.lcp)</>}
            >
              <CharacterList
                title='Lancer Content Pack'
                characterEntries={allLcpEntries}
                handleEntryClick={setActiveLcpID}
                activeCharacterID={activeLcpID}
                checkIfDeletable={id => !coreLcpEntries.some(coreEntry => coreEntry.id == id)}
                deleteActiveCharacter={deleteActiveLcp}
                createNewCharacter={() => setIsUploadingNewLcpFile(true)}
                onTitleClick={() => setIsShowingLcpList(false)}
              />
            </FileList>
          :
            <button className='lcp-list-collapsed' onClick={() => setIsShowingLcpList(true)}>
              {/* allLcpEntries.map((lcpEntry, i) =>
                <span key={lcpEntry.id}> — {lcpEntry.name}</span>
              )*/}
              {/*<span>—</span>*/}
              {allLcpEntries.length <= 1 ?
                <>Click here to add LCPs</>
              :
                <>{allLcpEntries.length} LCPs loaded</>
              }
            </button>
          }
        </div>
      </div>

      <div className='game-mode-and-squad-container'>
        { gameMode === GAME_MODE_PLAYER ?
          <LancerPlayerMode
            setTriggerRerender={setTriggerRerender}
            triggerRerender={triggerRerender}

            partyConnected={partyConnected}
            partyRoom={partyRoom}
            setPartyLastAttackKey={setPartyLastAttackKey}
            setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
            setRollSummaryData={setRollSummaryData}
            setDistantDicebagData={setDistantDicebagData}

            skipDicebagJumplink={skipDicebagJumplink}
          />
        : gameMode === GAME_MODE_NPC &&
          <LancerNpcMode
            setTriggerRerender={setTriggerRerender}
            triggerRerender={triggerRerender}

            partyConnected={partyConnected}
            partyRoom={partyRoom}
            setPartyLastAttackKey={setPartyLastAttackKey}
            setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
            setRollSummaryData={setRollSummaryData}
            setDistantDicebagData={setDistantDicebagData}

            skipDicebagJumplink={skipDicebagJumplink}
          />
        }

        { partyConnected &&
          <>
            <div className='jumplink-anchor' id='squad' />
            <SquadPanel
              partyConnected={partyConnected}
              partyRoom={partyRoom}
            />
          </>
        }

        <NouveauDivider />

      </div>
    </div>
  )
}

export default MainLancer;
