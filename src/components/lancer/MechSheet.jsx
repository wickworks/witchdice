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
        />
      }
    </div>
  )
}

const MechMount = ({
  mount,
  setActiveWeaponData,
}) => {
  const primaryWeapon = mount.slots[0];
  const secondaryWeapon = mount.extra[0];

  return (

    <div className="MechMount">
      <h3>{mount.mount_type} Mount</h3>

      { primaryWeapon &&
        <MechWeapon
          mountSlot={primaryWeapon}
          setActiveWeaponData={setActiveWeaponData}
        />
      }
      { secondaryWeapon &&
        <MechWeapon
          mountSlot={secondaryWeapon}
          setActiveWeaponData={setActiveWeaponData}
        />
      }
    </div>
  )
}

const MechWeapon = ({
  mountSlot,
  setActiveWeaponData
}) => {
  const activeWeaponData = mountSlot.weapon;
  const weaponData = allWeapons.find(weapon => weapon.id === activeWeaponData.id);

  return (
    <div className="MechWeapon" onClick={() => setActiveWeaponData(weaponData)}>
      <div className="name">{weaponData.name}</div>
    </div>
  )
}

export default MechSheet;
