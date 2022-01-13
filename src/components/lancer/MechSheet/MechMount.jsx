import React from 'react';
import DestroySystemButton from './DestroySystemButton.jsx'
import {
  findActionData,
  findWeaponData,
  findSystemData,
  findCoreBonusData,
  findModData,
  findTalentData,
} from '../lancerData.js';

import { deepCopy } from '../../../utils.js';

import './MechMount.scss';


function getModdedWeaponData(weapon) {
  // if we're asking for baseline weapon data, give that instead
  if (weapon.id.startsWith('act_')) {
    return baselineWeapons.find(baseline => baseline.id === weapon.id)
  }

  let weaponData = deepCopy( findWeaponData(weapon.id) );

  // now we actually MODIFY the weaponData to add any tags from mods. Much easier than doing it dynamically later.
  if (weapon.mod) {
    const modData = findModData(weapon.mod.id)
    if (modData.added_tags) weaponData.tags = [...weaponData.tags, ...modData.added_tags]
  }

  // Also mark it as, y'know, destroyed
  if (weapon.destroyed) weaponData.destroyed = true

  return weaponData;
}

function getWeaponsOnMount(mount) {
  if (!mount) return

  const weapons =
    [...mount.slots, ...mount.extra]
    // .slice(0,2) // in case there's leftover 'extra' data that shouldn't be there
    .map(slot => slot.weapon)
    .filter(weapon => weapon)

  return weapons;
}

function getMountsFromLoadout(loadout) {
  let mounts = [];

  // STANDARD MOUNTS
  mounts = loadout.mounts.map(mount =>
    ({...mount, source: 'mounts'})
  )

  // IMPROVED improved_armament
  if (loadout.improved_armament.slots.length > 0 && loadout.improved_armament.slots[0].weapon) {
    let improved_armament = deepCopy(loadout.improved_armament)
    improved_armament.bonus_effects.push('cb_improved_armament')
    improved_armament.source = 'improved_armament'
    mounts.push(improved_armament)
  }

  // give the integrated weapon a bonus_effect and source to make it clear where it came from
  if (loadout.integratedWeapon.slots.length > 0 && loadout.integratedWeapon.slots[0].weapon) {
    let integratedWeapon = deepCopy(loadout.integratedWeapon)
    integratedWeapon.bonus_effects = ['cb_integrated_weapon']
    integratedWeapon.source = 'integratedWeapon'
    mounts.push(integratedWeapon)
  }

  // gotta make a dummy mount for integrated mounts
  if (loadout.integratedMounts.length > 0) {
    const integratedMounts =
      loadout.integratedMounts.map(integratedMountWeapon => {
        return {
          mount_type: "Integrated",
          lock: false,
          slots: [ integratedMountWeapon ],
          extra: [],
          bonus_effects: [],
          source: 'integratedMounts'
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

const baselineWeapons = [
  {
    id: 'act_ram',
    name: 'Ram',
    mount: 'Quick Action',
    type: 'Melee',
    damage: [],
    range: [{type: 'Threat', val: '1'}],
    effect: findActionData('act_ram').detail,
  },
  {
    id: 'act_grapple',
    name: 'Grapple',
    mount: 'Quick Action',
    type: 'Melee',
    damage: [],
    range: [{type: 'Threat', val: '1'}],
    effect: findActionData('act_grapple').detail,
  },
  {
    id: 'act_improvised_attack',
    name: 'Improvised Attack',
    mount: 'Full Action',
    type: 'Melee',
    damage: [{type: 'Kinetic', val: '1d6'}],
    range: [{type: 'Threat', val: '1'}],
    effect: findActionData('act_improvised_attack').detail,
  }
]

const baselineMount = {
  mount_type: 'Baseline',
  slots: [
    {
      size: 'Quick Action',
      weapon: { id: 'act_ram' }
    },
    {
      size: 'Quick Action',
      weapon: { id: 'act_grapple' }
    },
    {
      size: 'Full Action',
      weapon: { id: 'act_improvised_attack' }
    }
  ],
  extra: [],
  bonus_effects: []
}


const MechMount = ({
  mount,
  setActiveWeaponIndex,
  activeWeaponIndex,

  setDestroyedForWeapon,
}) => {
  const mountedWeapons = getWeaponsOnMount(mount)
  const mountedWeaponData = mountedWeapons.map(weapon => getModdedWeaponData(weapon))
  const isEmpty = mountedWeaponData.length === 0
  const isBaseline = mount.mount_type === 'Baseline'
  const isDestructable = mount.source !== 'integratedMounts' && !isBaseline

  const bonusEffects = mount.bonus_effects.map(effectID => findCoreBonusData(effectID).name);

  return (
    <div className={`MechMount ${isEmpty ? 'empty' : ''} ${isBaseline ? 'baseline' : ''}`}>
      { mountedWeaponData.map((weaponData, i) => {

        // GHOST BUG: if we log mount.slots[i], it'll print fine, but accessing its props crashes it.
        const weaponMod = mount.slots[i] ? mount.slots[i].weapon.mod : null;

        return (
          <MechWeapon
            mountType={(i === 0 && !isBaseline) ? mount.mount_type : ''}
            bonusEffects={i === 0 ? bonusEffects : []}
            weaponData={weaponData}
            mod={weaponMod}
            onClick={() => setActiveWeaponIndex(i)}
            isActive={activeWeaponIndex === i}

            isDestructable={isDestructable}
            isDestroyed={mountedWeapons[i].destroyed}
            onDestroy={() => setDestroyedForWeapon(!mountedWeapons[i].destroyed, i)}
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
    <div className='TechAttack'>
      <button
        className={`select-tech ${isActive ? 'active' : ''}`}
        onClick={onClick}
      >
        { mountType && <div className='mount-type'>{mountType}</div>}

        <div className="weapon-name-container">
          <div className="name">{invadeData.name}</div>
        </div>
      </button>
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

  isDestructable,
  isDestroyed,
  onDestroy,
}) => {

  var modData;
  if (mod) modData = findModData(mod.id);

  return (
    <div className='MechWeapon'>
      {isDestructable && isActive &&
        <DestroySystemButton
          isDestroyed={isDestroyed}
          onDestroy={onDestroy}
        />
      }

      <button
        className={`select-weapon ${isActive ? 'active' : ''}`}
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
          <div className={`weapon-name-container ${isDestroyed ? 'destroyed' : ''}`}>
            <div className="name">{weaponData.name.toLowerCase()}</div>
            {isDestroyed && <div className='destroyed-text'>[ DESTROYED ]</div>}
            {modData && <div className='mod'>{modData.name}</div>}
          </div>
        :
          <div className={'i-have-no-weapon'}>(empty mount)</div>
        }
      </button>
    </div>
  )
}


export {
  MechMount,
  TechAttack,
  getModdedWeaponData,
  getWeaponsOnMount,
  getInvadeOptions,
  getMountsFromLoadout,
  baselineMount,
};
