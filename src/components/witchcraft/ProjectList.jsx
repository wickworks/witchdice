import React from 'react';
import TextInput from '../shared/TextInput.jsx';
import { deepCopy, capitalize } from '../../utils.js';
import { loadLocalData } from '../../localstorage.js';
import {
  getStaminaCostForProject
} from './data.js';

import './ProjectList.scss';

const PROJECT_PREFIX = 'project';

const ProjectList = ({
  activeProjectID,
  projectEntries,
  handleProjectClick,
  handleAddProject,
  updateProjectData,
}) => {

  function renderProjectItem(projectData) {
    if (!projectData) { return (<div className='name'>Missing Data</div>) }

    const stage = projectData.stage;
    const settingUpProject =
      (projectData !== null) &&
      (projectData.stage === 'preparing' || projectData.stage === 'tuning')
    const listIcon =
      (stage === 'preparing' || stage === 'tuning') ?
        'list_dot'
      : (stage === 'success') ?
        'list_check'
      :
        'list_x'

    return (
      <>
        <div className={`asset ${listIcon}`}/>
        <div className={`name ${stage}`}>
          { settingUpProject ?
            <TextInput
              textValue={projectData.name}
              setTextValue={(value) => { updateProjectData({name: value}) }}
              placeholder={'What are you making?'}
              maxLength={128}
              startsOpen={projectData.name === ''}
            />
          :
            <>{projectData.name ? projectData.name : 'Project'}</>
          }
        </div>


        { (stage === 'preparing' || stage === 'tuning') &&
          <div className='stamina'>
            {projectData.staminaSpent}/{getStaminaCostForProject(projectData)}
          </div>
        }
      </>
    )
  }

  return (
    <div className='ProjectList'>
      <div className='title-container'>
        <div className='title'>Projects</div>

        <div className='new-project'>
          <button className="asset plus" onClick={handleAddProject}>
            <div className='text-container'>
              <span>New Project</span>
            </div>
          </button>
        </div>
      </div>

      <div className='projects-container'>
        <ul>
          { projectEntries.map((entry, i) => {
            const selectedClass = (entry.id === activeProjectID) ? 'selected' : ''
            const projectData = loadLocalData(PROJECT_PREFIX, entry.id);
            return (
              <li
                className={`project-entry ${selectedClass}`}
                onClick={() => handleProjectClick(entry.id)}
                key={entry.id}
              >
                {renderProjectItem(projectData)}
              </li>
            )
          })}
        </ul>
      </div>
      <hr className="pumpkin-bar" />
    </div>
  )
}

export default ProjectList ;
