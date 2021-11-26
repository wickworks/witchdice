import React, { useState, useEffect } from 'react';
import WeaponAttack from './WeaponAttack/WeaponAttack.jsx';
import WeaponAttackSetup from './WeaponAttackSetup.jsx';
import WeaponRollerBonusDamage from './WeaponRollerBonusDamage.jsx';
import WeaponRollerBaseDamage from './WeaponRollerBaseDamage.jsx';
import { deepCopy } from '../../utils.js';
import { BONUS_TO_BURN_TAGS } from './data.js';

import {
  getTagName,
  findTagOnWeapon,
  findTagData,
  defaultWeaponDamageType,
  processDiceString,
  GENERIC_BONUS_SOURCE,
  DAMAGE_MODIFIERS,
} from './data.js';

import {
  rollToHit,
  rollDamage,
  rollBonusDamage,
  produceRollPools,
  makeDamageRoll,
  getActiveBonusDamageData,
} from './weaponRollerUtils.js';

import './WeaponRoller.scss';


const WeaponRoller = ({
  weaponData,
  gritBonus,
  availableBonusSources = [],
  isPrimaryWeaponOnMount,
}) => {
  const [allAttackRolls, setAllAttackRolls] = useState([]);
  const [showAttackSetup, setShowAttackSetup] = useState(true);

  const [bonusDamageData, setBonusDamageData] = useState(null);
  const [activeBonusSources, setActiveBonusSources] = useState([]);

  const [damageModifiers, setDamageModifiers] = useState({...DAMAGE_MODIFIERS});

  const [genericBonusDieCount, setGenericBonusDieCount] = useState(0);
  const [genericBonusPlus, setGenericBonusPlus] = useState(0);

  // =============== CHANGE WEAPON ==================
  useEffect(() => {
    clearAttacks()
  }, [weaponData]);

  const clearAttacks = () => {
    setAllAttackRolls([]);
    setShowAttackSetup(true);
    setBonusDamageData(null);
    setActiveBonusSources([]);
    setDamageModifiers({...DAMAGE_MODIFIERS})
    setGenericBonusDieCount(0);
    setGenericBonusPlus(0);
  }

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

  let weaponTags = []
  if (weaponData.tags) {
    weaponData.tags.map(tag => {
      weaponTags.push( getTagName(tag) )
    })
  }

  // Create a new attack roll, including to-hit and damage.
  const createNewAttackRoll = (flatBonus, accuracyMod) => {
    let newAttack = {};

    // Overkill?
    newAttack.isOverkill = !!findTagOnWeapon(weaponData, 'tg_overkill');;

    // Armor piercing?
    newAttack.isArmorPiercing = !!findTagOnWeapon(weaponData, 'tg_ap')

    // Reliable?
    newAttack.reliable = { val: 0, type: 'Variable' };
    const reliableTag = findTagOnWeapon(weaponData, 'tg_reliable')
    if (reliableTag) {
      newAttack.reliable.val = reliableTag.val;
      newAttack.reliable.type = defaultWeaponDamageType(weaponData)
    }

    // Knockback?
    newAttack.knockback = 0;
    const knockbackTag = findTagOnWeapon(weaponData, 'tg_knockback')
    if (knockbackTag) newAttack.knockback = knockbackTag.val;

    // Self heat?
    newAttack.selfHeat = 0;
    const selfHeatTag = findTagOnWeapon(weaponData, 'tg_heat_self')
    if (selfHeatTag) newAttack.selfHeat = selfHeatTag.val;

    newAttack.toHit = rollToHit(flatBonus, accuracyMod);
    newAttack.toHitReroll = rollToHit(flatBonus, accuracyMod);

    // ROLL DAMAGE (or inherit it from the first roll)
    if (allAttackRolls.length === 0) {
      newAttack.damage = rollDamage(weaponData, newAttack.isOverkill);
    } else {
      newAttack.damage = deepCopy(allAttackRolls[0].damage)
    }

    newAttack.onAttack = weaponData.on_attack || '';
    newAttack.onHit = weaponData.on_hit || '';
    newAttack.onCrit = weaponData.on_crit || '';

    console.log('New Attack:', newAttack);

    let newData = deepCopy(allAttackRolls);
    newData.push(newAttack);
    setAllAttackRolls(newData);
    setShowAttackSetup(false);

    // do we need to roll bonus damage?
    if (bonusDamageData === null) {
      const bonusDamage = rollBonusDamage(
        [...availableBonusSources, GENERIC_BONUS_SOURCE],
        defaultWeaponDamageType(weaponData),
        newAttack.isOverkill
      );

      console.log('New Bonus Damage:', bonusDamage);

      setBonusDamageData(bonusDamage);
    }
  }

  // the actual data for all the currently active bonus damages
  const isOverkill = !!findTagOnWeapon(weaponData, 'tg_overkill');
  var activeBonusDamageData = getActiveBonusDamageData(
    bonusDamageData,
    activeBonusSources,
    genericBonusDieCount,
    genericBonusPlus,
    isOverkill
  );

  const genericBonusIsActive = genericBonusPlus || genericBonusDieCount;

  return (
    <div className='WeaponRoller'>
      <div className="top-bar">
        <h3 className='name'>{weaponData.name}</h3>

        <div className="base-damage-and-tags">
          <WeaponRollerBaseDamage
            weaponData={weaponData}
            damageModifiers={damageModifiers}
            toggleDamageModifier={toggleDamageModifier}
          />

          <div className="tags">
            {weaponTags.join(', ').toLowerCase()}
            <span className='size'>{weaponData.mount}</span>
          </div>


        </div>

        {weaponData.effect &&
          <div className='effect-row'>
            {weaponData.effect}
          </div>
        }

        <WeaponRollerBonusDamage
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
            bonusDamageData={activeBonusDamageData}
            halveBonusDamage={allAttackRolls.length >= 2}
            damageModifiers={damageModifiers}
            isFirstRoll={i === 0}
            key={i}
          />
        )}


        {showAttackSetup &&
          <WeaponAttackSetup
            weaponData={weaponData}
            gritBonus={gritBonus}
            createNewAttackRoll={createNewAttackRoll}
          />
        }
      </div>


      <div className='status-bar'>

        { !isPrimaryWeaponOnMount && allAttackRolls.length === 0 && showAttackSetup &&
          <div className='tip'>
            In addition to your primary attack, you may also attack with a different Auxiliary weapon on the same mount. That weapon doesn’t deal bonus damage.
          </div>
        }

        { (allAttackRolls.length >= 1) &&
          <>
            {(allAttackRolls.length >= 2 && activeBonusDamageData.rolls.length > 0) && !showAttackSetup &&
              <div className='tip'>
                If an attack that targets more than one character deals bonus damage, the bonus damage is halved.
              </div>
            }

            <div className='action-buttons-container'>
              <button className='add-target' onClick={() => setShowAttackSetup(true)} disabled={showAttackSetup}>
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
