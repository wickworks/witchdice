import React, { useState } from 'react';
import RollMod from './RollMod.jsx';
import './Attack.scss';

const initialRollData =
[
  {rollCount: 1, dieType: 20, modifier: 0, timing: 'none', rollIcon: 'd20'},
  {rollCount: 1, dieType: 8, modifier: 3, timing: 'all', rollIcon: 'fire'},
  {rollCount: 1, dieType: 6, modifier: 1, timing: 'first', rollIcon: 'fire'},
];

const Attack = () => {
  const [rollData, setRollData] = useState(initialRollData);

  const updateRollData = (key, value, id) => {
    console.log('updating roll',id,' data ',key,'to',value);

    let newData = [...rollData]
    newData[id][key] = value

    console.log('new data : ', newData);

    setRollData(newData);
  }

  const rollFunctions = {
    setRollCount: (rollCount, id) => updateRollData('rollCount',rollCount,id),
    setDieType: (dieType, id) => updateRollData('dieType',dieType,id),
    setModifier: (modifier, id) => updateRollData('modifier',modifier,id),
    setTiming: (timing, id) => updateRollData('timing',timing,id),
    setRollIcon: (rollIcon, id) => updateRollData('rollIcon',rollIcon,id),
  }

  return (
    <div className="Attack">
      <h2>Attack Action</h2>

      <RollMod rollID={0} {...rollData[0]} {...rollFunctions} />

      <div className='attack-timing-labels'>
        <div>All</div>
        <div>First hit</div>
      </div>

      <RollMod rollID={1} {...rollData[1]} {...rollFunctions} />
      <RollMod rollID={2} {...rollData[2]} {...rollFunctions} />

      <p>Add Damage Roll</p>
    </div>
  );
}
export default Attack ;
