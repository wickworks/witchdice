import React, { useState, useEffect } from 'react';
import WeaponRoller from './WeaponRoller/WeaponRoller.jsx';
import MechanicsList from './MechanicsList.jsx';
import { findWeaponData, getGrit, findFrameData, findSystemData } from './lancerData.js';

import { getBonusDamageSourcesFromMech, getBonusDamageSourcesFromTalents } from './bonusDamageSourceUtils.js';

import './MechSheet.scss';

function getWeaponsOnMount(mountData) {
  if (!mountData) return

  const weapons =
    [...mountData.slots, ...mountData.extra]
    .map(slot => slot.weapon)
    .filter(weapon => weapon)
    .map(weapon => findWeaponData(weapon.id))
    .filter(weaponData => weaponData);

  return weapons;
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

  // =============== CHANGE MECH ==================
  useEffect(() => {
    setActiveMountIndex(null);
  }, [activeMech, activePilot]);

  // =============== MECH AND MOUNT MAGANGEMENT ==================
  const loadout = activeMech.loadouts[0];
  const mounts = [...loadout.mounts];
  if (loadout.improved_armament.slots.weapon) mounts.push(loadout.improved_armament);
  if (loadout.integratedWeapon.slots.weapon) mounts.push(loadout.integratedWeapon);

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

  const frameData = findFrameData(activeMech.frame);

  const gritBonus = getGrit(activePilot);

  const bonusDamageSources = [
    ...getBonusDamageSourcesFromMech(activeMech),
    ...getBonusDamageSourcesFromTalents(activePilot),
  ];

  const changeMount = (newIndex) => {
    setActiveMountIndex(newIndex)

    // the next attack roll will be a new entry in the summary
    setPartyLastAttackKey('')
    setPartyLastAttackTimestamp(0)
  }

  // =============== SUMMARY DATA ==================

  // inject the mech name to summary data before sending it up
  const setRollSummaryDataWithName = (rollSummaryData) => {
    rollSummaryData.characterName = activeMech.name
    console.log('rollSummaryData', rollSummaryData)
    setRollSummaryData(rollSummaryData)
  }

  // console.log('bonusDamageSources', bonusDamageSources);
  // console.log('mounts',mounts);

  return (
    <div className="MechSheet">
      <div className="mech-container">

        <img className='portrait asset ssc-watermark' src={activeMech.cloud_portrait} alt={'mech portrait'} />

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
              activateMount={() => changeMount(i)}
              isActive={activeMountIndex === i}
              key={`mount-${i}`}
            />
          )}
        </div>
      </div>

      {mounts[activeMountIndex] &&
        getWeaponsOnMount(mounts[activeMountIndex]).map((weaponData, i) =>
          <WeaponRoller
            weaponData={weaponData}
            gritBonus={gritBonus}
            availableBonusSources={bonusDamageSources}
            isPrimaryWeaponOnMount={i === 0}
            setRollSummaryData={setRollSummaryDataWithName}
            key={`${weaponData.id}-${i}`}
          />
        )
      }
    </div>
  )
}

const MechMount = ({
  mount,
  activateMount,
  isActive,
}) => {
  const mountedWeapons = getWeaponsOnMount(mount);

  const isEmpty = mountedWeapons.length === 0;

  return (
    <button
      className={`MechMount ${isActive ? 'active' : ''} ${isEmpty ? 'empty' : ''}`}
      onClick={activateMount}
      disabled={mountedWeapons.length === 0}
    >
      <div className='mount-type'>{mount.mount_type}</div>

      <div className='weapons-container'>
        { mountedWeapons.map((weaponData, i) =>
          <div className="mech-weapon" key={i}>
            <div className="name">{weaponData.name.toLowerCase()}</div>
          </div>
        )}

        {isEmpty &&
          <div className={'i-have-no-weapon'}>(empty mount)</div>
        }
      </div>
    </button>
  )
}

export default MechSheet;
