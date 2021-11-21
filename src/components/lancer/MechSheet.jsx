import React, { useState } from 'react';
import WeaponRoller from './WeaponRoller.jsx';

import './MechSheet.scss';


const MechSheet = ({
  activeMech
}) => {
  const [activeWeapon, setActiveWeapon] = useState(null);

  const loadout = activeMech.loadouts[0];
  const mounts = loadout.mounts;

  return (
    <div className="MechSheet">
      <div className="mech-container">
        <h2>{activeMech.name}</h2>

        <div className="mounts-list">
          { mounts.map((mount, i) => {
            return (
              <Mount
                mount={mount}
                setActiveWeapon={setActiveWeapon}
                key={`mount-${i}`}
              />
            )
          })}
        </div>
      </div>

      {activeWeapon && <WeaponRoller weaponData={activeWeapon} /> }
    </div>
  )
}

const Mount = ({
  mount,
  setActiveWeapon,
}) => {
  const primaryWeapon = mount.slots[0];
  const secondaryWeapon = mount.extra[0];

  return (

    <div className="Mount">
      <h3>{mount.mount_type} Mount</h3>

      { primaryWeapon &&
        <Weapon
          mountSlot={primaryWeapon}
          setActiveWeapon={setActiveWeapon}
        />
      }
      { secondaryWeapon &&
        <Weapon
          mountSlot={secondaryWeapon}
          setActiveWeapon={setActiveWeapon}
        />
      }
    </div>
  )
}

const Weapon = ({
  mountSlot,
  setActiveWeapon
}) => {
  const weapon = mountSlot.weapon;

  return (
    <div className="Weapon" onClick={() => setActiveWeapon(weapon)}>
      <div className="name">{weapon.id}</div>
    </div>
  )
}

export default MechSheet;
