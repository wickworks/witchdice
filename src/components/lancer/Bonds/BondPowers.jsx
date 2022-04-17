import React, { useState } from 'react';
import Select from 'react-select'
import TraitBlock from '../MechSheet/TraitBlock.jsx';
import { deepCopy } from '../../../utils.js';
import './BondPowers.scss';

// =============== ADD / REMOVE TAG CRAP =============


const BondPowers = ({
  bondData,
  pilotBondPowers,
  setPilotBondPowers,
}) => {
  const [isAddingPower, setIsAddingPower] = useState(pilotBondPowers.length === 0)

  const powerOptions =
    Object.values(bondData.powers)
    .filter(power =>
      !pilotBondPowers.some(pilotPower => pilotPower.name === power.name)
    ).map(power => ({
      "value" : power.name,
      "label" : power.name
    }))

  const bondTraits = pilotBondPowers.map(power => {
    return {
      name: power.name,
      activation: power.frequency || '',
      // trigger: deployable.freqency || '',
      description: power.description,
      isDestructable: true,
    }
  })

  const addPower = (option) => {
    const newData = deepCopy(pilotBondPowers)
    const newPower = bondData.powers.find(power => power.name === option.value)
    if (newPower) {
      newData.push(newPower)
      setPilotBondPowers(newData)
    }
    // setIsAddingPower(false)
  }

  const removePower = (index) => {
    if (index >= 0 && index < pilotBondPowers.length) {
      const newData = deepCopy(pilotBondPowers)
      newData.splice(index, 1)
      setPilotBondPowers(newData)
    }
  }

  return (
    <div className='BondPowers'>
      <h4>
        Bond Powers
        <button
          className={`asset ${isAddingPower ? 'minus' : 'plus'}`}
          onClick={() => setIsAddingPower(!isAddingPower)}
        />
      </h4>

      <div className='powers-container'>
        { isAddingPower &&
          <Select
            placeholder='Add Bond Power'
            name='conditions'
            className='conditions-dropdown'
            options={powerOptions}
            value={null}
            onChange={addPower}
          />
        }

        { bondTraits.map((trait, index) =>
          <TraitBlock
            key={`${trait.name}-${index}`}
            trait={trait}
            defaultCollapsed={false}
            onDestroy={() => removePower(index)}
          />
        )}
      </div>
    </div>
  );
}

export default BondPowers ;
