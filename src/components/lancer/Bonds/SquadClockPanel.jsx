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
	// When we see a new entry in firebase or locally, we put it here.
  // This triggers triggering it getting added/updated in allSquadClocks.
  const [lastUpdatedSquadClock, setLastUpdatedSquadClock] = useState(null);

  // Similar logic, but for targeted destruction of keys
  const [lastDestroyedKey, setLastDestroyedKey] = useState('');

  // List of all the entries to display.
  // const [allSquadClocks, setAllSquadClocks] = useState([]);

  const allSquadClocksJson = localStorage.getItem(LANCER_SQUAD_CLOCK_KEY);
  const allSquadClocks = JSON.parse(allSquadClocksJson) || []

  // process a remote or local change to the clock data
  const updateAllClockData = (change, isLocal) => {
    let newData = [...allSquadClocks] // no need for a deep copy

    if ('newClock' in change) {
      newData.push(deepCopy(change.newClock))
      if (isLocal) updateClockInFirebase(change.newClock)

    } else if ('updateClock' in change) {
      const updateIndex = allSquadClocks.findIndex(clock => clock.id === change.updateClock.id)
      if (updateIndex >= 0) {
        newData[updateIndex] = deepCopy(change.updateClock)
        if (isLocal) updateClockInFirebase(change.updateClock)
      }


    } else if ('deleteClock' in change) {
      const deleteIndex = allSquadClocks.findIndex(clock => clock.id === change.deleteClock.id)
      console.log('deleting clock ', change.deleteClock, ' index ', deleteIndex);
      if (deleteIndex >= 0) {
    		newData.splice(change.deleteClock, 1);
        if (isLocal) deleteClockFromFirebase(change.deleteClock)
      }
    }

    saveSquadClockData(newData)
    setTriggerRerender(!triggerRerender)
  }

  // we clicked modified a clock locally
  const localUpdateToClock = (clock, change) => {
    const updateClock = {...deepCopy(clock), ...change}
    updateAllClockData({updateClock: updateClock}, true)
  }

	// we clicked "add clock" locally
	const localAdditionOfNewClock = (title) => {
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

    updateAllClockData({newClock: newClock}, true)
	}

  // push a deletion of a clock to firebase
	function deleteClockFromFirebase(clock) {
		if (partyConnected) {
			const firebaseKey = clock.firebaseKey
			getFirebaseDB().child(FIREBASE_SQUAD_CLOCK_KEY).child(partyRoom).child(firebaseKey).remove()
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
						updateAllClockData({updateClock: newEntry}, false)
					}
				});

				dbInitiativeRef.on('child_added', (snapshot) => {
					if (snapshot) {
						let newEntry = snapshot.val() // restore the firebase key to the entry's object
						newEntry.firebaseKey = snapshot.key
            updateAllClockData({newClock: newEntry}, false)
					}
				});

				dbInitiativeRef.on('child_removed', (snapshot) => {
					if (snapshot) {
            let oldEntry = allSquadClocks.find(clock => clock.firebaseKey === snapshot.key)
            updateAllClockData({deleteClock: oldEntry}, false)
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
              onFinish={() => updateAllClockData({deleteClock: clock}, true) }
              typeLabel='Campaign clock'
              userLabel={clock.title}
              setUserLabel={title => localUpdateToClock(clock, {title: title}) }
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
