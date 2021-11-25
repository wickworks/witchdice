import React, { useState, useEffect } from 'react';
import WeaponAttack from './WeaponAttack/WeaponAttack.jsx';
import WeaponAttackSetup from './WeaponAttackSetup.jsx';
import WeaponRollerBonusDamage from './WeaponRollerBonusDamage.jsx';
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
    newAttack.damage = rollDamage(weaponData, newAttack.isOverkill);

    newAttack.effect = weaponData.effect || '';
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
    <div className="WeaponRoller">
      <div className="top-bar">

        <div className="name-and-tags">
          <h3 className='name'>{weaponData.name}</h3>
          <div className="tags">{weaponTags.join(', ')}</div>
        </div>

        <div className="damage-row">
          <div className="base-damage-container">
            <div className="base-damage">
              <div>{'[ '}</div>
              { weaponData.damage.map((damage, i) =>
                <div className='damage-dice' key={`damage-${i}`}>
                  {damage.val}
                  <div className={`asset-lancer ${damage.type.toLowerCase()}`} />
                </div>
              )}
              <div>{' ]'}</div>
            </div>

            <div className="multipliers">
              <button
                className={damageModifiers.double ? 'active' : ''}
                onClick={() => toggleDamageModifier('double')}
              >
                <div className='asset x' />
                <div>2</div>
              </button>

              <button
                className={damageModifiers.average ? 'active' : ''}
                onClick={() => toggleDamageModifier('average')}
              >
                <div>Avg</div>
              </button>

              <button
                className={damageModifiers.half ? 'active' : ''}
                onClick={() => toggleDamageModifier('half')}
              >
                <div className='asset x' />
                <div>.5</div>
              </button>
            </div>
          </div>

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


        {showAttackSetup ?
          <WeaponAttackSetup
            weaponData={weaponData}
            gritBonus={gritBonus}
            createNewAttackRoll={createNewAttackRoll}
          />
        :
          <button className='add-target' onClick={() => setShowAttackSetup(true)}>
            <div className='asset plus' />
            Add target
          </button>
        }
      </div>

      { !showAttackSetup &&
        <div className='status-bar'>
          { ((allAttackRolls.length >= 2) && activeBonusDamageData.rolls.length > 0) &&
            <div>If an attack that targets more than one character deals bonus damage, the bonus damage is halved.</div>
          }

          { (allAttackRolls.length >= 1) &&
            <button className='clear-attacks' onClick={clearAttacks} >
              Clear
            </button>
          }
        </div>
      }
    </div>
  )
}


export default WeaponRoller;
