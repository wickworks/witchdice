import React, { useState, useEffect } from 'react';
import MechTraits from './MechTraits.jsx';
import StatBroadcast from './StatBroadcast.jsx';
import MechState from '../MechState/MechState.jsx';
import ConditionsAndCounters from '../MechState/ConditionsAndCounters.jsx';
import WeaponRoller from '../WeaponRoller/WeaponRoller.jsx';
import TechRoller from '../WeaponRoller/TechRoller.jsx';

import {
  getWeaponsOnMount,
  TechAttack,
  MechMount
} from './MechMount.jsx';

import {
  getSystemLimited,
  getAllWeaponRanges,
  getModdedWeaponData,
  findModData,
} from '../lancerData.js';

import {
  getAvailableBonusDamageSources,
} from '../WeaponRoller/bonusDamageSourceUtils.js';

import './MechSheet.scss';


const MechSheet = ({
  // activeMech,
  // activePilot,

  robotState,
  robotStats,
  robotInfo,
  robotLoadout,
  updateMechState,

  accuracyAndDamageSourceInputs,

  setPartyLastAttackKey,
  setPartyLastAttackTimestamp,
  setRollSummaryData,
  setDistantDicebagData,
}) => {
  const [activeMountIndex, setActiveMountIndex] = useState(null);
  const [activeWeaponIndex, setActiveWeaponIndex] = useState(0);

  const [activeInvadeIndex, setActiveInvadeIndex] = useState(null)

  // =============== CHANGE MECH / WEAPON ==================
  useEffect(() => {
    setActiveMountIndex(null);
    setActiveWeaponIndex(0);
  }, [robotInfo.id]);

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
  const setRollSummaryDataWithName = (rollSummaryData, forceNewEntry = false) => {
    rollSummaryData.characterName = robotInfo.name
    rollSummaryData.forceNewEntry = forceNewEntry
    setRollSummaryData(rollSummaryData)
  }

  // the next attack roll will be a new entry in the summary
  const newAttackSummary = () => {
    setPartyLastAttackKey('')
    setPartyLastAttackTimestamp(0)
  }


  // functions to update mech system states
  const setLimitedCountForSystem = (count, systemIndex) => {
    updateMechState({
      systemUses: {index: systemIndex, uses: count}
    })
  }
  const setDestroyedForSystem = (destroyed, systemIndex) => {
    updateMechState({
      systemDestroyed: {index: systemIndex, destroyed: destroyed}
    })
  }
  const setRechargedForSystem = (charged, systemIndex) => {
    updateMechState({
      systemCharged: {index: systemIndex, charged: charged}
    })
  }

  const setPerRoundCount = (source, uses) => {
    updateMechState({
      systemPerRoundCount: {source: source, uses: uses}
    })
  }

  const resetPerRoundCounts = () => updateMechState({resetPerRoundCounts: true})

  // =============== GET THE DATA FOR THE SHEET ==================
  const activeMount = robotLoadout.mounts[activeMountIndex];
  const activeMountWeapons = getWeaponsOnMount(activeMount);
  const activeWeapon = activeMountWeapons && activeMountWeapons[activeWeaponIndex];

  const activeWeaponData = getModdedWeaponData(activeWeapon)
  const activeInvadeData = robotLoadout.invades[activeInvadeIndex]

  const weaponLimited = activeWeaponData ? getSystemLimited(activeWeapon, activeWeaponData, robotStats.limitedBonus) : null
  const modLimited = activeWeaponData && activeWeapon.mod ? getSystemLimited(activeWeapon.mod, findModData(activeWeapon.mod.id), robotStats.limitedBonus) : null

  const bonusDamageSources = getAvailableBonusDamageSources(accuracyAndDamageSourceInputs, activeMount, activeWeapon, activeInvadeData);

  // console.log('activeWeapon',activeWeapon);

  let totalAttackBonus = robotStats.attackBonus

  if (robotStats.attackBonusRanged) {
    const weaponRanges = getAllWeaponRanges(activeWeaponData)
    const isActiveWeaponRanged = weaponRanges.some(range => (range.type !== 'Threat'))
    if (isActiveWeaponRanged) totalAttackBonus += robotStats.attackBonusRanged
  }
  if (activeWeapon && activeWeapon.npcAttackBonus) totalAttackBonus += activeWeapon.npcAttackBonus

  // I try not to discriminate, but in some cases it's convenient to.
  const looksLikeAnNPC = robotState.coreEnergy < 0

  return (
    <div className="MechSheet">
      <div className="mech-container">

        {/*<div className="portrait asset ssc-watermark">
          <img src={activeMech.cloud_portrait} alt={'mech portrait'} />
        </div>*/}

        <h2>{robotInfo.name}</h2>

        <div className='frame-and-stat-broadcast'>
          <div className='frame-container'>
            <div className={`asset ${robotInfo.frameSourceIcon}`} />
            <div className='manufacturer'>{robotInfo.frameSourceText}</div>
            <div className="frame">{robotInfo.frameName}</div>
          </div>

          { looksLikeAnNPC &&
            <StatBroadcast
              robotInfo={robotInfo}
              robotStats={robotStats}
              robotState={robotState}
              onBroadcast={(summaryData) => setRollSummaryDataWithName(summaryData, true)}
              key={robotInfo.id}
            />
          }
        </div>


        <MechState
          robotState={robotState}
          robotStats={robotStats}
          robotInfo={robotInfo}
          updateMechState={updateMechState}
          setDistantDicebagData={setDistantDicebagData}
          setRollSummaryData={(summaryData) => setRollSummaryDataWithName(summaryData, true)}
        />

        <ConditionsAndCounters
          activeConditions={robotState.conditions}
          activeCounters={robotState.counters}
          updateMechState={updateMechState}
          setRollSummaryData={(summaryData) => setRollSummaryDataWithName(summaryData, true)}
        />

        { robotInfo.hasMultipleLoadouts &&
          <p className='multiple-loadouts-warning'> WARNING: multiple mech loadouts detected; Witchdice only supports the first one created.</p>
        }

        { robotLoadout.pilotTraits.length > 0 &&
          <MechTraits
            sectionTitle='Pilot Traits'
            frameTraits={robotLoadout.pilotTraits}
            setRollSummaryData={(summaryData) => setRollSummaryDataWithName(summaryData, true)}
            setPerRoundCount={setPerRoundCount}
            showResetPerRoundCounts={true}
            resetPerRoundCounts={resetPerRoundCounts}
          />
        }

        {/* Frame Traits & Core Systems -- not destructable! */}
        { robotLoadout.frameTraits.length > 0 &&
          <MechTraits
            sectionTitle='Frame Traits'
            frameTraits={robotLoadout.frameTraits}
            setRollSummaryData={(summaryData) => setRollSummaryDataWithName(summaryData, true)}
            setLimitedCountForSystem={setLimitedCountForSystem}
            setRechargedForSystem={setRechargedForSystem}
            setPerRoundCount={setPerRoundCount}
            showResetPerRoundCounts={robotLoadout.pilotTraits.length === 0}
            resetPerRoundCounts={resetPerRoundCounts}
          />
        }

        { robotLoadout.systems.length > 0 &&
          <MechTraits
            sectionTitle='Systems'
            frameTraits={robotLoadout.systems}
            setRollSummaryData={(summaryData) => setRollSummaryDataWithName(summaryData, true)}
            setLimitedCountForSystem={setLimitedCountForSystem}
            setDestroyedForSystem={setDestroyedForSystem}
            setRechargedForSystem={setRechargedForSystem}
            setPerRoundCount={setPerRoundCount}
          />
        }

        <div className='jumplink-anchor' id='weapons' />
        <div className="mounts-label">Mounts & Attacks</div>

        <div className="mounts-list">
          { robotLoadout.mounts.map((mount, i) =>
            <MechMount
              key={`${robotInfo.name}-mount-${i}`}
              mount={mount}
              limitedBonus={robotStats.limitedBonus}
              setActiveWeaponIndex={(weaponIndex) => changeMountAndWeapon(i, weaponIndex)}
              activeWeaponIndex={activeMountIndex === i ? activeWeaponIndex : -1}
              setDestroyedForWeapon={(destroyed, weaponIndex) =>
                updateMechState({
                  weaponDestroyed: {
                    mountSource: mount.source,
                    mountIndex: mount.index,
                    weaponIndex: weaponIndex,
                    destroyed: destroyed
                  }
                })
              }
              setRollSummaryData={setRollSummaryDataWithName}
            />
          )}

          { robotLoadout.invades.map((invade, i) =>
            <TechAttack
              key={`invade-${i}`}
              invadeData={invade}
              techAttackBonus={robotStats.techAttackBonus}
              sensorRange={robotStats.sensorRange}
              onClick={() => activateInvade(i)}
              isActive={activeInvadeIndex === i}
              setRollSummaryData={setRollSummaryDataWithName}
            />
          )}
        </div>
      </div>

      {activeWeaponData && !activeWeaponData.destroyed &&
        <WeaponRoller
          weaponData={activeWeaponData}
          weaponMod={activeWeapon.mod}
          weaponNpcAccuracy={activeWeapon.npcAccuracyBonus}
          flavorName={activeWeapon.flavorName}
          flavorNote={activeWeapon.note}
          mountBonusEffects={activeMount.bonus_effects}
          gritBonus={totalAttackBonus}
          allRangeSynergies={robotStats.rangeSynergies}
          weaponLimited={weaponLimited}
          setLimitedCount={(count) =>
            updateMechState({
              weaponUses: {
                mountSource: activeMount.source,
                mountIndex: activeMount.index,
                weaponIndex: activeWeaponIndex,
                uses: count
              }
            })
          }
          modLimited={modLimited}
          setModLimitedCount={(count) =>
            updateMechState({
              weaponModUses: {
                mountSource: activeMount.source,
                mountIndex: activeMount.index,
                weaponIndex: activeWeaponIndex,
                modUses: count
              }
            })
          }
          isLoaded={activeWeapon.loaded}
          setIsLoaded={(isLoaded) =>
            updateMechState({
              weaponLoaded: {
                mountSource: activeMount.source,
                mountIndex: activeMount.index,
                weaponIndex: activeWeaponIndex,
                loaded: isLoaded
              }
            })
          }
          availableBonusSources={bonusDamageSources}
          accuracyAndDamageSourceInputs={accuracyAndDamageSourceInputs}
          isPrimaryWeaponOnMount={activeWeaponIndex === 0}
          setRollSummaryData={setRollSummaryDataWithName}
          onClear={newAttackSummary}
        />
      }

      {activeInvadeData &&
        <TechRoller
          invadeData={activeInvadeData}
          techAttackBonus={robotStats.techAttackBonus}
          sensorRange={robotStats.sensorRange}
          availableBonusSources={bonusDamageSources}
          accuracyAndDamageSourceInputs={accuracyAndDamageSourceInputs}
          setRechargedForSystem={setRechargedForSystem}
          setRollSummaryData={setRollSummaryDataWithName}
          onClear={newAttackSummary}
        />
      }
    </div>
  )
}

export default MechSheet;
