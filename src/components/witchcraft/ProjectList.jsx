import React, { useState, useEffect } from 'react';
import TextInput from '../shared/TextInput.jsx';
import { DeleteButton, DeleteConfirmation } from '../shared/DeleteButton.jsx';
import { deepCopy, capitalize } from '../../utils.js';
import { loadLocalData } from '../../localstorage.js';
import {
  getStaminaCostForProject,
  defaultProject
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

  const [isImportingFile, setIsImportingFile] = useState(false);

  const handleFileUpload = e => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      handleAddProject(e.target.result);
      setIsImportingFile(false);
    };
  };

  return (
    <div className='ProjectList'>
      <div className='title-container'>
        <div className='title'>Projects</div>

        <div className='new-project'>
          <button className={`asset plus ${projectEntries.length === 0 ? 'first' : ''}`} onClick={() => handleAddProject()}>
            <div className='text-container'>
              <span>New</span>
            </div>
          </button>
        </div>

        <div className='import-container'>
          {isImportingFile ?
            <input type="file" onChange={handleFileUpload} />
          :
            <a onClick={() => setIsImportingFile(true)}>Import</a>
          }
        </div>


        {/* <div className='stamina-label'>Stamina</div> */}
      </div>

      <div className='projects-container'>
        <ul>
          { projectEntries.map((entry, i) => {
            const projectData = loadLocalData(PROJECT_PREFIX, entry.id);
            const selectedClass = (entry.id === activeProjectID) ? 'selected' : ''
            return (
              <>{ projectData ?
                <ProjectListItem
                  projectData={projectData}
                  updateProjectData={updateProjectData}
                  selectedClass={selectedClass}
                  handleClick={() => handleProjectClick(entry.id)}
                  key={entry.id}
                />
              :
                <div>Error: cannot find project entry ~{entry.id}</div>
              }</>
            )
          })}
        </ul>
      </div>
      <hr className="pumpkin-bar" />
    </div>
  )
}


const ProjectListItem = ({
  projectData,
  updateProjectData,
  selectedClass,
  handleClick,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!selectedClass) { setIsDeleting(false) }
  }, [selectedClass]);


  const stage = projectData.stage;
  const settingUpProject = (stage === 'preparing' || stage === 'tuning')
  const listIcon =
    settingUpProject
      ? 'list_dot'
      : (stage === 'success')
        ? 'list_check'
        : 'list_x'

  // show no name if it's the default one
  const displayName = projectData.name === defaultProject.name ? '' : projectData.name

  return (
    <li
      className={`project-entry ${selectedClass}`}
      onClick={handleClick}
    >
      <div className={`list-dot asset ${listIcon}`}/>

      {isDeleting ?
        <DeleteConfirmation
          name={displayName}
          handleCancel={() => setIsDeleting(false)}
          handleDelete={() => { setIsDeleting(false); updateProjectData({name: ''}) }}
          moreClasses={'delete-project-confirmation'}
        />
      :
        <div className='project-item-container'>
          <div className={`name ${stage}`}>
            { settingUpProject ?
              <TextInput
                textValue={displayName}
                setTextValue={(value) => { updateProjectData({name: capitalize(value)}) }}
                placeholder={'What are you making?'}
                maxLength={128}
                startsOpen={projectData.name === defaultProject.name}
              />
            :
              projectData.name
            }
          </div>

          {/* { settingUpProject ?
            <div className='stamina'>
              {projectData.staminaSpent}/{getStaminaCostForProject(projectData)}
            </div>
          : */}
          { displayName.length > 0 &&
            <DeleteButton
              handleClick={() => setIsDeleting(true)}
              moreClasses='delete-project'
            />
          }
        </div>
      }
    </li>
  )
}

export default ProjectList ;
