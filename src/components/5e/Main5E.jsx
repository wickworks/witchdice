import React, { useState, useEffect } from 'react';
import { CharacterAndMonsterList } from '../shared/CharacterAndMonsterList.jsx';
import Antiracism from './Antiracism.jsx';
import Character from './Character.jsx';
import ActiveAttackList from './ActiveAttackList.jsx';
import Roller from './Roller.jsx';
import { CURRENT_VERSION } from '../../version.js';
import { deepCopy, getRandomInt } from '../../utils.js';
import { getMonsterData } from './stockdata/process_monster_srd.js';
import { getSpellData } from './stockdata/process_spell_srd.js';
import allCharacterPresetData from './stockdata/character_presets.json';
import {
  loadLocalData,
  saveLocalData,
  getStorageName,
  getNameFromStorageName,
  getIDFromStorageName,
  getRandomFingerprint,
} from '../../localstorage.js';
import {
  defaultDamageData,
  defaultAttackData,
  defaultRollData,
} from './data.js';

import './Main5E.scss';

const CHARACTER_PREFIX = 'character';

function saveCharacterData(fingerprint, name, allAttackData) {
  const characterData = {
    id: fingerprint,
    name: name,
    allAttackData: allAttackData
  }
  saveLocalData(CHARACTER_PREFIX, fingerprint, name, characterData);
}

function loadCharacterData(fingerprint) {
  return loadLocalData(CHARACTER_PREFIX, fingerprint);
}


const Main5E = ({
  renderDiceBag,
  renderPartyPanel,
  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
}) => {
  const [allCharacterEntries, setAllCharacterEntries] = useState([]);
  const [allMonsterEntries, setAllMonsterEntries] = useState([]);
  const [allPresetEntries, setAllPresetEntries] = useState([]);
  const [allSpellData, setAllSpellData] = useState({});

  const [characterID, setCharacterID] = useState(null);
  const [characterName, setCharacterName] = useState('');
  const [characterAttackData, setCharacterAttackData] = useState([]);

  const [rollData, setRollData] = useState([]);


  // =============== INITIALIZE ==================

  useEffect(() => {
    initializeCharactersAndMonsters();

    let monsterEntries = [];
    let characterEntries = [];
    let presetEntries = [];

    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
      const key = localStorage.key(i);
      // console.log('localStorage key : ', key);
      // console.log('                item : ', localStorage.getItem(key));
      if (key.startsWith(`${CHARACTER_PREFIX}-`)) {
        const characterName = getNameFromStorageName(CHARACTER_PREFIX, key);
        const characterID = getIDFromStorageName(CHARACTER_PREFIX, key);

        // first chunk of IDs are monsters
        if (characterID < 120000) {
          monsterEntries.push({id: characterID, name: characterName})

        // second chunk are character presets
        } else if (characterID < 200000) {
          presetEntries.push({id: characterID, name: characterName})

        } else {
          characterEntries.push({id: characterID, name: characterName})
        }
      }

    }

    setAllMonsterEntries(monsterEntries);
    setAllCharacterEntries(characterEntries);
    setAllPresetEntries(presetEntries);

    // PARSE SPELL DATA
    setAllSpellData(getSpellData());

    // if we were looking at a character, restore that
    const oldSelectedID = localStorage.getItem("5e-selected-character");
    if (oldSelectedID) setActiveCharacter( parseInt(oldSelectedID) )
  }, []);


  function initializeCharactersAndMonsters() {
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
    //   // clear out the old data
    //   console.log('Clearing out old data...');
    //   // let skipClears = 0;
    //   // while (localStorage.length > skipClears) {
    //   while (localStorage.length > 0) {
    //     const key = localStorage.key(0);
    //     localStorage.removeItem(key)
    //
    //     //
    //     // // monster?
    //     // if (getCharacterIDFromStorageName(key) < 100000) {
    //     //   if (brokeOldMonsterData) {localStorage.removeItem(key)} else {skipClears += 1}
    //     // } else {
    //     //   if (brokeOldCharacterData) {localStorage.removeItem(key)} else {skipClears += 1}
    //     // }
    //   }

      // PARSE MONSTER JSON
      getMonsterData().forEach((data,i) => {
        const fingerprint = (100000 + i)
        saveCharacterData(
          fingerprint,
          data.name,
          data.allAttackData
        )
      })

      // PARSE PRESET JSON
      for ( var i = 0; i < allCharacterPresetData.length; ++i ) {
        const presetData = allCharacterPresetData[i];

        saveCharacterData(
          presetData.id,
          presetData.name,
          presetData.allAttackData
        )
      }

      localStorage.setItem("version", CURRENT_VERSION);
    }
  }

  // =============== ADD/EDIT/DELETE CHARACTER FUNCTIONS ==================

  const createNewCharacter = () => {
    const fingerprint = getRandomFingerprint();
    const name = 'Character';
    const attackData = [];
    // let attackData = [deepCopy(defaultAttackData)];
    // attackData[0].damageData.push(deepCopy(defaultDamageData));

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
    const storageName = getStorageName(CHARACTER_PREFIX, characterID, characterName);
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
    const loadedCharacter = loadCharacterData( parseInt(id) );
    // console.log('setActiveCharacter', id, '     data', loadedCharacter);

    if (loadedCharacter) {
      setCharacterID(id);
      setCharacterName(loadedCharacter.name);
      setCharacterAttackData(loadedCharacter.allAttackData);
    }
    clearRolls();

    localStorage.setItem("5e-selected-character", id);
  }

  const setToCharacterPreset = (id) => {
    const loadedCharacterPreset = loadCharacterData( parseInt(id) );

    if (loadedCharacterPreset) {
      setCharacterName(loadedCharacterPreset.name);
      setCharacterAttackData(loadedCharacterPreset.allAttackData);
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

  const createAttackFromSpell = (spellName) => {
    let newData = deepCopy(characterAttackData);

    const spellData = allSpellData[spellName];

    if (spellData) {
      let newAttack = deepCopy(spellData);
      newData.push(newAttack);

      setCharacterAttackData(newData);

      console.log('added new attack from spell ', spellName);
      console.log(spellData);

      clearRolls();
    }
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


  return (
    <div className='Main5E'>
      <CharacterAndMonsterList
        setActiveCharacterID={setActiveCharacter}
        activeCharacterID={characterID}
        allCharacterEntries={allCharacterEntries}
        allMonsterEntries={allMonsterEntries}
        createNewCharacter={createNewCharacter}
      />

      {(characterName.length > 0) && (
        <>
          { (characterName === "Orc" || characterName === "Goblin") &&
            <Antiracism />
          }

          <Character
            characterName={characterName}
            setCharacterName={setCharacterName}
            characterID={characterID}
            updateAllAttackData={updateAllAttackData}
            allAttackData={characterAttackData}
            createAttack={createAttack}
            createAttackFromSpell={createAttackFromSpell}
            deleteAttack={deleteAttack}
            attackFunctions={attackFunctions}
            deleteCharacter={deleteActiveCharacter}
            allPresetEntries={allPresetEntries}
            setToCharacterPreset={setToCharacterPreset}
            allSpellData={allSpellData}
            clearRollData={clearRolls}
          />
        </>
      )}

      <div className='gameplay-container'>
        {renderDiceBag()}

        {(characterName.length > 0) &&
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
              characterName={characterName}
              setRollSummaryData={setRollSummaryData}
            />
          </div>
        }

        {renderPartyPanel()}
      </div>

    </div>
  )
}

export default Main5E;
