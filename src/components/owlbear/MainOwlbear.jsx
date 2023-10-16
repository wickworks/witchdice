import React, { useState, useEffect } from 'react';

import DiceBag from '../shared/DiceBag/DiceBag.jsx';
import RollHistory from '../shared/RollHistory/RollHistory.jsx';
import PageModeSwitcher from './PageModeSwitcher.jsx';
import OwlbearSettings from './OwlbearSettings.jsx';
import MarkedIntegration from './MarkedIntegration.jsx';
import ProblemsBar from './ProblemsBar.jsx';
import SquadClockPanel from '../shared/SquadClockPanel/SquadClockPanel.jsx';
import DiscordBotNotice from '../shared/bots/DiscordBotNotice.jsx';
import TipsAndTricks from '../settings/TipsAndTricks.jsx';
import Footer from '../siteframe/Footer.jsx';
import MainLancer from '../lancer/MainLancer.jsx';
import { randomWords } from '../../random_words.js';
import { MARKED_METADATA_KEY } from './marked_integration_utils.js';
import { latestActionToNotification } from './OwlbearNotifications.js';

import OBR from "@owlbear-rodeo/sdk";

import './MainOwlbear.scss';

const WITCHDICE_METADATA_KEY = "com.witchdice.obr-extension/metadata"

const FRAME_WIDTH = 380;
const FRAME_WIDTH_EXPANDED = 840;

const SETTINGS_HIDDEN_PAGE_MODES = 'settings-hidden-iframe-page-modes';

// Returns a hash of currently-enabled pages
function loadSkippedPageModes() {
  // only enable simple mode if local storage is not enabled
  if (!window.localStorageEnabled) return Object.keys(allPageModes).filter(mode => !['dice','rolls','settings'].includes(mode))

  let skipPages = []
  const savedString = localStorage.getItem(SETTINGS_HIDDEN_PAGE_MODES)
  if (savedString) skipPages = JSON.parse(savedString)
  return skipPages;
}

// saved a page to be skipped/shown to localstorage
function saveSkipPages(skipPages) {
  if (!window.localStorageEnabled) return

  localStorage.setItem(SETTINGS_HIDDEN_PAGE_MODES, JSON.stringify(skipPages))
}

// Instead of changing the URL, change the page in state here
const allPageModes = {
  dice: {label: 'Dice', icon: 'dicebag', skippable: false},
  rolls: {label: 'Rolls', icon: 'owlbear_ext_icon', skippable: false},
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
  setPartyRoom,
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
  const [requestUserRefresh, setRequestUserRefresh] = useState(false)

  const [notifyOnRoll, setNotifyOnRoll] = useState(true)
  const [actionToNotificationMap, setActionToNotificationMap] = useState({})

  const [markedMetadata, setMarkedMetadata] = useState(null)

  // INITIALIZE
  useEffect(() => {
    setSkipPages(loadSkippedPageModes())

    if (OBR.isAvailable && !obrReady) OBR.onReady(initializeObr)
  }, [])

  // DICE ROLL NOTIFICATION
  useEffect(() => {

    // New action coming in to roll history; let's make a notification about it. (closing the old one if it's still open)
    // console.log('latestAction', latestAction, ' obrReady ', obrReady, ' OBR.isAvailable', OBR.isAvailable);

    // was this one modified in the last ten seconds?
    var now = Date.now()
    var cutoff = now - (10 * 1000) // 10 seconds ago
    if (obrReady && notifyOnRoll && latestAction && latestAction.updatedAt > cutoff) {
      latestActionToNotification(latestAction, actionToNotificationMap, setActionToNotificationMap)
    }

  }, [latestAction])

  // INITIALIZE OWLBEAR SDK
  const initializeObr = () => {
    console.log('Witchdice sees: OBR SDK ready!');
    setObrReady(true);

    OBR.player.onChange((player) => {
      setPartyName(player.name)
    })

    OBR.player.getName().then(playerName => setPartyName(playerName))

    // does this owlbear room already have an associated Witchdice room?
    OBR.room.getMetadata().then(fullOwlbearMetadata => {
      // console.log('Full owlbear metadata: ', fullOwlbearMetadata);

      const metadata = fullOwlbearMetadata[WITCHDICE_METADATA_KEY]
      console.log('Loaded Witchdice metadata for this Owlbear room :', metadata);
      if (metadata && metadata['party_room']) {
        const loadedRoom = metadata['party_room']
        setPartyRoom(loadedRoom)
        connectToRoom(loadedRoom)
      }

      // obtain the marked metadata, if it's available
      if (fullOwlbearMetadata[WITCHDICE_METADATA_KEY]) setMarkedMetadata(fullOwlbearMetadata[MARKED_METADATA_KEY])
    })

    // if the room in the metadata changes -- reload to pick that up and join that room instead.
    OBR.room.onMetadataChange((fullOwlbearMetadata) => {
      const metadata = fullOwlbearMetadata[WITCHDICE_METADATA_KEY]
      // console.log('Witchdice room metadata changed. Metadata: ', metadata);

      if (metadata) {
        const loadedRoom = metadata['party_room']

        // somebody joined a room
        if (!!loadedRoom) {
          setPartyRoom(loadedRoom)
          connectToRoom(loadedRoom)
        } else { // somebody left a room
          setRequestUserRefresh(true)
        }
      }

      // change to the marked metadata; who knows, we might be interested in the fact it changed
      if (fullOwlbearMetadata[WITCHDICE_METADATA_KEY]) setMarkedMetadata(fullOwlbearMetadata[MARKED_METADATA_KEY])
    })
  }

  const createAndJoinRoom = (roomName) => {
    // Joining the room happens through the normal metadata change detection
    if (obrReady) {
      const metadataUpdate = {}
      metadataUpdate[WITCHDICE_METADATA_KEY] = {'party_room': roomName}
      OBR.room.setMetadata(metadataUpdate)
      console.log('Initialized Witchdice metadata for this Owlbear room: ', metadataUpdate);
    }
  }

  // CLEAR THE OBR ROOM DATA
  const onLeaveRoom = () => {
    console.log('Leaving witchdice room: ', partyRoom);
    if (obrReady) {
      if (window.confirm(
        `This will leave the Witchdice room for everyone in this Owlbear room. All connected players will have to manually refresh after you pick a new Witchdice room. Continue?`
      )) {
        OBR.room.getMetadata().then(fullOwlbearMetadata => {
          const metadata = fullOwlbearMetadata[WITCHDICE_METADATA_KEY]

          // preserve any other metadata we've saved (none atm) but clear out the room
          const metadataUpdate = {}
          metadataUpdate[WITCHDICE_METADATA_KEY] = {...metadata, 'party_room': ''}
          OBR.room.setMetadata(metadataUpdate)

          // the refresh request will come through the normal metadata change mechanism
        })
      }
    }
  }

  // CHANGE PAGE MODE
  const changePageTo = (mode) => {
    // console.log('changed to mode ', mode);
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
  const forceShowRolls = (pageMode === 'dice' && isExpanded) || (pageMode === 'lancer')

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

      { (!obrReady || requestUserRefresh || !partyRoom) &&
        <ProblemsBar
          obrReady={obrReady}
          partyRoom={partyRoom}
          onJoinRoom={createAndJoinRoom}
          requestUserRefresh={requestUserRefresh}
        />
      }

      <div className={`page-mode-content ${isExpanded ? 'expanded' : ''}`}>

        { (pageMode === 'dice' || forceShowDicebag) ?
          <DiceBag
            addNewDicebagPartyRoll={addNewDicebagPartyRoll}
            distantDicebagData={distantDicebagData}
            setDistantDicebagData={setDistantDicebagData}
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
              onLeaveRoom={onLeaveRoom}

            />
            { !skipPages.includes('lancer') &&
              <MarkedIntegration markedMetadata={markedMetadata} />
            }
            <TipsAndTricks partyRoom={partyRoom} abbreviated={true} />
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
