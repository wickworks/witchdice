import React from 'react';
import Select from 'react-select'
import TextInput from '../TextInput.jsx';
import NumberInput from '../NumberInput.jsx';
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
  characterData,
  updateCharacterData
}) => {

  const updateTechnique = (techniqueIndex, value) => {
    var newData = deepCopy(characterData.techniques);
    // replace or add
    if (techniqueIndex < newData.length) {
      newData[techniqueIndex] = value;
    } else {
      newData.push(value);
    }

    updateCharacterData('techniques', newData);
  }

  // get a default class if none is entered
  if (characterData.mediaPrimary && characterData.mediaSecondary && !characterData.class) {
    updateCharacterData('class', getDefaultClass(characterData.mediaPrimary, characterData.mediaSecondary))
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
      <div className='intro-container'>
        <div className='name-and-class'>
          <h2 className='name'>
            <TextInput
              textValue={characterData.name}
              setTextValue={(value) => { updateCharacterData('name', value) }}
              placeholder={'Name'}
              maxLength={32}
            />
          </h2>

          <div className='tier'>
            <div className="crafting-tier">
              <NumberInput
                value={characterData.tier}
                setValue={(value) => { updateCharacterData('tier', value) }}
                minValue={1}
                maxValue={5}
                prefix={"Tier "}
              />
            </div>
            <div className="crafting-class">
              <TextInput
                textValue={characterData.class}
                setTextValue={(value) => { updateCharacterData('class', value) }}
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
              value={getOptionFromValue(mediaOptions,characterData.mediaPrimary)}
              onChange={(option) => { updateCharacterData('mediaPrimary', option.value) }}
              styles={ {...clearSelectDropdownIconStyle, ...centerSelectStyle} }
              isSearchable={false}
            />
          </div>
          <div className='secondary'>
            <Select
              placeholder={'Secondary'}
              className={'select-dropdown'}
              options={mediaOptions}
              value={getOptionFromValue(mediaOptions,characterData.mediaSecondary)}
              onChange={(option) => { updateCharacterData('mediaSecondary', option.value) }}
              styles={ {...clearSelectDropdownIconStyle, ...centerSelectStyle} }
              isSearchable={false}
            />
          </div>
        </div>
      </div>

      <div className='stats'>
        <div className='stamina'>
          <div className='label'>Stamina</div>
          <div className='value'>{getStaminaForCharacter(characterData)}</div>
        </div>

        <div className='base-dice'>
          <div className='label'>Base Dice</div>
          <div className='value'>{`${characterData.tier}d6`}</div>
        </div>

        <div className='proficiency'>
          <div className='label'>Proficiency</div>
          <div className='value'>
            <NumberInput
              value={characterData.proficiencyBonus}
              setValue={(value) => { updateCharacterData('proficiencyBonus', value) }}
              minValue={2}
              maxValue={10}
              plusPrefix={true}
            />
          </div>
        </div>
      </div>

      <table className='techniques'><tbody>
        <tr>
          <td>Workshop</td>
          <td>
            <TextInput
              textValue={characterData.workshop}
              setTextValue={(value) => { updateCharacterData('workshop', value) }}
              placeholder={'Workshop'}
              maxLength={64}
            />
          </td>
        </tr>
        <tr>
          <td>Lingua Franca</td>
          <td>
            <TextInput
              textValue={characterData.linguaFranca}
              setTextValue={(value) => { updateCharacterData('linguaFranca', value) }}
              placeholder={'Language'}
              maxLength={32}
            />
          </td>
        </tr>
        <tr>
          <td>Tool Proficiency</td>
          <td>
            <TextInput
              textValue={characterData.toolProficiency}
              setTextValue={(value) => { updateCharacterData('toolProficiency', value) }}
              placeholder={'Tool'}
              maxLength={32}
            />
          </td>
        </tr>

        { characterData.techniques.map((technique, i) => {
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

        { (characterData.techniques.length < getTechniqueCountForCharacter(characterData)) &&
          <tr>
            <td>
              <Select
                className={'select-dropdown'}
                options={techniqueOptions}
                value={null}
                onChange={(option) => { updateTechnique((characterData.techniques.length), option.value) }}
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
    </div>
  )
}

export default CraftCharacter ;
