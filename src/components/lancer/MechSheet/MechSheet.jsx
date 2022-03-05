import React, { useState, useEffect } from 'react';
import MechTraits from './MechTraits.jsx';
import StatBroadcast from './StatBroadcast.jsx';
import MechState from '../MechState/MechState.jsx';
import ConditionsAndCounters from '../MechState/ConditionsAndCounters.jsx';
import WeaponRoller from '../WeaponRoller/WeaponRoller.jsx';
import TechRoller from '../WeaponRoller/TechRoller.jsx';

import {
  getWeaponsOnMount,
  getModdedWeaponData,
  TechAttack,
  MechMount
} from './MechMount.jsx';

import {
  getSystemLimited,
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
  const setRollSummaryDataWithName = (rollSummaryData) => {
    rollSummaryData.characterName = robotInfo.name
    setRollSummaryData(rollSummaryData)
  }

  // the next attack roll will be a new entry in the summary
  const newAttackSummary = () => {
    setPartyLastAttackKey('')
    setPartyLastAttackTimestamp(0)
  }


  // =============== GET THE DATA FOR THE SHEET ==================
  const activeMount = robotLoadout.mounts[activeMountIndex];
  const activeMountWeapons = getWeaponsOnMount(activeMount);
  const activeWeapon = activeMountWeapons && activeMountWeapons[activeWeaponIndex];

  const activeWeaponData = getModdedWeaponData(activeWeapon)
  const activeInvadeData = robotLoadout.invades[activeInvadeIndex]

  const weaponLimited = activeWeaponData ? getSystemLimited(activeWeapon, activeWeaponData, robotStats.limitedBonus) : null
  // console.log('activeWeapon',activeWeapon);
  // console.log('activeWeaponData',activeWeaponData);

  const bonusDamageSources = getAvailableBonusDamageSources(accuracyAndDamageSourceInputs, activeMount, activeWeapon);

  // console.log('activeWeapon',activeWeapon);
  let totalAttackBonus = robotStats.attackBonus
  if (robotStats.attackBonusRanged) totalAttackBonus += robotStats.attackBonusRanged
  if (activeWeapon && activeWeapon.npcAttackBonus) totalAttackBonus += activeWeapon.npcAttackBonus

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

          {robotInfo.frameID.startsWith('npcc_') &&
            <StatBroadcast
              robotStats={robotStats}
              robotState={robotState}
              onBroadcast={(summaryData) => { setRollSummaryDataWithName(summaryData); newAttackSummary(); }}
            />
          }
        </div>


        <MechState
          robotState={robotState}
          robotStats={robotStats}
          robotInfo={robotInfo}
          updateMechState={updateMechState}
          setDistantDicebagData={setDistantDicebagData}
        />

        <ConditionsAndCounters
          activeConditions={robotState.conditions}
          activeCounters={robotState.counters}
          updateMechState={updateMechState}
        />

        {/*Frame Traits & Core System*/}
        { robotLoadout.frameTraits.length > 0 &&
          <MechTraits
            sectionTitle='Frame Traits'
            frameTraits={robotLoadout.frameTraits}
            setRollSummaryData={(summaryData) => { setRollSummaryDataWithName(summaryData); newAttackSummary(); }}
          />
        }

        { robotLoadout.systems.length > 0 &&
          <MechTraits
            sectionTitle='Systems'
            frameTraits={robotLoadout.systems}
            setRollSummaryData={(summaryData) => { setRollSummaryDataWithName(summaryData); newAttackSummary(); }}
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
            setRechargedForSystem={(charged, systemIndex) =>
              updateMechState({
                systemCharged: {index: systemIndex, charged: charged}
              })
            }
          />
        }

        <div className='jumplink-anchor' id='weapons' />
        <div className="mounts-label">Mounts & Attacks</div>

        <div className="mounts-list">
          { robotLoadout.mounts.map((mount, i) =>
            <MechMount
              key={`mount-${i}`}
              mount={mount}
              limitedBonus={robotStats.limitedBonus}
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

          { robotLoadout.invades.map((invade, i) =>
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
          weaponData={activeWeaponData}
          weaponMod={activeWeapon.mod}
          weaponNpcAccuracy={activeWeapon.npcAccuracyBonus}
          gritBonus={totalAttackBonus}
          weaponLimited={weaponLimited}
          setLimitedCount={(count) =>
            updateMechState({
              weaponUses: {
                mountSource: activeMount.source,
                mountIndex: activeMountIndex,
                weaponIndex: activeWeaponIndex,
                uses: count
              }
            })
          }
          isLoaded={activeWeapon.loaded}
          setIsLoaded={(isLoaded) =>
            updateMechState({
              weaponLoaded: {
                mountSource: activeMount.source,
                mountIndex: activeMountIndex,
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
          accuracyAndDamageSourceInputs={accuracyAndDamageSourceInputs}
          setRollSummaryData={setRollSummaryDataWithName}
          onClear={newAttackSummary}
        />
      }
    </div>
  )
}

export default MechSheet;
