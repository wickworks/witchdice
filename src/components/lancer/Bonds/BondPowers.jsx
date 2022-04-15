import React from 'react';
import TraitBlock from '../MechSheet/TraitBlock.jsx';
import './BondPowers.scss';

const BondPowers = ({
  activePilot,
}) => {

  const bondTraits = [
    {
      name: 'Absolute Meat',
      // activation: deployable.activation || 'Deployable',
      // trigger: deployable.trigger,
      description: 'If you concentrate and grit your teet, get stronk.',
      isTitleCase: true,
    }
  ]

  // make it so this is broadcastable!
  // setRollSummaryData={setRollSummaryData}

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
