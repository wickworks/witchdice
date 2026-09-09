import React from 'react';

import './PerRoundBar.scss';

export interface PerRoundCount {
  source: string;
  max: number;
  current: number;
  interval: string;
}

function dotIsFilled(perRoundCount: PerRoundCount, i: number) {
	return (perRoundCount.max - i) <= (perRoundCount.max - perRoundCount.current)
}

export function getPerRoundCountShortString(perRoundCount: PerRoundCount) {
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
}: {
	perRoundCount: PerRoundCount,
	setPerRoundCount: (source: string, current: number) => void,
}) => {
  return (
    <label className='PerRoundBar'>
			{ [...Array(perRoundCount.max || 0)].map((undef, i) =>
	      <input type='checkbox'
	        checked={dotIsFilled(perRoundCount, i)}
	        onChange={(e) => setPerRoundCount(
						perRoundCount.source,
						perRoundCount.current + (e.target.checked ? -1 : 1)
					)}
					key={i}
	      />
			)}
			<div className='uses-label'>/ {perRoundCount.interval}</div>
    </label>
  )
}

export default PerRoundBar
