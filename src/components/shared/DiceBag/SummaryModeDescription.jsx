import React from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import './SummaryModeDescription.scss';

const SummaryModeDescription = ({
  summaryMode,

  summaryModeValue,
  setSummaryModeValue,
}) => {

  const preDesc = {
    'total': `Simply sum up all rolls.`,
    'high': 'Keep the highest',
    'low': 'Keep the lowest',
    'count-high': 'Count how many dice roll above',
    'count-low': 'Count how many dice roll below'
  }

  const postDesc = {
    'total': '',
    'high': (summaryModeValue === 1 ? 'roll.' : `rolls.`),
    'low': (summaryModeValue === 1 ? 'roll.' : `rolls.`),
    'count-high': '',
    'count-low': ''
  }

  return (
    <div className="SummaryModeDescription">

      <span>{preDesc[summaryMode]}</span>

      {summaryMode !== 'total' &&
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
      }

      <span>{postDesc[summaryMode]}</span>

    </div>
  )
}

export default SummaryModeDescription;
