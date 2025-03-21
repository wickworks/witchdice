import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { CharacterAndMonsterList } from '../shared/CharacterAndMonsterList.jsx';
import NouveauDivider from '../shared/NouveauDivider.jsx';
import Antiracism from './Antiracism.jsx';
import Character from './Character.jsx';
import ActiveAttackList from './ActiveAttackList.jsx';
import Roller from './Roller.jsx';
import InitiativeTracker from './InitiativeTracker.jsx';
import { CURRENT_VERSION } from '../../version.js';
import { deepCopy, getRandomInt } from '../../utils.js';
import { getMonsterData } from './stockdata/process_monster_srd.js';
// import parsedMonsterData from './stockdata/srd_monsters_parsed.json';
import { getSpellData } from './stockdata/process_spell_srd.js';
// import parsedSpellData from './stockdata/srd_spells_parsed.json';
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
  defaultDamageRoll,
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
	setPartyLastAttackKey,
	setPartyLastAttackTimestamp,
	setRollSummaryData,
	partyRoom,
	partyConnected,
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

    function setupEntries() {
		initializeCharacters();

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

		// USE PREPARSED SPELL DATA
		// setAllSpellData(parsedSpellData);

		// if we were looking at a character, restore that
		const oldSelectedID = localStorage.getItem("5e-selected-character");
		if (oldSelectedID) setActiveCharacter( parseInt(oldSelectedID) )
	}

    useEffect(() => {
		setupEntries()
	}, []);


  function initializeCharacters() {
	const loadedVersion = localStorage.getItem("version");
	// should we initialize to defaults?
	if (!loadedVersion) {
	  // PARSE PRESET JSON
	  for ( var j = 0; j < allCharacterPresetData.length; ++j ) {
		const presetData = allCharacterPresetData[j];

		saveCharacterData(
		  presetData.id,
		  presetData.name,
		  presetData.allAttackData
		)
	  }

	  localStorage.setItem("version", CURRENT_VERSION);
	}
  }

  function initializeMonsters() {
	console.log('initializing mosters')
	const hasMonsters = loadCharacterData(100000) != null;
	if (!hasMonsters) {
	  getMonsterData().forEach((monsterData,i) => {
		const fingerprint = (100000 + i)
		saveCharacterData(
		  fingerprint,
		  monsterData.name,
		  monsterData.allAttackData
		)
	  })

	  localStorage.setItem("version", CURRENT_VERSION);
	  setupEntries()
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
	  if (String(entry.id) === String(characterID)) {characterIndex = i;}
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
	  if (String(entry.id) === String(characterID)) {characterIndex = i;}
	});
	if (characterIndex >= 0) {
	  newData[characterIndex].name = characterName;
	  setAllCharacterEntries(newData);
	}

  }, [characterName]);

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
	newAttack.modifier = getCharacterAttackBonus(characterAttackData);
	newAttack.savingThrowDC = getCharacterSaveDC(characterAttackData);
	newData.push(newAttack);
	setCharacterAttackData(newData);
	saveCharacterData(characterID, characterName, newData)

	clearRolls();
  }

  const createAttackFromSpell = (spellName) => {
	let newData = deepCopy(characterAttackData);

	const spellData = allSpellData[spellName];

	if (spellData) {
	  let newAttack = deepCopy(spellData);
	  newAttack.modifier = getCharacterAttackBonus(characterAttackData);
	  newAttack.savingThrowDC = getCharacterSaveDC(characterAttackData);
	  newData.push(newAttack);

	  setCharacterAttackData(newData);
	  saveCharacterData(characterID, characterName, newData)
	  clearRolls();
	}
  }

  const deleteAttack = (attackID) => {
	let newData = deepCopy(characterAttackData);
	newData.splice(attackID, 1);
	setCharacterAttackData(newData);
	saveCharacterData(characterID, characterName, newData)

	clearRolls();
  }

  // harvests the save dc from the first attack with one that we find
  function getCharacterSaveDC(allAttackData) {
	let prevDC = -1;
	allAttackData.forEach((attackData) => {
	  if (attackData.type === 'save') prevDC = Math.max(prevDC, attackData.savingThrowDC);
	})
	prevDC = prevDC > 0 ? prevDC : 12; //default
	return prevDC
  }

  // harvests the attack from the first attack
  function getCharacterAttackBonus(allAttackData) {
	let prevBonus = 0;
	allAttackData.forEach((attackData) => {
	  prevBonus = Math.max(prevBonus, attackData.modifier);
	})
	return prevBonus
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
	setRollData: (newData) => setRollData(deepCopy(newData)),
	setHit: (value, id) => updateRollData('hit',value,id),
	setManualCrit: (value, id) => updateRollData('manualCrit',value,id),
	setRollOne: (value, id) => updateRollData('rollOne',parseInt(value),id),
	setRollTwo: (value, id) => updateRollData('rollTwo',parseInt(value),id),
	setDamageRollData: (value, id) => updateRollData('damageRollData',value,id),
	setCritRollData: (value, id) => updateRollData('critRollData',value,id),
  }

  function getDamageRoll(source, damageSourceID) {
	let damageRoll = deepCopy(defaultDamageRoll);

	damageRoll.type = source.damageType;
	damageRoll.amount = getRandomInt(source.dieType)
	damageRoll.rerolledAmount = getRandomInt(source.dieType)
	damageRoll.rerolled = false;
	damageRoll.sourceID = damageSourceID;

	// maximized?
	if (source.tags.includes('maximized')) { damageRoll.amount = source.dieType }

	// reroll damage?
	if (
	  (source.tags.includes('reroll1') && damageRoll.amount <= 1) ||
	  (source.tags.includes('reroll2') && damageRoll.amount <= 2)
	) {
	  damageRoll.rerolled = true;
	}

	// minimum 2s?
	if (
	  (source.tags.includes('min2'))
	) {
	  damageRoll.amount = Math.max(damageRoll.amount, 2);
	  damageRoll.rerolledAmount = Math.max(damageRoll.rerolledAmount, 2);
	}

	return damageRoll;
  }

  const generateNewRoll = () => {
	let data = []
	let abilityData = [] // these go at the end of the other attacks

	// console.log('');
	// console.log('~~~~~ NEW ROLL ~~~~~');

	// EACH ATTACK (that is active)
	for (let attackID = 0; attackID < characterAttackData.length; attackID++) {
	  const attackData = characterAttackData[attackID]
	  let triggeredRollData = [];

	  if (attackData.isActive && attackData.damageData.length > 0) {

		// we direct abilities towards their own list
		const currentData = attackData.type === 'ability' ? abilityData : data;

		// EACH TO-HIT D20
		for (let rollID = 0; rollID < attackData.dieCount; rollID++) {
		  const defaultHit = attackData.type === 'save' ? true : false;
		  let roll = deepCopy(defaultRollData);
		  roll.attackID = attackID;
		  roll.hit = defaultHit;

		  // roll some d20s for attacks
		  if (attackData.type === 'attack') {
			roll.attackBonus = attackData.modifier;
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
			  const dicePools = [damageRollData, critRollData]
			  dicePools.forEach((dicePool) => {
				let damageDieCount = source.dieCount

				// handle crits that get extra dice
				if (dicePool === critRollData) {
				  if (source.tags.includes('extracritdie1')) damageDieCount += 1
				  if (source.tags.includes('extracritdie2')) damageDieCount += 2
				}

				// EACH DIE IN THAT SOURCE
				for (let damageDieID = 0; damageDieID < damageDieCount; damageDieID++) {
				  const damage = getDamageRoll(source, damageSourceID);
				  const amount = damage.rerolled ? damage.rerolledAmount : damage.amount;
				  if (amount > 0 || source.condition.length > 0) { dicePool.push(damage) }
				}
			  })

			  // PLUS MODIFIER
			  if (source.modifier !== 0) {
				let damage = deepCopy(defaultDamageRoll);
				damage.type = source.damageType;
				damage.amount = source.modifier;
				damage.rerolledAmount = -1; // can't be rerolled
				damage.rerolled = false;
				damage.sourceID = damageSourceID;
				damageRollData.push(damage)
			  }
			}
		  }

		  roll.damageRollData = damageRollData
		  roll.critRollData = critRollData
		  currentData.push(roll)

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
			  triggeredroll.gatedByRollID = (data.length-1); // the current roll ID === the length of the roll data

			  for (let damageDieID = 0; damageDieID < source.dieCount; damageDieID++) {
				const damage = getDamageRoll(source, damageSourceID);
				if (damage.amount > 0 || source.condition.length > 0) { triggeredroll.damageRollData.push(damage) }
			  }

			  // plus modifier
			  if (source.modifier > 0) {
				let damage = deepCopy(defaultDamageRoll);
				damage.type = source.damageType;
				damage.amount = source.modifier;
				damage.rerolledAmount = -1; // can't be rerolled
				damage.rerolled = false;
				damage.sourceID = damageSourceID;
				triggeredroll.damageRollData.push(damage)
			  }

			  triggeredRollData.push(triggeredroll)
			}
		  }
		}

		// add all the triggered rolls to the end of the normal roll data
		triggeredRollData.forEach((triggeredroll) => currentData.push(triggeredroll) )
	  }
	}

	// add all the ability rolls to the rest of the attacks
	abilityData.forEach((abilityRoll) => data.push(abilityRoll) )

	console.log('New Roll Data', JSON.stringify(data));
	setRollData(data);

	// clear out the last attack key so we'll push a new one in the rollData useEffect
	setPartyLastAttackKey('');
	setPartyLastAttackTimestamp(0);
  }


  return (
	<div className='Main5E'>
	  { (characterName && characterName.length > 0) &&
		<Helmet> <title>{characterName} ~ Witch Dice</title> </Helmet>
	  }

	  <CharacterAndMonsterList
		setActiveCharacterID={setActiveCharacter}
		activeCharacterID={characterID}
		allCharacterEntries={allCharacterEntries}
		allMonsterEntries={allMonsterEntries}
		deleteActiveCharacter={deleteActiveCharacter}
		createNewCharacter={createNewCharacter}
		initializeMonsters={initializeMonsters}
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
			allPresetEntries={allPresetEntries}
			setToCharacterPreset={setToCharacterPreset}
			allSpellData={allSpellData}
			clearRollData={clearRolls}
		  />
		</>
	  )}

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

	  <NouveauDivider />

	  <InitiativeTracker
		partyConnected={partyConnected}
		partyRoom={partyRoom}
	  />

	  <NouveauDivider />

	</div>
  )
}

export default Main5E;
