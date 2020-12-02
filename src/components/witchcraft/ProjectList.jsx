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
  handleAddProject
}) => {

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
            const id = entry.id;
            const name = entry.name;
            const selectedClass = (id === activeProjectID) ? 'selected' : ''
            const projectData = loadLocalData(PROJECT_PREFIX, id);
            return (
              <li
                className={`project-entry ${selectedClass}`}
                onClick={() => handleProjectClick(id)}
                key={id}
              >
                { projectData ?
                  <>
                    <div className='name'>{name ? name : 'Project'}</div>
                    <div className='stamina'>
                      {projectData.staminaSpent}
                      /
                      {getStaminaCostForProject(projectData)}
                    </div>
                  </>
                :
                  <div className='name'>Missing Data</div>
                }
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
