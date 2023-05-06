import React, { useState, useEffect } from 'react';

import DiceBag from '../shared/DiceBag/DiceBag.jsx';
import RollHistory from '../shared/RollHistory/RollHistory.jsx';
import RoomConnect from '../shared/RoomConnect/RoomConnect.jsx';
import SquadClockPanel from '../shared/SquadClockPanel/SquadClockPanel.jsx';
import TipsAndTricks from '../settings/TipsAndTricks.jsx';
import { randomWords } from '../../random_words.js';
import { latestActionToNotification } from './OwlbearNotifications.js';

import OBR from "@owlbear-rodeo/sdk";

import './MainOwlbear.scss';

const METADATA_ROOM = "com.witchdice.obr-extension/metadata"

function generateOwlbearRoomName() {
  return `owlbear-${randomWords(1)}-${randomWords({exactly: 1, maxLength: 6})}-${randomWords({exactly: 1, maxLength: 4})}`
}

const MainOwlbear = ({
  addNewDicebagPartyRoll,
  distantDicebagData,
  allPartyActionData,
  latestAction,

  partyName,
  setPartyName,
  partyConnected,
  partyRoom,
  connectToRoom,
  setPartyRoom,
  generateRoomName,
}) => {
  const [triggerRerender, setTriggerRerender] = useState(false);

  // Instead of changing the URL, change the page in state here
  const allPageModes = ['Dice','History','Clocks','?']
  const [pageMode, setPageMode] = useState('Dice');

  // Initialize Owlbear SDK
  const [obrReady, setObrReady] = useState(false)
  useEffect(() => { if (OBR.isAvailable && !obrReady) OBR.onReady(() => initializeObr(obrReady)) }, [obrReady])
  const initializeObr = () => {
    console.log('OBR READY');
    setObrReady(true);

    // get the player name
    Promise.all([OBR.room.getMetadata(), OBR.player.getName()])
      .then(values => {
        const metadata = values[0][METADATA_ROOM]
        const playerName = values[1]

        // is this room already connected to an owlbear room?
        let loadedRoom = ''
        if (metadata) {
          console.log('in a witchdice room already :', metadata);
          loadedRoom = metadata['party_room']
        } else {
          // create a new room
          loadedRoom = generateOwlbearRoomName()
          const initialWitchdiceMetadata = {'party_room': loadedRoom}

          const metadataUpdate = {}
          metadataUpdate[METADATA_ROOM] = initialWitchdiceMetadata
          OBR.room.setMetadata(metadataUpdate)

          console.log('Initialized witchdice metadata: ', initialWitchdiceMetadata);
        }

        // update state
        if (playerName) setPartyName(playerName)
        if (loadedRoom) connectToRoom(loadedRoom)
      })
  }

  // New action coming in to roll history; let's make a notification about it. (closing the old one if it's still open)
  const [actionToNotificationMap, setActionToNotificationMap] = useState({})
  useEffect(() => {
    console.log('latestAction', latestAction, ' obrReady ', obrReady, ' OBR.isAvailable', OBR.isAvailable);

    // was this one modified in the last ten seconds?
    var now = Date.now()
    var cutoff = now - (10 * 1000) // 10 seconds ago
    if (obrReady && latestAction.updatedAt > cutoff) {
      latestActionToNotification(latestAction, actionToNotificationMap, setActionToNotificationMap)
    }

  }, [latestAction])

  return (
    <div className='MainOwlbear'>

      <div className='pagemode-switcher'>
        {allPageModes.map(mode =>
          <button
            onClick={() => setPageMode(mode)}
            className={pageMode === mode ? 'active' : ''}
            key={mode}
          >
            {mode}
          </button>
        )}
      </div>


      { pageMode === 'Dice' ?
        <DiceBag
          addNewDicebagPartyRoll={addNewDicebagPartyRoll}
          distantDicebagData={distantDicebagData}
          bookmarksEnabled={false}
        />
      : pageMode === 'Clocks' ?
        <SquadClockPanel
          partyConnected={partyConnected}
          partyRoom={partyRoom}
          setTriggerRerender={setTriggerRerender}
          triggerRerender={triggerRerender}
        />
      : pageMode === '?' &&
        <>
          <RoomConnect
            partyName={partyName}
            setPartyName={setPartyName}
            partyRoom={partyRoom}
            setPartyRoom={setPartyRoom}
            generateRoomName={generateRoomName}
            partyConnected={partyConnected}
            connectToRoom={connectToRoom}
            currentPage={'simple'}
          />
          <TipsAndTricks abbreviated={true} />
        </>
      }

      <div className={`roll-history-container ${pageMode === 'History' ? 'visible' : 'hidden'}`}>
        <RollHistory
          allPartyActionData={allPartyActionData}
        />
      </div>

    </div>
  )
}

export default MainOwlbear ;
