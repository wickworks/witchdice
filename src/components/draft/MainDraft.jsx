import React, { useState, useEffect } from 'react';
import SetupDeck from './SetupDeck.jsx';
import DraftDecks from './DraftDecks.jsx';
import { deepCopy } from '../../utils.js';

import './MainDraft.scss';

const defaultDeck = [
    "npcc_ace",
    "npcc_ace",
    "npcc_ace",
    "npcc_ace",
    "npcc_ronin",
    "npcc_ronin",
    "npcc_ronin",
    "npcc_ronin",
    "npcc_specter",
    "npcc_specter",
    "npcc_specter",
    "npcc_specter",
    "npcc_aegis",
    "npcc_aegis",
    "npcc_aegis",
    "npcc_aegis",
    "npcc_goliath",
    "npcc_goliath",
    "npcc_goliath",
    "npcc_goliath",
    "npcc_mirage",
    "npcc_mirage",
    "npcc_mirage",
    "npcc_mirage",
    "npcc_sentinel",
    "npcc_sentinel",
    "npcc_sentinel",
    "npcc_sentinel",
    "npcc_archer",
    "npcc_archer",
    "npcc_archer",
    "npcc_archer",
    "npcc_bombard",
    "npcc_bombard",
    "npcc_bombard",
    "npcc_bombard",
    "npcc_demolisher",
    "npcc_demolisher",
    "npcc_demolisher",
    "npcc_demolisher",
    "npcc_hive",
    "npcc_hive",
    "npcc_hive",
    "npcc_hive",
    "npcc_operator",
    "npcc_operator",
    "npcc_operator",
    "npcc_operator",
    "npcc_witch",
    "npcc_witch",
    "npcc_witch",
    "npcc_witch"
]

const blankTeamSlot = {
  npcs: [],
  upgrades: []
}

const blankPlayerTeam = {
  unallocated: [],
  slots: [
    deepCopy(blankTeamSlot),
    deepCopy(blankTeamSlot),
    deepCopy(blankTeamSlot),
    deepCopy(blankTeamSlot),
  ]
}

const FIREBASE_DRAFT_STATE_KEY = 'drafts'

function getFirebaseDB() {
  return window.firebase.database().ref()
}

const blankDraftState = {
  undrawnDeck: [],
  currentPicks: ['','','','','','','',''],
}

const MainDraft = ({
  partyName,
  partyConnected,
  partyRoom,
}) => {
  // when we get REMOTE changes, that remote data is set here
  // const [draftStateFromRemote, setDraftStateFromRemote] = useState(null);
  // the Firebase item ID we're reading from and writing to
  const [currentDraftID, setCurrentDraftID] = useState('');
  // just the whole json of the draft state
  const [draftState, setDraftState] = useState({})

  // ~~ INITIAL CONNECTION FROM SERVER ~~
  // Watch server for change/add/delete events & update the local data accordingly.
	useEffect(() => {
    if (partyConnected) {
      console.log('INITIAL CONNECTION FROM SERVER');
      try {
        const dbDraftRef = getFirebaseDB().child(FIREBASE_DRAFT_STATE_KEY).child(partyRoom)
        dbDraftRef.on('child_changed', (snapshot) => {
          if (snapshot) {
            setCurrentDraftID(snapshot.key)
            setDraftState(snapshot.val())
          }
        })

        dbDraftRef.on('child_added', (snapshot) => {
          if (snapshot) {
            setCurrentDraftID(snapshot.key)
            setDraftState(snapshot.val())
          }
        })

        dbDraftRef.on('child_removed', (snapshot) => {
          if (snapshot && snapshot.val().id === currentDraftID) {
            setCurrentDraftID('')
            setDraftState(null)
          }
        })

        // CLEANUP FUNCTION
        return () => {
          dbDraftRef.off('child_changed')
          dbDraftRef.off('child_added')
          dbDraftRef.off('child_removed')
        }

      } catch (error) {
        console.log('ERROR: ', error.message);
      }
    }
  }, [partyConnected]);

  // // ~~ CREATE / UPDATE FROM SERVER ~~
  // // New/updated state on the server! Add it to the local state data.
  // useEffect(() => {
  //   console.log('CREATE / UPDATE FROM SERVER');
  //   if (draftStateFromRemote) setDraftState(draftStateFromRemote)
  // }, [draftStateFromRemote]);

  // ~~ DETECT STATE UPDATE, TRIGGER A SERVER UPDATE  ~~
  // (this will also trigger on remote changes, but setting to the thing we recieved won't do anything?)
  useEffect(() => {
    if (draftState && currentDraftID) {
      // update the draft state locally
      // setDraftStateFromRemote(draftState)
      console.log('DETECT STATE UPDATE, TRIGGER A SERVER UPDATE, draftState', draftState);

      // update the draft state on the server
      getFirebaseDB().child(FIREBASE_DRAFT_STATE_KEY).child(partyRoom).child(currentDraftID).set(draftState)
    }
  }, [ JSON.stringify(draftState) ]);

  // ================================================ INDIVIDUAL GETTERS/SETTERS ================================
  const allTeams = deepCopy(draftState)
  delete allTeams.undrawnDeck
  delete allTeams.currentPicks

  const setDraftStateProperty = (property, newProperty) => {
    const newDraftState = deepCopy(draftState)
    newDraftState[property] = newProperty
    setDraftState(newDraftState)
  }

  const setNewNpcDeck = (newUndrawnDeck) => {
    const newDraftState = deepCopy(blankDraftState)
    newDraftState.undrawnDeck = newUndrawnDeck
    newDraftState[partyName] = deepCopy(blankPlayerTeam)

    if (partyConnected) {
      console.log('starting new draft with state : ', newDraftState);
      const dbDraftRef = getFirebaseDB().child(FIREBASE_DRAFT_STATE_KEY).child(partyRoom)
      const newKey = dbDraftRef.push(newDraftState).key

      // add the firebase key to the locally-saved entry
      setCurrentDraftID(newKey)
      // Set it locally
      setDraftState(newDraftState)
    }
  }



  // ================================================ JOIN/START DRAFT ================================
  console.log('draftState', draftState);

  const joinExistingDraft = () => {
    const newDraftState = {...draftState}
    newDraftState[partyName] = deepCopy(blankPlayerTeam)
    console.log('joining exsting draft, newDraftState',newDraftState);
    setDraftState(newDraftState)
  }

  const endExistingDraft = () => {
    getFirebaseDB().child(FIREBASE_DRAFT_STATE_KEY).child(partyRoom).child(currentDraftID).remove()
    setDraftState(deepCopy(blankDraftState))
    setCurrentDraftID('')
  }

  const hasDraftStarted = !!currentDraftID//!!draftState.undrawnDeck && (draftState.undrawnDeck.length > 0)
  const hasJoinedDraft = !!draftState[partyName]
  const readyToDraft = hasDraftStarted && hasJoinedDraft

  console.log('hasDraftStarted', hasDraftStarted);
  console.log('hasJoinedDraft', hasJoinedDraft);

  return (
    <div className='MainDraft'>
      {!hasDraftStarted ?
        <SetupDeck
          setNewNpcDeck={setNewNpcDeck}
        />
      :
        <div className='controls panel'>
          <h3>Draft in progress</h3>
          {!hasJoinedDraft &&
            <button onClick={joinExistingDraft}>
              Join as '{partyName}'
            </button>
          }
          <button onClick={endExistingDraft}>
            End draft
          </button>
        </div>
      }

      {readyToDraft &&
        <DraftDecks
          undrawnDeck={draftState.undrawnDeck}
          setUndrawnDeck={(newUndrawnDeck) => setDraftStateProperty('undrawnDeck', newUndrawnDeck)}
          currentPicks={draftState.currentPicks}
          setCurrentPicks={(newCurrentPicks) => setDraftStateProperty('currentPicks', newCurrentPicks)}
          allTeams={allTeams}
          setTeamData={(teamName, teamData) => setDraftStateProperty(teamName, teamData)}
          partyName={partyName}
        />
      }
    </div>
  )
}

export default MainDraft ;
