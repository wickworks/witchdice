import React, { useState, useEffect } from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import './SummaryModeSwitcher.scss';
//
// const allSummaryModes = {
//   'total': {
//     'keep': 'total',
//     'count': 'total',
//   },
//   'highest': {
//     'keep': 'highest',
//     'count': 'above',
//   },
//   'lowest': {
//     'keep': 'lowest',
//     'count': 'below',
//   }
// }


const SummaryModeSwitcher = ({
  summaryMode,
  setSummaryMode,
}) => {

  const [standardMode, setStandardMode] = useState('total') // total / high / low
  const [advancedMode, setAdvancedMode] = useState('keep')  // keep / count

  // // determine what the summary mode is
  // useEffect(() => {
  //   const newSummaryMode = allSummaryModes[standardMode][advancedMode]
  //   setSummaryMode(newSummaryMode)
  // }, [standardMode, advancedMode]);

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

        <label className={`mode-button ${summaryMode === 'above' ? 'selected' : ''}`} key='mode-over'>
          <Radio value='above' id='mode-over' />
          Over
        </label>

        <label className={`mode-button ${summaryMode === 'below' ? 'selected' : ''}`} key='mode-under'>
          <Radio value='below' id='mode-under' />
          Under
        </label>
      </RadioGroup>
    </div>
  )
}

export default SummaryModeSwitcher;
