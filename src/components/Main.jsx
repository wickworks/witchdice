import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Switch, Route, useParams, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";

import { deepCopy, capitalize } from '../utils.js';
import { randomWords } from '../random_words.js';
import { getPage } from "./page_data.js";


import LoadinDots from './shared/LoadinDots.jsx';
import DiceBag from './shared/DiceBag/DiceBag.jsx';
import RollHistory from './shared/RollHistory/RollHistory.jsx';
import RoomConnect from './shared/RoomConnect/RoomConnect.jsx';
import DiscordBotNotice from './shared/DiscordBotNotice.jsx';
import {XCard, XCardModal} from './shared/RoomConnect/XCard.jsx';

import './Main.scss';

// import MainSimple from './simple/MainSimple.jsx';
// import Main5E from './5e/Main5E.jsx';
// import MainWitchCraft from './witchcraft/MainWitchCraft.jsx';

const MainSimple = lazy(() => import('./simple/MainSimple.jsx'));
const Main5E = lazy(() => import('./5e/Main5E.jsx'));
const MainWitchCraft = lazy(() => import('./witchcraft/MainWitchCraft.jsx'));
const MainLancer = lazy(() => import('./lancer/MainLancer.jsx'));
const MainSettings = lazy(() => import('./settings/MainSettings.jsx'));

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function getFirebaseDB() {
  return window.firebase.database().ref()
}

const Main = ({
  setIsModalOpen,
  enabledPages, setEnabledPages
}) => {
  const [xCardRaisedBy, setXCardRaisedBy] = useState('');

  // 5e summary of the current roll. On change, we push it to firebase.
  // Or, if disconnected, just send straight to latestAction.
  const [rollSummaryData, setRollSummaryData] = useState({});

  // When we see a new roll in firebase, we put it here.
  // This triggers triggering it getting added to allPartyActionData.
  const [latestAction, setLatestAction] = useState(null);
  // List of all the rolls to display in the party panel.
  const [allPartyActionData, setAllPartyActionData] = useState([]);

  // Allow other parts of the program to queue up dicebag rolls
  const [distantDicebagData, setDistantDicebagData] = useState(null);

  // Store the key/timestamp of the last roll so we can update it.
  const [partyLastAttackKey, setPartyLastAttackKey] = useState('');
  const [partyLastAttackTimestamp, setPartyLastAttackTimestamp] = useState(0);
  const [partyLastDicebagKey, setPartyLastDicebagKey] = useState('');
  const [partyLastDicebagTimestamp, setPartyLastDicebagTimestamp] = useState(0);

  // Values for connecting to a room.
  const [partyRoom, setPartyRoom] = useState('');
  const [partyConnected, setPartyConnected] = useState(false);
  const [partyName, setPartyName] = useState('');
  const [partyAutoconnect, setPartyAutoconnect] = useState(false);

  // =============== INITIALIZE ==================
  const { rollmode } = useParams();
  const queryParams = useQuery();
  useEffect(() => {
    const urlRoom = queryParams.get('r');
    const loadedRoom = localStorage.getItem("party_room");
    const loadedName = localStorage.getItem("party_name");

    if (loadedName) setPartyName(loadedName);

    // join the room from the URL
    if (urlRoom && urlRoom.length > 6) {
      console.log('we are joining from a link, connecting...');
      if (!loadedName) generatePartyName();
      setPartyRoom(urlRoom);
      setPartyAutoconnect(true);
    } else {
      // prefill the room name from local storage
      if (loadedRoom) {
        setPartyRoom(loadedRoom);
      // new here? get a random name
      } else {
        generateRoomName()
      }
    }
  }, []);

  // automatically try to connect to a room if we flag it to do so
  useEffect(() => {
    if (partyAutoconnect) connectToRoom(partyRoom)
  }, [partyAutoconnect]);

  // =============== FIREBASE DICE ROLL FUNCTIONS ==================

  // Push a 5e damage roll to firebase
  const addNewAttackPartyRoll = (actionData) => {
    if (partyConnected) {
      const dbRollsRef = getFirebaseDB().child('rolls').child(partyRoom);

      // ~~ new attack roll ~~ //
      if (partyLastAttackTimestamp === 0) {
        const newKey = dbRollsRef.push(actionData).key
        setPartyLastAttackKey(newKey);
        // console.log('       pushed  new attack to firebase', actionData);

      // ~~ update attack roll ~~ //
      } else {
        dbRollsRef.child(partyLastAttackKey).set(actionData);
        // console.log('       set updated attack in firebase', actionData);
      }
    } else {
      // add it to the single-player roll history
      // console.log('setting single-player attack history latest action');
      setLatestAction(actionData)
    }
  }

  // Push a dicebag roll to firebase
  const addNewDicebagPartyRoll = (rolls, summaryMode, annotation, message, isNew) => {
    if (rolls.length > 0) {
      let actionData = {};
      actionData.name = partyName || 'Me';
      if (annotation) actionData.name += ` — ${annotation}`
      actionData.message = message

      actionData.type = 'dicebag';
      actionData.conditions = rolls.length > 1 ? summaryMode : '';

      // rolls = [ {dieType: 'd6', result: 4}, ... ]
      rolls.forEach((roll, i) => {
        actionData[`roll-${i}`] = {
          dieType: roll.dieType,
          result: roll.result,
          sign: roll.sign,
        }
      });

      if (isNew) {
        actionData.createdAt = Date.now();
        actionData.updatedAt = actionData.createdAt;
        setPartyLastDicebagTimestamp(actionData.createdAt)
      } else {
        actionData.createdAt = partyLastDicebagTimestamp
        actionData.updatedAt = Date.now();
      }

      if (partyConnected) {
        const dbRollsRef = getFirebaseDB().child('rolls').child(partyRoom);
        // ~~ new dicebag roll ~~ //
        if (isNew) {
          // console.log('       pushing  new dicebag roll to room',partyRoom,' : ', actionData);
          const newKey = dbRollsRef.push(actionData).key;
          setPartyLastDicebagKey(newKey);
        // ~~ update dicebag roll ~~ //
        } else {
          // console.log('       set updated dicebag roll in firebase', actionData);
          dbRollsRef.child(partyLastDicebagKey).set(actionData);
        }

      } else {
        // add it to the single-player roll history
        // console.log('setting single-player dicebag history latest action');
        setLatestAction(actionData)
      }
    }
  }

  // Push a general text-broadcast to firebase
  const addNewBroadcastText = (actionData) => {
    if (partyConnected) {
      const dbRollsRef = getFirebaseDB().child('rolls').child(partyRoom);

      // ~~ new text broadcast ~~ //
      dbRollsRef.push(actionData) // we don't track the key because we can't update broadcasts
    } else {
      // add it to the single-player roll history
      console.log('setting single-player text broadcast history ',actionData);
      setLatestAction(actionData)
    }
  }

  // We created or updated our 5e/lancer damage roll data — prepare it to push to firebase.
  useEffect(() => {
    // console.log('new rollSummaryData',rollSummaryData);

    // if it's a broadcast
    if (rollSummaryData.type === 'text') {
      let actionData = {};
      actionData.name = rollSummaryData.characterName || partyName || 'Me';
      actionData.type = 'text'
      actionData.title = rollSummaryData.title
      actionData.message = rollSummaryData.message
      actionData.createdAt = Date.now();
      actionData.updatedAt = actionData.createdAt;

      addNewBroadcastText(actionData)

    // default to an attack
    } else {
      const conditions = rollSummaryData.conditions;
      const characterName = rollSummaryData.characterName;
      const rolls = rollSummaryData.rolls;
      const skipTotal = !!rollSummaryData.skipTotal;
      const forceNewEntry = !!rollSummaryData.forceNewEntry

      if (rolls && rolls.length > 0) {
        // traverse rollData to pull it out in a format that we want.
        let actionData = {};
        actionData.name = partyName;
        actionData.char = characterName;
        actionData.type = 'attack';
        actionData.conditions = conditions.join(', ')
        actionData.skipTotal = skipTotal

        // ~~ new attack roll ~~ //
        if (partyLastAttackTimestamp === 0 || forceNewEntry) {
          actionData.createdAt = Date.now();
          actionData.updatedAt = actionData.createdAt;
          setPartyLastAttackTimestamp(actionData.createdAt);

        // ~~ update attack roll ~~ //
        } else {
          actionData.createdAt = partyLastAttackTimestamp
          actionData.updatedAt = Date.now();
        }

        // rollSummaryData = [ {attack: 20, name: 'Longsword', 'slashing': 13, 'necrotic': 4}, ... ]
        // (replaces "attack" with "save" for saving throws)
        rolls.forEach((roll, i) => {
          actionData[`roll-${i}`] = { ...roll }
        });

        addNewAttackPartyRoll(actionData);
      }
    }
  }, [rollSummaryData]);

  // Detect new roll actions coming in from firebase => update allPartyActionData
  useEffect(() => {
    if (latestAction) {
      let newData = deepCopy(allPartyActionData);

      // console.log('       new action created at :', latestAction.createdAt);

      // is this an update or a new one?
      let isUpdate = false;
      allPartyActionData.forEach((action, i) => {
        if (action !== null && action.createdAt === latestAction.createdAt) {
          isUpdate = true;
          newData[i] = deepCopy(latestAction);
        }
      });
      if (!isUpdate) newData.push(latestAction)

      setAllPartyActionData(newData);
    }

  }, [latestAction]);


  // =============== UTILS ==================

  const connectToRoom = (roomName) => {
    try {
      console.log('Connecting to room : ', roomName);
      if (roomName === null || roomName.length === 0) { throw new Error('Invalid room name!') }

      // ~~ DICEBAG AND DAMAGE ROLLS ~~~
      const dbRollsRef = getFirebaseDB().child('rolls').child(roomName)
      dbRollsRef.on('child_changed', (snapshot) => {
        if (snapshot) { setLatestAction(snapshot.val()) }
      });
      dbRollsRef.on('child_added', (snapshot) => {
        if (snapshot) {
          // clean out old rolls?
          var now = Date.now()
          var cutoff = now - 1 * 24 * 60 * 60 * 1000 // 1 day ago
          if (snapshot.val().createdAt < cutoff) {
            snapshot.ref.remove()
          } else {
            setLatestAction(snapshot.val())
          }
        }
      });

      setPartyConnected(true);
      localStorage.setItem("party_name", partyName);
      localStorage.setItem("party_room", roomName);

    } catch (error) {
      console.log('ERROR: ',error.message);
      setPartyConnected(false);
    }
  }

  const generateRoomName = () => {
    setPartyRoom( `${randomWords(1)}-${randomWords({exactly: 1, maxLength: 6})}-${randomWords({exactly: 1, maxLength: 4})}` )
  }

  const generatePartyName = () => {
    setPartyName( capitalize(`${randomWords(1)}`) )
  }


  useEffect(() => {
    setIsModalOpen( (xCardRaisedBy.length > 0) )
  }, [xCardRaisedBy]);



  function renderDicebag() {
    return (
      <div className="dicebag-and-history">
        <DiceBag
          addNewDicebagPartyRoll={addNewDicebagPartyRoll}
          distantDicebagData={distantDicebagData}
        />

        <div className="history-and-room">
          <RollHistory
            allPartyActionData={allPartyActionData}
          />

          <div className="room-and-xcard">
            <RoomConnect
              partyName={partyName}
              setPartyName={(name) => { setPartyName(name); localStorage.setItem("party_name", name); } }
              partyRoom={partyRoom}
              setPartyRoom={setPartyRoom}
              generateRoomName={generateRoomName}
              partyConnected={partyConnected}
              connectToRoom={connectToRoom}
              rollMode={rollmode}
            />

            <XCard
              setXCardRaisedBy={setXCardRaisedBy}
              partyConnected={partyConnected}
              partyRoom={partyRoom}
              partyName={partyName}
            />

            { xCardRaisedBy &&
              <XCardModal
                raisedBy={xCardRaisedBy}
                handleClose={() => setXCardRaisedBy('')}
              />
            }

            <DiscordBotNotice
              partyRoom={partyRoom}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='Main'>
      <Switch>

        <Route path="/simple">
          <HelmetForPage pageID='simple' />
          <Suspense fallback={<LoadinDots />}>
            {renderDicebag()}
            <MainSimple
              partyConnected={partyConnected}
              partyRoom={partyRoom}
            />
          </Suspense>
        </Route>

        <Route path="/5e">
          <HelmetForPage pageID='5e' />
          <Suspense fallback={<LoadinDots />}>
            <Main5E
             setPartyLastAttackKey={setPartyLastAttackKey}
             setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
             setRollSummaryData={setRollSummaryData}
             partyConnected={partyConnected}
             partyRoom={partyRoom}
            />
            {renderDicebag()}
          </Suspense>
        </Route>

        <Route path="/craft">
          <HelmetForPage pageID='craft' />
          <Suspense fallback={<LoadinDots />}>
            <MainWitchCraft />
            {renderDicebag()}
          </Suspense>
        </Route>

        <Route path="/lancer">
          <HelmetForPage pageID='lancer' />
          <Suspense fallback={<LoadinDots />}>
            <MainLancer
              setPartyLastAttackKey={setPartyLastAttackKey}
              setPartyLastAttackTimestamp={setPartyLastAttackTimestamp}
              setRollSummaryData={setRollSummaryData}
              setDistantDicebagData={setDistantDicebagData}
              partyConnected={partyConnected}
              partyRoom={partyRoom}
            />
            {renderDicebag()}
          </Suspense>
        </Route>

        <Route path="/settings">
          <HelmetForPage pageID='settings' />
          <Suspense fallback={<LoadinDots />}>
            <MainSettings
              enabledPages={enabledPages}
              setEnabledPages={setEnabledPages}
            />
            {renderDicebag()}
          </Suspense>
        </Route>
      </Switch>
    </div>
  )
}

const HelmetForPage = ({pageID}) => {
  return (
    <Helmet>
        <title>{getPage(pageID).metaTitle}</title>
        <meta
          name="description"
          content={getPage(pageID).metaDesc}
        />
    </Helmet>
  )
}


export default Main ;
