import React, { useState, useEffect } from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import './AddDamage.scss';

const defaultDamageData = { dieType: 6, damageType:'slashing' }

const AddDamage = ({startingData, onCancel, onDelete, onAccept}) => {
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

  return (
    <div className="AddDamage">
      <div className='icons-container'>

        <div className='dice'>
          <IconMenu
            groupName={'select-die-type'}
            allIcons={[4,6,8,10,12,0]}
            selectedIcon={die}
            setIcon={setDie}
            showLabels={true}
          />
        </div>

        <div className='horiz-divider' />

        <div className='types'>
          <IconMenu
            groupName={'select-damage-type'}
            allIcons={['slashing','piercing','bludgeoning','fire','cold','lightning','thunder','acid','poison','psychic','necrotic','radiant','force']}
            selectedIcon={type}
            setIcon={setType}
            showLabels={false}
          />
        </div>
      </div>

      <div className='buttons-container'>
        <button className='accept' onClick={() => onAccept(die, type)}>
          Accept
        </button>
        <button className='cancel' onClick={() => onCancel()}>
          Cancel
        </button>

        { (startingData !== null) &&
          <button className='delete' onClick={() => onDelete()}>
            Delete
          </button>
        }
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
