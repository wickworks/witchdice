import React from 'react';
import TextInput from '../shared/TextInput.jsx';
import { deepCopy, capitalize } from '../../utils.js';
// import {
//
// } from './data.js';

import './ProjectCard.scss';


const ProjectCard = ({
  projectData,
  updateProjectData
}) => {

  return (
    <div className='ProjectCard'>
      <div className='project-container'>
        <div className='title'>
          <TextInput
            textValue={projectData.blueprint}
            setTextValue={(value) => { updateProjectData('blueprint', value) }}
            placeholder={'Project name'}
            suffix={'.'}
            maxLength={128}
          />
        </div>

        <div className='attributes'>
          {`${capitalize(projectData.size)}, ${projectData.difficulty} project.`}
        </div>

        <div className='description'>
          <TextInput
            textValue={projectData.desc}
            setTextValue={(value) => { updateProjectData('desc', value) }}
            placeholder='Project description'
            maxLength={512}
            isTextbox={true}
            isMarkdown={true}
          />
        </div>
      </div>
    </div>
  )
}

export default ProjectCard ;
