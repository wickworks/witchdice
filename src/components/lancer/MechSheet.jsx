import React, { useState, useEffect } from 'react';
import WeaponRoller from './WeaponRoller.jsx';
import { findWeaponData, getGrit, findFrameData } from './data.js';

import { getBonusDamageSourcesFromMech, getBonusDamageSourcesFromTalents } from './bonusDamageSourceUtils.js';

import './MechSheet.scss';

function getWeaponsOnMount(mountData) {
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
}) => {
  // const [activeWeaponData, setActiveWeaponData] = useState(null);
  const [activeMount, setActiveMount] = useState(null);

  const loadout = activeMech.loadouts[0];
  const mounts = loadout.mounts;

  const frameData = findFrameData(activeMech.frame);

  const gritBonus = getGrit(activePilot);

  const bonusDamageSources = [
    ...getBonusDamageSourcesFromMech(activeMech),
    ...getBonusDamageSourcesFromTalents(activePilot),
  ];

  // =============== CHANGE MECH ==================
  useEffect(() => {
    setActiveMount(null);
  }, [activeMech, activePilot]);

  // console.log('bonusDamageSources', bonusDamageSources);

  return (
    <div className="MechSheet">
      <div className="mech-container">
        <h2>{activeMech.name}</h2>

        <div className='frame-container'>
          <div className={`asset-lancer ${frameData.source.toLowerCase()}`} />
          <div className='manufacturer'>

            {frameData.source}
          </div>
          <div className="frame">{frameData.name.toLowerCase()}</div>
        </div>


        <div className="mounts-label">Mounts</div>

        <div className="mounts-list">
          { mounts.map((mount, i) =>
            <MechMount
              mount={mount}
              activateMount={() => setActiveMount(i)}
              isActive={activeMount === i}
              key={`mount-${i}`}
            />
          )}
        </div>
      </div>

      {activeMount !== null &&
        getWeaponsOnMount(mounts[activeMount]).map((weaponData, i) =>
          <WeaponRoller
            weaponData={weaponData}
            gritBonus={gritBonus}
            availableBonusSources={bonusDamageSources}
            isPrimaryWeaponOnMount={i === 0}
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
