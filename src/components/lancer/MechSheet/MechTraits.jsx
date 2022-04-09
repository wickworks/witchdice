import React, { useState } from 'react';
import TraitBlock from './TraitBlock.jsx'

import './MechTraits.scss';

// Frame Traits & Core System        Systems
const MechTraits = ({
	frameTraits,
  sectionTitle,
	setRollSummaryData,
  setLimitedCountForSystem = () => {},
  setDestroyedForSystem = () => {},
	setRechargedForSystem = () => {},
}) => {
	const [defaultCollapsed, setDefaultCollapsed] = useState(true)

  return (
		<div className='MechTraits'>
			<button className="label" onClick={() => setDefaultCollapsed(!defaultCollapsed)}>
				{sectionTitle}
			</button>

    	<div className='traits-container'>
				{ frameTraits.map((trait, index) =>
          <TraitBlock
            key={`${trait.name}-${index}`}
						trait={trait}
            onDestroy={() => setDestroyedForSystem(!trait.isDestroyed, trait.systemIndex)}
            setLimitedCount={(count) => setLimitedCountForSystem(count, trait.systemIndex)}
						setRecharged={(charged) => setRechargedForSystem(charged, trait.systemIndex)}
						setRollSummaryData={setRollSummaryData}

						defaultCollapsed={defaultCollapsed}
          />
				)}
			</div>
    </div>
  );
}

export default MechTraits;
