import React, { useState } from 'react';
import WeaponAttack from './WeaponAttack.jsx';
import WeaponAttackSetup from './WeaponAttackSetup.jsx';
import { getRandomInt, deepCopy } from '../../utils.js';

import { allTags } from './data.js';

import './WeaponRoller.scss';


const WeaponRoller = ({
  weaponData,
  gritBonus,
}) => {
  const [allAttackRolls, setAllAttackRolls] = useState([]);
  const [showAttackSetup, setShowAttackSetup] = useState(true);

  let weaponTags = []
  weaponData.tags.map(tag => {
    const tagData = allTags.find(weapontag => weapontag.id === tag.id);
    weaponTags.push(tagData.name)
  })

  const createNewAttackRoll = (flatBonus, accuracyMod) => {
    let newAttack = {};

    newAttack.baseRoll = getRandomInt(20)

    newAttack.accuracyRolls = [...Array(Math.abs(accuracyMod))];
    newAttack.accuracyRolls.map((accuracy, i) => {
      newAttack.accuracyRolls[i] = getRandomInt(6)
    });
    newAttack.accuracyBonus = Math.max(...newAttack.accuracyRolls) * Math.sign(accuracyMod)

    newAttack.flatBonus = flatBonus

    newAttack.finalResult = newAttack.baseRoll + newAttack.flatBonus + newAttack.accuracyBonus

    let newData = deepCopy(allAttackRolls);
    newData.push(newAttack);
    setAllAttackRolls(newData);
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
