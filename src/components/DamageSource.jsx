import React from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import './DamageSource.scss';

const DamageSource = ({...props }) => {

  const {
    attackID, damageID,
    dieCount, setDieCount,
    dieType, setDieType,
    modifier, setModifier,
    tags, setTags,
    damageType, setDamageType,
    enabled, setEnabled,
    name, setName,
    onEdit, extraClass
  } = props;


  return (
    <div className={`DamageSource ${extraClass}`}>

      <div className='meta-container'>
        <input
          type="checkbox"
          checked={enabled}
          onChange={e => setEnabled(!enabled, attackID, damageID)}
        />

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value, attackID, damageID)}
          placeholder={'Damage name'}
        />
      </div>

      <div className='numbers-container'>
        { (dieType === 0) ? <>
          <input
            type="number"
            value={modifier}
            onChange={e => setModifier(e.target.value, attackID, damageID)}
          />

          <div
            className={`asset ${damageType} clickable`}
            onClick={() => onEdit(attackID, damageID)}
          />

          <span>Flat Damage</span>
        </> : <>

          <input
            type="number"
            value={dieCount}
            onChange={e => setDieCount(e.target.value, attackID, damageID)}
          />

          <div
            className={`asset ${damageType} clickable`}
            onClick={() => onEdit(attackID, damageID)}
          />

          <span className='die-type'>d{dieType}</span>

          <span className='plus'>+</span>
          <input
            type="number"
            value={modifier}
            onChange={e => setModifier(e.target.value, attackID, damageID)}
          />

        </>}

      </div>

      <input
        type="text"
        value={tags}
        onChange={e => setTags(e.target.value, attackID, damageID)}
        placeholder={'Tags'}
      />

    </div>
  );
}
export default DamageSource ;
