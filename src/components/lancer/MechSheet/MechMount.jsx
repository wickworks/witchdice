import React from 'react';
import { DestroySystemButton, BroadcastSystemButton } from './DestroySystemButton.jsx'
import {
  findCoreBonusData,
  findModData,
  getSystemLimited,
  hasTag,
  getTagName,
  getModdedWeaponData,
} from '../lancerData.js';

import {
  getAllWeaponProfiles,
  getMountName,
} from '../WeaponRoller/weaponRollerUtils.js';

import { capitalize } from '../../../utils.js';
import { getBroadcastObjectForTrait } from './TraitBlock.jsx';
import { getRechargeStatusString } from './RechargeBar.jsx';

import './MechMount.scss';

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
  return featureData.effect.toLowerCase().indexOf('makes a tech attack') >= 0
}

function getBroadcastObjectForWeapon(weaponData, bonusEffects, modData, flavorName = null) {
  const mountString = [
    getMountName(weaponData),
    bonusEffects && bonusEffects.map(effect => capitalize(effect, true)),
    modData && `(${modData.name})`,
  ].flat().filter(str => str).join(' | ')

  const statString = getAllWeaponProfiles(weaponData)
    .map(profile => {
      let profileName =
        profile.profileName &&
        `— ${profile.profileName} —`

      let damage =
        profile.damage &&
        profile.damage.map(damage => `${damage.val} ${damage.type}`).join(' + ')
      if (damage) damage = `[ ${damage} ]`

      let range =
        profile.range &&
        profile.range.map(range => `${range.val} ${range.type}`).join(', ')
      if (range) range = `[ ${range} ]`

      let tags =
        profile.tags &&
        profile.tags.map(tagID => getTagName(tagID, true)).join(', ')

      return [
        profileName,
        [damage,range].join(' '),
        tags,
      ]
    }).flat().filter(str => str).join('<br>')

  const effectString = [
    weaponData.effect,
    weaponData.on_attack && `On attack: ${weaponData.on_attack}`,
  ].filter(str => str).join('<br>')

  const actionString =
    weaponData.actions &&
    weaponData.actions.map(action => {
      const actionBroadcast = getBroadcastObjectForTrait(action)
      return `${actionBroadcast.title}: ${actionBroadcast.message}`
    })

  return {
    type: 'text',
		title: (flavorName || weaponData.name).toUpperCase(),
		message: [
      mountString,
      statString,
      effectString,
      actionString
    ].filter(str => str).join('<br>')
  }
}

function getBroadcastObjectForTechAttack(invadeData, techAttackBonus, sensorRange) {

  let statString = `[ Tech Attack ${techAttackBonus > 0 ? '+' : ''}${techAttackBonus} ]`
  statString += ` [ Sensors ${sensorRange} ]`
  if (invadeData.activation === 'Invade') statString += ' [ 2 Heat ] '

  return {
    type: 'text',
		title: invadeData.name.toUpperCase(),
		message: [
      invadeData.activation,
      statString,
      invadeData.detail
    ].join('<br>')
  }
}

const MechMount = ({
  mount,
  limitedBonus,
  setActiveWeaponIndex,
  activeWeaponIndex,
  setDestroyedForWeapon,
  setRollSummaryData,
}) => {
  const mountedWeapons = getWeaponsOnMount(mount)

  // Short arrays of each weapon and its data.
  const mountedWeaponData = mountedWeapons.map(weapon => [weapon, getModdedWeaponData(weapon)])

  const isEmpty = mountedWeaponData.length === 0
  const isBaseline = mount.mount_type === 'Baseline'
  const isDestructable = mount.source !== 'integratedMounts' && !isBaseline
  const bonusEffects = mount.bonus_effects.map(effectID => findCoreBonusData(effectID).name);


  // it's cleanest to just skip rendering empty mounts
  return (mountedWeaponData.length > 0 ?
    <div className={`MechMount ${isEmpty ? 'empty' : ''} ${isBaseline ? 'baseline' : ''}`}>
      { mountedWeaponData.map(([weapon, weaponData], i) => {
        const allWeaponProfiles = getAllWeaponProfiles(weaponData)
        const weaponProfileData = allWeaponProfiles[0]
        const limited = getSystemLimited(weapon, weaponProfileData, limitedBonus)
        const isLoaded = hasTag(weaponProfileData, 'tg_loading') ? weapon.loaded : null

        // GHOST BUG: if we log mount.slots[i], it'll print fine, but accessing its props crashes it.
        const weaponMod = mount.slots[i] ? mount.slots[i].weapon.mod : null;

        return (
          <MechWeapon
            mountType={(i === 0 && !isBaseline) ? getMountName(weaponData) : ''}
            bonusEffects={i === 0 ? bonusEffects : []}
            weaponData={weaponData}
            flavorName={weapon.flavorName}
            mod={weaponMod}
            onClick={() => setActiveWeaponIndex(i)}
            isActive={activeWeaponIndex === i}

            isLoaded={isLoaded}
            limited={limited}
            isDestructable={isDestructable}
            isDestroyed={mountedWeapons[i].destroyed}
            onDestroy={() => setDestroyedForWeapon(!mountedWeapons[i].destroyed, i)}
            setRollSummaryData={setRollSummaryData}
            key={i}
          />
        )
      })}

      { mountedWeaponData.length === 0 &&
        <MechWeapon
          mountType={mount.mount_type}
          isActive={false}
        />
      }
    </div>
  :
    <></>
  )
}

const TechAttack = ({
  invadeData,
  techAttackBonus,
  sensorRange,

  onClick,
  isActive,
  setRollSummaryData,
}) => {
  const mountType = invadeData.activation
  const recharge = invadeData.recharge

  return (
    <div className='TechAttack'>
      { isActive &&
        <div className='sidebar-buttons'>
          { setRollSummaryData &&
            <BroadcastSystemButton onBroadcast={() =>
              setRollSummaryData(getBroadcastObjectForTechAttack(invadeData, techAttackBonus, sensorRange))}
            />
          }
        </div>
      }

      <button
        className={`select-tech ${isActive ? 'active' : ''}`}
        onClick={onClick}
      >
        { mountType && <div className='mount-type'>{mountType}</div>}

        <div className="weapon-name-container">
          <div className="name">{invadeData.name.toLowerCase()}</div>
          {recharge &&
            <div className='mod'>{getRechargeStatusString(recharge)}</div>
          }
        </div>
      </button>
    </div>
  )
}


const MechWeapon = ({
  mountType = '',
  bonusEffects = [],
  weaponData = null,
  flavorName = null,
  mod = null,
  onClick = () => {},
  isActive,

  isLoaded = null,
  limited = null,
  isDestructable,
  isDestroyed,
  onDestroy,
  setRollSummaryData,
}) => {

  var modData;
  if (mod) modData = findModData(mod.id);
  return (
    <div className='MechWeapon'>

      { isActive &&
        <div className='sidebar-buttons'>
          { isDestructable &&
            <DestroySystemButton
              isDestroyed={isDestroyed}
              onDestroy={onDestroy}
            />
          }
          { setRollSummaryData &&
            <BroadcastSystemButton onBroadcast={() =>
              setRollSummaryData(getBroadcastObjectForWeapon(weaponData, bonusEffects, modData, flavorName))}
            />
          }
        </div>
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
            <div className="name">{(flavorName || weaponData.name).toLowerCase()}</div>
            {isDestroyed && <div className='destroyed-text'>[ DESTROYED ]</div>}
            {modData && <div className='mod'>{modData.name}</div>}
            {limited && <div className='mod'>Limited {limited.current}/{limited.max}</div>}
            {isLoaded !== null && <div className='mod'>Loading {isLoaded ? '1' : '0'}/1</div>}
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
  getWeaponsOnMount,
  isSystemTechAttack,
  isNpcFeatureTechAttack,
};
