import React from 'react';
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
    'count': 'Count dice that roll',
  }

  const postDesc = {
    'total': '',
    'highest': (summaryModeValue === 1 ? 'roll.' : `rolls.`),
    'lowest': (summaryModeValue === 1 ? 'roll.' : `rolls.`),
    'count': 'or higher.',
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
