import React, { useState, useEffect } from 'react';
import WeaponRoller from './WeaponRoller/WeaponRoller.jsx';
import MechanicsList from './MechanicsList.jsx';
import {
  getGrit,
  findWeaponData,
  findFrameData,
  findSystemData,
  findCoreBonusData,
  findModData,
} from './lancerData.js';

import {
  getBonusDamageSourcesFromMech,
  getBonusDamageSourcesFromTalents,
  getBonusDamageSourcesFromMod,
  getToHitBonusFromMech,
} from './bonusDamageSourceUtils.js';

import { deepCopy } from '../../utils.js';

import './MechSheet.scss';

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

  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
}) => {
  // const [activeWeaponData, setActiveWeaponData] = useState(null);
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
  const activeWeaponData = activeWeapon && findWeaponData(activeWeapon.id)

  const bonusDamageSources = [
    ...getBonusDamageSourcesFromMech(activeMech),
    ...getBonusDamageSourcesFromTalents(activePilot),
    ...getBonusDamageSourcesFromMod(activeWeapon)
  ];

  const miscBonusToHit = getToHitBonusFromMech(activeMech);

  return (
    <div className="MechSheet">
      <div className="mech-container">

        <div className="portrait asset ssc-watermark">
          <img src={activeMech.cloud_portrait} alt={'mech portrait'} />
        </div>

        <h2>{activeMech.name}</h2>

        <div className='frame-container'>
          <div className={`asset ${frameData.source.toLowerCase()}`} />
          <div className='manufacturer'>

            {frameData.source}
          </div>
          <div className="frame">{frameData.name.toLowerCase()}</div>
        </div>

        <MechanicsList
          label='Systems'
          findData={findSystemData}
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
  const mountedWeaponData = getWeaponsOnMount(mount).map(weapon => findWeaponData(weapon.id));
  const isEmpty = mountedWeaponData.length === 0;

  const bonusEffects = mount.bonus_effects.map(effectID => findCoreBonusData(effectID).name);

  return (
    <div className={`MechMount ${isEmpty ? 'empty' : ''}`}>
      { mountedWeaponData.map((weaponData, i) =>
        <MechWeapon
          mountType={i === 0 ? mount.mount_type : ''}
          bonusEffects={i === 0 ? bonusEffects : []}
          weaponData={weaponData}
          mod={mount.slots[i].weapon.mod}
          onClick={() => setActiveWeaponIndex(i)}
          isActive={activeWeaponIndex === i}
          key={i}
        />
      )}

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
