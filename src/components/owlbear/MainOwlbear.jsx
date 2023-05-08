import React, { useState, useEffect } from 'react';

import DiceBag from '../shared/DiceBag/DiceBag.jsx';
import RollHistory from '../shared/RollHistory/RollHistory.jsx';
import PageModeSwitcher from './PageModeSwitcher.jsx';
import OwlbearSettings from './OwlbearSettings.jsx';
import SquadClockPanel from '../shared/SquadClockPanel/SquadClockPanel.jsx';
import DiscordBotNotice from '../shared/bots/DiscordBotNotice.jsx';
import TipsAndTricks from '../settings/TipsAndTricks.jsx';
import Footer from '../siteframe/Footer.jsx';
import MainLancer from '../lancer/MainLancer.jsx';
import { randomWords } from '../../random_words.js';
import { latestActionToNotification } from './OwlbearNotifications.js';

import OBR from "@owlbear-rodeo/sdk";

import './MainOwlbear.scss';

const METADATA_ROOM = "com.witchdice.obr-extension/metadata"

const FRAME_WIDTH = 380;
const FRAME_WIDTH_EXPANDED = 840;

const SETTINGS_HIDDEN_PAGE_MODES = 'settings-hidden-iframe-page-modes';

// Returns a hash of currently-enabled pages
function loadSkippedPageModes() {
  let skipPages = []
  const savedString = localStorage.getItem(SETTINGS_HIDDEN_PAGE_MODES)
  if (savedString) skipPages = JSON.parse(savedString)
  return skipPages;
}

// saved a page to be skipped/shown to localstorage
function saveSkipPages(skipPages) {
  localStorage.setItem(SETTINGS_HIDDEN_PAGE_MODES, JSON.stringify(skipPages))
}

function generateOwlbearRoomName() {
  return `owlbear-${randomWords(1)}-${randomWords({exactly: 1, maxLength: 6})}-${randomWords({exactly: 1, maxLength: 4})}`
}

// Instead of changing the URL, change the page in state here
const allPageModes = {
  dice: {label: 'Dice', icon: 'dicebag', skippable: false},
  rolls: {label: 'Rolls', icon: 'icon_owlbear', skippable: false},
  lancer: {label: 'Lancer', icon: 'union', skippable: true},
  clocks: {label: 'Clocks', icon: 'clock', skippable: true},
  settings: {label: 'Settings', icon: 'gear', skippable: false},
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
  const [isExpanded, setIsExpanded] = useState(false);

  const [pageMode, setPageMode] = useState('dice');

  // settings can turn certain pages off
  const [skipPages, setSkipPages] = useState([])

  const [obrReady, setObrReady] = useState(false)

  const [notifyOnRoll, setNotifyOnRoll] = useState(true)
  const [actionToNotificationMap, setActionToNotificationMap] = useState({})

  // INITIALIZE
  useEffect(() => {
    setSkipPages(loadSkippedPageModes())
    if (OBR.isAvailable && !obrReady) OBR.onReady(() => initializeObr(obrReady))
  }, [])

  // DICE ROLL NOTIFICATION
  useEffect(() => {
    // New action coming in to roll history; let's make a notification about it. (closing the old one if it's still open)
    // console.log('latestAction', latestAction, ' obrReady ', obrReady, ' OBR.isAvailable', OBR.isAvailable);

    // was this one modified in the last ten seconds?
    var now = Date.now()
    var cutoff = now - (10 * 1000) // 10 seconds ago
    if (obrReady && notifyOnRoll && latestAction.updatedAt > cutoff) {
      latestActionToNotification(latestAction, actionToNotificationMap, setActionToNotificationMap)
    }

  }, [latestAction])

  // INITIALIZE OWLBEAR SDK
  const initializeObr = () => {
    console.log('Witchdice: OBR SDK ready!');
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

  // CHANGE PAGE MODE
  const changePageTo = (mode) => {
    console.log('changed to mode ', mode);
    setPageMode(mode)

    if (obrReady) {
      let newWidth = isExpanded ? FRAME_WIDTH_EXPANDED : FRAME_WIDTH
      OBR.action.setWidth(newWidth)
    }
  }

  // SHOW / HIDE A PAGE MODE
  const toggleSkipPage = (mode) => {
    let newSkipPages = []
    if (skipPages.includes(mode)) {
      newSkipPages = skipPages.filter(e => e !== mode)
    } else {
      newSkipPages = [...skipPages, mode]
    }
    setSkipPages(newSkipPages)
    saveSkipPages(newSkipPages)
  }

  // EXPAND / CONTRACT THE IFRAME
  const toggleExpanded = () => {
    if (obrReady) {
      let newWidth = isExpanded ? FRAME_WIDTH : FRAME_WIDTH_EXPANDED
      OBR.action.setWidth(newWidth)
    }
    if (pageMode === 'rolls') setPageMode('dice') // these categories are condensed
    setIsExpanded(!isExpanded)
  }

  // DISTANT DICEBAG DATA CHANGES PAGE MODE
  const setDistantDicebagDataWithPageModeChange = (distantData) => {
    setPageMode('dice') // since it's not on the same page anymore, we gotta switch modes to show the dicebag
    setDistantDicebagData(distantData)
  }

  const forceShowDicebag = (pageMode === 'rolls' && isExpanded)
  const forceShowRolls = (pageMode === 'dice' && isExpanded)

  return (
    <div className='MainOwlbear'>

      <PageModeSwitcher
        isExpanded={isExpanded}
        toggleExpanded={toggleExpanded}
        allPageModes={allPageModes}
        skipPages={skipPages}
        pageMode={pageMode}
        changePageTo={changePageTo}
        allPartyActionDataLength={allPartyActionData.length}
        obrReady={obrReady}
      />

      <div className={`page-mode-content ${isExpanded ? 'expanded' : ''}`}>

        { (pageMode === 'dice' || forceShowDicebag) ?
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
            setDistantDicebagData={setDistantDicebagDataWithPageModeChange}
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
          <div className='owlbear-settings-container'>
            <div className='witch-dice banner-container-container'>
              <div className='banner-container'>
                <a href='https://witchdice.com/' target='_blank'>
                  <div className='asset site_banner' role="img" alt="WITCH DICE"/>
                </a>
              </div>
            </div>
            <OwlbearSettings
              notifyOnRoll={notifyOnRoll}
              setNotifyOnRoll={setNotifyOnRoll}
              allPageModes={allPageModes}
              skipPages={skipPages}
              toggleSkipPage={toggleSkipPage}
              partyRoom={partyRoom}
            />
            <TipsAndTricks abbreviated={true} />
            <DiscordBotNotice partyRoom={partyRoom} abbreviated={true} />
            <Footer />
          </div>
        }

        <div className={`roll-history-container ${(pageMode === 'rolls' || forceShowRolls) ? 'visible' : 'hidden'} ${isExpanded ? 'expanded' : ''}`}>
          <RollHistory
            allPartyActionData={allPartyActionData}
          />
        </div>


      </div>
    </div>
  )
}

export default MainOwlbear ;
