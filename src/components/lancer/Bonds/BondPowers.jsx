import React from 'react';
import TraitBlock from '../MechSheet/TraitBlock.jsx';
import './BondPowers.scss';

const BondPowers = ({
  activePilot,
}) => {

  const bondTraits = activePilot.bondPowers.map(power => {
    return {
      name: power.name,
      // activation: deployable.activation || 'Deployable',
      // trigger: deployable.trigger,
      description: power.description,
    }
  })

  return (
    <div className='BondPowers'>
      <h4>Bond Powers</h4>
      { bondTraits.map((trait, index) =>
        <TraitBlock
          key={`${trait.name}-${index}`}
          trait={trait}
          defaultCollapsed={false}
        />
      )}
    </div>
  );
}

export default BondPowers ;
