import React from 'react';
import TextInput from '../shared/TextInput.jsx';
import { capitalize } from '../../utils.js';
import './ProjectCard.scss';

const ProjectCard = ({
  projectData,
  updateProjectData
}) => {

  var jsonData = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData));


  return (
    <div className='ProjectCard'>

      <div className='card'>

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

      <div className='export-container'>
        <a
          className='export-json'
          href={`data:${jsonData}`}
          download={`${projectData.name}.json`}
        >
          Export
        </a>
      </div>
    </div>
  )
}



export default ProjectCard ;
