import React from 'react';
import Select from 'react-select'
import TextInput from '../../shared/TextInput.jsx';
import { getOptionFromValue, deepCopy } from '../../../utils.js';

import './ConditionsAndCounters.scss';

import {
  findAllStatusData,
  findStatusData,
} from '../lancerData.js';


const ConditionsAndCounters = ({
  activeConditions,
  activeCounters,
	updateMechState
}) => {
  const allStatuses = findAllStatusData()
  const conditionOptions = Object.values(allStatuses).map(condition => ({
    "value" : condition.name,
    "label" : condition.name
  }))


  const setActiveConditions = (conditions) => updateMechState({conditions: conditions})
  const setCustomCounters = (custom_counters) => updateMechState(
    {
      custom_counters: custom_counters.map(counter => {return {name: counter.name, id: counter.id, custom: true}}),
      counter_data: custom_counters.map(counter => {return {id: counter.id, val: counter.val}}),
    }
  )

  const selectedConditions = activeConditions
    ? activeConditions.map(conditionName => getOptionFromValue(conditionOptions, conditionName))
    : []

  const updateSelectedConditions = (newSelectedConditions) => {
    let newConditions = newSelectedConditions ? newSelectedConditions.map(cond => cond.value) : []
    setActiveConditions(newConditions)
  }

  const updateCounter = (counterData, index) => {
    let newData = deepCopy(activeCounters)
    newData[index] = counterData
    setCustomCounters(newData)
  }

  const deleteCounter = (index) => {
    let newData = deepCopy(activeCounters)
    newData.splice(index, 1)
    setCustomCounters(newData)
  }

  const addCounter = () => {
    let newData = deepCopy(activeCounters)
    newData.push({
      id: String(parseInt(Math.random() * 1000000)), // COMPCON makes some super long alphanumeric id but this should work too
      name: '',
      val: 0,
    })
    setCustomCounters(newData)
  }

  return (
    <div className='ConditionsAndCounters'>
      <div className='controls-container'>

        <Select
          isMulti
          placeholder='Add Condition'
          name='conditions'
          className='conditions-dropdown'
          options={conditionOptions}
          value={selectedConditions}
          onChange={updateSelectedConditions}
        />

        <button className='add-custom-counter' onClick={addCounter}>
          Add Custom Counter
          <div className='asset plus' />
        </button>
      </div>


      <div className='active-blocks'>
        { activeConditions && activeConditions.map(condition =>
          <Condition condition={condition} key={condition} />
        )}

        { activeCounters && activeCounters.map((counter, i) =>
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
      <div className='blue-pill'>
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
    </div>
  );
}



export default ConditionsAndCounters;
