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
      <div className='title'>
        <TextInput
          textValue={projectData.name}
          setTextValue={(value) => { updateProjectData({name: value}) }}
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
          setTextValue={(value) => { updateProjectData({desc: value}) }}
          placeholder='Project description'
          isTextbox={true}
          isMarkdown={true}
        />
      </div>
    </div>
  )
}

export default ProjectCard ;
