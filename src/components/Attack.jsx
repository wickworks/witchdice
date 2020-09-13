import React, { useState } from 'react';
import RollMod from './RollMod.jsx';
import './Attack.scss';

const initialRollData =
[
  {rollCount: 1, dieType: 8, modifier: 2, timing: 'first', rollIcon: 'fire'}
];

const Attack = () => {
  const [rollData, setRollData] = useState(initialRollData);

  const setRollCount = (rollCount, id) => { rollData[id]['rollCount'] = rollCount }
  const setDieType = (dieType, id) => { rollData[id]['dieType'] = dieType }
  const setModifier = (modifier, id) => { rollData[id]['modifier'] = modifier }
  const setTiming = (timing, id) => { rollData[id]['timing'] = timing }
  const setRollIcon = (rollIcon, id) => { rollData[id]['rollIcon'] = rollIcon }

  // so we can easily pass them into RollMods
  const rollFunctions = {
    setRollCount: setRollCount,
    setDieType: setDieType,
    setModifier: setModifier,
    setTiming: setTiming,
    setRollIcon: setRollIcon
  }

  // console.log('rolldata', rollData[0]);

  // <RollMod {...rollData[0]} {...rollFunctions} idD={0} />


  return (
    <div className="Attack">
      <h2>Attack Action</h2>
      <RollMod rollID={0} {...rollData[0]} {...rollFunctions} />


      <p>X Damage Name 1 d8 + 3 Damage Modifier All</p>
      <p>X Damage Name 5 Flat Damage All</p>
      <p>X Damage Name 1 d8 + 3 Damage Modifier First hit</p>
      <p>Add Damage Roll</p>
    </div>
  );
}
export default Attack ;
