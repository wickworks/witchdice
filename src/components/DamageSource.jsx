import React, { useState } from 'react';
import { Multiselect } from 'multiselect-react-dropdown';
import './DamageSource.scss';
import { allTags, allConditions, abilityTypes } from '../data.js';
import DamageEdit from './DamageEdit.jsx';

const DamageSource = ({
  damageID, attackID, damageData, damageFunctions,
  isEditing, onEdit, onDelete,
  setSavingThrowDC, setSavingThrowType, savingThrowDC, savingThrowType
}) => {

  const {
    dieCount,
    dieType,
    modifier,
    tags,
    damageType,
    enabled,
    name,
    condition
  } = damageData;

  const {
    setDieCount,
    setDieType,
    setModifier,
    setTags,
    setDamageType,
    setEnabled,
    setName,
    setCondition,
  } = damageFunctions;

  const [hoveringOverCheckBox, setHoveringOverCheckBox] = useState(false);


  const editingClass = isEditing ? 'editing' : '';

  const handleContainerClick = () => {
    if (hoveringOverCheckBox) { return }
    if (!isEditing) { onEdit(damageID) }
  }

  // =============== ADD / REMOVE TAG CRAP =============

  let tagOptions = [];
  for (const [key, value] of Object.entries(allTags)) {
    tagOptions.push({name: value, id: key})
  }

  let selectedTags = [];
  let selectedTagNames = [];
  tags.forEach((tagKey, i) => {
    selectedTags.push({name: allTags[tagKey], id: tagKey})
    selectedTagNames.push(allTags[tagKey])
  })

  const handleTagUpdate = (selectedTags) => {
    let newTags = []
    selectedTags.forEach((tag) => { newTags.push(tag.id) })
    setTags(newTags, attackID, damageID)
  }

  function handleSavingThrowDCClick(e, leftMouse) {
    let newDC = savingThrowDC;

    if (leftMouse && !e.shiftKey) {
      newDC += 1;
    } else {
      newDC -= 1;
      e.preventDefault()
    }

    newDC = Math.min(newDC, 40);
    newDC = Math.max(newDC, 0);
    setSavingThrowDC(newDC, attackID, damageID);
  }

  function handleSavingThrowTypeClick(e, leftMouse) {
    let newType = savingThrowType;

    if (leftMouse && !e.shiftKey) {
      newType += 1;
    } else {
      newType -= 1;
      e.preventDefault()
    }

    newType = newType % abilityTypes.length
    setSavingThrowType(newType, attackID, damageID);
  }

  function renderEditMetaData() {
    return(
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
      </>
    )
  }

  return (
    <div className={`DamageSource ${editingClass}`} onClick={handleContainerClick} >

      <div className='stats-container'>
        <input
          type="checkbox"
          checked={enabled}
          onChange={() => setEnabled(!enabled, attackID, damageID)}
          onMouseEnter={() => setHoveringOverCheckBox(true)}
          onMouseLeave={() => setHoveringOverCheckBox(false)}
        />

        {/* SUMMARY MODE */}
        {!isEditing ?
          <div className="summary">
            <div className="roll-numbers">
              { (dieType === 0) ?
                <>{modifier} flat</>
              :
                <>
                  {dieCount}d{dieType}
                  {modifier > 0 ? ` + ${modifier}` : ''}
                </>
              }
            </div>

            <div className={`asset ${damageType}`} />

            <div className="name">
              {name.length > 0 ? name : 'damage'}
            </div>

            <div className="tags">{selectedTagNames.join(', ')}</div>
          </div>
        :
          <>
          {/* EDIT MODE */}
          <div className='edit-mode'>
            { (dieType === 0) ? <>
              {/* FLAT DAMAGE */}
              <input
                type="number"
                value={modifier}
                onChange={e => setModifier(e.target.value, attackID, damageID)}
              />

              <div
                className={`asset ${damageType}`}
              />

              <span className='flat-damage'>Flat Damage</span>

              {renderEditMetaData()}

            </> : <>
              {/* DICE ROLL */}
              <input
                type="number"
                value={dieCount}
                onChange={e => setDieCount(e.target.value, attackID, damageID)}
              />

              <div
                className={`asset d${dieType}`}
                onClick={() => onEdit(attackID, damageID)}
              />

              <span className='die-type'>d{dieType}</span>

              <span className='plus'>+</span>
              <input
                type="number"
                value={modifier}
                onChange={e => setModifier(e.target.value, attackID, damageID)}
              />

              <div
                className={`asset ${damageType}`}
              />


              {renderEditMetaData()}

            </>}
          </div>

          </>
        }
      </div>

      {isEditing &&

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
                    {allConditions.map((conditionName, i) => {
                      return (<option value={conditionName} key={i}>{conditionName}</option>)
                    })}
                  </select>
                  condition.
                </div>
              }
            </div>
          }

          <DamageEdit
            attackID={attackID}
            die={dieType}
            type={damageType}
            setDie={(value) => setDieType(value, attackID, damageID)}
            setType={(value) => setDamageType(value, attackID, damageID)}
            onDelete={() => onDelete(damageID)}
            onClose={() => onEdit(damageID)}
          />
        </>
      }
    </div>
  );
}

// <input
//   type="text"
//   value={tags}
//   onChange={e => setTags(e.target.value, attackID, damageID)}
//   placeholder={'Tags'}
// />

export default DamageSource ;
