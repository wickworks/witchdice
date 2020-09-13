import React from 'react';
import './RollMod.scss';

const RollMod = ({...props }) => {

  const {
    rollID,
    rollCount, setRollCount,
    dieType, setDieType,
    modifier, setModifier,
    timing, setTiming,
    rollIcon, setRollIcon
  } = props;

  // rollID,
  // rollCount, setRollCount,
  // dieType, setDieType,
  // modifier, setModifier,
  // timing, setTiming,
  // rollIcon, setRollIcon


  console.log('roll id',rollID);
  console.log('count:',rollCount);
  console.log('die:',dieType);
  console.log('mod',modifier);
  console.log('timing',timing);
  console.log('icon',rollIcon);


  console.log('icon', rollIcon);
  const iconPath = `/assets/damagetypes/${rollIcon}.svg`;
  console.log('path', iconPath);


  return (
    <div className="RollMod">
      <input
        type="number"
        value={rollCount}
        onChange={e => setRollCount(e.target.value, rollID)}
      />

      <img src={iconPath} alt={rollIcon} />

      <span>{dieType}</span>

      <span>+</span>

      <input
        type="number"
        value={modifier}
        onChange={e => setModifier(e.target.value, rollID)}
      />

      <span>Damage Modifier</span>

      <select value={timing} onChange={e => setTiming(e.target.value, rollID)}>
        <option value="all">All</option>
        <option value="first">First Hit</option>
      </select>

    </div>
  );
}
export default RollMod ;
