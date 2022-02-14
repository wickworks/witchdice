import React, { useState, useEffect } from 'react';
import { FileList } from './FileAndPlainList.jsx';
import LancerPlayerMode from './LancerPlayerMode/LancerPlayerMode.jsx';
import LancerNpcMode from './LancerNpcMode/LancerNpcMode.jsx';

import PromisifyFileReader from 'promisify-file-reader'
import { parseContentPack } from './contentPackParser.js';

import {
  saveLcpData,
  loadLcpData,
  deleteLcpData,
  LCP_PREFIX,
  STORAGE_ID_LENGTH,
} from './lancerLocalStorage.js';

import { deepCopy } from '../../utils.js';
import { getIDFromStorageName } from '../../localstorage.js';

import './MainLancer.scss';

const coreLcpEntry = {
  name: 'Core LCP Data',
  id: 'core'
}

const GAME_MODE_PLAYER = 1
const GAME_MODE_NPC = 2

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

  const [triggerRerender, setTriggerRerender] = useState(false);
  const [gameMode, setGameMode] = useState(GAME_MODE_NPC);

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
    let lcpEntries = [coreLcpEntry];

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

      <div className='game-mode-switcher-container'>
        <div className='game-mode-switcher'>
          <button
            onClick={() => setGameMode(GAME_MODE_PLAYER)}
            className={gameMode === GAME_MODE_PLAYER ? 'active' : ''}
          >
            Player
          </button>
          <button
            onClick={() => setGameMode(GAME_MODE_NPC)}
            className={gameMode === GAME_MODE_NPC ? 'active' : ''}
          >
            GM
          </button>
        </div>
      </div>


      { gameMode === GAME_MODE_PLAYER ?
        <LancerPlayerMode
          setTriggerRerender={setTriggerRerender}
          triggerRerender={triggerRerender}

          partyConnected={partyConnected}
          partyRoom={partyRoom}
          setPartyLastAttackKey={setPartyLastAttackKey}
          setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
          setRollSummaryData={setRollSummaryData}
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
        />
      }


      <div className='jumplink-anchor' id='dicebag' />
    </div>
  )
}

export default MainLancer;
