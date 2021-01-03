import React, { useState, useEffect } from 'react';
import { deepCopy,  } from '../../utils.js';
import InitiativeList from './InitiativeList.jsx';
import './InitiativeTracker.scss';

function getFirebaseDB() {
  return window.firebase.database().ref()
}

const InitiativeTracker = ({
  partyConnected,
  partyRoom
}) => {
  // When we see a new entry in firebase, we put it here.
  // This triggers triggering it getting added to allInitiativeData.
  const [latestInitiative, setLatestInitiative] = useState(null);

  // Similar logic, but for targeted destruction of keys
  const [latestDestroyKey, setLatestDestroyKey] = useState('');

  // List of all the entries to display.
  const [allInitiativeData, setAllInitiativeData] = useState([]);


  // always sort the initiative data before setting it
  const updateAllInitiativeData = (newData) => {
    newData.sort((a, b) => {
      if (a.initiative === b.initiative) {
        if (a.bonus === b.bonus) {
          return (a.name < b.name) ? 1 : -1
        } else {
          return (a.bonus < b.bonus) ? 1 : -1
        }
      } else {
        return (a.initiative < b.initiative) ? 1 : -1
      }
    })
    setAllInitiativeData(newData)
  }

  // we clicked "add character" locally
  const addEntry = (newEntry) => {
    if (partyConnected) {
      const dbInitiativeRef = getFirebaseDB().child('initiative').child(partyRoom)
      const newKey = dbInitiativeRef.push(newEntry).key

      // add the firebase key to the locally-saved entry
      newEntry.firebaseKey = newKey
    }

    // add it to the local allInitiativeData
    let newData = deepCopy(allInitiativeData)
    newData.push(newEntry)
    updateAllInitiativeData(newData)
  }

  // toggle this entry to highlighted, all other ones false
  const highlightEntry = (hightlightIndex) => {
    if (hightlightIndex < 0 || hightlightIndex >= allInitiativeData.length) return

    let newData = deepCopy(allInitiativeData)
    newData.forEach((entry, i) => {
      entry.highlighted = (i === hightlightIndex )

      // if we're changing it, push the new one to firebase
      if (partyConnected && entry.highlighted !== allInitiativeData[i].highlighted) {
        getFirebaseDB().child('initiative').child(partyRoom).child(entry.firebaseKey).set(entry)
      }
    })

    updateAllInitiativeData(newData)
  }

  // we clicked "delete character" locally
  const deleteEntry = (index) => {
    if (index < 0 || index >= allInitiativeData.length) return

    if (partyConnected) {
      const firebaseKey = allInitiativeData[index].firebaseKey
      getFirebaseDB().child('initiative').child(partyRoom).child(firebaseKey).remove()
    }

    let newData = deepCopy(allInitiativeData)
    newData.splice(index, 1);
    updateAllInitiativeData(newData)
  }

  // we clicked the "clear" button locally
  const clearData = () => {
    if (partyConnected) {
      getFirebaseDB().child('initiative').child(partyRoom).remove()
    }
    setAllInitiativeData([])
  }

  // ~~ CREATE / UPDATE ~~
  // There's a new kid in town! let's welcome them and add them to the data
  useEffect(() => {
    if (latestInitiative) {
      let newData = deepCopy(allInitiativeData)
      let isUpdate = false;
      allInitiativeData.forEach((entry, i) => {
        if (entry !== null && entry.firebaseKey === latestInitiative.firebaseKey) {
          isUpdate = true;
          newData[i] = deepCopy(latestInitiative);
        }
      });
      if (!isUpdate) newData.push(latestInitiative)
      updateAllInitiativeData(newData)
    }

  }, [latestInitiative]); // eslint-disable-line react-hooks/exhaustive-deps

  // ~~ DESTROY ~~
  // We have a new target. Search and destroy, by any means necessary.
  useEffect(() => {
    if (latestDestroyKey) {
      let newData = deepCopy(allInitiativeData)
      allInitiativeData.forEach((entry, i) => {
        if (entry !== null && entry.firebaseKey === latestDestroyKey) {
          newData.splice(i, 1);
        }
      });
      updateAllInitiativeData(newData)
    }

  }, [latestDestroyKey]); // eslint-disable-line react-hooks/exhaustive-deps


  useEffect(() => {
    if (partyConnected) {
      try {
        const dbInitiativeRef = getFirebaseDB().child('initiative').child(partyRoom)

        dbInitiativeRef.on('child_changed', (snapshot) => {
          if (snapshot) {
            let newEntry = snapshot.val() // restore the firebase key to the entry's object
            newEntry.firebaseKey = snapshot.key
            setLatestInitiative(newEntry)
          }
        });

        dbInitiativeRef.on('child_added', (snapshot) => {
          if (snapshot) {
            let newEntry = snapshot.val() // restore the firebase key to the entry's object
            newEntry.firebaseKey = snapshot.key
            setLatestInitiative(newEntry)
          }
        });

        dbInitiativeRef.on('child_removed', (snapshot) => {
          if (snapshot) {
            setLatestDestroyKey(snapshot.key) // triggers a search and destroy
          }
        });

        // add all the current local ones to the party, in case we rolled too soon
        allInitiativeData.forEach((entry, i) => {
          if (entry !== null) {
            const newKey = dbInitiativeRef.push(entry).key
            entry.firebaseKey = newKey
          }
        })

      } catch (error) {
        console.log('ERROR: ',error.message);
      }
    }

  }, [partyConnected]); // eslint-disable-line react-hooks/exhaustive-deps


	return (
		<div className="InitiativeTracker">
      <InitiativeList
        allInitiativeData={allInitiativeData}
        addEntry={addEntry}
        highlightEntry={highlightEntry}
        deleteEntry={deleteEntry}
        clearData={clearData}
      />
		</div>
	);
}



export default InitiativeTracker;
