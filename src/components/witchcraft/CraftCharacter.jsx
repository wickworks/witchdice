import React from 'react';
import Select from 'react-select'
import TextInput from '../shared/TextInput.jsx';
import NumberInput from '../shared/NumberInput.jsx';
import { deepCopy } from '../../utils.js';
import {
  allMediaTypes,
  allTechniques,
  getStaminaForCharacter,
  getTechniqueCountForCharacter,
  getDefaultClass
} from './data.js';

import './CraftCharacter.scss';


const mediaOptions = allMediaTypes.map(media => ({
  "value" : media,
  "label" : media
}))

const techniqueOptions = Object.keys(allTechniques).map(key => ({
  "value" : key,
  "label" : allTechniques[key].name
}))

// The react-select wants us to pass in the ENTIRE option from above to be selected, not just the value.
// However, I don't want to store its weird-ass special object. We can just retrieve it with the key here.
function getOptionFromValue(options, value) {
  if (!Array.isArray(options)) { return null }

  var result = options.find(option => {
    return option.value === value
  })
  return result;
}


const CraftCharacter = ({
  crafterData,
  updateCrafterData
}) => {

  const updateTechnique = (techniqueIndex, value) => {
    var newData = deepCopy(crafterData.techniques);
    // replace or add
    if (techniqueIndex < newData.length) {
      newData[techniqueIndex] = value;
    } else {
      newData.push(value);
    }

    updateCrafterData('techniques', newData);
  }

  // get a default class if none is entered
  if (crafterData.mediaPrimary && crafterData.mediaSecondary && !crafterData.class) {
    updateCrafterData('class', getDefaultClass(crafterData.mediaPrimary, crafterData.mediaSecondary))
  }

  const clearSelectDropdownIconStyle = {
    indicatorsContainer: (provided, state) => {
      const display = 'none';
      return { ...provided, display };
    }
  }

  const centerSelectStyle = {
    valueContainer: (provided, state) => {
      const justifyContent = 'center';
      const padding = '6px'
      return { ...provided, justifyContent, padding };
    },
    menu: (provided, state) => {
      const fontSize = '16px';
      return { ...provided, fontSize };
    },
  }

  return (
    <div className='CraftCharacter'>
      <hr className="pumpkin-bar" />

      <div className='intro-container'>
        <div className='name-and-class'>
          <h2 className='name'>
            <TextInput
              textValue={crafterData.name}
              setTextValue={(value) => { updateCrafterData('name', value) }}
              placeholder={'Name'}
              maxLength={32}
            />
          </h2>

          <div className='tier'>
            <div className="crafting-tier">
              <NumberInput
                value={crafterData.tier}
                setValue={(value) => { updateCrafterData('tier', value) }}
                minValue={1}
                maxValue={5}
                prefix={"Tier "}
              />
            </div>
            <div className="crafting-class">
              <TextInput
                textValue={crafterData.class}
                setTextValue={(value) => { updateCrafterData('class', value) }}
                placeholder={'Class'}
                maxLength={32}
              />
            </div>
          </div>
        </div>

        <div className='crafting-media'>
          <div className='primary'>
            <Select
              placeholder={'Primary'}
              className={'select-dropdown'}
              options={mediaOptions}
              value={getOptionFromValue(mediaOptions,crafterData.mediaPrimary)}
              onChange={(option) => { updateCrafterData('mediaPrimary', option.value) }}
              styles={ {...clearSelectDropdownIconStyle, ...centerSelectStyle} }
              isSearchable={false}
              key={`${crafterData.name}-media-primary`}
            />
          </div>
          <div className='secondary'>
            <Select
              placeholder={'Secondary'}
              className={'select-dropdown'}
              options={mediaOptions}
              value={getOptionFromValue(mediaOptions,crafterData.mediaSecondary)}
              onChange={(option) => { updateCrafterData('mediaSecondary', option.value) }}
              styles={ {...clearSelectDropdownIconStyle, ...centerSelectStyle} }
              isSearchable={false}
              key={`${crafterData.name}-media-secondary`}
            />
          </div>
        </div>
      </div>

      <div className='stats'>
        <div className='stamina'>
          <div className='label'>Stamina</div>
          <div className='value'>{getStaminaForCharacter(crafterData)}</div>
        </div>

        <div className='base-dice'>
          <div className='label'>Base Dice</div>
          <div className='value'>{`${crafterData.tier}d6`}</div>
        </div>

        <div className='proficiency'>
          <div className='label'>Proficiency</div>
          <div className='value'>
            <NumberInput
              value={crafterData.proficiencyBonus}
              setValue={(value) => { updateCrafterData('proficiencyBonus', value) }}
              minValue={2}
              maxValue={10}
              plusPrefix={true}
            />
          </div>
        </div>
      </div>

      <table className='techniques'><tbody>

        <tr>
          <td>Tool Proficiency</td>
          <td>
            <TextInput
              textValue={crafterData.toolProficiency}
              setTextValue={(value) => { updateCrafterData('toolProficiency', value) }}
              placeholder={'Tool'}
              maxLength={32}
            />
          </td>
        </tr>

        <tr>
          <td>Lingua Franca</td>
          <td>
            <TextInput
              textValue={crafterData.linguaFranca}
              setTextValue={(value) => { updateCrafterData('linguaFranca', value) }}
              placeholder={'Language'}
              maxLength={32}
            />
          </td>
        </tr>

        <tr>
          <td>Workshop</td>
          <td>
            <TextInput
              textValue={crafterData.workshop}
              setTextValue={(value) => { updateCrafterData('workshop', value) }}
              placeholder={'Workshop'}
              maxLength={64}
            />
          </td>
        </tr>

        { crafterData.techniques.map((technique, i) => {
            return (
              <tr key={i}>
                <td>
                  <Select
                    className={'select-dropdown'}
                    options={techniqueOptions}
                    value={getOptionFromValue(techniqueOptions, technique)}
                    onChange={(option) => { updateTechnique(i, option.value) }}
                    escapeClearsValue={true}
                    styles={clearSelectDropdownIconStyle}
                  />
                </td>
                <td>{allTechniques[technique].desc}</td>
              </tr>
            )
        })}

        { (crafterData.techniques.length < getTechniqueCountForCharacter(crafterData)) &&
          <tr>
            <td>
              <Select
                className={'select-dropdown'}
                options={techniqueOptions}
                value={null}
                onChange={(option) => { updateTechnique((crafterData.techniques.length), option.value) }}
                placeholder={'Technique'}
                styles={
                  {
                    dropdownIndicator: (provided, state) => {
                      const padding = '2px 4px 2px 2px';
                      return { ...provided, padding };
                    }
                  }
                }
              />
            </td>
            <td></td>
          </tr>
        }
      </tbody></table>

      <hr className="pumpkin-bar" />
    </div>
  )
}

export default CraftCharacter ;
