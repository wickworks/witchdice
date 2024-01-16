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

const blankPlayerSlots = [
  deepCopy(blankTeamSlot),
  deepCopy(blankTeamSlot),
  deepCopy(blankTeamSlot),
  deepCopy(blankTeamSlot),
]
export const blankPlayerTeam = {
  state: 'joined', // firebase doesn't store this object if it's totally empty
  unallocated: [],
  slots: deepCopy(blankPlayerSlots)
}

const blankDraftState = {
  undrawnDeck: [],
  currentPicks: ['','','','','','','',''],
  allTeams: {}
}

const importStateFromFirebase = (importedDraftState) => {
  var newDraftState = {...blankDraftState, ...importedDraftState}
  Object.keys(newDraftState.allTeams).forEach(teamName => {
    newDraftState.allTeams[teamName].unallocated = newDraftState.allTeams[teamName].unallocated || []
    newDraftState.allTeams[teamName].slots = newDraftState.allTeams[teamName].slots || []
    newDraftState.allTeams[teamName].slots = deepCopy(blankPlayerSlots.map(
      (blankSlot, i) => (i < newDraftState.allTeams[teamName].slots.length ? {...blankSlot, ...newDraftState.allTeams[teamName].slots[i]} : blankSlot)
    ))
  });
  return newDraftState
}

const FIREBASE_DRAFT_STATE_KEY = 'drafts'

function getFirebaseDB() {
  return window.firebase.database().ref()
}

const MainDraft = ({
  partyName,
  partyConnected,
  partyRoom,
}) => {
  // the Firebase item ID we're reading from and writing to
  const [currentDraftID, setCurrentDraftID] = useState('');
  // just the whole json of the draft state
  const [draftState, setDraftState] = useState({})
  const [updatedStateFromServer, setUpdatedStateFromServer] = useState(false)


  // ~~ INITIAL CONNECTION FROM SERVER ~~
  // Watch server for change/add/delete events & update the local data accordingly.
	useEffect(() => {
    if (partyConnected) {
      console.log('INITIAL CONNECTION FROM SERVER');
      try {
        const dbDraftRef = getFirebaseDB().child(FIREBASE_DRAFT_STATE_KEY).child(partyRoom)
        dbDraftRef.on('child_changed', (snapshot) => {
          if (snapshot) {
            // console.log('child changed', snapshot.val(), '  IMPORTED:', importStateFromFirebase(snapshot.val()));
            setCurrentDraftID(snapshot.key)
            setDraftState(importStateFromFirebase(snapshot.val()))
            setUpdatedStateFromServer(true)
          }
        })

        dbDraftRef.on('child_added', (snapshot) => {
          if (snapshot) {
            // console.log('child added', snapshot.val(), '  IMPORTED:', importStateFromFirebase(snapshot.val()));
            setCurrentDraftID(snapshot.key)
            setDraftState(importStateFromFirebase(snapshot.val()))
            setUpdatedStateFromServer(true)
          }
        })

        dbDraftRef.on('child_removed', (snapshot) => {
          if (snapshot && snapshot.key === currentDraftID) {
            // console.log('child removed', snapshot.val());
            setCurrentDraftID('')
            setDraftState(blankDraftState)
            setUpdatedStateFromServer(true)
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
    if (draftState && currentDraftID && !updatedStateFromServer) {
      // console.log('DETECT STATE UPDATE, TRIGGER A SERVER UPDATE');
      // update the draft state on the server
      getFirebaseDB().child(FIREBASE_DRAFT_STATE_KEY).child(partyRoom).child(currentDraftID).set(draftState)
    }
    setUpdatedStateFromServer(false)
  }, [ JSON.stringify(draftState) ]);

  // ================================================ INDIVIDUAL GETTERS/SETTERS ================================

  const updateDraftState = (updates) => {
    setDraftState({...deepCopy(draftState), ...updates})
  }

  const setNewNpcDeck = (newUndrawnDeck) => {
    const newDraftState = deepCopy(blankDraftState)
    newDraftState.undrawnDeck = newUndrawnDeck
    newDraftState.allTeams[partyName] = deepCopy(blankPlayerTeam)

    if (partyConnected) {
      const dbDraftRef = getFirebaseDB().child(FIREBASE_DRAFT_STATE_KEY).child(partyRoom)
      const newKey = dbDraftRef.push(newDraftState).key

      // dbDraftRef.push({array: ['test'], obj: {test: 'test_object'}, 'olive': 'wtf'})

      // add the firebase key to the locally-saved entry
      setCurrentDraftID(newKey)
      // Set it locally
      console.log('setNewNpcDeck');
      setDraftState(newDraftState)
    }
  }



  // ================================================ JOIN/START DRAFT ================================

  const joinExistingDraft = () => {
    const newDraftState = {...draftState}
    newDraftState.allTeams[partyName] = deepCopy(blankPlayerTeam)
    setDraftState(newDraftState)
  }

  const endExistingDraft = () => {
    getFirebaseDB().child(FIREBASE_DRAFT_STATE_KEY).child(partyRoom).child(currentDraftID).remove()
    setDraftState(deepCopy(blankDraftState))
    setCurrentDraftID('')
  }

  const hasDraftStarted = !!currentDraftID//!!draftState.undrawnDeck && (draftState.undrawnDeck.length > 0)
  const hasJoinedDraft = !!draftState.allTeams && !!draftState.allTeams[partyName]
  const readyToDraft = hasDraftStarted && hasJoinedDraft

  return (
    <div className='MainDraft'>
      {!hasDraftStarted ?
        <SetupDeck
          setNewNpcDeck={setNewNpcDeck}
          partyConnected={partyConnected}
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
          updateDraftState={updateDraftState}
          currentPicks={draftState.currentPicks}
          allTeams={draftState.allTeams}
          partyName={partyName}
        />
      }
    </div>
  )
}

export default MainDraft ;
