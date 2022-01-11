import React from 'react';
import {
  findWeaponData,
  findSystemData,
  findCoreBonusData,
  findModData,
  findTalentData,
} from '../lancerData.js';

import { deepCopy } from '../../../utils.js';

import './MechMount.scss';


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

function getInvadeOptions(loadout, pilotTalents) {
  let invades = [];

  invades.push({
    "name": "Fragment Signal",
    "activation": "Invade",
    "detail": "IMPAIR and SLOW a character until the end of their next turn.",
  })

  loadout.systems.forEach(system => {
    const systemActions = findSystemData(system.id).actions
    if (systemActions && !system.destroyed) {
      systemActions.forEach(action => {
        if (action.activation === 'Invade') invades.push(action)
      })
    }
  })

  pilotTalents.forEach(pilotTalent => {
    const talentActions = findTalentData(pilotTalent.id).actions
    if (talentActions) {
      talentActions.forEach(action => {
        if (action.activation === 'Invade') invades.push(action)
      })
    }
  })

  return invades
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

const TechAttack = ({
  invadeData,
  onClick,
  isActive,
}) => {
  const mountType = 'Invade'

  return (
    <button
      className={`TechAttack tech ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      { mountType && <div className='mount-type'>{mountType}</div>}

      <div className="mech-weapon">
        <div className="name">{invadeData.name}</div>
      </div>
    </button>
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

export { MechMount, TechAttack, getModdedWeaponData, getWeaponsOnMount, getInvadeOptions, getMountsFromLoadout };
