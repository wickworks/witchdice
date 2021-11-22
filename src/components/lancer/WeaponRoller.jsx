import React, { useState } from 'react';
import WeaponAttack from './WeaponAttack.jsx';
import WeaponAttackSetup from './WeaponAttackSetup.jsx';
import { getRandomInt, deepCopy } from '../../utils.js';

import {
  getTagName,
  processDiceString,
} from './data.js';

import './WeaponRoller.scss';


const WeaponRoller = ({
  weaponData,
  gritBonus,
}) => {
  const [allAttackRolls, setAllAttackRolls] = useState([]);
  const [showAttackSetup, setShowAttackSetup] = useState(true);

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
    newAttack.damage = rollDamage();

    newAttack.onAttack = weaponData.on_attack || '';
    newAttack.onHit = weaponData.on_hit || '';
    newAttack.onCrit = weaponData.on_crit || '';

    console.log('New Attack:', newAttack);

    let newData = deepCopy(allAttackRolls);
    newData.push(newAttack);
    setAllAttackRolls(newData);
  }

  // Fills out the to-hit roll for the attack data.
  const rollToHit = (flatBonus, accuracyMod) => {
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

  // A sub-function of rollDamage(); records a specific roll individually and totalled by type
  const recordDamageRoll = (damageData, roll, type) => {
    // record just this roll
    damageData.rolls.push({
      roll: roll,
      type: type
    });

    // tally up the total, sorted by type
    const prevTypeTotal = (damageData.totalsByType[type] || 0);
    damageData.totalsByType[type] = prevTypeTotal + roll;
  }

  // Fills out the damage rolls for the attack data.
  const rollDamage = (newAttack) => {
    var damage = {};

    damage.totalsByType = {}
    damage.rolls = [];
    weaponData.damage.forEach(damageValAndType => {
      const damageDice = processDiceString(damageValAndType.val);

      // ROLLS
      [...Array(damageDice.count)].forEach(rollIndex => {
        recordDamageRoll(damage, getRandomInt(damageDice.dietype), damageValAndType.type)
      })

      // PLUSES TO ROLLS
      if (damageDice.bonus !== 0) {
        recordDamageRoll(damage, damageDice.bonus, damageValAndType.type)
      }
    });

    return damage;
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
              <span key={`damage-${i}`}>
                {damage.val}
                {damage.type}
              </span>
            )}
            {' ]'}
          </div>

          <div className="bonus-damage-container">

            <div className='bonus-damage-other'>
              <button className='asset plus'>
              </button>
              <button className='asset d6'>
              </button>
              Bonus damage
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
        <button className='add-target'>
          <div className='asset plus' />
          Add target
        </button>
      }


    </div>
  )
}


export default WeaponRoller;
