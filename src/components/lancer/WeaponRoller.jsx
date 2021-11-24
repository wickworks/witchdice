import React, { useState, useEffect } from 'react';
import WeaponAttack from './WeaponAttack/WeaponAttack.jsx';
import WeaponAttackSetup from './WeaponAttackSetup.jsx';
import { deepCopy } from '../../utils.js';

import {
  getTagName,
  findTagOnWeapon,
  findTagData,
  defaultWeaponDamageType,
  processDiceString,
  GENERIC_BONUS_SOURCE,
  MAX_BONUS,
  DAMAGE_MODIFIERS,
} from './data.js';

import {
  rollToHit,
  rollDamage,
  rollBonusDamage,
  produceRollPools,
  makeDamageRoll,
  getActiveBonusDamageData,
} from './damageRollUtils.js';

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

  const genericBonusIsActive = genericBonusPlus || genericBonusDieCount;


  // the actual data for all the currently active bonus damages
  const isOverkill = !!findTagOnWeapon(weaponData, 'tg_overkill');
  var activeBonusDamageData = getActiveBonusDamageData(
    bonusDamageData,
    activeBonusSources,
    genericBonusDieCount,
    genericBonusPlus,
    isOverkill
  );

  // Add or remove the name of a bonus damage to the active list
  const toggleBonusDamage = (sourceName) => {
    let newBonusDamages = [...activeBonusSources];

    const bonusIndex = newBonusDamages.indexOf(sourceName);
    if (bonusIndex >= 0) {
      newBonusDamages.splice(bonusIndex, 1) // REMOVE source
    } else {
      newBonusDamages.push(sourceName);          // ADD source
    }

    setActiveBonusSources(newBonusDamages);
  }

  const toggleDamageModifiers = (modifier) => {
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

  // =============== CHANGE WEAPON ==================
  useEffect(() => {
    setAllAttackRolls([]);
    setShowAttackSetup(true);
    setBonusDamageData(null);
  }, [weaponData]);


  let weaponTags = []
  if (weaponData.tags) {
    weaponData.tags.map(tag => {
      weaponTags.push( getTagName(tag) )
    })
  }

  // Create a new attack roll, including to-hit and damage.
  const createNewAttackRoll = (flatBonus, accuracyMod) => {
    let newAttack = {};

    newAttack.isOverkill = !!findTagOnWeapon(weaponData, 'tg_overkill');;

    newAttack.toHit = rollToHit(flatBonus, accuracyMod);
    newAttack.toHitReroll = rollToHit(flatBonus, accuracyMod);
    newAttack.damage = rollDamage(weaponData, newAttack.isOverkill);

    newAttack.effect = weaponData.effect || '';
    newAttack.onAttack = weaponData.on_attack || '';
    newAttack.onHit = weaponData.on_hit || '';
    newAttack.onCrit = weaponData.on_crit || '';

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
                onClick={() => toggleDamageModifiers('double')}
              >
                <div className='asset x' />
                <div>2</div>
              </button>

              <button
                className={damageModifiers.average ? 'active' : ''}
                onClick={() => toggleDamageModifiers('average')}
              >
                <div>Avg</div>
              </button>

              <button
                className={damageModifiers.half ? 'active' : ''}
                onClick={() => toggleDamageModifiers('half')}
              >
                <div className='asset x' />
                <div>.5</div>
              </button>
            </div>
          </div>

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

      { ((allAttackRolls.length >= 2) && activeBonusDamageData.rolls.length > 0) && !showAttackSetup &&
        <div className='status-bar'>
          If an attack that targets more than one character deals bonus damage, the bonus damage is halved.
        </div>
      }
    </div>
  )
}


const BonusDamageBar = ({
  genericBonusDieCount,
  setGenericBonusDieCount,
  genericBonusPlus,
  setGenericBonusPlus,
  genericBonusIsActive,
  availableBonusSources,
  activeBonusSources,
  toggleBonusDamage,
}) => {

  return (
    <div className="BonusDamageBar">
      <div className='generic'>
        <button
          className={`amount ${genericBonusDieCount ? 'active' : 'inactive'}`}
          onClick={() => setGenericBonusDieCount(Math.min(genericBonusDieCount + 1, MAX_BONUS))}
        >
          {genericBonusDieCount ?
            `${genericBonusDieCount}d6`
          :
            <div className='asset d6' />
          }
        </button>

        <button
          className={`amount ${genericBonusPlus ? 'active' : 'inactive'}`}
          onClick={() => setGenericBonusPlus(Math.min(genericBonusPlus + 1, MAX_BONUS))}
        >
          {genericBonusPlus ?
            `+${genericBonusPlus}`
          :
            <div className='asset plus' />
          }
        </button>

        <button
          className={`reset ${genericBonusIsActive ? 'active' : 'inactive'}`}
          onClick={() => { setGenericBonusPlus(0); setGenericBonusDieCount(0); }}
          disabled={!genericBonusIsActive}
        >
          <div className='label'>Bonus damage</div>
        </button>
      </div>

      { availableBonusSources.map((bonusSource, i) =>
        <button
          className={`bonus-source ${activeBonusSources.indexOf(bonusSource.id) >= 0 ? 'active' : 'inactive'}`}
          onClick={() => toggleBonusDamage(bonusSource.id)}
          key={`${bonusSource.id}-${i}`}
        >
          <div className='amount'>
            { bonusSource.type && <div className={`asset-lancer ${bonusSource.type.toLowerCase()}`} /> }
            {bonusSource.diceString}
          </div>
          <div className='label'>{bonusSource.name}</div>
        </button>
      )}
    </div>
  )
}


export default WeaponRoller;
