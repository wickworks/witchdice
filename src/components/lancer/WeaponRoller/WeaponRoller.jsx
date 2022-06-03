import React, { useState, useEffect } from 'react';
import WeaponAttack from './WeaponAttack/WeaponAttack.jsx';
import WeaponRollerSetup from './WeaponRollerSetup.jsx';
import BonusDamageBar from './BonusDamageBar.jsx';
import DamageModifierBar from './DamageModifierBar.jsx';
import BaseDamageBar from './BaseDamageBar.jsx';
import MechNumberBar from '../MechState/MechNumberBar.jsx'
import BrToParagraphs from '../../shared/BrToParagraphs.jsx';
import TraitBlock from '../MechSheet/TraitBlock.jsx'
import { deepCopy } from '../../../utils.js';

import {
  getDefaultWeaponDamageType,
  findTagOnWeapon,
  GENERIC_BONUS_SOURCE,
  DAMAGE_MODIFIERS,
} from '../lancerData.js';

import {
  rollBonusDamage,
  getActiveBonusDamageData,
  createNewAttack,
  setAccuracyMod,
  getAllWeaponProfiles,
  getMountName,
} from './weaponRollerUtils.js';

import {
  getPassingWeaponSynergies,
} from './synergyUtils.js';


import './WeaponRoller.scss';

const WeaponRoller = ({
  weaponData,
  weaponMod,
  weaponNpcAccuracy,
  mountBonusEffects,
  gritBonus,
  allRangeSynergies,

  isLoaded,
  setIsLoaded = () => {},

  weaponLimited,
  setLimitedCount = () => {},

  isPrimaryWeaponOnMount,
  availableBonusSources = [],
  accuracyAndDamageSourceInputs,

  setRollSummaryData,
  onClear,
}) => {
  const [allAttackSummaries, setAllAttackSummaries] = useState([]); // for the summary panel

  const [activeProfileIndex, setActiveProfileIndex] = useState(0);

  const [allAttackRolls, setAllAttackRolls] = useState([]);
  const [isSettingUpAttack, setIsSettingUpAttack] = useState(true);

  const [bonusDamageData, setBonusDamageData] = useState(null);
  const [activeBonusSources, setActiveBonusSources] = useState([]);

  const [damageModifiers, setDamageModifiers] = useState({...DAMAGE_MODIFIERS});

  const [genericBonusDieCount, setGenericBonusDieCount] = useState(0);
  const [genericBonusPlus, setGenericBonusPlus] = useState(0);

  const [manualBaseDamage, setManualBaseDamage] = useState(1);

  // ====== ROLL SUMMARY PANEL ======
  // inject the weapon name to summary data before sending it up
  const setRollSummaryDataWithWeaponName = (attackSummaryData, attackIndex) => {
    var attackSummaries = deepCopy(allAttackSummaries);

    if ((allAttackSummaries.length-1) < attackIndex) {
      attackSummaries.push(attackSummaryData)
    } else {
      attackSummaries[attackIndex] = attackSummaryData;
    }

    setAllAttackSummaries(attackSummaries);
    setRollSummaryData({
      conditions: [weaponData.name],
      rolls: attackSummaries,
      skipTotal: true,
    })
  }

  // =============== CHANGE WEAPON ==================
  const stringifiedWeaponData = JSON.stringify(weaponData)
  useEffect(() => {
    clearAttacks()
    clearActiveBonusSources()
    setActiveProfileIndex(0)
  }, [stringifiedWeaponData]);

  const clearAttacks = () => {
    setAllAttackSummaries([]);
    setAllAttackRolls([]);
    setIsSettingUpAttack(true);
    setBonusDamageData(null);
    onClear();
  }

  const clearActiveBonusSources = () => {
    setActiveBonusSources([]);
    setDamageModifiers({...DAMAGE_MODIFIERS})
    setGenericBonusDieCount(0);
    setGenericBonusPlus(0);
  }

  // =============== MAKE ATTACK ROLLS ==================

  const allWeaponProfiles = getAllWeaponProfiles(weaponData);
  const currentWeaponProfile = allWeaponProfiles[activeProfileIndex] || allWeaponProfiles[0];

  // console.log('allWeaponProfiles',allWeaponProfiles);
  // console.log('currentWeaponProfile',currentWeaponProfile);
  // console.log('weaponData',weaponData);

  // Add or remove the name of a bonus damage to the active list
  const toggleBonusDamage = (sourceID) => {
    let newBonusDamages = [...activeBonusSources];

    // Special case: walking armories are mutually exclusive, so clear out all the others
    if (sourceID.startsWith('t_walking_armory')) {
      newBonusDamages = newBonusDamages.filter(bonusID => !bonusID.startsWith('t_walking_armory') || bonusID === sourceID)
    }


    const bonusIndex = newBonusDamages.indexOf(sourceID);
    if (bonusIndex >= 0) {
      newBonusDamages.splice(bonusIndex, 1) // REMOVE source
    } else {
      newBonusDamages.push(sourceID);          // ADD source
    }

    setActiveBonusSources(newBonusDamages);
  }

  const toggleDamageModifier = (modifier) => {
    let newModifiers = {...damageModifiers};

    // toggle the given key
    newModifiers[modifier] = !damageModifiers[modifier]

    // half & double are mutually exclusive
    if (modifier === 'half' && newModifiers.half) {
      newModifiers.double = false;
    } else if (modifier === 'double' && newModifiers.double) {
      newModifiers.half = false;
    }

    setDamageModifiers(newModifiers);
  }

  // Create a new attack roll, including to-hit and damage.
  const createNewAttackRoll = (flatBonus, accuracyMod, consumedLock) => {

    const previousAttackDamage = allAttackRolls.length > 0 ? allAttackRolls[0].damage : null;
    const newAttack = createNewAttack(
      currentWeaponProfile,
      flatBonus,
      accuracyMod,
      consumedLock,
      manualBaseDamage,
      previousAttackDamage
    )

    console.log('New Attack:', newAttack);

    let newData = deepCopy(allAttackRolls);
    newData.push(newAttack);
    setAllAttackRolls(newData);
    setIsSettingUpAttack(false);

    // do we need to roll bonus damage?
    if (bonusDamageData === null) {
      var bonusDamage = {};

      bonusDamage.rolls = rollBonusDamage(
        [...availableBonusSources, GENERIC_BONUS_SOURCE],
        getDefaultWeaponDamageType(currentWeaponProfile),
        newAttack.isOverkill
      );

      // pull any traits out of the bounus sources
      bonusDamage.traits = availableBonusSources.filter(source => source.trait).map(source => source.trait)

      setBonusDamageData(bonusDamage);
    }
  }

  const changeAccuracyModForIndex = (change, attackRollIndex) => {
    let newData = deepCopy(allAttackRolls)

    let newAttackData = newData[attackRollIndex]
    setAccuracyMod(newAttackData.toHit, newAttackData.toHit.accuracyMod + change)
    setAccuracyMod(newAttackData.toHitReroll, newAttackData.toHitReroll.accuracyMod + change)

    setAllAttackRolls(newData)
  }

  const isLoading = !!findTagOnWeapon(currentWeaponProfile, 'tg_loading')
  const isOverkill = !!findTagOnWeapon(currentWeaponProfile, 'tg_overkill')

  // the actual data for all the currently active bonus damages
  var activeBonusDamageData = getActiveBonusDamageData(
    bonusDamageData,
    activeBonusSources,
    genericBonusDieCount,
    genericBonusPlus,
    isOverkill
  );

  // fold in any active damage modifiers from the active bonus sources (things can only get flipped to TRUE)
  var totalDamageModifiers = {...damageModifiers}
  if (activeBonusDamageData.traits) {
    activeBonusDamageData.traits.forEach(bonusTrait => {
      if (bonusTrait.damageModifiers) {
        Object.keys(bonusTrait.damageModifiers).forEach(modifierKey =>
          totalDamageModifiers[modifierKey] = totalDamageModifiers[modifierKey] || bonusTrait.damageModifiers[modifierKey]
        );
      }
    });
  }

  const genericBonusIsActive = genericBonusPlus || genericBonusDieCount;
  const rangeSynergies = getPassingWeaponSynergies(weaponData, allRangeSynergies)

  return (
    <div className='WeaponRoller'>
      <h3 className='name'>{weaponData.name}</h3>

      <div className="top-bar">
        { allWeaponProfiles.map((weaponProfile, i) =>
          <BaseDamageBar
            weaponProfile={weaponProfile}
            mountType={getMountName(weaponData)}
            rangeSynergies={rangeSynergies}
            onClick={() => setActiveProfileIndex(i)}
            isClickable={allWeaponProfiles.length > 1 && allAttackRolls.length === 0 && activeProfileIndex !== i}
            isActive={allWeaponProfiles.length > 1 && activeProfileIndex === i}
            manualBaseDamage={manualBaseDamage}
            setManualBaseDamage={setManualBaseDamage}
            manualBaseDamageDisabled={allAttackRolls.length > 0}
            key={`basedamage-${i}`}
          />
        )}

        { weaponLimited &&
          <div className='limited-container'>
            <MechNumberBar
              extraClass='condensed'
              dotIcon='ammo'
              zeroIcon='dot'
              maxNumber={weaponLimited.max}
              currentNumber={weaponLimited.current}
              setCurrentNumber={setLimitedCount}
              leftToRight={true}
            />

            <div className='limited-label'>
              Limited {weaponLimited.current}/{weaponLimited.max}
            </div>
          </div>
        }

        { isLoading &&
          <label className='loading-container'>
            <input
              type='checkbox'
              checked={isLoaded}
              onChange={() => setIsLoaded(!isLoaded)}
            />
            <div className='loading-text'>
              {isLoaded ? '〔 - Loaded! - 〕' : '〔 - Reload! - 〕'}
            </div>
          </label>
        }

        { weaponData.effect &&
          <div className='effect-row'>
            <BrToParagraphs stringWithBrs={weaponData.effect}/>
          </div>
        }

        { weaponData.actions && weaponData.actions.map((action, i) =>
          <TraitBlock
            key={action.name}
            trait={action}
          />
        )}

        { availableBonusSources.map((availableBonusSource, i) =>
          ( availableBonusSource.trait.effect &&
            <div className='effect-row' key={`bonus-source-effect-${i}`}>
              <strong>{availableBonusSource.trait.name}</strong>
              <BrToParagraphs stringWithBrs={availableBonusSource.trait.effect}/>
            </div>
          )
        )}

        { weaponData.on_attack &&
          <div className='effect-row'>
            <p><strong>On attack:</strong> {weaponData.on_attack}</p>
          </div>
        }

        <DamageModifierBar
          damageModifiers={damageModifiers}
          toggleDamageModifier={toggleDamageModifier}
        />

        <BonusDamageBar
          genericBonusDieCount={genericBonusDieCount}
          setGenericBonusDieCount={setGenericBonusDieCount}
          genericBonusPlus={genericBonusPlus}
          setGenericBonusPlus={setGenericBonusPlus}
          genericBonusIsActive={genericBonusIsActive}

          availableBonusSources={availableBonusSources}
          activeBonusSources={activeBonusSources}
          toggleBonusDamage={toggleBonusDamage}
        />
      </div>

      <div className="attacks-bar">
        { allAttackRolls.map((attackData, i) =>
          <WeaponAttack
            attackData={attackData}
            changeAccuracyMod={(change) => changeAccuracyModForIndex(change, i)}
            bonusDamageData={activeBonusDamageData}
            halveBonusDamage={allAttackRolls.length >= 2}
            damageModifiers={totalDamageModifiers}
            manualBaseDamage={manualBaseDamage}
            isFirstRoll={i === 0}
            isTechAttack={false}
            setAttackSummary={(attackSummaryData) => setRollSummaryDataWithWeaponName(attackSummaryData, i)}
            key={i}
          />
        )}

        { isSettingUpAttack &&
          <WeaponRollerSetup
            weaponData={currentWeaponProfile}
            weaponMod={weaponMod}
            weaponNpcAccuracy={weaponNpcAccuracy}
            mountBonusEffects={mountBonusEffects}
            rollBonus={gritBonus}
            rollBonusLabel={weaponNpcAccuracy === undefined ? 'Grit' : 'Flat'}
            createNewAttackRoll={createNewAttackRoll}
            accuracySourceInputs={accuracyAndDamageSourceInputs}
          />
        }
      </div>


      <div className='status-bar'>

        { !isPrimaryWeaponOnMount && allAttackRolls.length === 0 && isSettingUpAttack &&
          <div className='tip'>
            In addition to your primary attack, you may also attack with a different Auxiliary weapon on the same mount. That weapon doesn’t deal bonus damage.
          </div>
        }

        { (allAttackRolls.length >= 1) &&
          <>
            { !isSettingUpAttack &&
              <>
                { activeBonusDamageData.rolls.length > 0 && allAttackRolls.length >= 2 &&
                  <div className='tip'>
                    If an attack that targets more than one character deals bonus damage, the bonus damage is halved.
                  </div>
                }

                { damageModifiers.double &&
                  <div className='tip'>
                    All kinetic<span className='asset kinetic' />, explosive<span className='asset explosive' /> or energy<span className='asset energy' />
                    damage taken by EXPOSED characters is doubled, before applying any reductions.
                  </div>
                }
              </>
            }

            <div className='action-buttons-container'>
              <button
                className='add-target'
                onClick={() => setIsSettingUpAttack(true)}
                disabled={isSettingUpAttack || allAttackRolls.length >= 9}
              >
                <div className='asset plus' />
                Add target
              </button>

              <button className='clear-attacks' onClick={clearAttacks} >
                <div className='asset x' />
                Clear
              </button>
            </div>
          </>
        }
      </div>
    </div>
  )
}


export default WeaponRoller;
