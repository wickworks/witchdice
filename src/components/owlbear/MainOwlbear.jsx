import React, { useState, useEffect } from 'react';

import DiceBag from '../shared/DiceBag/DiceBag.jsx';
import RollHistory from '../shared/RollHistory/RollHistory.jsx';
import OwlbearSettings from './OwlbearSettings.jsx';
import SquadClockPanel from '../shared/SquadClockPanel/SquadClockPanel.jsx';
import TipsAndTricks from '../settings/TipsAndTricks.jsx';
import MainLancer from '../lancer/MainLancer.jsx';
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

  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
  setDistantDicebagData,
}) => {
  const [triggerRerender, setTriggerRerender] = useState(false);

  // Instead of changing the URL, change the page in state here

  const allPageModes = {
    dice: {label: 'Dice', width: 340, icon: 'dicebag'},
    rolls: {label: 'Rolls', width: 340, icon: 'icon_owlbear'},
    lancer: {label: 'Lancer', width: 380, icon: 'union'},
    clocks: {label: 'Clocks', width: 340, icon: 'clock'},
    settings: {label: 'Settings', width: 340, icon: 'gear'},
  }
  const [pageMode, setPageMode] = useState('dice');

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
  const [notifyOnRoll, setNotifyOnRoll] = useState(true)
  const [actionToNotificationMap, setActionToNotificationMap] = useState({})
  useEffect(() => {
    console.log('latestAction', latestAction, ' obrReady ', obrReady, ' OBR.isAvailable', OBR.isAvailable);

    // was this one modified in the last ten seconds?
    var now = Date.now()
    var cutoff = now - (10 * 1000) // 10 seconds ago
    if (obrReady && notifyOnRoll && latestAction.updatedAt > cutoff) {
      latestActionToNotification(latestAction, actionToNotificationMap, setActionToNotificationMap)
    }

  }, [latestAction])

  const changePageTo = (mode) => {
    console.log('changed to mode ', mode);
    setPageMode(mode)

    if (obrReady) {
      OBR.action.setWidth(allPageModes[mode].width)
    }
  }
  // {allPageModes[mode].label}

  return (
    <div className='MainOwlbear'>
      <div className='pagemode-switcher'>
        {Object.keys(allPageModes).map(mode => {
          let buttonClass = (pageMode === mode ? 'active' : '')
          // flops back and forth to trigger anim
          if (mode === 'rolls' && allPartyActionData.length > 0) buttonClass += ` flash-${allPartyActionData.length % 2}`
          return (
            <button
              onClick={() => changePageTo(mode)}
              className={buttonClass}
              key={mode}
            >
              <div className='text'>{allPageModes[mode].label}</div>
              <div className={`asset ${allPageModes[mode].icon}`} />
            </button>
          )
        })}
      </div>


      { pageMode === 'dice' ?
        <DiceBag
          addNewDicebagPartyRoll={addNewDicebagPartyRoll}
          distantDicebagData={distantDicebagData}
          bookmarksEnabled={false}
        />

      : pageMode === 'lancer' ?
        <MainLancer
          setPartyLastAttackKey={setPartyLastAttackKey}
          setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
          setRollSummaryData={setRollSummaryData}
          setDistantDicebagData={setDistantDicebagData}
          partyConnected={partyConnected}
          partyRoom={partyRoom}
          skipDicebagJumplink={true}
        />
      : pageMode === 'clocks' ?
        <SquadClockPanel
          partyConnected={partyConnected}
          partyRoom={partyRoom}
          setTriggerRerender={setTriggerRerender}
          triggerRerender={triggerRerender}
        />
      : pageMode === 'settings' &&
        <>
          <OwlbearSettings
            notifyOnRoll={notifyOnRoll}
            setNotifyOnRoll={setNotifyOnRoll}
            partyRoom={partyRoom}
          />
          <TipsAndTricks abbreviated={true} />
        </>
      }

      <div className={`roll-history-container ${pageMode === 'rolls' ? 'visible' : 'hidden'}`}>
        <RollHistory
          allPartyActionData={allPartyActionData}
        />
      </div>


    </div>
  )
}

export default MainOwlbear ;
