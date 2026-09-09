import React, { useState, useEffect } from 'react';
import MechTraitsUntyped from './MechTraits';
import StatBroadcast from './StatBroadcast';
import MechState from '../MechState/MechState';
import ConditionsAndCounters from '../MechState/ConditionsAndCounters';
import WeaponRollerUntyped from '../WeaponRoller/WeaponRoller';
import TechRoller from '../WeaponRoller/TechRoller';

const MechTraits: any = MechTraitsUntyped;
const WeaponRoller: any = WeaponRollerUntyped;

import {
  getWeaponsOnMount,
  TechAttack,
  MechMount
} from './MechMount';

import {
  getSystemLimited,
  getAllWeaponRanges,
  getModdedWeaponData,
  findModData,
} from '../lancerData';

import {
  getAvailableBonusDamageSources,
} from '../WeaponRoller/bonusDamageSourceUtils';

import type {
  RobotState,
  RobotStats,
  RobotInfo,
  RobotLoadout,
  UpdateMechState,
} from '../types';

import './MechSheet.scss';


const MechSheet = ({
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
}: {
  robotState: RobotState,
  robotStats: RobotStats,
  robotInfo: RobotInfo,
  robotLoadout: RobotLoadout,
  updateMechState: UpdateMechState,
  accuracyAndDamageSourceInputs: any,
  setPartyLastAttackKey: (key: any) => void,
  setPartyLastAttackTimestamp: (timestamp: any) => void,
  setRollSummaryData: (data: any) => void,
  setDistantDicebagData: (data: any) => void,
}) => {
  const [activeMountIndex, setActiveMountIndex] = useState<number | null>(null);
  const [activeWeaponIndex, setActiveWeaponIndex] = useState(0);

  const [activeInvadeIndex, setActiveInvadeIndex] = useState<number | null>(null)

  useEffect(() => {
    setActiveMountIndex(null);
    setActiveWeaponIndex(0);
  }, [robotInfo.id]);

  const changeMountAndWeapon = (mountIndex: number, weaponIndex: number) => {
    setActiveMountIndex(mountIndex)
    setActiveWeaponIndex(weaponIndex)
    setActiveInvadeIndex(null)

    newAttackSummary()
  }

  const activateInvade = (invadeIndex: number) => {
    setActiveMountIndex(null)
    setActiveWeaponIndex(0)
    setActiveInvadeIndex(invadeIndex)

    newAttackSummary()
  }

  const setRollSummaryDataWithName = (rollSummaryData: any, forceNewEntry = false) => {
    rollSummaryData.characterName = robotInfo.name
    rollSummaryData.forceNewEntry = forceNewEntry
    setRollSummaryData(rollSummaryData)
  }

  const newAttackSummary = () => {
    setPartyLastAttackKey('')
    setPartyLastAttackTimestamp(0)
  }


  const setLimitedCountForSystem = (count: number, systemIndex: number) => {
    updateMechState({
      systemUses: {index: systemIndex, uses: count}
    })
  }
  const setDestroyedForSystem = (destroyed: boolean, systemIndex: number) => {
    updateMechState({
      systemDestroyed: {index: systemIndex, destroyed: destroyed}
    })
  }
  const setRechargedForSystem = (charged: boolean, systemIndex: number) => {
    updateMechState({
      systemCharged: {index: systemIndex, charged: charged}
    })
  }

  const setPerRoundCount = (source: string, uses: number) => {
    updateMechState({
      systemPerRoundCount: {source: source, uses: uses}
    })
  }

  const resetPerRoundCounts = () => updateMechState({resetPerRoundCounts: true})

  const activeMount = activeMountIndex != null ? robotLoadout.mounts[activeMountIndex] : undefined;
  const activeMountWeapons = getWeaponsOnMount(activeMount);
  const activeWeapon = activeMountWeapons && activeMountWeapons[activeWeaponIndex];

  const activeWeaponData = getModdedWeaponData(activeWeapon)
  const activeInvadeData = activeInvadeIndex != null ? robotLoadout.invades[activeInvadeIndex] : undefined

  const weaponLimited = activeWeaponData ? getSystemLimited(activeWeapon, activeWeaponData, robotStats.limitedBonus) : null
  const modLimited = activeWeaponData && activeWeapon.mod ? getSystemLimited(activeWeapon.mod, findModData(activeWeapon.mod.id), robotStats.limitedBonus) : null

  const bonusDamageSources = getAvailableBonusDamageSources(accuracyAndDamageSourceInputs, activeMount, activeWeapon, activeInvadeData);

  let totalAttackBonus = robotStats.attackBonus

  if (robotStats.attackBonusRanged) {
    const weaponRanges = getAllWeaponRanges(activeWeaponData)
    const isActiveWeaponRanged = weaponRanges.some((range: any) => (range.type !== 'Threat'))
    if (isActiveWeaponRanged) totalAttackBonus += robotStats.attackBonusRanged
  }
  if (activeWeapon && activeWeapon.npcAttackBonus) totalAttackBonus += activeWeapon.npcAttackBonus

  const looksLikeAnNPC = robotState.coreEnergy < 0

  return (
    <div className="MechSheet">
      <div className="mech-container">

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
          setRollSummaryData={(summaryData: any) => setRollSummaryDataWithName(summaryData, true)}
        />

        <ConditionsAndCounters
          activeConditions={robotState.conditions}
          activeCounters={robotState.counters}
          updateMechState={updateMechState}
          setRollSummaryData={(summaryData: any) => setRollSummaryDataWithName(summaryData, true)}
        />

        { robotInfo.hasMultipleLoadouts &&
          <p className='multiple-loadouts-warning'> WARNING: multiple mech loadouts detected; Witchdice only supports the first one created.</p>
        }

        { robotLoadout.pilotTraits.length > 0 &&
          <MechTraits
            sectionTitle='Pilot Traits'
            frameTraits={robotLoadout.pilotTraits}
            setRollSummaryData={(summaryData: any) => setRollSummaryDataWithName(summaryData, true)}
            setPerRoundCount={setPerRoundCount}
            showResetPerRoundCounts={true}
            resetPerRoundCounts={resetPerRoundCounts}
          />
        }

        { robotLoadout.frameTraits.length > 0 &&
          <MechTraits
            sectionTitle='Frame Traits'
            frameTraits={robotLoadout.frameTraits}
            setRollSummaryData={(summaryData: any) => setRollSummaryDataWithName(summaryData, true)}
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
            setRollSummaryData={(summaryData: any) => setRollSummaryDataWithName(summaryData, true)}
            setLimitedCountForSystem={setLimitedCountForSystem}
            setDestroyedForSystem={setDestroyedForSystem}
            setRechargedForSystem={setRechargedForSystem}
            setPerRoundCount={setPerRoundCount}
          />
        }

        <div className='jumplink-anchor' id='weapons' />
        <div className="mounts-label">Mounts & Attacks</div>

        <div className="mounts-list">
          { robotLoadout.mounts.map((mount: any, i: number) =>
            <MechMount
              key={`${robotInfo.name}-mount-${i}`}
              mount={mount}
              limitedBonus={robotStats.limitedBonus}
              setActiveWeaponIndex={(weaponIndex: number) => changeMountAndWeapon(i, weaponIndex)}
              activeWeaponIndex={activeMountIndex === i ? activeWeaponIndex : -1}
              setDestroyedForWeapon={(destroyed: boolean, weaponIndex: number) =>
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

          { robotLoadout.invades.map((invade: any, i: number) =>
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
          setLimitedCount={(count: number) =>
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
          setModLimitedCount={(count: number) =>
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
          setIsLoaded={(isLoaded: boolean) =>
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
