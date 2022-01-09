import React, { useState, useEffect } from 'react';
import WeaponRoller from './WeaponRoller/WeaponRoller.jsx';
import TechRoller from './WeaponRoller/TechRoller.jsx';
import MechState from './MechState/MechState.jsx';
import MechanicsList from './MechanicsList.jsx';
import { MechTraits, MechCoreSystem } from './MechTraits.jsx';
import {
  getGrit,
  findWeaponData,
  findFrameData,
  findSystemData,
  findCoreBonusData,
  findModData,
  findTalentData,
} from './lancerData.js';

import {
  getMechSP,
  getMechTechAttack,
} from './MechState/mechStateUtils.js';

import {
  getToHitBonusFromMech,
  getBonusDamageSourcesFromMech,
  getBonusDamageSourcesFromTalents,
  getBonusDamageSourcesFromMod,
  getBonusDamageSourcesFromCoreBonuses,
} from './bonusDamageSourceUtils.js';

import {
  getWeaponSynergies,
  getFailingWeaponSynergies,
} from './WeaponRoller/synergyUtils.js';

import { deepCopy } from '../../utils.js';

import './MechSheet.scss';

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
    if (systemActions) {
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

function getBonusDamageSources(activeMech, activePilot, activeMount, activeWeapon) {
  let bonusDamageSources = [
    ...getBonusDamageSourcesFromMech(activeMech),
    ...getBonusDamageSourcesFromCoreBonuses(activeMount),
    ...getBonusDamageSourcesFromMod(activeWeapon),
    ...getBonusDamageSourcesFromTalents(activePilot),
  ]

  // filter them out by synergy e.g. melee talents only apply to melee weapons
  if (activeWeapon) {
    bonusDamageSources = bonusDamageSources.filter(source => {
      const synergies = getWeaponSynergies(source.trait.synergies)
      const weaponData = findWeaponData(activeWeapon.id)
      const failingSynergies = getFailingWeaponSynergies(weaponData, synergies)

      // Only include sources without failing synergies
      return failingSynergies.length === 0;
    })
  }

  return bonusDamageSources
}

const MechSheet = ({
  activeMech,
  activePilot,
  updateMechState,

  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
}) => {
  const [activeMountIndex, setActiveMountIndex] = useState(null);
  const [activeWeaponIndex, setActiveWeaponIndex] = useState(0);

  const [activeInvadeIndex, setActiveInvadeIndex] = useState(null)

  // =============== CHANGE MECH / WEAPON ==================
  useEffect(() => {
    setActiveMountIndex(null);
    setActiveWeaponIndex(0);
  }, [
    (activeMech && activeMech.id),
    (activePilot && activePilot.id)]
  );

  const changeMountAndWeapon = (mountIndex, weaponIndex) => {
    setActiveMountIndex(mountIndex)
    setActiveWeaponIndex(weaponIndex)
    setActiveInvadeIndex(null)

    // the next attack roll will be a new entry in the summary
    newAttackSummary()
  }

  const activateInvade = (invadeIndex) => {
    setActiveMountIndex(null)
    setActiveWeaponIndex(0)
    setActiveInvadeIndex(invadeIndex)

    // the next attack roll will be a new entry in the summary
    newAttackSummary()
  }

  // =============== SUMMARY DATA ==================
  // inject the mech name to summary data before sending it up
  const setRollSummaryDataWithName = (rollSummaryData) => {
    rollSummaryData.characterName = activeMech.name
    // console.log('rollSummaryData', rollSummaryData)
    setRollSummaryData(rollSummaryData)
  }

  // the next attack roll will be a new entry in the summary
  const newAttackSummary = () => {
    setPartyLastAttackKey('')
    setPartyLastAttackTimestamp(0)
  }


  // =============== GET THE DATA FOR THE SHEET ==================

  const loadout = activeMech.loadouts[0];
  const mounts = getMountsFromLoadout(loadout);
  const invades = getInvadeOptions(loadout, activePilot.talents);

  const frameData = findFrameData(activeMech.frame);
  const gritBonus = getGrit(activePilot);

  const activeMount = mounts[activeMountIndex];
  const activeMountWeapons = getWeaponsOnMount(activeMount);
  const activeWeapon = activeMountWeapons && activeMountWeapons[activeWeaponIndex];
  const activeWeaponData = activeWeapon && getModdedWeaponData(activeWeapon)

  const bonusDamageSources = getBonusDamageSources(activeMech, activePilot, activeMount, activeWeapon);

  // Filter out any bonus damage sources

  const miscBonusToHit = getToHitBonusFromMech(activeMech);

  const activeInvadeData = invades[activeInvadeIndex]

  return (
    <div className="MechSheet">
      <div className="mech-container">

        {/*<div className="portrait asset ssc-watermark">
          <img src={activeMech.cloud_portrait} alt={'mech portrait'} />
        </div>*/}

        <h2>{activeMech.name}</h2>

        <div className='frame-container'>
          <div className={`asset ${frameData.source.toLowerCase()}`} />
          <div className='manufacturer'>

            {frameData.source}
          </div>
          <div className="frame">{frameData.name.toLowerCase()}</div>
        </div>

        <MechTraits traitList={frameData.traits} />

        <MechCoreSystem coreSystem={frameData.core_system} />

        <MechState
          activeMech={activeMech}
          activePilot={activePilot}
          frameData={frameData}
          updateMechState={updateMechState}
        />

        <MechanicsList
          label={`Systems (${getMechSP(activeMech, activePilot, frameData)} SP)`}
          findData={findSystemData}
          tooltipContentKey='effect'
          tooltipFlavorKey='description'
          tooltipHref='https://compcon.app/#/compendium/search?search=%TITLE'
          mechanicIDList={loadout.systems}
          containerClass={'systems'}
          namesToLowercase={false}
        />

        <a className='jumplink-anchor' id='weapons' />
        <div className="mounts-label">Mounts</div>

        <div className="mounts-list">
          { mounts.map((mount, i) =>
            <MechMount
              mount={mount}
              setActiveWeaponIndex={(weaponIndex) => changeMountAndWeapon(i, weaponIndex)}
              activeWeaponIndex={activeMountIndex === i ? activeWeaponIndex : -1}
              key={`mount-${i}`}
            />
          )}

          { invades.map((invade, i) =>
            <div className='MechMount tech' key={`invade-${i}`}>
              <TechAttack
                invadeData={invade}
                onClick={() => activateInvade(i)}
                isActive={activeInvadeIndex === i}
              />
            </div>
          )}
        </div>
      </div>

      {activeWeaponData &&
        <WeaponRoller
          activeMech={activeMech}
          activePilot={activePilot}
          weaponData={activeWeaponData}
          gritBonus={gritBonus+miscBonusToHit}
          availableBonusSources={bonusDamageSources}
          isPrimaryWeaponOnMount={activeWeaponIndex === 0}
          setRollSummaryData={setRollSummaryDataWithName}
          onClear={newAttackSummary}
        />
      }

      {activeInvadeData &&
        <TechRoller
          activeMech={activeMech}
          activePilot={activePilot}
          invadeData={activeInvadeData}
          techAttackBonus={getMechTechAttack(activeMech, activePilot, frameData)}
          sensorRange={frameData.stats.sensor_range}
          setRollSummaryData={setRollSummaryDataWithName}
          onClear={newAttackSummary}
        />
      }
    </div>
  )
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


export default MechSheet;
