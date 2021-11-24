import React, { useState, useEffect } from 'react';
import WeaponRoller from './WeaponRoller.jsx';
import { findWeaponData, findFrameData, getGrit } from './data.js';

import './MechSheet.scss';


function newBonusDamageSource(name, id, diceString, type = '', traitData = null) {
  return {
    name: name,
    id: id,
    diceString: diceString,
    type: type,
    trait: traitData,
  }
}

function findTraitFromFrame(frame, traitName) {
  const traitData = frame.traits.find(trait => trait.name === traitName);
  return traitData || null;
}

function newBonusDamageSourceFromFrame(frame, diceString, type = '', traitName = '') {
  return newBonusDamageSource(frame.name, frame.id, diceString, type, findTraitFromFrame(frame, traitName))
}

function getBonusDamageSourcesFromMech(mech) {
  var sources = [];

  const frame = findFrameData(mech.frame);
  if (!frame) return sources;

  console.log('frame',frame);

  switch (frame.id) {
    case 'mf_nelson':
      sources.push( newBonusDamageSourceFromFrame(frame, '1d6', '', 'Momentum') )
      break;

    case 'mf_deaths_head':
      sources.push( newBonusDamageSource('Mark for Death - Aux', 'mf_deaths_head_aux', '1d6', '') )
      sources.push( newBonusDamageSource('Mark for Death - Main', 'mf_deaths_head_main', '2d6', '') )
      sources.push( newBonusDamageSource('Mark for Death - Heavy', 'mf_deaths_head_heavy', '3d6', '') )
      break;

    case 'mf_mourning_cloak':
      sources.push( newBonusDamageSourceFromFrame(frame, '1d6', '', 'Hunter') )
      break;

    case 'mf_tokugawa':
      sources.push( newBonusDamageSourceFromFrame(frame, '3', 'Energy', 'Limit Break') )
      sources.push( newBonusDamageSource('Plasma Sheath', 'mf_tokugawa_dz', '', 'Burn', findTraitFromFrame(frame, 'Plasma Sheath')) )
      break;
  }

  return sources;
}


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

  const bonusDamageSources = getBonusDamageSourcesFromMech(activeMech);

  console.log('bonusDamageSources', bonusDamageSources);

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
