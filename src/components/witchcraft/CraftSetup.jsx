import React from 'react';
import TextInput from '../shared/TextInput.jsx';
import {RadioGroup, Radio} from 'react-radio-group';
import { deepCopy, capitalize } from '../../utils.js';
import {
  allDifficulties,
  allSizes,
  allPreparations,
  allTechniques,
  crafterHasTechnique,
  getStaminaCostForProject
} from './data.js';

import './CraftSetup.scss';

const CraftSetup = ({
  crafterData,
  projectData,
  updateProjectData
}) => {

  const updatePreparation = (preparation, value) => {
    var newData = deepCopy(projectData.preparations);
    if (value) {
      newData.push(preparation)
    } else {
      newData.splice(newData.indexOf(preparation), 1);
    }
    updateProjectData({preparations: newData});
  }

  const updateTechnique = (technique, value) => {
    var newData = deepCopy(projectData.techniques);
    if (value) {
      newData.push(technique)
    } else {
      newData.splice(newData.indexOf(technique), 1);
    }
    updateProjectData({techniques: newData});
  }

  var preparations = [...allPreparations];
  if (crafterHasTechnique(crafterData, 'collaborator')) {
    preparations.push('Assistance (2)')
    if (crafterData.tier >= 5) preparations.push('Assistance (3)')
  }
  if (crafterHasTechnique(crafterData, 'counselledCrafter')) {
    preparations.push('Knowledge (2)')
    if (crafterData.tier >= 5) preparations.push('Knowledge (3)')
  }
  if (crafterHasTechnique(crafterData, 'theGoodStuff')) {
    preparations.push('High-quality Materials (2)')
    if (crafterData.tier >= 5) preparations.push('High-quality Materials (3)')
  }

  var techniques = [];
  if (crafterHasTechnique(crafterData, 'slowAndSteady')) {
    techniques.push('slowAndSteady')
  }

  return (
    <div className='CraftSetup'>
      <div className='setup-title'>
        <TextInput
          textValue={projectData.name}
          setTextValue={(value) => { updateProjectData({name: value}) }}
          placeholder={'Project title'}
          maxLength={128}
        />
      </div>
      <table><tbody>

        <tr className="blueprint">
          <td className="label">
            <div className="name">Blueprint</div>
          </td>
          <td>
            <TextInput
              textValue={projectData.blueprint}
              setTextValue={(value) => { updateProjectData({blueprint: value}) }}
              placeholder={'Additional details'}
              maxLength={128}
            />
          </td>
        </tr>

        <tr className="difficulty">
          <td className="label">
            <div className="name">Difficulty Level</div>
            <div className="summary">
              {allDifficulties[projectData.difficulty]}
            </div>
          </td>
          <td>
            <RadioGroup
              name={'difficulty'}
              className={"selections"}
              selectedValue={projectData.difficulty}
              onChange={(value) => { updateProjectData({difficulty: value}) }}
            >
              { Object.keys(allDifficulties).map((difficulty, i) => {
                const radioID = `difficulty-${i}`;
                const selectedClass = (difficulty === projectData.difficulty) ? 'selected' : '';
                return (
                  <label className={selectedClass} htmlFor={radioID} key={`radio-${radioID}`}>
                    <Radio value={difficulty} id={radioID} />
                    <div className='name'>
                      {capitalize(difficulty)}
                    </div>
                  </label>
                )
              })}
            </RadioGroup>
          </td>
        </tr>

        <tr className="size">
          <td className="label">
            <div className="name">Project Size</div>
            <div className="summary">
              {getStaminaCostForProject(projectData)}
            </div>
          </td>
          <td>
            <RadioGroup
              name={'size'}
              className={"selections"}
              selectedValue={projectData.size}
              onChange={(value) => { updateProjectData({size: value}) }}
            >
              { Object.keys(allSizes).map((size, i) => {
                const radioID = `size-${i}`;
                const selectedClass = (size === projectData.size) ? 'selected' : '';
                return (
                  <label className={selectedClass} htmlFor={radioID} key={`radio-${radioID}`}>
                    <Radio value={size} id={radioID} />
                    <div className='name'>
                      {capitalize(size)}
                    </div>
                  </label>
                )
              })}
            </RadioGroup>
          </td>
        </tr>

        <tr className="preparation">
          <td className="label">
            <div className="name">Preparation</div>
            <div className="summary">
              { projectData.preparations.length > 0 ?
                <span>+{projectData.preparations.length}d6</span>
              :
                <span />
              }
            </div>
          </td>
          <td>
            <div className="selections">
              { preparations.map((prep, i) => {
                const checkboxID = `preparation-${i}`;
                const isChecked = projectData.preparations.indexOf(prep) >= 0;
                return (
                  <label className='preparation' htmlFor={checkboxID} key={`checkbox-${checkboxID}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => updatePreparation(prep, !isChecked)}
                      id={checkboxID}
                    />
                    <div className='name'>{prep}</div>
                  </label>
                )
              })}
            </div>
          </td>
        </tr>

        { (techniques.length > 0) &&
          <tr className="technique">
            <td className="label">
              <div className="name">Techniques</div>
            </td>
            <td>
              <div className="selections">
                { techniques.map((tech, i) => {
                  const checkboxID = `technique-${i}`;
                  const isChecked = projectData.techniques.indexOf(tech) >= 0;
                  return (
                    <label className='technique' htmlFor={checkboxID} key={`checkbox-${checkboxID}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => updateTechnique(tech, !isChecked)}
                        id={checkboxID}
                      />
                      <div className='name'>{allTechniques[tech].name}</div>
                    </label>
                  )
                })}
              </div>
            </td>
          </tr>
        }
      </tbody></table>
    </div>
  )
}

export default CraftSetup ;
