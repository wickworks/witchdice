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
}) => {
	// When we see a new entry in firebase or locally, we put it here.
  // This triggers triggering it getting added/updated in allSquadMechs.
  const [lastUpdatedMechStatus, setLastUpdatedMechStatus] = useState(null);

  // Similar logic, but for targeted destruction of keys
  const [lastDestroyedID, setLastDestroyedID] = useState('');

  // List of all the entries to display.
  const [allSquadMechs, setAllSquadMechs] = useState([]);

  // Is the current mech in the lineup?
  const currentSquadMechJson = localStorage.getItem(LANCER_SQUAD_MECH_KEY);
  const currentSquadMech = JSON.parse(currentSquadMechJson)
	const isCurrentMechInSquad = currentSquadMech && allSquadMechs.some(squadMech => squadMech.detail.id === currentSquadMech.id)

  // console.log('currentSquadMech',currentSquadMech);
  // console.log('allSquadMechs',allSquadMechs);
  // console.log('isCurrentMechInSquad',isCurrentMechInSquad);

	// we clicked "add mech" locally
	const addCurrentMechToSquad = () => {
    const newEntry = deepCopy(currentSquadMech)

		if (partyConnected) {
      const mechID = currentSquadMech.detail.id

      // the values that change frequently
			getFirebaseDB().child(FIREBASE_SQUAD_MECH_KEY).child(partyRoom).child(mechID).set(newEntry.status)
      // the detailed build, only set on the initial add
      getFirebaseDB().child(FIREBASE_SQUAD_DETAIL_KEY).child(partyRoom).child(mechID).set(newEntry.details)
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
      const mechID = allSquadMechs[index].detail.id
      getFirebaseDB().child(FIREBASE_SQUAD_MECH_KEY).child(partyRoom).child(mechID).remove()
			getFirebaseDB().child(FIREBASE_SQUAD_DETAIL_KEY).child(partyRoom).child(mechID).remove()
		}

		let newData = [...allSquadMechs]
		newData.splice(index, 1);
		setAllSquadMechs(newData)
	}

  // ~~ DETECT LOCAL CHANGE VIA LOCALSTORAGE, TRIGGER A SERVER UPDATE  ~~
  useEffect(() => {
    if (currentSquadMech && isCurrentMechInSquad) {
      const mechID = currentSquadMech.detail.id

      // get the current firebase key for this mech
      const oldEntry = allSquadMechs.find(entry => entry.detail.id === mechID)
      if (oldEntry) {
        const newEntry = deepCopy(currentSquadMech)
        // update the squad status locally
        setLastUpdatedMechStatus(newEntry.status)

        // TODO: add details locally!!!

        // update the squad status on the server
        getFirebaseDB().child(FIREBASE_SQUAD_MECH_KEY).child(partyRoom).child(mechID).set(newEntry.status)
      }
    }
  }, [ currentSquadMechJson ]);


  // ~~ CREATE / UPDATE FROM SERVER OR LOCAL ACTIVE MECH CHANGE ~~
  // New/updated mech on the server or local data! Add it to the local allSquadMechs.
  useEffect(() => {
    if (lastUpdatedMechStatus) {
      let newData = [...allSquadMechs]
      let isUpdate = false;

      allSquadMechs.forEach((entry, i) => {
        if (entry.status.id === lastUpdatedMechStatus.id) {
          isUpdate = true
          newData[i].status = deepCopy(lastUpdatedMechStatus)
        }
      });

      if (!isUpdate) newData.push(lastUpdatedMechStatus)
      setAllSquadMechs(newData)
    }
  }, [lastUpdatedMechStatus]);


	// ~~ DESTROY FROM SERVER ~~
  // We've heard from the server to remove a mech of the given key.
  useEffect(() => {
    if (lastDestroyedID) {
      let newData = [...allSquadMechs]
      allSquadMechs.forEach((entry, i) => {
        if (entry !== null && entry.id === lastDestroyedID) {
          newData.splice(i, 1);
        }
      });
      setAllSquadMechs(newData)
    }

  }, [lastDestroyedID]);

	// ~~ INITIAL CONNECTION FROM SERVER ~~
  // Watch server for change/add/delete events & update the local data accordingly.
	useEffect(() => {
		if (partyConnected) {
			try {
        // STATUSES
				const dbStatusRef = getFirebaseDB().child(FIREBASE_SQUAD_MECH_KEY).child(partyRoom)
				dbStatusRef.on('child_changed', (snapshot) => {
					if (snapshot) setLastUpdatedMechStatus(snapshot.val())
				})

				dbStatusRef.on('child_added', (snapshot) => {
					if (snapshot) setLastUpdatedMechStatus(snapshot.val())
				})

				dbStatusRef.on('child_removed', (snapshot) => {
					if (snapshot) setLastDestroyedID(snapshot.val().id)
				})

        // DETAILS (only pay attention to ADDS)
        const dbDetailRef = getFirebaseDB().child(FIREBASE_SQUAD_DETAIL_KEY).child(partyRoom)
        dbDetailRef.on('child_added', (snapshot) => {
          // TODO: add details locally!!!
          if (snapshot) setLastUpdatedMechDetail(snapshot.val())
        })

			} catch (error) {
				console.log('ERROR: ', error.message);
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
