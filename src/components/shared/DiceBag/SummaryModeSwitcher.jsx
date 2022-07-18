import React from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import './SummaryModeSwitcher.scss';

const SummaryModeSwitcher = ({
  summaryMode,
  setSummaryMode,
}) => {

  return (
    <div className="SummaryModeSwitcher">
      <RadioGroup
        name='summary-mode-standard'
        className='RadioGroup'
        selectedValue={summaryMode}
        onChange={setSummaryMode}
      >
        <label className={`mode-button ${summaryMode === 'total' ? 'selected' : ''}`} key='mode-total'>
          <Radio value='total' id='mode-total' />
          Total
        </label>

        <label className={`mode-button ${summaryMode === 'highest' ? 'selected' : ''}`} key='mode-high'>
          <Radio value='highest' id='mode-high' />
          High
        </label>

        <label className={`mode-button ${summaryMode === 'lowest' ? 'selected' : ''}`} key='mode-low'>
          <Radio value='lowest' id='mode-low' />
          Low
        </label>

        <label className={`mode-button ${summaryMode === 'count' ? 'selected' : ''}`} key='mode-count'>
          <Radio value='count' id='mode-count' />
          Count
        </label>

        {/*<label className={`mode-button ${summaryMode === 'below' ? 'selected' : ''}`} key='mode-under'>
          <Radio value='below' id='mode-under' />
          Under
        </label>*/}
      </RadioGroup>
    </div>
  )
}

export default SummaryModeSwitcher;
