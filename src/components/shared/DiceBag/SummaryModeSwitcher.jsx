import React from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import './SummaryModeSwitcher.scss';

const SummaryModeSwitcher = ({
  summaryMode,
  setSummaryMode
}) => {

  return (
    <RadioGroup
      name='summary-mode'
      className='SummaryModeSwitcher'
      selectedValue={summaryMode}
      onChange={setSummaryMode}
    >
      <label className={`mode-container ${summaryMode === 'total' ? 'selected' : ''}`} key='mode-total'>
        <Radio value='total' id='mode-total' />
        Total
      </label>

      <label className={`mode-container ${summaryMode === 'high' ? 'selected' : ''}`} key='mode-high'>
        <Radio value='high' id='mode-high' />
        High
      </label>

      <label className={`mode-container ${summaryMode === 'low' ? 'selected' : ''}`} key='mode-low'>
        <Radio value='low' id='mode-low' />
        Low
      </label>
    </RadioGroup>

  )
}

export default SummaryModeSwitcher;
