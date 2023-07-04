import React, { useState } from 'react';
import TraitBlock from './TraitBlock.jsx'

import './MechTraits.scss';

// Frame Traits & Core System        Systems
const MechTraits = ({
	frameTraits,
  sectionTitle,
	setRollSummaryData,
	showResetPerRoundCounts = false,
  setLimitedCountForSystem = () => {},
  setDestroyedForSystem = () => {},
	setRechargedForSystem = () => {},
	setPerRoundCount = () => {},
	resetPerRoundCounts = () => {},
}) => {
	const [defaultCollapsed, setDefaultCollapsed] = useState(true)

  return (
		<div className='MechTraits'>
			<div className='title-container'>
				{ sectionTitle &&
					<button className="label" onClick={() => setDefaultCollapsed(!defaultCollapsed)}>
						{sectionTitle}
					</button>
				}

				{ showResetPerRoundCounts &&
					<button className="reset-per-round-counts" onClick={resetPerRoundCounts}>
						<div className='hover-explain'>Reset uses</div>
						<div className='reset-icon'>⚉↺</div>
					</button>
				}
			</div>

    	<div className='traits-container'>
				{ frameTraits.map((trait, index) =>
          <TraitBlock
            key={`${trait.name}-${index}`}
						trait={trait}
            onDestroy={() => setDestroyedForSystem(!trait.isDestroyed, trait.systemIndex)}
            setLimitedCount={(count) => setLimitedCountForSystem(count, trait.systemIndex)}
						setRecharged={(charged) => setRechargedForSystem(charged, trait.systemIndex)}
						setPerRoundCount={setPerRoundCount}
						setRollSummaryData={setRollSummaryData}

						defaultCollapsed={defaultCollapsed}
          />
				)}
			</div>
    </div>
  );
}

export default MechTraits;
