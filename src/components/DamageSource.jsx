import React, { useState } from 'react';
// import {RadioGroup, Radio} from 'react-radio-group';
import './DamageSource.scss';
import DamageEdit from './DamageEdit.jsx';

const DamageSource = ({...props }) => {
  const {
    attackID, damageID,
    isEditing, onEdit, onAccept, onDelete,

    dieCount, setDieCount,
    dieType, setDieType,
    modifier, setModifier,
    tags, setTags,
    damageType, setDamageType,
    enabled, setEnabled,
    name, setName,
  } = props;

  const [hoveringOverCheckBox, setHoveringOverCheckBox] = useState(false);


  const editingClass = isEditing ? 'editing' : '';

  const handleContainerClick = () => {
    if (hoveringOverCheckBox) { return }
    if (!isEditing) { onEdit(damageID) }
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
                  {modifier > 0 ? `+ ${modifier}` : ''}
                </>
              }
            </div>

            <div className={`asset ${damageType}`} />

            <div className="name">
              {name.length > 0 ? name : 'damage'}
            </div>

            <div className="tags">{tags.join(', ')}</div>
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
                value={name}
                onChange={e => setName(e.target.value, attackID, damageID)}
                placeholder={'Damage name'}
              />

              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value, attackID, damageID)}
                placeholder={'Tags'}
              />

            </>}
          </div>

          </>
        }
      </div>

      {isEditing &&
        <DamageEdit
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
export default DamageSource ;
