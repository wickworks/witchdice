import React from 'react';
import './ActiveAttackList.scss';

const ActiveAttackList = ({attackSourceData, attackFunctions}) => {
  const {setIsActive} = attackFunctions

  // to make the three-items-per-row come out nicely
  // const attackCount = attackSourceData.length;
  // const fillerAttackCount = (Math.ceil(attackCount / 3) * 3) - attackCount;

  return (
    <div className="ActiveAttackList">
      <h2 className="roll-attacks">~ Roll attacks ~</h2>

      <div className="attacks-container">
        { attackSourceData.map((attackSource, attackID) => {
          const {isActive} = attackSource;
          const activeClass = isActive ? 'active' : '';

          const showAttack =
            (attackSource.type === 'attack' && attackSource.damageData.length > 0) ||
            attackSource.type === 'save';

          if (showAttack) {
            return (
              <label className={`attack unselectable ${activeClass}`} key={`active-${attackSource.name}`}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => setIsActive(!isActive, attackID)}
                />
                <div className='name'>{attackSource.name}</div>
                {attackSource.dieCount > 1 &&
                  <div className='count'>
                    x{attackSource.dieCount}
                  </div>
                }
              </label>
            )
          } else { return null }
        })}
      </div>
    </div>
  );
}



export default ActiveAttackList;
