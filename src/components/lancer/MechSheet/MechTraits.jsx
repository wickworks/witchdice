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
            name={trait.name}
            activation={trait.activation}
            trigger={trait.trigger}
            frequency={trait.frequency}
            description={trait.description}
            isCP={trait.isCP}
            isDestructable={trait.isDestructable}
            isDestroyed={trait.isDestroyed}
            onDestroy={() => setDestroyedForSystem(!trait.isDestroyed, trait.systemIndex)}
            limited={trait.limited}
            setLimitedCount={(count) => setLimitedCountForSystem(count, trait.systemIndex)}
						recharge={trait.recharge}
						setRecharged={(charged) => setRechargedForSystem(charged, trait.systemIndex)}
            isTitleCase={trait.isTitleCase}
						setRollSummaryData={setRollSummaryData}

						defaultCollapsed={defaultCollapsed}
          />
				)}
			</div>
    </div>
  );
}

export default MechTraits;
