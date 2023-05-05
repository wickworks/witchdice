import React, { useState, useEffect } from 'react';

import DiceBag from '../shared/DiceBag/DiceBag.jsx';
import RollHistory from '../shared/RollHistory/RollHistory.jsx';
import RoomConnect from '../shared/RoomConnect/RoomConnect.jsx';
import SquadClockPanel from '../shared/SquadClockPanel/SquadClockPanel.jsx';
import TipsAndTricks from '../settings/TipsAndTricks.jsx';
import {
  getRollDescription,
  processRollData,
} from '../shared/DiceBag/DiceBagData.js';
import { randomWords } from '../../random_words.js';

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

  partyName,
  setPartyName,
  partyConnected,
  partyRoom,
  connectToRoom,
  setPartyRoom,
  generateRoomName,
}) => {

  // instead of changing the URL, change them in state here
  const allPageModes = ['Dice','History','Clocks','?']

  const [pageMode, setPageMode] = useState('Dice');
  const [triggerRerender, setTriggerRerender] = useState(false);

  const [obrReady, setObrReady] = useState(false)
  useEffect(() => {
    if (OBR.isAvailable && !obrReady) OBR.onReady(() => initializeObr(obrReady))
  }, [obrReady])

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

    //
    // OBR.room.setMetadata(
    //   {""}
    // )
  }


  const addNewDicebagPartyRollWithNotif = (rolls, summaryMode, summaryModeValue, annotation, message, isNew) => {
    // summarize the results
    const resultTotal = processRollData(rolls, summaryMode, summaryModeValue)
    const resultSummary = getRollDescription(rolls, summaryMode, summaryModeValue)

    //
    console.log('NEW ROLL ', resultTotal,  'obrReady ', obrReady, '  OBR.isAvailable', OBR.isAvailable);
    if (obrReady && resultTotal > 0) {
      OBR.notification.show(`Total: ${resultTotal} | Summary: ${resultSummary}`);
    }

    addNewDicebagPartyRoll(rolls, summaryMode, summaryModeValue, annotation, message, isNew)
  }

  // o2DDoFrVaznh/TheSolidStump

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
          addNewDicebagPartyRoll={addNewDicebagPartyRollWithNotif}
          distantDicebagData={distantDicebagData}
          bookmarksEnabled={false}
        />
      : pageMode === 'History' ?
        <RollHistory
          allPartyActionData={allPartyActionData}
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

    </div>
  )
}

export default MainOwlbear ;
