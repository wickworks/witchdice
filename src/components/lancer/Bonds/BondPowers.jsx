import React, { useState } from 'react';
import Select from 'react-select'
import TraitBlock from '../MechSheet/TraitBlock.jsx';
import { findAllGameData } from '../lancerData.js'
import { deepCopy } from '../../../utils.js';
import './BondPowers.scss';

// =============== ADD / REMOVE TAG CRAP =============

function getOptionForPower(power) {
  return {
    "label" : power.name,
    "value" : power,
  }
}

function getOptionsForBond(pilotBondPowers, bondData) {
  return bondData.powers
    .filter(power => !pilotBondPowers.some(pilotPower => pilotPower.name === power.name))
    .map(power => getOptionForPower(power))
}

function getBondPowersGroupedByClass(activeBondID, pilotBondPowers) {
  const allBondData = findAllGameData('bonds')
  const allOptions = []
  // start with the powers for the current class
  allOptions.push({
    label: allBondData[activeBondID].name,
    options: getOptionsForBond(pilotBondPowers, allBondData[activeBondID])
  })

  // then all the other ones
  Object.keys(allBondData).forEach(bondID => {
    if (bondID !== activeBondID) {
      allOptions.push({
        label: allBondData[bondID].name,
        options: getOptionsForBond(pilotBondPowers, allBondData[bondID])
      })
    }
  })
  return allOptions
}


const BondPowers = ({
  bondData,
  pilotBondPowers,
  setPilotBondPowers,
  setRollSummaryData,
}) => {
  const [isAddingPower, setIsAddingPower] = useState(pilotBondPowers.length === 0)

  const powerOptions = getBondPowersGroupedByClass(bondData.id, pilotBondPowers)


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
    if (option.value) {
      newData.push(option.value)
      setPilotBondPowers(newData)
    }
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
            setRollSummaryData={setRollSummaryData}
            onDestroy={() => removePower(index)}
          />
        )}
      </div>
    </div>
  );
}

export default BondPowers ;
