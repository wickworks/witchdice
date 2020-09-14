import React from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import './DamageSource.scss';

const DamageSource = ({...props }) => {

  const {
    attackID,
    dieCount, setDieCount,
    dieType, setDieType,
    modifier, setModifier,
    timing, setTiming,
    damageType, setDamageType,
    enabled, setEnabled,
    name, setName,
    onEdit
  } = props;

  const rollType = timing === 'none' ? 'Attack' : 'Damage';

  console.log('attack mod ',name, 'enabled ', enabled);

  return (
    <div className="DamageSource">

      {(rollType === 'Damage') &&
        <div className='meta-container'>
          <input
            type="checkbox"
            checked={enabled}
            onChange={e => setEnabled(!enabled, attackID)}
          />

          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value, attackID)}
            placeholder={'Damage name'}
          />
        </div>
      }

      <div className='numbers-container'>
        { (dieType === 0) ? <>
          <input
            type="number"
            value={modifier}
            onChange={e => setModifier(e.target.value, attackID)}
          />

          <div
            className={`asset ${damageType} clickable`}
            onClick={() => onEdit(attackID)}
          />

          <span>Flat Damage</span>
        </> : <>
          <input
            type="number"
            value={dieCount}
            onChange={e => setDieCount(e.target.value, attackID)}
          />

          { rollType === 'Damage' ?
            <div
              className={`asset ${damageType} clickable`}
              onClick={() => onEdit(attackID)}
            />
          :
            <div className={`asset ${damageType}`} />
          }

          <span className='die-type'>d{dieType}</span>

          <span className='plus'>+</span>
          <input
            type="number"
            value={modifier}
            onChange={e => setModifier(e.target.value, attackID)}
          />

          <span>{rollType} Mod</span>
        </>}

      </div>

      {(rollType === 'Damage') &&
        <RadioGroup
          name={`timing-${attackID}`}
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
export default DamageSource ;
