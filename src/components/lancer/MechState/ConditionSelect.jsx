import React, { useState } from 'react';
import Select from 'react-select'
import { getOptionFromValue } from '../../../utils.js';

import './ConditionSelect.scss';

import {
  LANCER_CONDITIONS,
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

const conditionOptions = LANCER_CONDITIONS.map(condition => ({
  "value" : condition.name,
  "label" : condition.name
}))


const ConditionSelect = ({
	activeConditions,
	setActiveConditions,
}) => {
  const selectedConditions = activeConditions
    ? activeConditions.map(conditionName => getOptionFromValue(conditionOptions, conditionName))
    : []

  const updateSelectedConditions = (newSelectedConditions) => {
    let newConditions = newSelectedConditions ? newSelectedConditions.map(cond => cond.value) : []
    setActiveConditions(newConditions)
  }

  return (
    <div className='ConditionSelect'>
      <Select
        isMulti
        placeholder='Conditions'
        name='conditions'
        className='conditions-dropdown'
        options={conditionOptions}
        value={selectedConditions}
        onChange={updateSelectedConditions}
      />

      { activeConditions &&
        <div className='condition-container'>
          { activeConditions.map(condition =>
            <div className='condition' key={condition}>
              <div className='label'>{condition}</div>
              <div className='text'>{findStatusData(condition).terse}</div>
            </div>
          )}
        </div>
      }
    </div>
  );
}



export default ConditionSelect;
