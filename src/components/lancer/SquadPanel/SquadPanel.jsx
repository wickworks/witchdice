import React, { useState, useEffect } from 'react';
import { SquadMech, AddSquadMechButton } from './SquadMech.jsx';
import { deepCopy } from '../../../utils.js';

import { LANCER_SQUAD_MECH_KEY } from '../lancerLocalStorage.js';

import './SquadPanel.scss';

const FIREBASE_SQUAD_MECH_KEY = 'mechsquad'

function getFirebaseDB() {
  return window.firebase.database().ref()
}

// HIDDEN INPUT: a localstorage item under LANCER_SQUAD_MECH_KEY containing
// the active mech's SquadMech summary data.
const SquadPanel = ({
	partyConnected,
  partyRoom,

  onSyncShareCode,
}) => {
	// When we see a new entry in firebase or locally, we put it here.
  // This triggers triggering it getting added/updated in allSquadMechs.
  const [lastUpdatedSquadMech, setLastUpdatedSquadMech] = useState(null);

  // Similar logic, but for targeted destruction of keys
  const [lastDestroyedKey, setLastDestroyedKey] = useState('');

  // List of all the entries to display.
  const [allSquadMechs, setAllSquadMechs] = useState([]);

  // Is the current mech in the lineup?
  const currentSquadMechJson = localStorage.getItem(LANCER_SQUAD_MECH_KEY);
  const currentSquadMech = JSON.parse(currentSquadMechJson)
	const isCurrentMechInSquad = currentSquadMech && allSquadMechs.some(squadMech => squadMech.id === currentSquadMech.id)

  // console.log('currentSquadMech',currentSquadMech);
  // console.log('allSquadMechs',allSquadMechs);
  // console.log('isCurrentMechInSquad',isCurrentMechInSquad);

	// we clicked "add mech" locally
	const addCurrentMechToSquad = () => {
    const newEntry = deepCopy(currentSquadMech)

		if (partyConnected) {
			const dbSquadRef = getFirebaseDB().child(FIREBASE_SQUAD_MECH_KEY).child(partyRoom)
			const newKey = dbSquadRef.push(newEntry).key

      // add the firebase key to the locally-saved entry
			newEntry.firebaseKey = newKey
		}

		// add it to the local allSquadMechs
		let newData = [...allSquadMechs] // no need for a deep copy
		newData.push(newEntry)
		setAllSquadMechs(newData)
	}

	// Clicked "delete mech" locally: trigger a server deleting & remove locally.
	const deleteEntry = (index) => {
		if (index < 0 || index >= allSquadMechs.length) return

		if (partyConnected) {
			const firebaseKey = allSquadMechs[index].firebaseKey
			getFirebaseDB().child(FIREBASE_SQUAD_MECH_KEY).child(partyRoom).child(firebaseKey).remove()
		}

		let newData = [...allSquadMechs]
		newData.splice(index, 1);
		setAllSquadMechs(newData)
	}

	function updateEntryInFirebase(entry) {
		let firebaseEntry = {...entry}
		const firebaseKey = firebaseEntry.firebaseKey
		delete firebaseEntry.firebaseKey // keep the key itself out of the firebase object
    getFirebaseDB().child(FIREBASE_SQUAD_MECH_KEY).child(partyRoom).child(firebaseKey).set(firebaseEntry)
	}

  // ~~ DETECT LOCAL CHANGE, TRIGGER A SERVER UPDATE  ~~
  useEffect(() => {
    if (currentSquadMech && isCurrentMechInSquad) {
      // get the current firebase key for this mech
      const oldEntry = allSquadMechs.find(entry => entry.id === currentSquadMech.id)
      if (oldEntry) {
        const newEntry = {...currentSquadMech, firebaseKey: oldEntry.firebaseKey}
        // update it locally
        setLastUpdatedSquadMech(newEntry)
        // update it on the server
        updateEntryInFirebase(newEntry)
      }
    }
  }, [ currentSquadMechJson ]);


  // ~~ CREATE / UPDATE FROM SERVER OR LOCAL CHANGE ~~
  // New/updated mech on the server or local data! Add it to the local allSquadMechs.
  useEffect(() => {
    if (lastUpdatedSquadMech) {
      let newData = [...allSquadMechs]
      let isUpdate = false;

      allSquadMechs.forEach((entry, i) => {
        if (entry.firebaseKey === lastUpdatedSquadMech.firebaseKey) {
          isUpdate = true
          newData[i] = deepCopy(lastUpdatedSquadMech)
        }
      });

      if (!isUpdate) newData.push(lastUpdatedSquadMech)
      setAllSquadMechs(newData)
    }

  }, [lastUpdatedSquadMech]);

	// ~~ DESTROY TO SERVER ~~
  // Tell the server to remove a mech of the given key.
  useEffect(() => {
    if (lastDestroyedKey) {
      let newData = [...allSquadMechs]
      allSquadMechs.forEach((entry, i) => {
        if (entry !== null && entry.firebaseKey === lastDestroyedKey) {
          newData.splice(i, 1);
        }
      });
      setAllSquadMechs(newData)
    }

  }, [lastDestroyedKey]);

	// ~~ INITIAL CONNECTION FROM SERVER ~~
  // Watch server for change/add/delete events & update the local data accordingly.
	useEffect(() => {
		if (partyConnected) {
			try {
				const dbInitiativeRef = getFirebaseDB().child(FIREBASE_SQUAD_MECH_KEY).child(partyRoom)

				dbInitiativeRef.on('child_changed', (snapshot) => {
					if (snapshot) {
						let newEntry = snapshot.val() // restore the firebase key to the entry's object
						newEntry.firebaseKey = snapshot.key
						setLastUpdatedSquadMech(newEntry)
					}
				});

				dbInitiativeRef.on('child_added', (snapshot) => {
					if (snapshot) {
						let newEntry = snapshot.val() // restore the firebase key to the entry's object
						newEntry.firebaseKey = snapshot.key
						setLastUpdatedSquadMech(newEntry)
					}
				});

				dbInitiativeRef.on('child_removed', (snapshot) => {
					if (snapshot) {
						setLastDestroyedKey(snapshot.key) // triggers a search and destroy
					}
				});

			} catch (error) {
				console.log('ERROR: ',error.message);
			}
		}

	}, [partyConnected]);

  return (
		<div className='SquadPanel'>
    	<div className='squad-container'>

        {/* <div className='squad-label'>
          LANCERS
        </div>*/}

				<div className='mechs-container'>
          <h3 className='squad-label'>
            LANCERS
          </h3>

					{ allSquadMechs.map((squadMech, i) =>
            <SquadMech
              squadMech={squadMech}
              onRemove={() => deleteEntry(i)}
              onSyncShareCode={onSyncShareCode}
              pointsRight={(i % 2 === 1)}
              key={squadMech.id}
            />
          )}

					{currentSquadMech && !isCurrentMechInSquad &&
						<AddSquadMechButton
              squadMech={currentSquadMech}
              handleClick={addCurrentMechToSquad}
              pointsRight={(allSquadMechs.length % 2 === 1)}
            />
					}
				</div>

			</div>
    </div>
  );
}




export default SquadPanel;
