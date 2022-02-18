import React from 'react';
import DestroySystemButton from './DestroySystemButton.jsx'
import {
  findWeaponData,
  findSystemData,
  findCoreBonusData,
  findModData,
  findTalentData,
  findNpcFeatureData,
  baselineWeapons
} from '../lancerData.js';

import { deepCopy } from '../../../utils.js';

import './MechMount.scss';


function getModdedWeaponData(weapon) {
  if (!weapon) return null
  let weaponData

  // Baseline ram / improvise / grapple
  if (weapon.id.startsWith('act_')) {
    weaponData = deepCopy(baselineWeapons.find(baseline => baseline.id === weapon.id))

    // Modify RAM and IMPROVISED ATTACKS due to systems or talents
    if (weapon.mod) {
      if (weapon.id === 'act_ram' && weapon.mod === 'ms_siege_ram') {
        weaponData.damage = [{type: 'Kinetic', val: '2'}]
      }

      if (weapon.id === 'act_improvised_attack' && weapon.mod === 't_brawler') {
        weaponData.damage = [{type: 'Kinetic', val: '2d6+2'}]
        weaponData.on_hit = "Knockback 2."
      }
    }

  // NPC weapons
  } else if (weapon.id.startsWith('npcf_')) {
    let featureData = findNpcFeatureData(weapon.id)

    weaponData = deepCopy(featureData)

    // select the correct tier of damage
    // npcs only ever have one kind of damage
    weaponData.damage.forEach(damageObject => {
      damageObject.val = damageObject.damage[weapon.npcTier-1]
    });

    // Say what the effect will be ahead of time.
    weaponData.effect += weaponData.on_hit

  // Normal weapon
  } else {
    weaponData = deepCopy( findWeaponData(weapon.id) );

    // Now we actually MODIFY the weaponData to add any tags from mods.
    // Much easier than doing it dynamically later.
    if (weapon.mod) {
      const modData = findModData(weapon.mod.id)
      if (modData.added_tags) weaponData.tags = [...weaponData.tags, ...modData.added_tags]
    }
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

function isSystemTechAttack(systemData, onlyCheckInvade = false) {
  if (!systemData || !systemData.actions) return false


  let isTechAttack = false
  systemData.actions.forEach(action => {
    if (action.activation === 'Invade') isTechAttack = true
    if (
      !onlyCheckInvade &&
      ['Quick Tech', 'Full Tech'].includes(action.activation) &&
      action.detail.includes('ake a tech attack')
    ) { isTechAttack = true }
  })

  return isTechAttack
}

function isNpcFeatureTechAttack(featureData) {
  if (!featureData || !featureData.effect) return false
  return !!featureData.effect.indexOf('makes a tech attack')
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
  const mountType = invadeData.activation

  return (
    <div className='TechAttack'>
      <button
        className={`select-tech ${isActive ? 'active' : ''}`}
        onClick={onClick}
      >
        { mountType && <div className='mount-type'>{mountType}</div>}

        <div className="weapon-name-container">
          <div className="name">{invadeData.name.toLowerCase()}</div>
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
  isSystemTechAttack,
  isNpcFeatureTechAttack,
};
