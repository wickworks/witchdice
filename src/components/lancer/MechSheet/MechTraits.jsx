import React from 'react';
import TraitBlock from './TraitBlock.jsx'

import './MechTraits.scss';

// Frame Traits & Core System        Systems
const MechTraits = ({
	frameTraits,
  sectionTitle,
  setLimitedCountForSystem = () => {},
  setDestroyedForSystem = () => {},
}) => {
  return (
		<div className='MechTraits'>
			<div className="label">{sectionTitle}</div>

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
            isTitleCase={trait.isTitleCase}
          />
				)}
			</div>
    </div>
  );
}

export default MechTraits;
