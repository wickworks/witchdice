import React, { useState, useEffect } from 'react';
import NouveauDivider from '../shared/NouveauDivider.jsx';
import LancerPlayerMode from './LancerPlayerMode/LancerPlayerMode.jsx';
import LancerNpcMode from './LancerNpcMode/LancerNpcMode.jsx';
import SquadPanel from './SquadPanel/SquadPanel.jsx';

import {
  LANCER_SQUAD_MECH_KEY,
  migrateLegacyLcpData,
} from './lancerLocalStorage';

import './MainLancer.scss';

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
  const [triggerRerender, setTriggerRerender] = useState(false);
  const [gameMode, setGameMode] = useState(loadGameModeFromLocalStorage());

  const changeGameMode = (newGameMode) => {
    setGameMode(newGameMode)
    saveGameModeToLocalStorage(newGameMode)
    // when we switch to NPC mode, clear the squadpanel's ability to add a mech
    if (newGameMode === GAME_MODE_NPC) localStorage.removeItem(LANCER_SQUAD_MECH_KEY);
  }

  useEffect(() => {
    migrateLegacyLcpData()
  }, []);

  return (
    <div className='MainLancer'>

      <div className='game-mode-container'>
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
