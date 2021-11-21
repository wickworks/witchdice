import React, { useState } from 'react';
import { allPilotSkills } from './data.js';

import './PilotDossier.scss';


const PilotDossier = ({
  activePilot
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="PilotDossier">
      <div className="dossier-container">
        <h2>{activePilot.name}</h2>

        <div className="name-etc">
          <div className="text-info">
            <div className="label">Callsign</div>
            <div className="info">{activePilot.callsign}</div>
          </div>

          <div className="text-info">
            <div className="label">Background</div>
            <div className="info">{activePilot.background}</div>
          </div>

          <div className="license-level">
            <div className="label">License Level</div>
            <div className="info">{activePilot.level}</div>
          </div>
        </div>

        <div className="section-label">Skill Triggers</div>
        <div className="skill-container">
          { activePilot.skills.map((skill, i) => {
            const skillData = allPilotSkills.find(pilotskill => pilotskill.id === skill.id);
            return (
              <div className="skill" key={skill.id}>
                <span className="name">{skillData.name}</span>
                <span className="bonus">+{skill.rank * 2}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PilotDossier;
