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
    'highest': 'Keep the highest',
    'lowest': 'Keep the lowest',
    'above': 'Count how many dice roll above',
    'below': 'Count how many dice roll below'
  }

  const postDesc = {
    'total': '',
    'highest': (summaryModeValue === 1 ? 'roll.' : `rolls.`),
    'lowest': (summaryModeValue === 1 ? 'roll.' : `rolls.`),
    'above': '',
    'below': ''
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
