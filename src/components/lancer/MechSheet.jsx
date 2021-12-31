import React, { useState, useEffect } from 'react';
import WeaponRoller from './WeaponRoller/WeaponRoller.jsx';
import MechState from './MechState/MechState.jsx';
import MechanicsList from './MechanicsList.jsx';
import { MechTraits, MechCoreSystem } from './MechTraits.jsx';
import {
  getGrit,
  findWeaponData,
  findFrameData,
  findSystemData,
  findCoreBonusData,
  findModData,
} from './lancerData.js';

import {
  getMechSP,
} from './MechState/mechStateUtils.js';

import {
  getToHitBonusFromMech,
  getBonusDamageSourcesFromMech,
  getBonusDamageSourcesFromTalents,
  getBonusDamageSourcesFromMod,
  getBonusDamageSourcesFromCoreBonuses,
} from './bonusDamageSourceUtils.js';

import { deepCopy } from '../../utils.js';

import './MechSheet.scss';

function getModdedWeaponData(weapon) {
  let weaponData = deepCopy( findWeaponData(weapon.id) );

  // now we actually MODIFY the weaponData to add any tags from mods. Much easier than doing it dynamically later.
  if (weapon.mod) {
    const modData = findModData(weapon.mod.id)
    if (modData.added_tags) weaponData.tags = [...weaponData.tags, ...modData.added_tags]
  }

  return weaponData;
}

function getWeaponsOnMount(mountData) {
  if (!mountData) return

  const weapons =
    [...mountData.slots, ...mountData.extra]
    .map(slot => slot.weapon)
    .filter(weapon => weapon)

  return weapons;
}

function getMountsFromLoadout(loadout) {
  const mounts = [...loadout.mounts];
  if (loadout.improved_armament.slots.weapon) mounts.push(loadout.improved_armament);

  // override the integrated weapon name to make it clear where it came from
  if (loadout.integratedWeapon.slots.length > 0 && loadout.integratedWeapon.slots[0].weapon) {
    mounts.push({
      ...deepCopy(loadout.integratedWeapon),
      bonus_effects: ['cb_integrated_weapon']
    });
  }

  // gotta make a dummy mount for integrated weapons
  if (loadout.integratedMounts.length > 0) {
    const integratedMounts =
      loadout.integratedMounts.map(integratedWeapon => {
        return {
          mount_type: "Integrated",
          lock: false,
          slots: [ integratedWeapon ],
          extra: [],
          bonus_effects: []
        }
      })
    mounts.push(...integratedMounts)
  }

  return mounts;
}

const MechSheet = ({
  activeMech,
  activePilot,
  updateMechState,

  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
}) => {
  const [activeMountIndex, setActiveMountIndex] = useState(null);
  const [activeWeaponIndex, setActiveWeaponIndex] = useState(0);

  // =============== CHANGE MECH / WEAPON ==================
  useEffect(() => {
    setActiveMountIndex(null);
    setActiveWeaponIndex(0);
  }, [activeMech, activePilot]);

  const changeMountAndWeapon = (newMount, newWeapon) => {
    setActiveMountIndex(newMount)
    setActiveWeaponIndex(newWeapon)

    // the next attack roll will be a new entry in the summary
    newAttackSummary()
  }


  // =============== SUMMARY DATA ==================
  // inject the mech name to summary data before sending it up
  const setRollSummaryDataWithName = (rollSummaryData) => {
    rollSummaryData.characterName = activeMech.name
    // console.log('rollSummaryData', rollSummaryData)
    setRollSummaryData(rollSummaryData)
  }

  // the next attack roll will be a new entry in the summary
  const newAttackSummary = () => {
    setPartyLastAttackKey('')
    setPartyLastAttackTimestamp(0)
  }


  // =============== GET THE DATA FOR THE SHEET ==================

  const loadout = activeMech.loadouts[0];
  const mounts = getMountsFromLoadout(loadout);

  const frameData = findFrameData(activeMech.frame);
  const gritBonus = getGrit(activePilot);

  const activeMount = mounts[activeMountIndex];

  const activeMountWeapons = getWeaponsOnMount(activeMount);
  const activeWeapon = activeMountWeapons && activeMountWeapons[activeWeaponIndex];
  const activeWeaponData = activeWeapon && getModdedWeaponData(activeWeapon)

  const bonusDamageSources = [
    ...getBonusDamageSourcesFromMech(activeMech),
    ...getBonusDamageSourcesFromCoreBonuses(activeMount),
    ...getBonusDamageSourcesFromMod(activeWeapon),
    ...getBonusDamageSourcesFromTalents(activePilot),
  ];

  const miscBonusToHit = getToHitBonusFromMech(activeMech);

  return (
    <div className="MechSheet">
      <div className="mech-container">

        {/*<div className="portrait asset ssc-watermark">
          <img src={activeMech.cloud_portrait} alt={'mech portrait'} />
        </div>*/}

        <h2>{activeMech.name}</h2>

        <div className='frame-container'>
          <div className={`asset ${frameData.source.toLowerCase()}`} />
          <div className='manufacturer'>

            {frameData.source}
          </div>
          <div className="frame">{frameData.name.toLowerCase()}</div>
        </div>

        <MechTraits traitList={frameData.traits} />

        <MechCoreSystem coreSystem={frameData.core_system} />

        <MechState
          activeMech={activeMech}
          activePilot={activePilot}
          frameData={frameData}
          updateMechState={updateMechState}
        />

        <MechanicsList
          label={`Systems (${getMechSP(activeMech, activePilot, frameData)} SP)`}
          findData={findSystemData}
          tooltipContentKey='effect'
          tooltipFlavorKey='description'
          tooltipHref='https://compcon.app/#/compendium/search?search=%TITLE'
          mechanicIDList={loadout.systems}
          containerClass={'systems'}
          namesToLowercase={false}
        />

        <div className="mounts-label">Mounts</div>

        <div className="mounts-list">
          { mounts.map((mount, i) =>
            <MechMount
              mount={mount}
              setActiveWeaponIndex={(weaponIndex) => changeMountAndWeapon(i, weaponIndex)}
              activeWeaponIndex={activeMountIndex === i ? activeWeaponIndex : -1}
              key={`mount-${i}`}
            />
          )}
        </div>
      </div>

      {activeWeaponData &&
        <WeaponRoller
          weaponData={activeWeaponData}
          gritBonus={gritBonus+miscBonusToHit}
          availableBonusSources={bonusDamageSources}
          isPrimaryWeaponOnMount={activeWeaponIndex === 0}
          setRollSummaryData={setRollSummaryDataWithName}
          onClear={newAttackSummary}
        />
      }
    </div>
  )
}

const MechMount = ({
  mount,
  setActiveWeaponIndex,
  activeWeaponIndex,
}) => {
  const mountedWeaponData = getWeaponsOnMount(mount).map(weapon => getModdedWeaponData(weapon));
  const isEmpty = mountedWeaponData.length === 0;

  const bonusEffects = mount.bonus_effects.map(effectID => findCoreBonusData(effectID).name);

  return (
    <div className={`MechMount ${isEmpty ? 'empty' : ''}`}>
      { mountedWeaponData.map((weaponData, i) => {

        // GHOST BUG: if we log mount.slots[i], it'll print fine, but accessing its props crashes it.
        const weaponMod = mount.slots[i] ? mount.slots[i].weapon.mod : null;

        return (
          <MechWeapon
            mountType={i === 0 ? mount.mount_type : ''}
            bonusEffects={i === 0 ? bonusEffects : []}
            weaponData={weaponData}
            mod={weaponMod}
            onClick={() => setActiveWeaponIndex(i)}
            isActive={activeWeaponIndex === i}
            key={i}
          />
        )
      })}

      {mountedWeaponData.length === 0 &&
        <MechWeapon
          mountType={mount.mount_type}
          weaponData={null}
          onClick={() => {}}
          isActive={false}
        />
      }
    </div>
  )
}

const MechWeapon = ({
  mountType = '',
  bonusEffects = [],
  weaponData,
  mod,
  onClick,
  isActive,
}) => {

  var modData;
  if (mod) modData = findModData(mod.id);

  return (
    <button
      className={`MechWeapon ${isActive ? 'active' : ''}`}
      onClick={onClick}
      disabled={weaponData === null}
    >
      { mountType && <div className='mount-type'>{mountType}</div>}
      { bonusEffects.map((bonusEffect, i) =>
         <div className='bonus-effect' key={`bonus-effect-${i}`}>
          {bonusEffect}
        </div>
      )}

      { weaponData ?
        <div className="mech-weapon">
          <div className="name">{weaponData.name.toLowerCase()}</div>
          {modData && <div className='mod'>{modData.name}</div>}
        </div>
      :
        <div className={'i-have-no-weapon'}>(empty mount)</div>
      }
    </button>
  )
}


export default MechSheet;
