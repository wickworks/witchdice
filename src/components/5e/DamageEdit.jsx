import React, {useEffect} from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import Select from 'react-select'
import {allTags, allDamageTypes, abilityTypes, allConditions} from './data.js'
import { getOptionFromValue } from '../../utils.js';
import './DamageEdit.scss';


const DamageEdit = ({
  damageID, attackID, damageData, damageFunctions,
  toggleEdit, onDelete,
  setSavingThrowDC, setSavingThrowType, savingThrowDC, savingThrowType
}) => {

  const {
    dieCount,
    dieType,
    modifier,
    tags,
    damageType,
  } = damageData;

  const {
    setDieCount,
    setModifier,
    setDieType,
    setTags,
    setCondition,
    setDamageType,
  } = damageFunctions;

  // =============== ADD / REMOVE TAG CRAP =============

  let tagOptions = [];
  for (const [key, value] of Object.entries(allTags)) {
    tagOptions.push({'value': key, 'label': value})
  }

  let selectedTags = [];
  tags.forEach((tagKey, i) => {
    selectedTags.push(getOptionFromValue(tagOptions, tagKey))
  })

  const handleTagUpdate = (selectedTags) => {
    let newTags = []
    if (selectedTags) selectedTags.forEach((tag) => { newTags.push(tag.value) })
    setTags(newTags, attackID, damageID)
  }

  // lose the condition data if we lose the associated tag
  // (should really just update it along with the tags, but we need a multi-property updating function)
  useEffect(() => {
    if (damageData.condition !== '' && !damageData.tags.includes('condition')) {
      setCondition('', attackID, damageID)
    }
  }, [damageData]);

  // =============== CHANGE MODIFIERS ============= //
  function handleSavingThrowDCClick(e, leftMouse) {
    let newDC = savingThrowDC
    if (leftMouse && !e.shiftKey) {
      newDC += 1
    } else {
      newDC -= 1
      e.preventDefault()
    }

    newDC = Math.min(newDC, 40)
    newDC = Math.max(newDC, 0)
    setSavingThrowDC(newDC, attackID, damageID)
  }

  function handleSavingThrowTypeClick(e, leftMouse) {
    let newType = savingThrowType
    if (leftMouse && !e.shiftKey) {
      newType += 1
    } else {
      newType -= 1
      e.preventDefault()
    }

    newType = newType % abilityTypes.length
    setSavingThrowType(newType, attackID, damageID);
  }

  const isRolledDie = (dieType !== 0);

  return (
    <div className='DamageEdit'>

      <div className='row'>

        { isRolledDie ?
          <input
            type="number"
            value={dieCount}
            onChange={e => setDieCount(e.target.value || 0, attackID, damageID)}
          />
        :
          <input
            type="number"
            value={modifier}
            onChange={e => setModifier(e.target.value || 0, attackID, damageID)}
          />
        }

        <DamageEditDieType
          attackID={attackID}
          die={dieType}
          setDie={(value) => setDieType(value, attackID, damageID)}
        />
      </div>

      <div className='row'>
        { isRolledDie && <>
          <span className='plus'>+</span>
          <input
            type="number"
            value={modifier}
            onChange={e => setModifier(e.target.value || 0, attackID, damageID)}
          />
        </>}

        <DamageEditDamageType
          attackID={attackID}
          type={damageType}
          setType={(value) => setDamageType(value, attackID, damageID)}
        />
      </div>

      <div className='row full'>
        <div className='tag-select'>
          <Select
            isMulti
            isSearchable={false}
            placeholder='Damage properties'
            name="tags"
            options={tagOptions}
            value={selectedTags}
            onChange={tags => handleTagUpdate(tags)}
            key='tags'
          />

        </div>

        <button className='delete' onClick={() => onDelete(damageID)}>
          <div className={'asset trash'} />
        </button>
      </div>

      <DamageEditMetadata
        damageID={damageID}
        attackID={attackID}
        damageData={damageData}
        damageFunctions={damageFunctions}
        handleTagUpdate={handleTagUpdate}
        handleSavingThrowDCClick={handleSavingThrowDCClick}
        handleSavingThrowTypeClick={handleSavingThrowTypeClick}
        savingThrowDC={savingThrowDC}
        savingThrowType={savingThrowType}
      />
    </div>
  );
}


const DamageEditMetadata = ({
  attackID, damageID,
  damageData,
  damageFunctions,
  handleTagUpdate,
  handleSavingThrowDCClick,
  handleSavingThrowTypeClick,
  savingThrowDC, savingThrowType
}) => {
  const {
    tags,
    condition
  } = damageData;

  const {
    setCondition,
  } = damageFunctions;

  return (
    <>
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
                <option value='' key='blank' disabled>Select...</option>
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

export default DamageEdit;
