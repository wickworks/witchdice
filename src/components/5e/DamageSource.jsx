import React from 'react';
import './DamageSource.scss';
import { allTags, abilityTypes } from './data.js';

const DamageSource = ({
  damageData, damageID,
  savingThrowDC, savingThrowType,
  isEditing, toggleEdit,
}) => {
  const {
    tags,
  } = damageData;

  let selectedTags = [];
  let selectedTagNames = [];
  tags.forEach((tagKey, i) => {
    selectedTags.push({name: allTags[tagKey], id: tagKey})
    selectedTagNames.push(allTags[tagKey])
  })

  const editingClass = isEditing ? 'editing' : '';

  return (
    <div className={`DamageSource ${editingClass}`} onClick={() => toggleEdit(damageID)} >
      <DamageNumbers damageData={damageData} />

      <DamageMetadata
        damageData={damageData}
        selectedTags={selectedTags}
        savingThrowDC={savingThrowDC}
        savingThrowType={savingThrowType}
      />
    </div>
  )
}

const DamageNumbers = ({
  damageData
}) => {

  const {
    dieCount,
    dieType,
    modifier,
    damageType,
  } = damageData;

  return (
    <>
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
    </>
  );
}

const DamageMetadata = ({
  damageData,
  selectedTags,
  savingThrowDC, savingThrowType
}) => {
  const { name } = damageData;

  const displayTags =
    selectedTags.map(tag => {
      if (tag.id === 'triggeredsave') {
        return `DC ${savingThrowDC} ${abilityTypes[savingThrowType]}`
      } else if (tag.id === 'condition') {
        return damageData.condition
      } else {
        return tag.name
      }
    })

  return (
    <>
      { (name.length > 0) &&
        <div className="name">{name}</div>
      }

      <div className="tags">{displayTags.join(', ')}</div>
    </>
  );
}


export default DamageSource ;
