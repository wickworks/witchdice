import React, { useState, useEffect } from 'react';
import { SquadMech, AddSquadMechButton } from './SquadMech.jsx';
import { deepCopy, capitalize } from '../../../utils.js';

import {
  getMechMaxHP,
  getMechMaxHeatCap,
  getMechMaxRepairCap,
  getCountersFromPilot,
} from '../MechState/mechStateUtils.js';

import {
  findFrameData,
  findSystemData,
	findWeaponData,
  OVERCHARGE_SEQUENCE,
} from '../lancerData.js';

import {
  getMountsFromLoadout,
  getWeaponsOnMount,
} from '../MechSheet/MechMount.jsx';

import './SquadPanel.scss';

function getFirebaseDB() {
  return window.firebase.database().ref()
}

// makes a condensed form of mech + pilot to show to the rest of the squad
function createSquadMech(mechData, pilotData) {
  // console.log('mechData', mechData);

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

	let statuses;

  // EXTERNAL statuses
  statuses = []
  if (mechData.conditions) statuses = mechData.conditions.map(condition => capitalize(condition.toLowerCase()))
  if (mechData.burn) statuses.push(`Burn ${mechData.burn}`)
	if (mechData.overshield) statuses.push(`Overshield ${mechData.overshield}`)
	squadMech.statusExternal = statuses.join(',')

  // INTERNAL statuses
  statuses = []
  if (pilotData.custom_counters) {
    getCountersFromPilot(pilotData)
      .filter(counter => counter.name.length > 0)
      .forEach(counter => statuses.push(`${counter.name}: ${counter.val}`))
  }
  if (mechData.current_overcharge > 0) statuses.push(`Overcharge ${OVERCHARGE_SEQUENCE[mechData.current_overcharge]} heat`)
  if (!mechData.current_core_energy) statuses.push('CP exhausted')
	if (mechData.current_repairs < getMechMaxRepairCap(mechData, pilotData, frameData)) {
    statuses.push(`${mechData.current_repairs} repairs left`)
  }

  let destroyedSystemNames = []
  mechData.loadouts[0].systems.forEach(system => {
    if (system.destroyed) {
      const destroyedSystemData = findSystemData(system.id)
      destroyedSystemNames.push( destroyedSystemData.name.toUpperCase() )
    }
  })
  getMountsFromLoadout(mechData.loadouts[0]).forEach(mount => {
    getWeaponsOnMount(mount).forEach(weapon => {
      if (weapon.destroyed) destroyedSystemNames.push( findWeaponData(weapon.id).name )
    })
  })
  if (destroyedSystemNames.length > 0) statuses.push(`DESTROYED:,${destroyedSystemNames.join(',')}`)

	squadMech.statusInternal = statuses.join(',')

	// console.log('squad mech', squadMech);
	return squadMech;
}


const SquadPanel = ({
	activeMech,
	activePilot,

	partyConnected,
  partyRoom,
}) => {
	// When we see a new entry in firebase or locally, we put it here.
  // This triggers triggering it getting added/updated in allSquadMechs.
  const [lastUpdatedSquadMech, setLastUpdatedSquadMech] = useState(null);

  // Similar logic, but for targeted destruction of keys
  const [lastDestroyedKey, setLastDestroyedKey] = useState('');

  // List of all the entries to display.
  const [allSquadMechs, setAllSquadMechs] = useState([]);

  // Is the current mech in the lineup?
	const isCurrentMechInSquad = activeMech && allSquadMechs.find(squadMech => squadMech.id === activeMech.id)
  const activeSquadMech = (activeMech && activePilot) ? createSquadMech(activeMech, activePilot) : null

	// we clicked "add mech" locally
	const addCurrentMechToSquad = () => {
    const newEntry = deepCopy(activeSquadMech)

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

	// Clicked "delete mech" locally: trigger a server deleting & remove locally.
	const deleteEntry = (index) => {
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
		let firebaseEntry = {...entry}
		const firebaseKey = firebaseEntry.firebaseKey
		delete firebaseEntry.firebaseKey // keep the key itself out of the firebase object
    getFirebaseDB().child('mechsquad').child(partyRoom).child(firebaseKey).set(firebaseEntry)
	}

  // ~~ DETECT LOCAL CHANGE, TRIGGER A SERVER UPDATE  ~~
  useEffect(() => {
    if (isCurrentMechInSquad && activeSquadMech) {
      // get the current firebase key for this mech
      const oldEntry = allSquadMechs.find(entry => entry.id === activeSquadMech.id)
      if (oldEntry) {
        const newEntry = {...activeSquadMech, firebaseKey: oldEntry.firebaseKey}
        // update it locally
        setLastUpdatedSquadMech(newEntry)
        // update it on the server
        updateEntryInFirebase(newEntry)
      }
    }
  }, [ JSON.stringify(activeSquadMech) ]);


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
				const dbInitiativeRef = getFirebaseDB().child('mechsquad').child(partyRoom)

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

        <div className='squad-label'>
          LANCERS
        </div>

				<div className='mechs-container'>
					{ allSquadMechs.map((squadMech, i) =>
            <React.Fragment key={squadMech.id}>
              <SquadMech squadMech={squadMech} onRemove={() => deleteEntry(i)} />
              {i % 2 === 0 &&
                <> <div className='filler' /> <div className='filler' /> </>
              }
            </React.Fragment>
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
