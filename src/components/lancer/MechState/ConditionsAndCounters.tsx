import React, { useState } from 'react';
import SelectUntyped from 'react-select'
import TextInput from '../../shared/TextInput';
import MechTraitsUntyped from '../MechSheet/MechTraits';
import { getOptionFromValue, deepCopy } from '../../../utils';

import './ConditionsAndCounters.scss';

import {
  findAllStatusData,
  findStatusData,
} from '../lancerData';

import { genericActionTraits } from '../lancerActionTraits';

import type { Counter, UpdateMechState } from '../types';

const Select: any = SelectUntyped;
const MechTraits: any = MechTraitsUntyped;

const ConditionsAndCounters = ({
  activeConditions,
  activeCounters,
	updateMechState,
  setRollSummaryData,
}: {
  activeConditions?: string[],
  activeCounters?: Counter[],
  updateMechState: UpdateMechState,
  setRollSummaryData: (data: any) => void,
}) => {
  const [genericActionsOpen, setGenericActionsOpen] = useState(false)

  const allStatuses = findAllStatusData()
  const conditionOptions = Object.values(allStatuses).map((condition: any) => ({
    "value" : condition.name,
    "label" : condition.name
  }))

  const setActiveConditions = (conditions: string[]) => updateMechState({conditions: conditions})
  const setCustomCounters = (custom_counters: any[]) => updateMechState(
    {
      custom_counters: custom_counters.map(counter => {return {name: counter.name, id: counter.id, custom: true}}),
      counter_data: custom_counters.map(counter => {return {id: counter.id, val: counter.val}}),
    }
  )

  const selectedConditions = activeConditions
    ? activeConditions.map(conditionName => getOptionFromValue(conditionOptions, conditionName))
    : []

  const updateSelectedConditions = (newSelectedConditions: any) => {
    let newConditions = newSelectedConditions ? newSelectedConditions.map((cond: any) => cond.value) : []
    setActiveConditions(newConditions)
  }

  const updateCounter = (counterData: any, index: number) => {
    let newData = deepCopy(activeCounters)
    newData[index] = counterData
    setCustomCounters(newData)
  }

  const deleteCounter = (index: number) => {
    let newData = deepCopy(activeCounters)
    newData.splice(index, 1)
    setCustomCounters(newData)
  }

  const addCounter = () => {
    let newData = deepCopy(activeCounters)
    newData.push({
      id: String(parseInt(String(Math.random() * 1000000))),
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

        <label className={`open-generic-actions ${genericActionsOpen ? 'open' : ''}`}>
          <input
            type="checkbox"
            checked={genericActionsOpen}
            onChange={() => setGenericActionsOpen(!genericActionsOpen)}
          />
          <div className='name'>Action Cheatsheet</div>
        </label>
      </div>


      <div className='active-blocks'>
        { activeConditions && activeConditions.map(condition =>
          <Condition condition={condition} key={condition} />
        )}

        { activeCounters && activeCounters.map((counter, i) =>
          <CustomCounter
            counter={counter}
            updateCounter={(counterData: any) => updateCounter(counterData, i)}
            deleteCounter={() => deleteCounter(i)}
            key={counter.id}
          />
        )}
      </div>

      {genericActionsOpen &&
        <MechTraits
          sectionTitle=''
          frameTraits={genericActionTraits}
          setRollSummaryData={setRollSummaryData}
        />
      }
    </div>
  );
}

const Condition = ({
  condition
}: {
  condition: string,
}) => {
  const conditionData = findStatusData(condition)

  const fullDescParagraphs = conditionData.effects.split('<br>')

  const [fullDescOpen, setFullDescOpen] = useState(false)

  const showMoreButton = Math.abs(conditionData.effects.length - conditionData.terse.length) > 1

  return (
    <div className='Condition'>
      <div className='label'>
        <span className='name'>{condition}</span>
        <span className='type'>{conditionData.type.toLowerCase()}</span>
      </div>
      <div className='text'>
        {fullDescOpen ?
          fullDescParagraphs.map((fullDescPara: string, i: number) =>
            <p>
              {fullDescPara}
              {(i === fullDescParagraphs.length-1) &&
                <button onClick={() => setFullDescOpen(false)}>(less)</button>
              }
            </p>
          )
        :
          <p>
            {conditionData.terse}
            {showMoreButton && <button onClick={() => setFullDescOpen(true)}>(more)</button>}
          </p>
        }
      </div>
    </div>
  );
}


const CustomCounter = ({
  counter,
  updateCounter,
  deleteCounter,
}: {
  counter: Counter,
  updateCounter: (data: any) => void,
  deleteCounter: () => void,
}) => {
  return (
    <div className='CustomCounter'>
      <div className='blue-pill'>
        <TextInput
          textValue={counter.name}
          setTextValue={(text: string) => updateCounter({...counter, name: text})}
          placeholder={'Counter name'}
          maxLength={22}
        />
        <input type='number'
          min={0}
          max={99}
          value={parseInt(String(counter.val)) || 0}
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
