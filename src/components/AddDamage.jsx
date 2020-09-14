import React, { useState, useEffect } from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import './AddDamage.scss';

const defaultDamageData = { dieType: 6, damageType:'slashing' }

const AddDamage = ({startingData, onDelete, onAccept, onClose}) => {
  const [initialData, setInitialData] = useState(defaultDamageData)
  const [die, setDie] = useState(initialData.dieType);
  const [type, setType] = useState(initialData.damageType);

  // whenever we're given new initial data, reset the selected icons appropriately
  if (
    startingData !== null &&
    (startingData.dieType !== initialData.dieType ||
    startingData.damageType !== initialData.damageType)
  ) {
    setInitialData(startingData);
    setDie(startingData.dieType);
    setType(startingData.damageType);
  }

  const handleChangeDie = (newDie) => {
    setDie(newDie);
    if (startingData !== null) { onAccept(newDie, type); } // do edits immediately
  }

  const handleChangeType = (newType) => {
    setType(newType);
    if (startingData !== null) { onAccept(die, newType); } // do edits immediately
  }

  return (
    <div className="AddDamage extra-css">
      <div className='icons-container'>

        <div className='dice'>
          <IconMenu
            groupName={'select-die-type'}
            allIcons={[4,6,8,10,12,0]}
            selectedIcon={die}
            setIcon={handleChangeDie}
            showLabels={true}
          />
        </div>

        <div className='types'>
          <IconMenu
            groupName={'select-damage-type'}
            allIcons={['slashing','piercing','bludgeoning','fire','cold','lightning','thunder','acid','poison','psychic','necrotic','radiant','force']}
            selectedIcon={type}
            setIcon={handleChangeType}
            showLabels={false}
          />
        </div>

        <div className='delete-container'>
          <button className='delete' onClick={() => onDelete()}>
            <div className={'asset trash'} />
          </button>
        </div>
      </div>
    </div>
  );
}

const IconMenu = (props) => {
  const {
    allIcons, groupName,
    selectedIcon, setIcon,
    showLabels,
  } = props;


  function getIconFile(iconName) {
    // damage types are their own icon name
    if (typeof(iconName) === 'string') {return iconName}

    // e.g. converts from 6 to 'd6' or 0 to 'flat'
    if (iconName === 0) {
      return 'flat'
    } else {
      return `d${iconName}`
    }
  }

  return (
    <RadioGroup
      name={groupName}
      className={'IconMenu'}
      selectedValue={selectedIcon}
      onChange={(value) => { setIcon(value) }}
    >
      { allIcons.map((icon, i) => {
        const radioID = `${groupName}-${i}`;
        return (
          <div className='icon-button' key={`radio-${radioID}`}>
            <Radio value={icon} id={radioID} />
            <label htmlFor={radioID} >
              <div className={`asset ${getIconFile(icon)}`} />
              { showLabels && <div className='label'>{getIconFile(icon)}</div> }
            </label>
          </div>
        )
      })}

    </RadioGroup>
  )
}

export default AddDamage;
