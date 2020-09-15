import React from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import './DamageEdit.scss';

const defaultDamageData = { dieType: 6, damageType:'slashing' }

const DamageEdit = ({
  attackID, die, setDie, type, setType,
  onDelete, onClose
}) => {

  return (
    <div className="DamageEdit extra-css">
      <div className='icons-container'>

        <div className='dice'>
          <IconMenu
            groupName={`select-die-type-${attackID}`}
            allIcons={[4,6,8,10,12,0]}
            selectedIcon={die}
            setIcon={setDie}
            showLabels={true}
          />
        </div>

        <div className='types'>
          <IconMenu
            groupName={`select-damage-type-${attackID}`}
            allIcons={['slashing','piercing','bludgeoning','fire','cold','lightning','thunder','acid','poison','psychic','necrotic','radiant','force']}
            selectedIcon={type}
            setIcon={setType}
            showLabels={false}
          />
        </div>

        <div className='buttons-container'>
          <button className='delete' onClick={() => onDelete()}>
            <div className={'asset trash'} />
          </button>
          <button className='accept' onClick={() => onClose()}>
            <div className={'asset checkmark'} />
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

    // e.g. converts from 6 to 'd6'
    return `d${iconName}`
  }

  // shows 'flat' label
  function getIconName(iconName) {
    if (iconName === 0) {return 'flat'}
    return getIconFile(iconName);
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
              { showLabels && <div className='label'>{getIconName(icon)}</div> }
            </label>
          </div>
        )
      })}

    </RadioGroup>
  )
}

export default DamageEdit;
