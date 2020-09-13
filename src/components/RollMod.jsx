import React from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
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

  return (
    <div className="RollMod">

      <div className='numbers-container'>
        <input
          type="number"
          value={rollCount}
          onChange={e => setRollCount(e.target.value, rollID)}
        />

        <div className={`asset ${rollIcon}`} />

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
export default RollMod ;
