import React, { useState, useEffect } from 'react';
import { deepCopy, capitalize } from '../../utils.js';
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

  // List of all the entries to display.
  const [allInitiativeData, setAllInitiativeData] = useState([]);


  // always sort the initiative data before setting it
  const updateAllInitiativeData = (newData) => {
    newData.sort((a, b) => (a.initiative < b.initiative) ? 1 : -1)
    setAllInitiativeData(newData)
  }

  // we clicked "add character" locally
  const addInitiativeEntry = (newEntry) => {
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

  // we clicked "delete character" locally
  const deleteInitiativeEntry = (index) => {
    if (index < 0 || index >= allInitiativeData.length) return

    if (partyConnected) {
      const firebaseKey = allInitiativeData[index].firebaseKey
      const dbInitiativeRef = getFirebaseDB().child('initiative').child(partyRoom).child(firebaseKey).remove()
    }

    let newData = deepCopy(allInitiativeData)
    newData.splice(index, 1);
    updateAllInitiativeData(newData)
  }

  useEffect(() => {
    if (latestInitiative) {
      let newData = deepCopy(allInitiativeData)

      // is this an update or a new one?
      let isUpdate = false;
      allInitiativeData.forEach((entry, i) => {
        if (entry !== null && entry.firebaseKey === latestInitiative.firebaseKey) {
          isUpdate = true;
          newData[i] = deepCopy(latestInitiative);
        }
      });
      if (!isUpdate) newData.push(latestInitiative)

      // sort by initiative TODO: copied code from above, consolidate
      updateAllInitiativeData(newData)
    }

  }, [latestInitiative]); // eslint-disable-line react-hooks/exhaustive-deps


  useEffect(() => {
    if (partyConnected) {
      try {
        const dbInitiativeRef = getFirebaseDB().child('initiative').child(partyRoom)

        // dbInitiativeRef.on('child_changed', (snapshot) => {
        //   if (snapshot) updateInitiativeEntry(snapshot.val())
        // });

        dbInitiativeRef.on('child_added', (snapshot) => {
          if (snapshot) {
            // restore the firebase key to the entry's object
            let newEntry = snapshot.val()
            newEntry.firebaseKey = snapshot.key
            setLatestInitiative(newEntry)
          }
        });

      } catch (error) {
        console.log('ERROR: ',error.message);
      }
    }

  }, [partyConnected]); // eslint-disable-line react-hooks/exhaustive-deps


	return (
		<div className="InitiativeTracker">
      <InitiativeList
        allInitiativeData={allInitiativeData}
        addInitiativeEntry={addInitiativeEntry}
        deleteInitiativeEntry={deleteInitiativeEntry}
      />
		</div>
	);
}



export default InitiativeTracker;
