import React, { useState } from 'react';
import './ActiveAttackList.scss';

const ActiveAttackList = ({attackSourceData, attackFunctions}) => {
  const {setIsActive, setDieCount} = attackFunctions

  // to make the three-items-per-row come out nicely
  // const attackCount = attackSourceData.length;
  // const fillerAttackCount = (Math.ceil(attackCount / 3) * 3) - attackCount;

  return (
    <div className="ActiveAttackList">
      <h2 className="roll-attacks">~ Roll attacks ~</h2>

      <div className="all-attacks-container">
        { attackSourceData.map((attackSource, attackID) => {
          const {isActive} = attackSource;
          const activeClass = isActive ? 'active' : '';

          const showAttack =
            (attackSource.type === 'attack' && attackSource.damageData.length > 0) ||
            (attackSource.type === 'save') ||
            (attackSource.type === 'ability' && attackSource.damageData.length > 0);

          if (showAttack) {
            return (
              <div className={`attack-container ${activeClass}`} key={attackID}>
                <label className='attack unselectable' key={`active-${attackSource.name}`}>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => setIsActive(!isActive, attackID)}
                  />
                  <div className='name'>{attackSource.name}</div>
                </label>

                <AttackCount
                  dieCount={attackSource.dieCount}
                  setDieCount={attackFunctions.setDieCount}
                  attackID={attackID}
                />
              </div>
            )
          } else { return null }
        })}
      </div>
    </div>
  );
}


const AttackCount = ({dieCount, setDieCount, attackID}) => {
  const [inputCount, setInputCount] = useState(dieCount);


  function handleAttackCountClick(e, leftMouse, currentCount, attackID) {
    let newDieCount = currentCount;

    if (leftMouse && !e.shiftKey) {
      newDieCount += 1;
    } else {
      newDieCount -= 1;
      e.preventDefault()
    }

    newDieCount = Math.min(newDieCount, 99);
    newDieCount = Math.max(newDieCount, 1);
    setDieCount(newDieCount, attackID);
    setInputCount(newDieCount)
  }


  return (
    <div className="AttackCount">
      { dieCount < 10 ?
        <button
          className='attack-count'
          onClick={(e) => handleAttackCountClick(e, true, dieCount, attackID)}
          onContextMenu={(e) => handleAttackCountClick(e, false, dieCount, attackID)}
        >
          x {dieCount}
        </button>
      :
        <input
          className='attack-count'
          type="number"
          value={inputCount}
          onChange={e => setInputCount(Math.max(Math.min(e.target.value, 999), 1))}
          onBlur={() => setDieCount( inputCount, attackID )}
        />
      }
    </div>
  );
}



export default ActiveAttackList;
