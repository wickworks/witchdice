import React, { useState, useEffect } from 'react';
import { SquadMech, AddSquadMechButton } from './SquadMech.jsx';
import { deepCopy } from '../../../../utils.js';

import {
  getMechMaxHP,
  getMechMaxHeatCap,
} from '../mechStateUtils.js';

import {
	findFrameData,
  OVERCHARGE_SEQUENCE,
} from '../../lancerData.js';

import './SquadPanel.scss';

function getFirebaseDB() {
  return window.firebase.database().ref()
}

// makes a condensed form of mech + pilot to show to the rest of the squad
function createSquadMech(mechData, pilotData) {
	const frameData = findFrameData(mechData.frame);
	let squadMech = {}
	squadMech.id = mechData.id
  squadMech.name = mechData.name

	squadMech.hpCurrent = mechData.current_hp
	squadMech.hpMax = getMechMaxHP(mechData, pilotData, frameData)
	squadMech.heatCurrent = mechData.current_heat
	squadMech.heatMax = getMechMaxHeatCap(mechData, pilotData, frameData)
	squadMech.structure = mechData.current_structure
	squadMech.stress = mechData.current_stress

	// starts with 'mf_' if it's a default one
	squadMech.portraitMech = mechData.cloud_portrait ? mechData.cloud_portrait : frameData.id
	// TODO: should sanitize this on the receiving end
	squadMech.portraitPilot = pilotData.cloud_portrait

	let statuses = ['Systems Destroyed']
	if (!mechData.current_core_energy) statuses.push('CP exhausted')
	if (mechData.current_overcharge > 0) statuses.push(`Overcharge ${OVERCHARGE_SEQUENCE[mechData.current_overcharge]}`)
  // Destroyed systems?
	squadMech.statusInternal = statuses.join(', ')

	statuses = ['Jammed, Impaired, Burn 2, Overshield 2']
  if (mechData.burn) statuses.push(`Burn ${mechData.burn}`)
	if (mechData.overshield) statuses.push(`Overshield ${mechData.overshield}`)
  // Exposed, etc.
	squadMech.statusExternal = statuses.join(', ')

	// console.log('squad mech', squadMech);
	return squadMech;
}


const SquadPanel = ({
	activeMech,
	activePilot,

	partyConnected,
  partyRoom,
}) => {
	// When we see a new entry in firebase, we put it here.
  // This triggers triggering it getting added to allSquadMechs.
  const [latestSquadMech, setLatestSquadMech] = useState(null);

  // Similar logic, but for targeted destruction of keys
  const [latestDestroyKey, setLatestDestroyKey] = useState('');

  // List of all the entries to display.
  const [allSquadMechs, setAllSquadMechs] = useState([]);

	// we clicked "add mech" locally
	const addCurrentMechToSquad = () => {
		const newEntry = createSquadMech(activeMech, activePilot)

		if (partyConnected) {
			const dbSquadRef = getFirebaseDB().child('mechsquad').child(partyRoom)
			const newKey = dbSquadRef.push(newEntry).key

			// add the firebase key to the locally-saved entry
			newEntry.firebaseKey = newKey
		}

		// add it to the local allSquadMechs
		let newData = [...allSquadMechs] // no need for a deep copy
		newData.push(newEntry)
		setAllSquadMechs(newData)
	}

	// we clicked "delete mech" locally
	const deleteEntry = (index) => {
    console.log('deleting mech from squad', index);

		if (index < 0 || index >= allSquadMechs.length) return


		if (partyConnected) {
			const firebaseKey = allSquadMechs[index].firebaseKey
			getFirebaseDB().child('mechsquad').child(partyRoom).child(firebaseKey).remove()
		}

		let newData = [...allSquadMechs]
		newData.splice(index, 1);
		setAllSquadMechs(newData)
	}

	function updateEntryInFirebase(entry) {
		const firebaseEntry = deepCopy(entry)
		const firebaseKey = firebaseEntry.firebaseKey
		delete firebaseEntry.firebaseKey // keep the key itself out of the firebase object
		getFirebaseDB().child('mechsquad').child(partyRoom).child(firebaseKey).set(firebaseEntry)
	}


  // ~~ CREATE / UPDATE ~~
  // There's a new kid in town! let's welcome them and add them to the data
  useEffect(() => {
    if (latestSquadMech) {
      let newData = [...allSquadMechs]
      let isUpdate = false;

      allSquadMechs.forEach((entry, i) => {
        if (entry !== null && entry.firebaseKey === latestSquadMech.firebaseKey) {
          isUpdate = true
          let newEntry = deepCopy(latestSquadMech)
          newData[i] = newEntry
        }
      });
      if (!isUpdate) newData.push(latestSquadMech)
      setAllSquadMechs(newData)

			console.log('create/update to latest squad mech : ', latestSquadMech);
    }

  }, [latestSquadMech]); // eslint-disable-line react-hooks/exhaustive-deps

	// ~~ DESTROY ~~
  // We have a new target. Search and destroy, by any means necessary.
  useEffect(() => {
    if (latestDestroyKey) {
      let newData = [...allSquadMechs]
      allSquadMechs.forEach((entry, i) => {
        if (entry !== null && entry.firebaseKey === latestDestroyKey) {
          newData.splice(i, 1);
        }
      });
      setAllSquadMechs(newData)
    }

  }, [latestDestroyKey]); // eslint-disable-line react-hooks/exhaustive-deps

	// ~~ INITIAL CONNECTION ~~
	useEffect(() => {
		console.log('initial connection : party connected : ', partyConnected);

		if (partyConnected) {
			try {
				const dbInitiativeRef = getFirebaseDB().child('mechsquad').child(partyRoom)

				dbInitiativeRef.on('child_changed', (snapshot) => {
					if (snapshot) {
						let newEntry = snapshot.val() // restore the firebase key to the entry's object
						newEntry.firebaseKey = snapshot.key
						setLatestSquadMech(newEntry)
					}
				});

				dbInitiativeRef.on('child_added', (snapshot) => {
					if (snapshot) {
						let newEntry = snapshot.val() // restore the firebase key to the entry's object
						newEntry.firebaseKey = snapshot.key
						setLatestSquadMech(newEntry)
					}
				});

				dbInitiativeRef.on('child_removed', (snapshot) => {
					if (snapshot) {
						setLatestDestroyKey(snapshot.key) // triggers a search and destroy
					}
				});

			} catch (error) {
				console.log('ERROR: ',error.message);
			}
		}

	}, [partyConnected]); // eslint-disable-line react-hooks/exhaustive-deps

	// Is the current mech in the lineup?
	const isCurrentMechInSquad = activeMech && allSquadMechs.find(squadMech => squadMech.id === activeMech.id)

  return (
		<div className='SquadPanel'>
    	<div className='squad-container'>

				<div className='mechs-container'>
					{ allSquadMechs.map((squadMech, i) =>
            <>
              <SquadMech squadMech={squadMech} onRemove={() => deleteEntry(i)} key={squadMech.id} />
              {i % 2 === 0 &&
                <> <div className='filler' /> <div className='filler' /> </>
              }
            </>
          )}

					{activeMech && !isCurrentMechInSquad &&
						<AddSquadMechButton squadMech={createSquadMech(activeMech, activePilot)} handleClick={addCurrentMechToSquad} />
					}
				</div>

			</div>
    </div>
  );
}




export default SquadPanel;
