import React, { useState, useEffect } from 'react';
import { MechTraits, MechSystemActions } from './MechTraits.jsx';
import MechState from '../MechState/MechState.jsx';
import ConditionsAndCounters from '../MechState/ConditionsAndCounters.jsx';
import WeaponRoller from '../WeaponRoller/WeaponRoller.jsx';
import TechRoller from '../WeaponRoller/TechRoller.jsx';
import {
  getGrit,
  findWeaponData,
  findFrameData,
  baselineMount,
} from '../lancerData.js';

import { deepCopy } from '../../../utils.js';

import {
  getMechTechAttack,
} from '../MechState/mechStateUtils.js';

import {
  getMountsFromLoadout,
  getInvadeAndTechAttacks,
  getWeaponsOnMount,
  getModdedWeaponData,
  TechAttack,
  MechMount
} from './MechMount.jsx';

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
} from '../WeaponRoller/synergyUtils.js';

import './MechSheet.scss';

function getBonusDamageSources(activeMech, activePilot, activeMount, activeWeapon) {
  let bonusDamageSources = [
    ...getBonusDamageSourcesFromMech(activeMech),
    ...getBonusDamageSourcesFromCoreBonuses(activeMount),
    ...getBonusDamageSourcesFromMod(activeWeapon),
    ...getBonusDamageSourcesFromTalents(activePilot),
  ]

  // filter them out by synergy e.g. melee talents only apply to melee weapons
  if (activeWeapon) {
    const weaponData = getModdedWeaponData(activeWeapon)

    bonusDamageSources = bonusDamageSources.filter(source => {
      const synergies = getWeaponSynergies(source.trait.synergies)
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
  const filteredMechID = (activeMech && activeMech.id)
  const filteredPilotID = (activePilot && activePilot.id)
  useEffect(() => {
    setActiveMountIndex(null);
    setActiveWeaponIndex(0);
  }, [filteredMechID,filteredPilotID]);

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

  function getActiveWeaponData(weapon) {
    if (!weapon) return null

    let weaponData = getModdedWeaponData(activeWeapon)

    // Special case: modify RAM and IMPROVISED ATTACKS due to systems or talents
    if (weapon.id === 'act_ram' && loadout.systems.find(system => system.id === 'ms_siege_ram')) {
      weaponData = deepCopy(weaponData) // don't modify the original
      weaponData.damage = [{type: 'Kinetic', val: '2'}]
    }
    if (weapon.id === 'act_improvised_attack' && activePilot.talents.find(talent => (talent.id === 't_brawler' && talent.rank >= 2))) {
      weaponData = deepCopy(weaponData) // don't modify the original
      weaponData.damage = [{type: 'Kinetic', val: '2d6+2'}]
      weaponData.on_hit = "Knockback 2."
    }

    return weaponData
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
  const mounts = [...getMountsFromLoadout(loadout), baselineMount];
  const invades = getInvadeAndTechAttacks(loadout, activePilot.talents);

  const frameData = findFrameData(activeMech.frame);
  const gritBonus = getGrit(activePilot);

  const activeMount = mounts[activeMountIndex];
  const activeMountWeapons = getWeaponsOnMount(activeMount);
  const activeWeapon = activeMountWeapons && activeMountWeapons[activeWeaponIndex];
  const activeWeaponData = getActiveWeaponData(activeWeapon)

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

        <MechTraits traitList={frameData.traits} coreSystem={frameData.core_system} />

        <MechState
          activeMech={activeMech}
          activePilot={activePilot}
          frameData={frameData}
          updateMechState={updateMechState}
        />

        <ConditionsAndCounters
          activeMech={activeMech}
          activePilot={activePilot}
          updateMechState={updateMechState}
        />

        <MechSystemActions
          systems={loadout.systems}
          setLimitedCountForSystem={(count, systemIndex) =>
            updateMechState({
              systemUses: {index: systemIndex, uses: count}
            })
          }
          setDestroyedForSystem={(destroyed, systemIndex) =>
            updateMechState({
              systemDestroyed: {index: systemIndex, destroyed: destroyed}
            })
          }
        />

        <div className='jumplink-anchor' id='weapons' />
        <div className="mounts-label">Mounts & Attacks</div>

        <div className="mounts-list">
          { mounts.map((mount, i) =>
            <MechMount
              key={`mount-${i}`}
              mount={mount}
              setActiveWeaponIndex={(weaponIndex) => changeMountAndWeapon(i, weaponIndex)}
              activeWeaponIndex={activeMountIndex === i ? activeWeaponIndex : -1}
              setDestroyedForWeapon={(destroyed, weaponIndex) =>
                updateMechState({
                  weaponDestroyed: {
                    mountSource: mount.source,
                    mountIndex: i,
                    weaponIndex: weaponIndex,
                    destroyed: destroyed
                  }
                })
              }
            />
          )}

          { invades.map((invade, i) =>
            <TechAttack
              key={`invade-${i}`}
              invadeData={invade}
              onClick={() => activateInvade(i)}
              isActive={activeInvadeIndex === i}
            />
          )}
        </div>
      </div>

      {activeWeaponData && !activeWeaponData.destroyed &&
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

export default MechSheet;