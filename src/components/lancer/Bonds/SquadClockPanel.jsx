import React, { useState, useEffect } from 'react';
import Clock from './Clock.jsx';
import TextInput from '../../shared/TextInput.jsx'
import { deepCopy } from '../../../utils.js';
import { blankClock } from '../lancerData.js';
import { getRandomFingerprint } from '../../../localstorage.js';

import {
  LANCER_SQUAD_CLOCK_KEY,
  saveSquadClockData,
  loadSquadClockData
} from '../lancerLocalStorage.js';

import './SquadClockPanel.scss';

const FIREBASE_SQUAD_CLOCK_KEY = 'clocksquad'

function getFirebaseDB() {
  return window.firebase.database().ref()
}

// HIDDEN INPUT: a localstorage item under FIREBASE_SQUAD_CLOCK_KEY containing
// the active mech's SquadClock summary data.
const SquadClockPanel = ({
	partyConnected,
  partyRoom,
  triggerRerender,
  setTriggerRerender,
}) => {
	// Local and remote changes to clocks set this to get processed.
  // (This roundabout system is necessary because we can't check current
  // state in firebase event listeners)
  const [clockChange, setClockChange] = useState(null)

  const allSquadClocksJson = localStorage.getItem(LANCER_SQUAD_CLOCK_KEY);
  const allSquadClocks = JSON.parse(allSquadClocksJson) || []
  console.log('render allSquadClocks', allSquadClocks);

  useEffect(() => {
    if (!clockChange) return
    let newData = [...allSquadClocks] // no need for a deep copy

    console.log('========= UPDATE CLOCK =======');
    console.log('current allSquadClocks', allSquadClocks);
    console.log('updateAllClockData', clockChange, '   local ', clockChange.isLocal);

    // NEW
    if (clockChange.newClock) {
      const alreadyHave = allSquadClocks.some(clock => clock.id === clockChange.newClock.id)
      if (!alreadyHave) {
        if (clockChange.isLocal) updateClockInFirebase(clockChange.newClock)
        newData.push(deepCopy(clockChange.newClock))
      }
    // UPDATE
    } else if (clockChange.updateClock) {
      const updateIndex = allSquadClocks.findIndex(clock => clock.id === clockChange.updateClock.id)
      console.log('updateIndex', updateIndex);
      if (updateIndex >= 0) {
        if (clockChange.isLocal) updateClockInFirebase(clockChange.updateClock)
        newData[updateIndex] = deepCopy(clockChange.updateClock)
      }
    // DELETE
  } else if (clockChange.deleteClockId) {
      const deleteIndex = allSquadClocks.findIndex(clock => clock.id === clockChange.deleteClockId)
      console.log('deleting  index ', deleteIndex);
      if (deleteIndex >= 0) {
        const firebaseKey = newData[deleteIndex].firebaseKey
        if (clockChange.isLocal && firebaseKey) deleteClockFromFirebase(firebaseKey)
        newData.splice(deleteIndex, 1);
      }
    }

    saveSquadClockData(newData)
    setTriggerRerender(!triggerRerender)
  }, [ JSON.stringify(clockChange) ]);

  // we clicked modified a clock locally
  const localUpdateToClock = (clock, change) => {
    const updateClock = {...deepCopy(clock), ...change}
    setClockChange({updateClock: updateClock, isLocal: true})
  }

	// we clicked "add clock" locally
	const localAdditionOfNewClock = (title) => {
    if (!title) return

    const newClock = deepCopy(blankClock)
    newClock.title = title
    newClock.id = `${getRandomFingerprint()}-${getRandomFingerprint()}`

		if (partyConnected) {
			const dbSquadRef = getFirebaseDB().child(FIREBASE_SQUAD_CLOCK_KEY).child(partyRoom)
			const newKey = dbSquadRef.push(newClock).key
			newClock.firebaseKey = newKey  // add the firebase key to the locally-saved entry
		}

		// Add it to the local allSquadClocks with the "I made this" set to true; this will mean that
    // on joining a room, the lack of this clock will assume that it wasn't uploaded yet. Clocks
    // missing this tag will be deleted since they came from afar in the first place.
    newClock.iMadeThis = true

    setClockChange({newClock: newClock, isLocal: true})
	}

  // push a deletion of a clock to firebase
	function deleteClockFromFirebase(firebaseKey) {
		if (partyConnected) {
			getFirebaseDB().child(FIREBASE_SQUAD_CLOCK_KEY).child(partyRoom).child(firebaseKey).remove()
      console.log('deleting clock from firebase');
    }
	}

  // push an update of a clock to firebase
	function updateClockInFirebase(clock) {
    if (partyConnected) {
  		let firebaseEntry = {...clock}
  		const firebaseKey = firebaseEntry.firebaseKey
  		delete firebaseEntry.firebaseKey // keep the key itself out of the firebase object
      delete firebaseEntry.iMadeThis // also do not push this local ownership data
      getFirebaseDB().child(FIREBASE_SQUAD_CLOCK_KEY).child(partyRoom).child(firebaseKey).set(firebaseEntry)
      console.log('setting clock in firebase');
    }
	}

	// ~~ INITIAL CONNECTION FROM SERVER ~~
  // Watch server for change/add/delete events & update the local data accordingly.
	useEffect(() => {
		if (partyConnected) {
			try {
				const dbInitiativeRef = getFirebaseDB().child(FIREBASE_SQUAD_CLOCK_KEY).child(partyRoom)

				dbInitiativeRef.on('child_changed', (snapshot) => {
					if (snapshot) {
						let newEntry = snapshot.val() // restore the firebase key to the entry's object
						newEntry.firebaseKey = snapshot.key

            console.log('update from firebase:', newEntry);
						setClockChange({updateClock: newEntry, isLocal: false})
					}
				});

				dbInitiativeRef.on('child_added', (snapshot) => {
					if (snapshot) {
						let newEntry = snapshot.val() // restore the firebase key to the entry's object
						newEntry.firebaseKey = snapshot.key
            setClockChange({newClock: newEntry, isLocal: false})
					}
				});

				dbInitiativeRef.on('child_removed', (snapshot) => {
					if (snapshot) {
            let oldEntry = snapshot.val() // restore the firebase key to the entry's object
            console.log('deleting firebase clock, oldEntry',oldEntry);
            setClockChange({deleteClockId: oldEntry.id, isLocal: false})
					}
				});

			} catch (error) {
				console.log('ERROR: ',error.message);
			}
		}

	}, [partyConnected]);

  return (
		<div className='SquadClockPanel'>
    	<div className='panel'>
        <h3 className='squad-label'>
          CLOCKS
        </h3>

				<div className='clocks-container'>
					{ allSquadClocks.map((clock, i) =>
            <Clock
              progress={clock.progress}
              setProgress={progress => localUpdateToClock(clock, {progress: progress}) }
              maxSegments={clock.segments}
              setMaxSegments={maxSegments => localUpdateToClock(clock, {segments: maxSegments}) }
              onReset={() => localUpdateToClock(clock, {progress: 0}) }
              onFinish={() => setClockChange({deleteClockId: clock.id, isLocal: true}) }
              typeLabel='Campaign clock'
              userLabel={clock.title}
              setUserLabel={title => {
                if (title) {
                  localUpdateToClock(clock, {title: title})
                } else {
                  setClockChange({deleteClockId: clock.id, isLocal: true})
                }
              }}
              inputEnabled={true}
              key={clock.id}
            />
          )}

					<AddSquadClockButton
            onClockAdd={localAdditionOfNewClock}
          />
				</div>

			</div>
    </div>
  );
}

const AddSquadClockButton = ({
  onClockAdd
}) => {
  return (
    <div className='AddSquadClockButton'>
      <TextInput
        textValue={''}
        setTextValue={title => onClockAdd(title)}
        placeholder={'Add new clock'}
        maxLength={32}
      />
    </div>
  );
}

export default SquadClockPanel;
