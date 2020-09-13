import React from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import './AttackMod.scss';

const AttackMod = ({...props }) => {

  const {
    rollID,
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
          onChange={e => setDieCount(e.target.value, rollID)}
        />

        <div className={`asset ${attackIcon}`} />

        <span>d{dieType} +</span>

        <input
          type="number"
          value={modifier}
          onChange={e => setModifier(e.target.value, rollID)}
        />

        <span>Damage Modifier</span>
      </div>

      {(timing !== 'none') &&
        <RadioGroup
          name="timing"
          className='timing-container'
          selectedValue={timing}
          onChange={(value) => { setTiming(value, rollID) }}
        >
          <Radio value="all" />
          <Radio value="first" />
        </RadioGroup>
      }

    </div>
  );
}
export default AttackMod ;
