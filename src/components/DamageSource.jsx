import React, { useState } from 'react';
import { Multiselect } from 'multiselect-react-dropdown';
import './DamageSource.scss';
import { allTags } from '../data.js';
import DamageEdit from './DamageEdit.jsx';

const DamageSource = ({
  damageID, attackID, damageData, damageFunctions,
  isEditing, onEdit, onDelete
}) => {
  const { dieCount, dieType, modifier, tags, damageType, enabled, name } = damageData;
  const { setDieCount, setDieType, setModifier, setTags, setDamageType, setEnabled, setName } = damageFunctions;

  const [hoveringOverCheckBox, setHoveringOverCheckBox] = useState(false);


  const editingClass = isEditing ? 'editing' : '';

  const handleContainerClick = () => {
    if (hoveringOverCheckBox) { return }
    if (!isEditing) { onEdit(damageID) }
  }

  // =============== ADD / REMOVE TAG CRAP =============

  let tagOptions = []; // [{name: 'First hit only', id: 'first'}, {name: 'Maximized damage', id: 'maximized'}]
  for (const [key, value] of Object.entries(allTags)) {
    tagOptions.push({name: value, id: key})
  }

  let selectedTags = [];
  let selectedTagNames = [];
  tags.map((tagKey, i) => {
    selectedTags.push({name: allTags[tagKey], id: tagKey})
    selectedTagNames.push(allTags[tagKey])
  })

  const handleTagUpdate = (selectedTags) => {
    let newTags = []
    selectedTags.map((tag) => { newTags.push(tag.id) })
    setTags(newTags, attackID, damageID)
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

              <span>Flat Damage</span>
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

            </>}
          </div>

          </>
        }
      </div>

      {isEditing &&
        <DamageEdit
          attackID={attackID}
          die={dieType}
          type={damageType}
          setDie={(value) => setDieType(value, attackID, damageID)}
          setType={(value) => setDamageType(value, attackID, damageID)}
          onDelete={() => onDelete(damageID)}
          onClose={() => onEdit(damageID)}
        />
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
