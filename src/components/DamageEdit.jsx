import React from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import { Multiselect } from 'multiselect-react-dropdown';
import {allTags, allDamageTypes, abilityTypes, allConditions} from '../data.js'
import './DamageEdit.scss';


const DamageEditNumbers = ({
  damageID, attackID,
  damageData,
  damageFunctions,
}) => {

  const {
    dieCount,
    dieType,
    modifier,
    damageType,
  } = damageData;

  const {
    setDieCount,
    setModifier,
  } = damageFunctions;

  return (
    <div className='DamageEditNumbers'>
      { (dieType === 0) ? <>
        {/* FLAT DAMAGE */}
        <input
          type="number"
          value={modifier}
          onChange={e => setModifier(e.target.value, attackID, damageID)}
        />

        <div className={`asset ${damageType} damage-type`}/>

        <span className={`flat-damage`}>
          Flat Damage
        </span>


      </> : <>
        {/* DICE ROLL */}
        <input
          type="number"
          value={dieCount}
          onChange={e => setDieCount(e.target.value, attackID, damageID)}
        />

        <div className='die-container'>
          <div className={`asset d${dieType}`} />

          <span className='die-type'>
            d{dieType}
          </span>
        </div>

        <span className='plus'>+</span>

        <input
          type="number"
          value={modifier}
          onChange={e => setModifier(e.target.value, attackID, damageID)}
        />

        <div className={`asset ${damageType} damage-type`} />

      </>}
    </div>
  );
}


const DamageEditMetadata = ({
  attackID, damageID,
  damageData,
  damageFunctions,
  selectedTags,
  handleTagUpdate,
  handleSavingThrowDCClick,
  handleSavingThrowTypeClick,
  savingThrowDC, savingThrowType
}) => {
  const {
    tags,
    name,
    condition
  } = damageData;

  const {
    // setTags,
    setName,
    setCondition,
  } = damageFunctions;


  let tagOptions = [];
  for (const [key, value] of Object.entries(allTags)) {
    tagOptions.push({name: value, id: key})
  }

  return (
    <>
      <input
        type="text"
        className='damage-name'
        value={name}
        onChange={e => setName(e.target.value, attackID, damageID)}
        placeholder={'Damage source'}
      />

      <div className='tag-select'>
        <Multiselect
          options={tagOptions}
          displayValue="name"
          hidePlaceholder={true}
          selectedValues={selectedTags}
          closeIcon='cancel'
          onSelect={(tag) => handleTagUpdate(tag)}
          onRemove={(tag) => handleTagUpdate(tag)}
        />
        {(tags.length === 0) && <label>Damage tags</label>}
      </div>

      { (tags.includes('triggeredsave') || tags.includes('condition')) &&
        <div className='additional-info'>

          { tags.includes('triggeredsave') &&
            <div className='saving-throw'>
              Triggers a
              <div
                className='saving-throw-dc unselectable'
                onClick={(e) => handleSavingThrowDCClick(e, true)}
                onContextMenu={(e) => handleSavingThrowDCClick(e, false)}
              >
                DC {savingThrowDC}
              </div>
              <div
                className='saving-throw-type unselectable'
                onClick={(e) => handleSavingThrowTypeClick(e, true)}
                onContextMenu={(e) => handleSavingThrowTypeClick(e, false)}
              >
                {abilityTypes[savingThrowType]}
              </div>
              save.
            </div>
          }

          { tags.includes('condition') &&
            <div className='condition-select'>
              Applies the
              <select value={condition} onChange={(e) => setCondition(e.target.value, attackID,damageID)}>
                {allConditions.map((conditionName, i) => {
                  return (<option value={conditionName} key={i}>{conditionName}</option>)
                })}
              </select>
              condition.
            </div>
          }
        </div>
      }
    </>
  );
}



const DamageEditDieType = ({
  attackID, die, setDie,
}) => {

  return (
    <div className='DamageEditDieType'>
      <IconMenu
        groupName={`select-die-type-${attackID}`}
        allIcons={[4,6,8,10,12,0]}
        selectedIcon={die}
        setIcon={setDie}
        showLabels={true}
      />
    </div>
  );
}

const DamageEditDamageType = ({
  attackID, type, setType,
}) => {

  return (
    <div className='DamageEditDamageType'>
      <IconMenu
        groupName={`select-damage-type-${attackID}`}
        allIcons={allDamageTypes}
        selectedIcon={type}
        setIcon={setType}
        showLabels={false}
      />
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

export {DamageEditDamageType, DamageEditMetadata, DamageEditNumbers, DamageEditDieType};
