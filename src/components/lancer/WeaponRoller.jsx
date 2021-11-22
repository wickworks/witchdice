import React, { useState, useEffect } from 'react';
import WeaponAttack from './WeaponAttack.jsx';
import WeaponAttackSetup from './WeaponAttackSetup.jsx';
import { getRandomInt, deepCopy } from '../../utils.js';

import {
  getTagName,
  findTagOnWeapon,
  findTagData,
  processDiceString,
} from './data.js';

import './WeaponRoller.scss';

const GENERIC_BONUS_DAMAGE = 'Bonus damage'

// Fills out the to-hit roll for the attack data.
function rollToHit(flatBonus, accuracyMod) {
  var toHit = {};

  toHit.baseRoll = getRandomInt(20);

  toHit.accuracyRolls = [...Array(Math.abs(accuracyMod))];
  toHit.accuracyRolls.map((accuracy, i) => {
    toHit.accuracyRolls[i] = getRandomInt(6)
  });
  toHit.accuracyBonus = Math.max(0, ...toHit.accuracyRolls) * Math.sign(accuracyMod)

  toHit.flatBonus = flatBonus

  toHit.finalResult = toHit.baseRoll + toHit.flatBonus + toHit.accuracyBonus

  return toHit;
}

// Fills out the damage rolls for the attack data.
function rollDamage(weaponData) {
  var damageData = {};

  const isOverkill = !!findTagOnWeapon(weaponData, 'tg_overkill');

  damageData.rolls = [];
  weaponData.damage.forEach(damageValAndType => {
    const damageDice = processDiceString(damageValAndType.val);

    // ROLLS
    let rollPool = [];
    let critPool = [];
    [...Array(damageDice.count)].forEach(rollIndex => {
      makeDamageRoll(damageDice.dietype, rollPool, isOverkill);
      makeDamageRoll(damageDice.dietype, critPool, isOverkill);
    })
    damageData.rolls.push({
      rollPool: rollPool,
      critPool: critPool,
      keep: damageDice.count,
      type: damageValAndType.type
    });

    // PLUSES TO ROLLS -- they get their own micro-pool
    if (damageDice.bonus !== 0) {
      damageData.rolls.push({
        rollPool: [damageDice.bonus],
        critPool: [],
        keep: 1,
        type: damageValAndType.type
      });
    }
  });

  // Reliable damage?
  damageData.reliable = { val: 0, type: 'Variable' };
  const reliableTag = findTagOnWeapon(weaponData, 'tg_reliable')
  if (reliableTag) {
    damageData.reliable.val = reliableTag.val;

    // we use the first damage type if there's only one available; otherwise we leave it variable
    // if (Object.keys(damageData..totalsByType).length === 1) {
      damageData.reliable.type = damageData.rolls[0].type;
    // }
  }

  // Overkill damage?
  damageData.isOverkill = isOverkill;

  return damageData;
}

// Adds to the given roll/critPool with a random damage roll, including overkill triggers
function makeDamageRoll(dieType, rollPool, isOverkill) {
  let roll = getRandomInt(dieType) ;
  rollPool.push(roll)

  if (isOverkill) {
    while (roll === 1) {
      roll = getRandomInt(Math.max(dieType, 3));
      rollPool.push(roll)
    }
  }
}

const WeaponRoller = ({
  weaponData,
  gritBonus,
  availableBonusDamages = [],
}) => {
  const [allAttackRolls, setAllAttackRolls] = useState([]);
  const [showAttackSetup, setShowAttackSetup] = useState(true);

  const [activeBonusDamages, setActiveBonusDamages] = useState([]);

  const [genericBonusDieCount, setGenericBonusDieCount] = useState(0);
  const [genericBonusPlus, setGenericBonusPlus] = useState(0);

  let genericBonusString = `${genericBonusDieCount}d6`;
  if (genericBonusPlus) genericBonusString += `+${genericBonusPlus}`
  const genericBonusIsActive = genericBonusPlus || genericBonusDieCount;
  const genericBonusDamage = {
    name: GENERIC_BONUS_DAMAGE,
    diceString: genericBonusString,
    tags: [],
  }

  const toggleBonusDamage = (sourceName) => {
    let newBonusDamages = [...activeBonusDamages];

    const bonusIndex = newBonusDamages.indexOf(sourceName);
    if (bonusIndex >= 0) {
      newBonusDamages.splice(bonusIndex, 1) // REMOVE source
    } else {
      newBonusDamages.push(sourceName);          // ADD source
    }

    setActiveBonusDamages(newBonusDamages);
  }

  // =============== CHANGE WEAPON ==================
  useEffect(() => {
    setAllAttackRolls([]);
    setShowAttackSetup(true);
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

    newAttack.toHit = rollToHit(flatBonus, accuracyMod);
    newAttack.damage = rollDamage(weaponData);

    newAttack.onAttack = weaponData.on_attack || '';
    newAttack.onHit = weaponData.on_hit || '';
    newAttack.onCrit = weaponData.on_crit || '';

    console.log('New Attack:', newAttack);

    let newData = deepCopy(allAttackRolls);
    newData.push(newAttack);
    setAllAttackRolls(newData);
    setShowAttackSetup(false);
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
            {'[ '}
            { weaponData.damage.map((damage, i) =>
              <div className='damage-dice' key={`damage-${i}`}>
                {damage.val}
                <div className={`asset-lancer ${damage.type.toLowerCase()}`} />
              </div>
            )}
            {' ]'}
          </div>

          <div className="bonus-damage-container">

            { availableBonusDamages.map((bonusDamageData, i) =>
              <button
                className={`bonus-source ${activeBonusDamages.indexOf(bonusDamageData.name) >= 0 ? 'active' : 'inactive'}`}
                onClick={() => toggleBonusDamage(bonusDamageData.name)}
                key={`${bonusDamageData.name}-${i}`}
              >
                <div className='amount'>{bonusDamageData.diceString}</div>
                <div className='label'>{bonusDamageData.name}</div>
              </button>
            )}


            <div className={`generic ${genericBonusIsActive ? 'active' : 'inactive'}`}>
              <button className='amount' onClick={() => setGenericBonusDieCount(genericBonusDieCount + 1)}>
                {genericBonusDieCount ?
                  `${genericBonusDieCount}d6`
                :
                  <div className='asset d6' />
                }
              </button>
              <button className='amount' onClick={() => setGenericBonusPlus(genericBonusPlus + 1)}>
                {genericBonusPlus ?
                  `+${genericBonusPlus}`
                :
                  <div className='asset plus' />
                }
              </button>
              <button
                className='reset'
                onClick={() => { setGenericBonusPlus(0); setGenericBonusDieCount(0); }}
                disabled={!genericBonusIsActive}
              >
                <div className='label'>Bonus damage</div>
              </button>
            </div>
          </div>
        </div>

      </div>

      { allAttackRolls.map((attackData, i) =>
        <WeaponAttack
          attackData={attackData}
          key={i}
        />
      )}


      {showAttackSetup ?
        <WeaponAttackSetup
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
  )
}


export default WeaponRoller;
