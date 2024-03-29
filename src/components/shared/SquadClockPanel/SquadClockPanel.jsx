import React, { useState, useEffect } from 'react';
import Clock, { blankClock } from './Clock.jsx';
import TextInput from '..//TextInput.jsx'
import { deepCopy } from '../../../utils.js';
import { getRandomFingerprint } from '../../../localstorage.js';

import {
  SQUAD_CLOCK_KEY,
  saveSquadClockData,
} from './clockLocalStorage.js';

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

  const allSquadClocksJson = localStorage.getItem(SQUAD_CLOCK_KEY);
  const allSquadClocks = JSON.parse(allSquadClocksJson) || []

  // console.log('allSquadClocks',allSquadClocks);

  useEffect(() => {
    if (!clockChange) return
    let newData = [...allSquadClocks] // no need for a deep copy

    // console.log('========= UPDATE CLOCK =======');
    // console.log('current allSquadClocks', allSquadClocks);
    // console.log('updateAllClockData', clockChange, '   local ', clockChange.isLocal);

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
      // console.log('update clock index', updateIndex);
      if (updateIndex >= 0) {
        if (clockChange.isLocal) updateClockInFirebase(clockChange.updateClock)
        newData[updateIndex] = deepCopy(clockChange.updateClock)
      }

    // FINISH
    // } else if (clockChange.finishClockId) {
    //   const finishIndex = allSquadClocks.findIndex(clock => clock.id === clockChange.finishClockId)
    //   // console.log('finish clock index ', finishIndex);
    //   if (finishIndex >= 0) {
    //     const finishedClock = newData[finishIndex]
    //     finishedClock.finished = true
    //     if (clockChange.isLocal) updateClockInFirebase(finishedClock)
    //     newData[finishIndex] = deepCopy(finishedClock)
    //   }

    // DELETE
    } else if (clockChange.deleteClockId) {
      const deleteIndex = allSquadClocks.findIndex(clock => clock.id === clockChange.deleteClockId)
      // console.log('deleting clock index ', deleteIndex);
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
    // newClock.iMadeThis = true >> this was a buggy system

    setClockChange({newClock: newClock, isLocal: true})
	}

  // push a deletion of a clock to firebase
	function deleteClockFromFirebase(firebaseKey) {
		if (partyConnected) {
			getFirebaseDB().child(FIREBASE_SQUAD_CLOCK_KEY).child(partyRoom).child(firebaseKey).remove()
    }
	}

  // push an update of a clock to firebase
	function updateClockInFirebase(clock) {
    if (partyConnected) {
      const dbSquadRef = getFirebaseDB().child(FIREBASE_SQUAD_CLOCK_KEY).child(partyRoom)

  		let firebaseEntry = {...clock}
  		const firebaseKey = firebaseEntry.firebaseKey

      // it has a key; update it in firebase
      if (firebaseKey) {
        delete firebaseEntry.firebaseKey // keep the key itself out of the firebase object
        dbSquadRef.child(firebaseKey).set(firebaseEntry)

      // it doesn't have a key yet; we must have made it before we connected. Upload it.
      } else {
        const newKey = dbSquadRef.push(firebaseEntry).key
        const newClock = deepCopy(clock)
        newClock.firebaseKey = newKey
        setClockChange({updateClock: newClock, isLocal: true})
      }
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
            // restore the firebase key to the entry's object
						let newEntry = snapshot.val()
						newEntry.firebaseKey = snapshot.key

            if (!newEntry.finished) {
              setClockChange({updateClock: newEntry, isLocal: false})
            } else {
              setClockChange({deleteClockId: newEntry.id, isLocal: false}) // the clock was finished elsewhere; delete our local copy
            }
					}
				});

				dbInitiativeRef.on('child_added', (snapshot) => {
					if (snapshot) {
            // restore the firebase key to the entry's object
						let newEntry = snapshot.val()
						newEntry.firebaseKey = snapshot.key

            if (!newEntry.finished) {
              setClockChange({newClock: newEntry, isLocal: false})

            } else {
              setClockChange({deleteClockId: newEntry.id, isLocal: false}) // the clock was finished elsewhere; delete our local copy
              // clean out clocks that were deleted more than two months ago; all players have likely had them removed by now
              var now = Date.now()
              var cutoff = now - 64 * 24 * 60 * 60 * 1000 // 64 days ago
              if (snapshot.val().updatedAt < cutoff) snapshot.ref.remove()
            }
					}
				});

				// dbInitiativeRef.on('child_removed', (snapshot) => {
				// 	if (snapshot) {
        //     let oldEntry = snapshot.val() // restore the firebase key to the entry's object
        //     console.log('deleting firebase clock, oldEntry',oldEntry);
        //     setClockChange({deleteClockId: oldEntry.id, isLocal: false})
				// 	}
				// });

        // TODO: change this to waiting until we see what clocks are all downloaded, then upload any ones the server doesn't have
        // Go through all the clocks that we have stored that WE made and add them,
        // overriding anything that people have done to them in the meantime.
        // const controlledClocks = allSquadClocks.filter(clock => clock.iMadeThis)
        // controlledClocks.forEach(clock => updateClockInFirebase(clock))

        // And THEN drop any clocks that we have local copies of but didn't make;
        // If they're still on the server, we'll re-add them.
        // If they're not, then they must have been deleted.
        // if (controlledClocks.length !== allSquadClocks.length) {
        //   saveSquadClockData(controlledClocks)
        //   setTriggerRerender(!triggerRerender)
        // }

        // CLEANUP FUNCTION
        return () => {
          dbInitiativeRef.off('child_changed')
          dbInitiativeRef.off('child_added')
          dbInitiativeRef.off('child_removed')
        }
			} catch (error) {
				console.log('ERROR: ',error.message);
			}
		}

	}, [partyConnected]);

  return (
		<div className='SquadClockPanel'>
    	<div className='panel'>
        {/*<h3 className='squad-label'>
          CLOCKS
        </h3>*/}

				<div className='clocks-container'>
					{ allSquadClocks.map((clock, i) =>
            <Clock
              progress={clock.progress}
              setProgress={progress => localUpdateToClock(clock, {progress: progress}) }
              maxSegments={clock.segments}
              setMaxSegments={maxSegments => localUpdateToClock(clock, {segments: maxSegments, progress: Math.min(maxSegments, clock.progress)}) }
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

          {allSquadClocks.length < 12 &&
  					<AddSquadClockButton
              onClockAdd={localAdditionOfNewClock}
            />
          }
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
      <div className='asset plus' />
      <TextInput
        textValue={''}
        setTextValue={title => onClockAdd(title)}
        placeholder={'ADD CLOCK'}
        maxLength={32}
      />
    </div>
  );
}

export default SquadClockPanel;
