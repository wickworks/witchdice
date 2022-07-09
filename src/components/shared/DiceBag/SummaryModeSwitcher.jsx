import React, { useState, useEffect } from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import './SummaryModeSwitcher.scss';

const allSummaryModes = {
  'total': {
    'keep': 'total',
    'count': 'total',
  },
  'high': {
    'keep': 'keep-high',
    'count': 'count-high',
  },
  'low': {
    'keep': 'keep-low',
    'count': 'count-low',
  }
}


const SummaryModeSwitcher = ({
  summaryMode,
  setSummaryMode,
  summaryModeValue,
  setSummaryModeValue,
}) => {

  const [standardMode, setStandardMode] = useState('total') // total / high / low
  const [advancedMode, setAdvancedMode] = useState('keep')  // keep / count

  // determine what the summary mode is
  useEffect(() => {
    const newSummaryMode = allSummaryModes[standardMode][advancedMode]
    setSummaryMode(newSummaryMode)
  }, [standardMode, advancedMode]);

  return (
    <div className="SummaryModeSwitcher">
      <RadioGroup
        name='summary-mode-standard'
        className='RadioGroup'
        selectedValue={standardMode}
        onChange={setStandardMode}
      >
        <label className={`mode-button ${standardMode === 'total' ? 'selected' : ''}`} key='mode-total'>
          <Radio value='total' id='mode-total' />
          Total
        </label>

        <label className={`mode-button ${standardMode === 'high' ? 'selected' : ''}`} key='mode-high'>
          <Radio value='high' id='mode-high' />
          High
        </label>

        <label className={`mode-button ${standardMode === 'low' ? 'selected' : ''}`} key='mode-low'>
          <Radio value='low' id='mode-low' />
          Low
        </label>
      </RadioGroup>

      {standardMode !== 'total' &&
        <div className='advanced-container'>


          <RadioGroup
            name='summary-mode-advanced'
            className='RadioGroup'
            selectedValue={advancedMode}
            onChange={setAdvancedMode}
          >
            <label className={`mode-button ${advancedMode === 'keep' ? 'selected' : ''}`} key='mode-keep'>
              <Radio value='keep' id='mode-keep' />
              Keep
            </label>

            <label className={`mode-button ${advancedMode === 'count' ? 'selected' : ''}`} key='mode-count'>
              <Radio value='count' id='mode-count' />
              Count
            </label>
          </RadioGroup>

          <input className='advanced-value'
            type="number"
            value={summaryModeValue}
            onChange={e => setSummaryModeValue(Math.min(Math.max(e.target.value, 1), 99))}
            min='0'
            max='99'
            onClick={e => e.stopPropagation()}
            onFocus={e => e.target.select()}
            onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
          />
        </div>
      }
    </div>
  )
}

export default SummaryModeSwitcher;
