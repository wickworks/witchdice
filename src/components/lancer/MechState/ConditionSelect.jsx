import React, { useState } from 'react';
import Select from 'react-select'
import { getOptionFromValue } from '../../../utils.js';

import './ConditionSelect.scss';

import {
  LANCER_CONDITIONS,
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

const conditionOptions = LANCER_CONDITIONS.map(condition => ({
  "value" : condition.icon,
  "label" : condition.name
}))


const ConditionSelect = ({
	activeConditions,
	setActiveConditions,
}) => {

  return (
    <div className='ConditionSelect'>

			<Select
	      isMulti
	      placeholder='Conditions'
	      name='conditions'
	      className='conditions-dropdown'
	      options={conditionOptions}
	      value={activeConditions}
	      onChange={options => setActiveConditions(options)}
	    />
    </div>
  );
}



export default ConditionSelect;
