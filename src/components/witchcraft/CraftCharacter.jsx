import React from 'react';
import Select from 'react-select'
import TextInput from '../TextInput.jsx';
import NumberInput from '../NumberInput.jsx';
import { deepCopy } from '../../utils.js';
import {
  allMediaTypes,
  allTechniques,
  getStaminaForCharacter,
  getTechniqueCountForCharacter
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

  return (
    <div className='CraftCharacter'>
      <div className='intro-container'>
        <div className='name-and-class'>
          <h2 className='name'>
            <TextInput
              textValue={characterData.characterName}
              setTextValue={(value) => { updateCharacterData('name', value) }}
              placeholder={'Name'}
              maxLength={32}
            />
          </h2>

          <div className='tier'>
            <h3 className="crafting-tier">
              <NumberInput
                value={characterData.craftingTier}
                setValue={(value) => { updateCharacterData('tier', value) }}
                minValue={1}
                maxValue={5}
                prefix={"Tier "}
              />
            </h3>
            <h3 className="crafting-class">
              <TextInput
                textValue={characterData.craftingClass}
                setTextValue={(value) => { updateCharacterData('class', value) }}
                placeholder={'Class'}
                maxLength={32}
              />
            </h3>
          </div>
        </div>

        <div className='crafting-media'>
          <div className='primary'>
            <Select
              options={mediaOptions}
              value={getOptionFromValue(mediaOptions,characterData.mediaPrimary)}
              onChange={(option) => { updateCharacterData('mediaPrimary', option.value) }}
            />
          </div>
          <div className='secondary'>
            <Select
              options={mediaOptions}
              value={getOptionFromValue(mediaOptions,characterData.mediaSecondary)}
              onChange={(option) => { updateCharacterData('mediaSecondary', option.value) }}
            />
          </div>
        </div>
      </div>

      <div className='stats'>
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

        <div className='stamina'>
          <div className='label'>Stamina</div>
          <div className='value'>{getStaminaForCharacter(characterData)}</div>
        </div>
      </div>

      <table className='techniques'><tbody>
        <tr>
          <td>Workshop</td>
          <td>
            <TextInput
              textValue={characterData.workshop}
              setTextValue={(value) => { updateCharacterData('workshop', value) }}
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
              placeholder={''}
              maxLength={32}
            />
          </td>
        </tr>

        { characterData.techniques.map((technique, i) => {
            return (
              <tr key={i}>
                <td>
                  <Select
                    options={techniqueOptions}
                    value={getOptionFromValue(techniqueOptions, technique)}
                    onChange={(option) => { updateTechnique(i, option.value) }}
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
                options={techniqueOptions}
                value={null}
                onChange={(option) => { updateTechnique((characterData.techniques.length), option.value) }}
              />
            </td>
            <td>+</td>
          </tr>
        }
      </tbody></table>
    </div>
  )
}

export default CraftCharacter ;
