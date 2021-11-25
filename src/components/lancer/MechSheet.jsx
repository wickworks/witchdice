import React, { useState, useEffect } from 'react';
import WeaponRoller from './WeaponRoller.jsx';
import { findWeaponData, getGrit } from './data.js';
import { getBonusDamageSourcesFromMech, getBonusDamageSourcesFromTalents } from './bonusDamageSourceUtils.js';

import './MechSheet.scss';



const MechSheet = ({
  activeMech,
  activePilot,
}) => {
  const [activeWeaponData, setActiveWeaponData] = useState(null);

  const loadout = activeMech.loadouts[0];
  const mounts = loadout.mounts;

  // =============== CHANGE MECH ==================
  useEffect(() => {
    setActiveWeaponData(null);
  }, [activeMech, activePilot]);

  // const bonusDamageSources = [
  //   {
  //     name: 'Tokugawa',
  //     diceString: '3',
  //     type: 'Energy',
  //     id: 'mf_tokugawa',
  //   },{
  //     name: 'Nuclear Cavalier',
  //     diceString: '1d6',
  //     type: 'Energy',
  //     id: 't_nuclear_cavalier',
  //   },{
  //     name: 'Nuclear Cavalier',
  //     diceString: '2',
  //     type: 'Heat',
  //     id: 't_nuclear_cavalier',
  //   }
  // ]

  const bonusDamageSources = [
    ...getBonusDamageSourcesFromMech(activeMech),
    ...getBonusDamageSourcesFromTalents(activePilot),
  ];


  // console.log('bonusDamageSources', bonusDamageSources);

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
  const weaponData = findWeaponData(activeWeaponID)

  return (
    <div className="MechWeapon" onClick={() => setActiveWeaponData(weaponData)}>
      <div className="name">{weaponData.name}</div>
    </div>
  )
}

export default MechSheet;
