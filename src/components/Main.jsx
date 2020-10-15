import React, { useState, useEffect } from 'react';
import { deepCopy, getRandomInt } from '../utils.js';
import {
  CURRENT_VERSION,
  getRandomFingerprint,
  getCharacterStorageName,
  getCharacterNameFromStorageName,
  getCharacterIDFromStorageName,
  defaultDamageData,
  defaultAttackData,
  defaultRollData,
  saveCharacterData,
  loadCharacterData
} from '../data.js';
import { getMonsterData } from '../stockdata/process_monster_srd.js';

import CharacterAndMonsterList from './CharacterAndMonsterList.jsx';
import Character from './Character.jsx';
import ActiveAttackList from './ActiveAttackList.jsx';
import Roller from './Roller.jsx';
import DiceBag from './DiceBag.jsx';
import PartyPanel from './PartyPanel.jsx';
import './Main.scss';

// import firebase from 'firebase/app';
// import 'firebase/database';

import {randomWords} from '../random_words.js';


const loadedVersion = localStorage.getItem("version");
let brokeOldCharacterData = false;
let brokeOldMonsterData = false;
if (loadedVersion) {
  const newMajorVersion = loadedVersion.slice(0,loadedVersion.indexOf("."))
  const newMinorVersion = loadedVersion.slice(loadedVersion.indexOf(".")+1)
  console.log('Loading data from version', loadedVersion, '--— major version: ', newMajorVersion, ' ---- minor version', newMinorVersion);

  if (newMajorVersion !== CURRENT_VERSION.slice(0,CURRENT_VERSION.indexOf("."))) {
    brokeOldCharacterData = true;
    brokeOldMonsterData = true;
    console.log('Detected breaking change of saved Character data. Clearing.');
  }

  if (newMinorVersion !== CURRENT_VERSION.slice(CURRENT_VERSION.indexOf(".")+1)) {
    brokeOldMonsterData = true;
    console.log('Detected breaking change of saved Monster data. Resetting to defaults.');
  }
}

// should we initialize to defaults?
if (!loadedVersion || brokeOldCharacterData || brokeOldMonsterData) {
  // clear out the old data
  console.log('Clearing out old data...');
  // let skipClears = 0;
  // while (localStorage.length > skipClears) {
  while (localStorage.length > 0) {
    const key = localStorage.key(0);
    localStorage.removeItem(key)

    //
    // // monster?
    // if (getCharacterIDFromStorageName(key) < 100000) {
    //   if (brokeOldMonsterData) {localStorage.removeItem(key)} else {skipClears += 1}
    // } else {
    //   if (brokeOldCharacterData) {localStorage.removeItem(key)} else {skipClears += 1}
    // }
  }

  // save the new data
  getMonsterData().forEach((data,i) => {
    const fingerprint = (100000 + i)
    saveCharacterData(
      fingerprint,
      data.name,
      data.allAttackData
    )
  })

  localStorage.setItem("version", CURRENT_VERSION);
}


const Main = ({rollMode}) => {
  const [allCharacterEntries, setAllCharacterEntries] = useState([]);
  const [allMonsterEntries, setAllMonsterEntries] = useState([]);

  const [characterID, setCharacterID] = useState(null);
  const [characterName, setCharacterName] = useState('');
  const [characterAttackData, setCharacterAttackData] = useState([]);

  const [rollData, setRollData] = useState([]);
  // don't want to re-traverse the rollData for the party, so roller will build a summary for us
  const [rollSummaryData, setRollSummaryData] = useState([]);
  const [rollConditions, setRollConditions] = useState([]);

  const [allPartyActionData, setAllPartyActionData] = useState([]);
  const [latestAction, setLatestAction] = useState(null);

  const [partyRoom, setPartyRoom] = useState('');
  const [partyName, setPartyName] = useState('');
  const [partyConnected, setPartyConnected] = useState(false);
  const [partyLastAttackKey, setPartyLastAttackKey] = useState('');
  const [partyLastAttackTimestamp, setPartyLastAttackTimestamp] = useState(0);

  // =============== INITIALIZE ==================

  useEffect(() => {
    let monsterEntries = [];
    let characterEntries = [];

    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
      const key = localStorage.key(i);
      // console.log('localStorage key : ', key);
      // console.log('                item : ', localStorage.getItem(key));
      if (key.startsWith('character-')) {
        const characterName = getCharacterNameFromStorageName(key);
        const characterID = getCharacterIDFromStorageName(key);

        // first chunk of IDs are monsters
        if (characterID < 200000) {
          monsterEntries.push({id: characterID, name: characterName})

        } else {
          characterEntries.push({id: characterID, name: characterName})
        }
      }
    }

    setAllMonsterEntries(monsterEntries);
    setAllCharacterEntries(characterEntries);

    const loadedRoom = localStorage.getItem("party_room");
    if (loadedRoom) {
      setPartyRoom(loadedRoom);
    } else {
      generateRoomName()
    }

    const loadedName = localStorage.getItem("party_name");
    if (loadedName) setPartyName(loadedName);

    // firebase.initializeApp(firebaseConfig);
  }, []);

  // =============== ADD/EDIT/DELETE CHARACTER FUNCTIONS ==================

  const createNewCharacter = () => {
    const fingerprint = getRandomFingerprint();
    const name = 'Character';
    let attackData = [deepCopy(defaultAttackData)];
    attackData[0].damageData.push(deepCopy(defaultDamageData));

    console.log('making new character with fingerprint', fingerprint);

    // set it as the current character
    setCharacterID(fingerprint);
    setCharacterName(name);
    setCharacterAttackData(attackData);
    clearRolls();

    // add it to the entries
    let newData = deepCopy(allCharacterEntries);
    newData.push({id: fingerprint, name: name});
    setAllCharacterEntries(newData);

    // save to localStorage
    saveCharacterData(fingerprint, name, attackData);
  }

  const deleteActiveCharacter = () => {
    // console.log('deleteActiveCharacter', characterID);
    const storageName = getCharacterStorageName(characterID, characterName);
    // remove from localstorage
    localStorage.removeItem(storageName);

    // remove from the current list of character entries
    let newData = deepCopy(allCharacterEntries)
    let characterIndex = -1;
    allCharacterEntries.forEach((entry, i) => {
      if (entry.id === characterID) {characterIndex = i;}
    });
    if (characterIndex >= 0) {
      newData.splice(characterIndex, 1)
      setAllCharacterEntries(newData);
    }

    clearCharacterSelection()
  }

  const setActiveCharacter = (id) => {
    const loadedCharacter = loadCharacterData(id);
    // console.log('setActiveCharacter', id);

    if (loadedCharacter) {
      setCharacterID(id);
      setCharacterName(loadedCharacter.name);
      setCharacterAttackData(loadedCharacter.allAttackData);
    }
    clearRolls();
  }

  const clearCharacterSelection = () => {
    setCharacterID(null);
    setCharacterName('');
    setCharacterAttackData([]);
    clearRolls();
  }

  // =============== UPDATE CHARACTER / ATTACK DATA ===================

  useEffect(() => {
    // update the localStorage
    saveCharacterData(characterID, characterName, characterAttackData);

    // update the entry
    let newData = deepCopy(allCharacterEntries);
    let characterIndex = -1;
    allCharacterEntries.forEach((entry, i) => {
      if (entry.id === characterID) {characterIndex = i;}
    });
    if (characterIndex >= 0) {
      newData[characterIndex].name = characterName;
      setAllCharacterEntries(newData);
    }

  }, [characterName]); // eslint-disable-line react-hooks/exhaustive-deps


  const updateAllAttackData = (key, value, attackID) => {
    // console.log('');
    // console.log('Current attack data:', JSON.stringify(allAttackData));
    // console.log('');
    // console.log('updating attack data id', attackID, '   key ', key)
    // console.log('  with value ', JSON.stringify(value));
    // console.log('old data : ', JSON.stringify(allAttackData[attackID][key]));

    let newData = deepCopy(characterAttackData)
    newData[attackID][key] = value
    // save new attack data to the current character object
    setCharacterAttackData(newData);
    // save new attack data to localStorage
    saveCharacterData(characterID, characterName, newData)

    clearRolls();
  }

  const attackFunctions = {
    setIsActive: (value, attackID) => updateAllAttackData('isActive',value,attackID),
    setDieCount: (value, attackID) => updateAllAttackData('dieCount',parseInt(value),attackID),
    setModifier: (value, attackID) => updateAllAttackData('modifier',parseInt(value),attackID),
    setType: (value, attackID) => updateAllAttackData('type',value,attackID),
    setSavingThrowDC: (value, attackID) => updateAllAttackData('savingThrowDC',parseInt(value),attackID),
    setSavingThrowType: (value, attackID) => updateAllAttackData('savingThrowType',parseInt(value),attackID),
    setName: (value, attackID) => updateAllAttackData('name',value,attackID),
    setDesc: (value, attackID) => updateAllAttackData('desc',value,attackID),
    setDamageData: (value, attackID) => updateAllAttackData('damageData',value,attackID),
  }

  const createAttack = () => {
    let newData = deepCopy(characterAttackData);
    let newAttack = deepCopy(defaultAttackData);
    newAttack.damageData.push(deepCopy(defaultDamageData))
    newData.push(newAttack);
    setCharacterAttackData(newData);

    clearRolls();
  }

  const deleteAttack = (attackID) => {
    let newData = deepCopy(characterAttackData);
    newData.splice(attackID, 1);
    setCharacterAttackData(newData);

    clearRolls();
  }

  // =============== ROLLER FUNCTIONS ==================
  const updateRollData = (key, value, rollID) => {
    let newData = deepCopy(rollData)
    newData[rollID][key] = value
    setRollData(newData);
  }

  const clearRolls = () => {
    setRollData([]);
  }

  const rollFunctions = {
    setHit: (value, id) => updateRollData('hit',value,id),
    setRollOne: (value, id) => updateRollData('rollOne',parseInt(value),id),
    setRollTwo: (value, id) => updateRollData('rollTwo',parseInt(value),id),
    setDamageRollData: (value, id) => updateRollData('damageRollData',value,id),
    setCritRollData: (value, id) => updateRollData('critRollData',value,id),
    setRollData: (newData) => setRollData(deepCopy(newData))
  }

  // returns [TYPE, AMOUNT, REROLLED, DAMAGE_ID]
  function getDamageRoll(source, damageSourceID) {
    let damageAmount = getRandomInt(source.dieType)
    let rerolled = false;

    // maximized?
    if (source.tags.includes('maximized')) { damageAmount = source.dieType }

    // reroll damage?
    if (
      (source.tags.includes('reroll1') && damageAmount <= 1) ||
      (source.tags.includes('reroll2') && damageAmount <= 2)
    ) {
      rerolled = true;
      damageAmount = getRandomInt(source.dieType);
    }

    // minimum 2s?
    if (
      (source.tags.includes('min2') && damageAmount <= 1)
    ) {
      rerolled = true;
      damageAmount = 2;
    }

    return [
      source.damageType,
      damageAmount,
      rerolled,
      damageSourceID
    ]
  }

  const generateNewRoll = () => {
    let data = []

    // console.log('');
    // console.log('~~~~~ NEW ROLL ~~~~~');

    // EACH ATTACK (that is active)
    for (let attackID = 0; attackID < characterAttackData.length; attackID++) {
      const attackData = characterAttackData[attackID]
      let triggeredRollData = [];

      if (attackData.isActive && attackData.damageData.length > 0) {

        // EACH TO-HIT D20
        for (let rollID = 0; rollID < attackData.dieCount; rollID++) {
          const defaultHit = attackData.type === 'save' ? true : false;
          let roll = deepCopy(defaultRollData);
          roll.attackID = attackID;
          roll.hit = defaultHit;
          roll.attackBonus = attackData.modifier;

          // roll some d20s for attacks
          if (attackData.type === 'attack') {
            roll.rollOne = getRandomInt(20)
            roll.rollTwo = getRandomInt(20)
          }

          // EACH DAMAGE SOURCE
          const damageData = attackData.damageData
          let damageRollData = []
          let critRollData = []
          for (let damageSourceID = 0; damageSourceID < damageData.length; damageSourceID++) {
            const source = damageData[damageSourceID]

            // triggered damage gets added later
            if (!source.tags.includes('triggeredsave')) {

              // get both CRIT and REGULAR dice
              const dicePools = [damageRollData,critRollData]
              dicePools.forEach((dicePool) => {

                // EACH DIE IN THAT SOURCE
                for (let damageDieID = 0; damageDieID < source.dieCount; damageDieID++) {
                  const damage = getDamageRoll(source, damageSourceID);
                  const amount = damage[1];
                  if (amount > 0 || source.condition.length > 0) { dicePool.push(damage) }
                }
              })

              // PLUS MODIFIER
              if (source.modifier > 0) {
                let damage = [
                  source.damageType,
                  source.modifier,
                  false,
                  damageSourceID
                ]
                damageRollData.push(damage)
              }
            }
          }

          roll.damageRollData = damageRollData
          roll.critRollData = critRollData
          data.push(roll)

          // TRIGGERED-SAVING THROW ROLLS (for each damage source, again) (ignores crits)
          for (let damageSourceID = 0; damageSourceID < damageData.length; damageSourceID++) {
            const source = damageData[damageSourceID]

            if (source.tags.includes('triggeredsave')) {
              let triggeredroll = deepCopy(defaultRollData);
              triggeredroll.attackID = attackID;
              triggeredroll.hit = true;
              triggeredroll.attackBonus = 0;
              triggeredroll.rollOne = 0;
              triggeredroll.rollTwo = 0;
              triggeredroll.gatedByRollID = rollID;

              for (let damageDieID = 0; damageDieID < source.dieCount; damageDieID++) {
                const damage = getDamageRoll(source, damageSourceID);
                const amount = damage[1];
                if (amount > 0 || source.condition.length > 0) { triggeredroll.damageRollData.push(damage) }
              }

              // plus modifier
              if (source.modifier > 0) {
                let damage = [source.damageType, source.modifier, false, damageSourceID]
                triggeredroll.damageRollData.push(damage)
              }

              triggeredRollData.push(triggeredroll)
            }
          }
        }

        // add all the triggered rolls to the end of the normal roll data
        triggeredRollData.forEach((triggeredroll) => {
          data.push(triggeredroll);
        });

        // console.log('New Roll Data for ', attackData.name, JSON.stringify(data));
        setRollData(data);

        // clear out the last attack key so we'll push a new one in the rollData useEffect
        setPartyLastAttackKey('');
        setPartyLastAttackTimestamp(0);
      }
    }
  }

  // =============== PARTY ROLL FUNCTIONS ==================


  const addNewAttackPartyRoll = (actionData) => {
    if (partyConnected) {
      const dbRef = window.firebase.database().ref().child('rooms').child(partyRoom);

      // ~~ new attack roll ~~ //
      if (partyLastAttackTimestamp === 0) {
        const newKey = dbRef.push(actionData).key
        setPartyLastAttackKey(newKey);
        console.log('       pushed  new attack to firebase', actionData);

      // ~~ update attack roll ~~ //
      } else {
        dbRef.child(partyLastAttackKey).set(actionData);
        console.log('       set updated attack in firebase', actionData);
      }
    } else {
      // add it to the single-player roll history
      setLatestAction(actionData)
    }
  }

  const addNewDicebagPartyRoll = (rolls) => {
      let actionData = {};
      actionData.name = partyName || 'Me';
      actionData.type = 'dicebag';
      actionData.createdAt = Date.now();
      actionData.updatedAt = Date.now(); // dicebag rolls can't be modified

      // rolls = [ {die: 'd6', result: 4}, ... ]
      rolls.forEach((roll, i) => {
        actionData[`roll-${i}`] = {
          die: roll.dieType,
          result: roll.result
        }
      });

    if (partyConnected) {
      // Push this single roll to Firebase
      // (the update of the local state is handled by the firebase change)
      console.log('       pushing roll to firebase', actionData);
      const dbRef = window.firebase.database().ref().child('rooms').child(partyRoom);
      dbRef.push(actionData);

    } else {
      // add it to the single-player roll history
      setLatestAction(actionData)
    }
  }

  // whenever we update rolldata
  useEffect(() => {
    if (rollSummaryData.length > 0) {
      // traverse rollData to pull it out in a format that we want.
      let actionData = {};
      actionData.name = partyName;
      actionData.char = characterName;
      actionData.type = 'attack';
      actionData.conditions = rollConditions.join(', ')

      // ~~ new attack roll ~~ //
      if (partyLastAttackTimestamp === 0) {
        actionData.createdAt = Date.now();
        actionData.updatedAt = actionData.createdAt;
        setPartyLastAttackTimestamp(actionData.createdAt);

      // ~~ update attack roll ~~ //
      } else {
        actionData.createdAt = partyLastAttackTimestamp
        actionData.updatedAt = Date.now();
      }


      // rollSummaryData = [ {attack: 20, name: 'Longsword', 'slashing': 13, 'necrotic': 4}, ... ]
      // (replaces "attack" with "save" for saving throws)
      rollSummaryData.forEach((roll, i) => {
        actionData[`roll-${i}`] = { ...roll }
      });

      addNewAttackPartyRoll(actionData);

    }
  }, [rollSummaryData]); // eslint-disable-line react-hooks/exhaustive-deps

  // since we can't read (only write) state variables from inside firebase triggers, have to do a handoff like this
  useEffect(() => {
    if (latestAction) {
      let newData = deepCopy(allPartyActionData);

      // is this an update or a new one?
      let isUpdate = false;
      allPartyActionData.forEach((action, i) => {
        if (action !== null && action.createdAt === latestAction.createdAt) {
          isUpdate = true;
          newData[i] = deepCopy(latestAction);
        }
      });
      if (!isUpdate) newData.push(latestAction)

      setAllPartyActionData(newData);
    }

  }, [latestAction]); // eslint-disable-line react-hooks/exhaustive-deps

  const connectToRoom = () => {
    console.log('Clicked button to connect to room : ', partyRoom);

    try {
      console.log('Attempting to connect to room : ', partyRoom);
      if (partyRoom === null || partyRoom.length === 0) { throw new Error('Invalid room name!') }

      const dbRef = window.firebase.database().ref().child('rooms').child(partyRoom)

      // get the current list of data >> don't need to do this, it'll call child_added for all ones initially
      // dbRef.once('value',
      //   (snapshot) => {
      //     const rawActionData = snapshot.val();
      //     if (rawActionData !== null) {
      //       let newActionData = []; // turn a buncha { "action-1": {data} } into just an array e.g. [ {data}, ... ]
      //       Object.keys(rawActionData).forEach((actionKey) => { newActionData.push(rawActionData[actionKey]) });
      //       setAllPartyActionData( newActionData );
      //     }
      //   }
      // );

      dbRef.on('child_changed', (snapshot) => {
        if (snapshot) { setLatestAction(snapshot.val()) }
      });
      dbRef.on('child_added', (snapshot) => {
        if (snapshot) { setLatestAction(snapshot.val()) }
      });

      setPartyConnected(true);
      localStorage.setItem("party_name", partyName);
      localStorage.setItem("party_room", partyRoom);

    } catch (error) {
      console.log('ERROR: ',error.message);
      setPartyConnected(false);
    }
  }


  const generateRoomName = () => {
    setPartyRoom( `${randomWords(1)}-${randomWords({exactly: 1, maxLength: 6})}-${randomWords({exactly: 1, maxLength: 4})}` )
  }


  return (
    <div className='Main'>
      { rollMode === '5e' &&
        <CharacterAndMonsterList
        setActiveCharacterID={setActiveCharacter}
        activeCharacterID={characterID}
        allCharacterEntries={allCharacterEntries}
        allMonsterEntries={allMonsterEntries}
        createNewCharacter={createNewCharacter}
      />
      }

      {/*<div>(click to increase attack rolls, right-click to decrease)</div>*/}
      {(rollMode === '5e' && characterName.length > 0) &&
        <Character
          characterName={characterName}
          setCharacterName={setCharacterName}
          characterID={characterID}
          updateAllAttackData={updateAllAttackData}
          allAttackData={characterAttackData}
          createAttack={createAttack}
          deleteAttack={deleteAttack}
          attackFunctions={attackFunctions}
          deleteCharacter={deleteActiveCharacter}
          clearRollData={clearRolls}
        />
      }

      <div className='gameplay-container'>
        <DiceBag
          addNewDicebagPartyRoll={addNewDicebagPartyRoll}
        />

        {(rollMode === '5e' && characterName.length > 0) &&
          <div className='roller-i-hardly-even-knower-container'>
            <ActiveAttackList
              attackSourceData={characterAttackData}
              attackFunctions={attackFunctions}
            />

            <Roller
              rollData={rollData}
              attackSourceData={characterAttackData}
              handleNewRoll={generateNewRoll}
              handleClear={clearRolls}
              rollFunctions={rollFunctions}
              setRollSummaryData={setRollSummaryData}
              setRollConditions={setRollConditions}
            />
          </div>
        }

        <PartyPanel
          allPartyActionData={allPartyActionData}
          partyName={partyName}
          setPartyName={setPartyName}
          partyRoom={partyRoom}
          setPartyRoom={setPartyRoom}
          generateRoomName={generateRoomName}
          partyConnected={partyConnected}
          connectToRoom={connectToRoom}
        />
      </div>

    </div>
  )
}

export default Main ;
