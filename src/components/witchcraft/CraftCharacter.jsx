import React, { useState, useEffect } from 'react';
import Select from 'react-select'
import TextInput from '../shared/TextInput.jsx';
import NumberInput from '../shared/NumberInput.jsx';
import { DeleteButton, DeleteConfirmation } from '../shared/DeleteButton.jsx';
import { deepCopy } from '../../utils.js';
import {
  allMediaTypes,
  allTechniques,
  getStaminaForCharacter,
  crafterHasTechnique,
  getDefaultClass
} from './data.js';

import './CraftCharacter.scss';


const mediaOptions = allMediaTypes.map(media => ({
  "value" : media,
  "label" : media
}))

function getTechniqueOptions(crafterData) {
  const techniqueOptions = Object.keys(allTechniques)
  // do we meet the prereqs?
  .filter(key => {
    const minTier = allTechniques[key].prereq[0];
    return crafterData.tier >= minTier;
  })
  // turn it into react-select's weird format
  .map(key => ({
    "value" : key,
    "label" : allTechniques[key].name,
  }))

  return techniqueOptions;
}

function getTechniquesGroupedByTier(techniqueOptions) {
  return [
    {
      label: 'Tier 1',
      options: techniqueOptions.filter(option => {
        const key = option.value;
        const tier = allTechniques[key].prereq[0];
        return (tier === 1);
      })
    },{
      label: 'Tier 2',
      options: techniqueOptions.filter(option => allTechniques[option.value].prereq[0] === 2 )
    },{
      label: 'Tier 3',
      options: techniqueOptions.filter(option => allTechniques[option.value].prereq[0] === 3 )
    },{
      label: 'Tier 4',
      options: techniqueOptions.filter(option => allTechniques[option.value].prereq[0] === 4 )
    },{
      label: 'Tier 5',
      options: techniqueOptions.filter(option => allTechniques[option.value].prereq[0] === 5 )
    },
  ]
}

const alloyOptions = [
  {"value": "Illuminium", "label": "Illuminium"},
  {"value": "Realm Silver", "label": "Realm Silver"},
  {"value": "Adamantine", "label": "Adamantine"},
  {"value": "Deep Mountain Brass", "label": "Deep Mountain Brass"},
  {"value": "Stained Glass Steel", "label": "Stained Glass Steel"},
  {"value": "Morphing Mercury", "label": "Morphing Mercury"},
]

const spellweaverOptions = [
  {"value": "Abjuration", "label": "Abjuration"},
  {"value": "Divination", "label": "Divination"},
  {"value": "Enchantment", "label": "Enchantment"},
  {"value": "Transmutation", "label": "Transmutation"},
]

// The react-select wants us to pass in the ENTIRE option from above to be selected, not just the value.
// However, I don't want to store its weird-ass special object. We can just retrieve it with the key here.
function getOptionFromValue(options, value) {
  if (!Array.isArray(options)) { return null }

  var result = options.find(option => {
    return option.value === value
  })
  return result;
}

// Style for the drop-down menus
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

const clearSelectDropdownIconStyle = {
  indicatorsContainer: (provided, state) => {
    const display = 'none';
    return { ...provided, display };
  }
}

const disguiseSelectStyle = {
  control: (provided, state) => {
    const backgroundColor = 'transparent';
    const border = 'none';
    return { ...provided, backgroundColor, border };
  },
  ...clearSelectDropdownIconStyle
}


const CraftCharacter = ({
  crafterData,
  updateCrafterData,
  deleteCrafter,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const isDeletingClass = isDeleting ? 'hidden' : '';

  useEffect(() => {
    setIsDeleting(false);
  }, [crafterData]);


  // ===== UPDATE CRAFTER DATA ====== //
  const updateTechnique = (techniqueIndex, value) => {
    var newData = deepCopy(crafterData.techniques);
    // replace or add
    if (techniqueIndex < newData.length) {
      newData[techniqueIndex] = value;
    } else {
      newData.push(value);
    }

    updateCrafterData({techniques: newData});
  }

  // get a default class if none is entered
  if (crafterData.mediaPrimary && crafterData.mediaSecondary && !crafterData.class) {
    updateCrafterData({class: getDefaultClass(crafterData.mediaPrimary, crafterData.mediaSecondary)})
  }

  // ======== TECHNIQUES ========= //
  const techniqueOptions = getTechniqueOptions(crafterData);
  const techniqueOptionsGroupedByTier = getTechniquesGroupedByTier(techniqueOptions);

  var techniqueCountForCrafter = (crafterData.tier + 1);
  if (crafterHasTechnique(crafterData, 'subtleTouch')) { techniqueCountForCrafter += 3 }
  const unselectedTechniques = techniqueCountForCrafter - crafterData.techniques.length;

  const alloySelect = (
    <Select
      isMulti
      placeholder={'Alloys'}
      name="alloys"
      className="technique-select"
      options={alloyOptions}
      value={crafterData.techniqueDetails.alloys}
      onChange={(options) => {
        updateCrafterData({techniqueDetails: {
          ...crafterData.techniqueDetails,
          alloys: options.slice(0,3)
        }})
      }}
      key={`alloys`}
    />
  )

  const spellweaverSelect = (
    <Select
      placeholder={'School of magic'}
      name="school"
      className="technique-select"
      options={spellweaverOptions}
      value={getOptionFromValue(spellweaverOptions, crafterData.techniqueDetails.spellweaver)}
      onChange={(option) => {
        updateCrafterData({techniqueDetails: {
          ...crafterData.techniqueDetails,
          spellweaver: option.value
        }})
      }}
      key={`alloys`}
    />
  )

  return (
    <div className={`CraftCharacter ${isDeletingClass}`}>
      <hr className="pumpkin-bar" />

      <div className='intro-container'>
        <div className='name-and-class'>
          <h2 className='name'>
            <TextInput
              textValue={crafterData.name}
              setTextValue={(value) => {
                if (value === '') { value = 'Crafter' }
                updateCrafterData({name: value})
              }}
              placeholder={'Name'}
              maxLength={32}
            />
          </h2>

          <div className='tier'>
            <div className="crafting-tier">
              <NumberInput
                value={crafterData.tier}
                setValue={(value) => { updateCrafterData({tier: value}) }}
                minValue={1}
                maxValue={5}
                prefix={"Tier "}
              />
            </div>
            <div className="crafting-class">
              <TextInput
                textValue={crafterData.class}
                setTextValue={(value) => { updateCrafterData({class: value}) }}
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
              onChange={(option) => { updateCrafterData({mediaPrimary: option.value}) }}
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
              onChange={(option) => { updateCrafterData({mediaSecondary: option.value}) }}
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
          <div className='value'>
            {getStaminaForCharacter(crafterData)}
            { crafterHasTechnique(crafterData, 'meTime') &&
              (crafterData.tier >= 5 ?
                <span>+3</span>
              : crafterData.tier >= 3  ?
                <span>+2</span>
              :
                <span>+1</span>
              )
            }
          </div>
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
              setValue={(value) => { updateCrafterData({proficiencyBonus: value}) }}
              minValue={2}
              maxValue={10}
              plusPrefix={true}
            />
          </div>
        </div>
      </div>

      <table className='techniques'><tbody>

        <tr className='basic'>
          <td>Tool Proficiency</td>
          <td>
            <TextInput
              textValue={crafterData.toolProficiency}
              setTextValue={(value) => { updateCrafterData({toolProficiency: value}) }}
              placeholder={'Tool'}
              maxLength={32}
            />
          </td>
        </tr>

        <tr className='basic'>
          <td>Lingua Franca</td>
          <td>
            <TextInput
              textValue={crafterData.linguaFranca}
              setTextValue={(value) => { updateCrafterData({linguaFranca: value}) }}
              placeholder={'Language'}
              maxLength={32}
            />
          </td>
        </tr>

        <tr className='basic'>
          <td>Workshop</td>
          <td>
            <TextInput
              textValue={crafterData.workshop}
              setTextValue={(value) => { updateCrafterData({workshop: value}) }}
              placeholder={'Workshop'}
              maxLength={64}
            />
          </td>
        </tr>

        { crafterHasTechnique(crafterData, 'finishingTouches') &&
          <tr className='basic'>
            <td>{allTechniques.finishingTouches.name}</td>
            <td>
              {allTechniques.finishingTouches.desc}
              { crafterData.tier >= 4 && ' You can use this feature twice per project.' }
            </td>
          </tr>
        }

        { crafterHasTechnique(crafterData, 'secondNature') &&
          <tr className='basic'>
            <td>{allTechniques.secondNature.name}</td>
            <td>{allTechniques.secondNature.desc}</td>
          </tr>
        }

        { crafterHasTechnique(crafterData, 'insightfulTalent') &&
          <tr className='basic'>
            <td>{allTechniques.insightfulTalent.name}</td>
            <td>{allTechniques.insightfulTalent.desc}</td>
          </tr>
        }

        { crafterData.techniques.map((technique, i) => {
            return (
              <tr key={i}>
                <td className='selected-technique'>
                  <Select
                    className={'select-dropdown'}
                    options={techniqueOptionsGroupedByTier}
                    isOptionDisabled={tech => (
                      tech.value !== technique &&
                      crafterHasTechnique(crafterData, tech.value)
                    )}
                    formatGroupLabel={data => (<div className='tier-group'>{data.label}</div>)}
                    value={getOptionFromValue(techniqueOptions, technique)}
                    onChange={(option) => { updateTechnique(i, option.value) }}
                    escapeClearsValue={true}
                    styles={disguiseSelectStyle}
                  />
                </td>
                <td>
                  {allTechniques[technique].desc}
                  {(technique === 'alloy') && alloySelect}
                  {(technique === 'spellweaver') && spellweaverSelect}
                </td>
              </tr>
            )
        })}

        { (unselectedTechniques > 0) &&
          [...Array(unselectedTechniques)].map( (technique, i) => (
            <tr key={i}>
              <td></td>
              <td>
                <Select
                  className={'select-dropdown'}
                  options={techniqueOptionsGroupedByTier}
                  isOptionDisabled={tech => crafterHasTechnique(crafterData, tech.value)}
                  formatGroupLabel={data => (<div className='tier-group'>{data.label}</div>)}
                  value={null}
                  onChange={(option) => { updateTechnique((crafterData.techniques.length), option.value) }}
                  placeholder={'Choose Technique'}
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
            </tr>
          ))
        }
      </tbody></table>

      { isDeleting ?
        <DeleteConfirmation
          name={crafterData.name}
          handleCancel={() => setIsDeleting(false)}
          handleDelete={() => {setIsDeleting(false); deleteCrafter()}}
          moreClasses={'delete-crafter-confirmation'}
        />
      :
        <DeleteButton
          handleClick={() => setIsDeleting(true)}
          moreClasses='delete-project'
        />
      }


      <hr className="pumpkin-bar" />
    </div>
  )
}

export default CraftCharacter ;
