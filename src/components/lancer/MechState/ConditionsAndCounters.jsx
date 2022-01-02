import React, { useState } from 'react';
import Select from 'react-select'
import TextInput from '../../shared/TextInput.jsx';
import { getOptionFromValue, deepCopy } from '../../../utils.js';

import './ConditionsAndCounters.scss';

import {
  allStatuses,
  findStatusData,
} from '../lancerData.js';


// Style for the drop-down menus
// const centerSelectStyle = {
//   valueContainer: (provided, state) => {
//     const justifyContent = 'center';
//     const padding = '6px'
//     return { ...provided, justifyContent, padding };
//   },
//   menu: (provided, state) => {
//     const fontSize = '16px';
//     return { ...provided, fontSize };
//   },
// }
//
// const clearSelectDropdownIconStyle = {
//   indicatorsContainer: (provided, state) => {
//     const display = 'none';
//     return { ...provided, display };
//   }
// }
//
// const disguiseSelectStyle = {
//   control: (provided, state) => {
//     const backgroundColor = 'transparent';
//     const border = 'none';
//     return { ...provided, backgroundColor, border };
//   },
//   ...clearSelectDropdownIconStyle
// }



// =============== ADD / REMOVE TAG CRAP =============

const conditionOptions = allStatuses.map(condition => ({
  "value" : condition.name,
  "label" : condition.name
}))


const ConditionsAndCounters = ({
	activeConditions,
	setActiveConditions,

  customCounters,
  setCustomCounters
}) => {
  const selectedConditions = activeConditions
    ? activeConditions.map(conditionName => getOptionFromValue(conditionOptions, conditionName))
    : []

  const updateSelectedConditions = (newSelectedConditions) => {
    let newConditions = newSelectedConditions ? newSelectedConditions.map(cond => cond.value) : []
    setActiveConditions(newConditions)
  }

  const updateCounter = (counterData, index) => {
    let newData = deepCopy(customCounters)
    newData[index] = counterData
    setCustomCounters(newData)
  }

  const deleteCounter = (index) => {
    let newData = deepCopy(customCounters)
    newData.splice(index, 1)
    setCustomCounters(newData)
  }

  const addCounter = () => {
    let newData = deepCopy(customCounters)
    newData.push({
      id: String(parseInt(Math.random() * 1000000)), // COMPCON makes some super long alphanumeric id but this should work too
      name: '',
      val: 0,
    })
    setCustomCounters(newData)
  }

  return (
    <div className='ConditionsAndCounters'>


      <div className='condition-container'>
        <Select
          isMulti
          placeholder='Conditions'
          name='conditions'
          className='conditions-dropdown'
          options={conditionOptions}
          value={selectedConditions}
          onChange={updateSelectedConditions}
        />

        { activeConditions && activeConditions.map(condition =>
          <Condition condition={condition} key={condition} />
        )}

        <button className='add-custom-counter' onClick={addCounter}>
          Add Custom Counter
          <div className='asset plus' />
        </button>

        { customCounters && customCounters.map((counter, i) =>
          <CustomCounter
            counter={counter}
            updateCounter={counterData => updateCounter(counterData, i)}
            deleteCounter={() => deleteCounter(i)}
            key={counter.id}
          />
        )}
      </div>
    </div>
  );
}

const Condition = ({
  condition
}) => {
  return (
    <div className='Condition'>
      <div className='label'>{condition}</div>
      <div className='text'>{findStatusData(condition).terse}</div>
    </div>
  );
}


const CustomCounter = ({
  counter,
  updateCounter,
  deleteCounter,
}) => {
  return (
    <div className='CustomCounter'>
      <TextInput
        textValue={counter.name}
        setTextValue={text => updateCounter({...counter, name: text})}
        placeholder={'Counter name'}
        maxLength={22}
      />
      <input type='number'
        min={0}
        max={99}
        value={parseInt(counter.val)}
        onChange={e =>
          updateCounter({...counter, val: parseInt(e.target.value) || 0})
        }
      />

      <button className='delete' onClick={deleteCounter}>
        <div className='asset x' />
      </button>
    </div>
  );
}



export default ConditionsAndCounters;
