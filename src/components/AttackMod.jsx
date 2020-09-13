import React from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import './AttackMod.scss';

const AttackMod = ({...props }) => {

  const {
    attackID,
    dieCount, setDieCount,
    dieType, setDieType,
    modifier, setModifier,
    timing, setTiming,
    attackIcon, setAttackIcon
  } = props;

  return (
    <div className="AttackMod">

      <div className='numbers-container'>
        <input
          type="number"
          value={dieCount}
          onChange={e => setDieCount(e.target.value, attackID)}
        />

        <div className={`asset ${attackIcon}`} />

        <span className='die-type'>d{dieType}</span>

        <span className='plus'>+</span>
        <input
          type="number"
          value={modifier}
          onChange={e => setModifier(e.target.value, attackID)}
        />

        <span>Damage Modifier</span>
      </div>

      {(timing !== 'none') &&
        <RadioGroup
          name="timing"
          className='timing-container'
          selectedValue={timing}
          onChange={(value) => { setTiming(value, attackID) }}
        >
          <Radio value="all" />
          <Radio value="first" />
        </RadioGroup>
      }

    </div>
  );
}
export default AttackMod ;
