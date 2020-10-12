import React from 'react';
import './ActiveAttackList.scss';

const ActiveAttackList = ({attackSourceData, attackFunctions}) => {
  const {setIsActive, setDieCount} = attackFunctions

  // to make the three-items-per-row come out nicely
  // const attackCount = attackSourceData.length;
  // const fillerAttackCount = (Math.ceil(attackCount / 3) * 3) - attackCount;

  function handleAttackCountClick(e, leftMouse, currentCount, attackID) {
    let newDieCount = currentCount;

    if (leftMouse && !e.shiftKey) {
      newDieCount += 1;
    } else {
      newDieCount -= 1;
      e.preventDefault()
    }

    newDieCount = Math.min(newDieCount, 99);
    newDieCount = Math.max(newDieCount, 0);
    setDieCount(newDieCount, attackID);
  }

  return (
    <div className="ActiveAttackList">
      <h2 className="roll-attacks">~ Roll attacks ~</h2>

      <div className="all-attacks-container">
        { attackSourceData.map((attackSource, attackID) => {
          const {isActive} = attackSource;
          const activeClass = isActive ? 'active' : '';

          const showAttack =
            (attackSource.type === 'attack' && attackSource.damageData.length > 0) ||
            attackSource.type === 'save';

          if (showAttack) {
            return (
              <div className="attack-container" key={attackID}>
                <label className={`attack unselectable ${activeClass}`} key={`active-${attackSource.name}`}>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => setIsActive(!isActive, attackID)}
                  />
                  <div className='name'>{attackSource.name}</div>
                </label>

                <button
                  className='attack-count'
                  onClick={(e) => handleAttackCountClick(e, true, attackSource.dieCount, attackID)}
                  onContextMenu={(e) => handleAttackCountClick(e, false, attackSource.dieCount, attackID)}
                >
                  x {attackSource.dieCount}
                </button>
              </div>
            )
          } else { return null }
        })}
      </div>
    </div>
  );
}



export default ActiveAttackList;
