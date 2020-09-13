import React, { useState } from 'react';
import AttackMod from './AttackMod.jsx';
import Roller from './Roller.jsx';

import './Attack.scss';

const initialAttackData =
[
  {dieCount: 1, dieType: 20, modifier: 0, timing: 'none', attackIcon: 'd20'},
  {dieCount: 1, dieType: 8, modifier: 3, timing: 'all', attackIcon: 'fire'},
  {dieCount: 1, dieType: 6, modifier: 1, timing: 'first', attackIcon: 'fire'},
];

const Attack = () => {
  const [attackData, setAttackData] = useState(initialAttackData);

  const updateAttackData = (key, value, id) => {
    let newData = [...attackData]
    newData[id][key] = value
    setAttackData(newData);
  }

  const attackFunctions = {
    setDieCount: (dieCount, id) => updateAttackData('dieCount',dieCount,id),
    setDieType: (dieType, id) => updateAttackData('dieType',dieType,id),
    setModifier: (modifier, id) => updateAttackData('modifier',modifier,id),
    setTiming: (timing, id) => updateAttackData('timing',timing,id),
    setAttackIcon: (attackIcon, id) => updateAttackData('attackIcon',attackIcon,id),
  }

  return (
    <>
      <div className="Attack">
        <h2>Attack Action</h2>

        <AttackMod attackID={0} {...attackData[0]} {...attackFunctions} />

        <div className='attack-timing-labels'>
          <div>All</div>
          <div>First hit</div>
        </div>

        <AttackMod attackID={1} {...attackData[1]} {...attackFunctions} />
        <AttackMod attackID={2} {...attackData[2]} {...attackFunctions} />

        <p>Add Damage Roll</p>
      </div>

      <Roller />
    </>
  );
}
export default Attack ;
