import React, { useState } from 'react';
import WeaponRoller from './WeaponRoller.jsx';
import { allWeapons, getGrit } from './data.js';

import './MechSheet.scss';


const MechSheet = ({
  activeMech,
  activePilot,
}) => {
  const [activeWeaponData, setActiveWeaponData] = useState(null);

  const loadout = activeMech.loadouts[0];
  const mounts = loadout.mounts;

  const bonusDamageSources = [{
    name: 'Tokugawa',
    diceString: '3',
    type: 'Energy',
    tags: [],
  }]

  return (
    <div className="MechSheet">
      <div className="mech-container">
        <h2>{activeMech.name}</h2>

        <div className="mounts-list">
          { mounts.map((mount, i) =>
            <MechMount
              mount={mount}
              setActiveWeaponData={setActiveWeaponData}
              key={`mount-${i}`}
            />
          )}
        </div>
      </div>

      {activeWeaponData &&
        <WeaponRoller
          weaponData={activeWeaponData}
          gritBonus={getGrit(activePilot)}
          availableBonusSources={bonusDamageSources}
        />
      }
    </div>
  )
}

const MechMount = ({
  mount,
  setActiveWeaponData,
}) => {
  const slotList = [...mount.slots, ...mount.extra]

  return (

    <div className="MechMount">
      <h3>{mount.mount_type} Mount</h3>

      { slotList.map((slot, i) =>
        slot.weapon &&
          <MechWeapon
            mountSlot={slot}
            setActiveWeaponData={setActiveWeaponData}
            key={i}
          />
      )}
    </div>
  )
}

const MechWeapon = ({
  mountSlot,
  setActiveWeaponData
}) => {
  const activeWeaponData = mountSlot.weapon;
  const activeWeaponID = activeWeaponData ? activeWeaponData.id : 'missing_mechweapon'
  const weaponData = allWeapons.find(weapon => weapon.id === activeWeaponID);

  return (
    <div className="MechWeapon" onClick={() => setActiveWeaponData(weaponData)}>
      <div className="name">{weaponData.name}</div>
    </div>
  )
}

export default MechSheet;
