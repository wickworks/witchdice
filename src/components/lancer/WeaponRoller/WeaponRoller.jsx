import React, { useState, useEffect } from 'react';
import WeaponAttack from './WeaponAttack/WeaponAttack.jsx';
import WeaponRollerSetup from './WeaponRollerSetup.jsx';
import BonusDamageBar from './BonusDamageBar.jsx';
import BaseDamageBar from './BaseDamageBar.jsx';
import BrToParagraphs from '../../shared/BrToParagraphs.jsx';
import { deepCopy } from '../../../utils.js';

import {
  defaultWeaponDamageType,
  findTagOnWeapon,
  GENERIC_BONUS_SOURCE,
  DAMAGE_MODIFIERS,
  BONUS_TO_BURN_TAGS,
} from '../lancerData.js';

import {
  rollBonusDamage,
  getBonusTraits,
  getActiveBonusDamageData,
  createNewAttack,
} from './weaponRollerUtils.js';

import './WeaponRoller.scss';

const WeaponRoller = ({
  weaponData,
  gritBonus,
  availableBonusSources = [],
  isPrimaryWeaponOnMount,

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

  // =============== CHANGE WEAPON ==================
  useEffect(() => {
    clearAttacks()
  }, [JSON.stringify(weaponData)]);

  const clearAttacks = () => {
    setAllAttackSummaries([]);
    setAllAttackRolls([]);
    setIsSettingUpAttack(true);
    setBonusDamageData(null);
    setActiveBonusSources([]);
    setDamageModifiers({...DAMAGE_MODIFIERS})
    setGenericBonusDieCount(0);
    setGenericBonusPlus(0);
    onClear();
  }

  // =============== MAKE ATTACK ROLLS ==================

  var allWeaponProfiles = [];
  if ('profiles' in weaponData) {
    allWeaponProfiles.push(...weaponData.profiles)
  } else {
    allWeaponProfiles.push(weaponData)
  }
  const currentWeaponProfile = allWeaponProfiles[activeProfileIndex];

  // console.log('allWeaponProfiles',allWeaponProfiles);

  // Add or remove the name of a bonus damage to the active list
  const toggleBonusDamage = (sourceID) => {
    let newBonusDamages = [...activeBonusSources];

    const bonusIndex = newBonusDamages.indexOf(sourceID);
    if (bonusIndex >= 0) {
      newBonusDamages.splice(bonusIndex, 1) // REMOVE source
    } else {
      newBonusDamages.push(sourceID);          // ADD source
    }

    // Special case: tokugawa bonus-to-burn
    if (BONUS_TO_BURN_TAGS.includes(sourceID)) toggleDamageModifier('bonusToBurn')

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
  const createNewAttackRoll = (flatBonus, accuracyMod) => {

    const previousAttackDamage = allAttackRolls.length > 0 ? allAttackRolls[0].damage : null;
    const newAttack = createNewAttack(currentWeaponProfile, flatBonus, accuracyMod, previousAttackDamage)

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
        defaultWeaponDamageType(currentWeaponProfile),
        newAttack.isOverkill
      );

      bonusDamage.traits = getBonusTraits(availableBonusSources)

      setBonusDamageData(bonusDamage);
    }
  }

  // the actual data for all the currently active bonus damages
  const isOverkill = !!findTagOnWeapon(currentWeaponProfile, 'tg_overkill');
  var activeBonusDamageData = getActiveBonusDamageData(
    bonusDamageData,
    activeBonusSources,
    genericBonusDieCount,
    genericBonusPlus,
    isOverkill
  );

  // console.log('availableBonusSources',availableBonusSources);
  // console.log('activeBonusDamageData',activeBonusDamageData);

  const genericBonusIsActive = genericBonusPlus || genericBonusDieCount;

  // fold in any active damage modifiers from the active bonus sources (things can only get flipped to TRUE)
  // console.log('damageModifiers',damageModifiers);
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
  // console.log('totalDamageModifiers',totalDamageModifiers);


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

  return (
    <div className='WeaponRoller'>
      <h3 className='name'>{weaponData.name}</h3>

      <div className="top-bar">
        { allWeaponProfiles.map((weaponProfile, i) =>
          <BaseDamageBar
            weaponProfile={weaponProfile}
            mountType={weaponData.mount}
            onClick={() => setActiveProfileIndex(i)}
            isClickable={allWeaponProfiles.length > 1 && allAttackRolls.length === 0}
            isActive={allWeaponProfiles.length > 1 && activeProfileIndex === i}
            key={`basedamage-${i}`}
          />
        )}

        {weaponData.effect &&
          <div className='effect-row'>
            <BrToParagraphs stringWithBrs={weaponData.effect}/>
          </div>
        }

        { availableBonusSources.map((availableBonusSource, i) =>
          ( availableBonusSource.trait.effect &&
            <div className='effect-row' key={`bonus-source-effect-${i}`}>
              <strong>{availableBonusSource.trait.name}</strong>
              <BrToParagraphs stringWithBrs={availableBonusSource.trait.effect}/>
            </div>
          )
        )}

        {weaponData.on_attack &&
          <div className='effect-row'>
            <p><strong>On attack:</strong> {weaponData.on_attack}</p>
          </div>
        }

        <BonusDamageBar
          genericBonusDieCount={genericBonusDieCount}
          setGenericBonusDieCount={setGenericBonusDieCount}
          genericBonusPlus={genericBonusPlus}
          setGenericBonusPlus={setGenericBonusPlus}
          genericBonusIsActive={genericBonusIsActive}

          availableBonusSources={availableBonusSources}
          activeBonusSources={activeBonusSources}
          toggleBonusDamage={toggleBonusDamage}

          damageModifiers={damageModifiers}
          toggleDamageModifier={toggleDamageModifier}
        />
      </div>

      <div className="attacks-bar">
        { allAttackRolls.map((attackData, i) =>
          <WeaponAttack
            attackData={attackData}
            bonusDamageData={activeBonusDamageData}
            halveBonusDamage={allAttackRolls.length >= 2}
            damageModifiers={totalDamageModifiers}
            isFirstRoll={i === 0}
            setAttackSummary={(attackSummaryData) => setRollSummaryDataWithWeaponName(attackSummaryData, i)}
            key={i}
          />
        )}

        { isSettingUpAttack &&
          <WeaponRollerSetup
            weaponData={currentWeaponProfile}
            gritBonus={gritBonus}
            createNewAttackRoll={createNewAttackRoll}
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
