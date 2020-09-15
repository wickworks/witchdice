import React, { useState, useEffect } from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import DamageSource from './DamageSource.jsx';
import DamageEdit from './DamageEdit.jsx';
import './AttackSource.scss';

const defaultDamageData =
  {dieCount: 1, dieType: 6, modifier: 0, damageType: 'slashing', name: '', tags: [], enabled: true};

const AttackSource = ({...props}) => {
  const {
    attackID,
    damageData, setDamageData,
    dieCount, setDieCount,
    modifier, setModifier,
    name, setName,
  } = props;

  const [damageEditIsOpen, setDamageEditIsOpen] = useState(false);
  const [editingDamageID, setEditingDamageID] = useState(null);


  // =============== DATA PASSING =============

  const damageFunctions = {
    setDieCount: (value, attackID,damageID) => updateDamageData('dieCount',parseInt(value),attackID,damageID),
    setDieType: (value, attackID,damageID) => updateDamageData('dieType',parseInt(value),attackID,damageID),
    setModifier: (value, attackID,damageID) => updateDamageData('modifier',parseInt(value),attackID,damageID),
    setDamageType: (value, attackID,damageID) => updateDamageData('damageType',value,attackID,damageID),
    setName: (value, attackID,damageID) => updateDamageData('name',value,attackID,damageID),
    setTags: (value, attackID,damageID) => updateDamageData('tags',value,attackID,damageID),
    setEnabled: (value, attackID,damageID) => updateDamageData('enabled',value,attackID,damageID),
  }

  const updateDamageData = (key, value, attackID, damageID) => {
    let newData = [...damageData]
    newData[damageID][key] = value
    setDamageData(newData);
  }

  // =============== ADD / EDIT SOURCES =============

  const openEditForDamage = (damageID) => {
    if (editingDamageID === damageID) { // already open; we clicked to close
      setDamageEditIsOpen(false);
    } else {
      setEditingDamageID(damageID);
      setDamageEditIsOpen(true);
    }
  }

  const updateDamage = (die, type) => {
    let newData = [...damageData];
    newData[editingDamageID].dieType = die
    newData[editingDamageID].damageType = type
    setDamageData(newData);
  }

  const createDamage = () => {
    let newData = [...damageData];
    let newDamage = {...defaultDamageData}
    newData.push(newDamage);
    setDamageData(newData);
  }

  const deleteDamage = (damageID) => {
    let newData = [...damageData];
    newData.splice(damageID, 1);
    setDamageData(newData);
    setDamageEditIsOpen(false);
  }

  // clear out the "we're editing this damage" whenever the panel closes
  useEffect(() => {
    if (!damageEditIsOpen) { setEditingDamageID(null) }
  }, [damageEditIsOpen]);



  const renderDamageEdit = (damageSourceID) => {
    if (damageEditIsOpen && editingDamageID === damageSourceID) {
      return (
        <DamageEdit
          startingData={editingDamageID === null ? null : damageData[editingDamageID]}
          onDelete={() => deleteDamage(damageSourceID)}
          onAccept={(die, type) => updateDamage(die, type)}
          onClose={() => setDamageEditIsOpen(false)}
        />
      )
    }
  }

  return (
    <div className='AttackSource'>
      <div className='die-count-container'>
        <div className='asset d20'>
          <div className='die-count'>{dieCount}</div>
        </div>
      </div>

      <div className='statblock-container'>
        <div className='titlebar'>
          <div className='name'>{name}.</div>
          <div className='modifier'>+{modifier} to hit</div>
          <div className='desc'>Melee weapon attack. Reach 5ft, one target.</div>
        </div>

        <div className='statblock'>
          { damageData.map((data, i) => {
            const editClass = (editingDamageID === i) ? 'editing' : '';
            return (
              <>
                <DamageSource
                  attackID={i}
                  {...damageData[i]}
                  {...damageFunctions}
                  onEdit={openEditForDamage}
                  extraClass={editClass}
                  key={i}
                />
                {renderDamageEdit(i)}
              </>
            )
          })}

          { !damageEditIsOpen &&
            <button
              className="add-damage-button"
              onClick={() => {
                openEditForDamage(damageData.length);
                createDamage();
              }}
            >
              <div className={`asset plus clickable`} />
              <span>Add Damage Source</span>
            </button>
          }
        </div>
      </div>
    </div>
  );
}
export default AttackSource ;
