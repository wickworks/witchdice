import React from 'react';

import './PerRoundBar.scss';

function dotIsFilled(perRoundCount, i) {
	return (perRoundCount.max - i) <= (perRoundCount.max - perRoundCount.current)
}

export function getPerRoundCountShortString(perRoundCount) {
	return (
		<>
			{ [...Array(perRoundCount.max || 0)].map((undef, i) =>
				<span key={i}>{dotIsFilled(perRoundCount, i) ? '⚉' : '◯'}</span>
			)}
		</>
	)
}

const PerRoundBar = ({
	perRoundCount,
	setPerRoundCount,
}) => {
  return (
    <label className='PerRoundBar'>
			{ [...Array(perRoundCount.max || 0)].map((undef, i) =>
	      <input type='checkbox'
	        checked={dotIsFilled(perRoundCount, i)}
	        onChange={(e) => setPerRoundCount(
						perRoundCount.source,
						perRoundCount.current + ((-1) ** e.target.checked) // turns true/false into 1/-1
					)}
					key={i}
	      />
			)}
			<div className='uses-label'>/ {perRoundCount.interval}</div>
    </label>
  )
}

export default PerRoundBar
