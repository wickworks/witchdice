import React from 'react';
import Select from 'react-select'
import TextInput from '../TextInput.jsx';
import NumberInput from '../NumberInput.jsx';
import { allMediaTypes, getStaminaForCharacter } from './data.js';

import './CraftCharacter.scss';

const CraftCharacter = ({
  characterData,
  updateCharacterData
}) => {
  const options = allMediaTypes.map(media => ({
     "value" : media,
     "label" : media[0].toUpperCase() + media.substring(1)
   }))

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
              options={options}
              value={characterData.mediaPrimary}
              onChange={(value) => { updateCharacterData('mediaPrimary', value) }}
            />
          </div>
          <div className='secondary'>
            <Select
              options={options}
              value={characterData.mediaSecondary}
              onChange={(value) => { updateCharacterData('mediaSecondary', value) }}
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

      <div className='features'>
        <table>
          <tr>
            <td>Workshop</td>
            <td>XX</td>
          </tr>
          <tr>
            <td>Lingua Franca</td>
            <td>XX</td>
          </tr>
          <tr>
            <td>Tool Proficiency</td>
            <td>XX</td>
          </tr>

          {characterData.features.map(feature, i) => {
            return (
              <tr key={i}>

              </tr>
            )
          }
          }
        </table>
      </div>
    </div>
  )
}

export default CraftCharacter ;
