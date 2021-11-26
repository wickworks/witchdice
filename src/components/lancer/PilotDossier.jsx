import React, { useState } from 'react';
import MechanicsList from './MechanicsList.jsx';
import { findSkillData, findFrameData, findTalentData, findCoreBonusData } from './lancerData.js';
import './PilotDossier.scss';


function truncateString(str, num) {
  if (str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str;
  }
}

function hashCode(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
}

function pilotIDToGeneStatus(pilotID) {
  const idHash = hashCode(pilotID)
  const modded = Math.abs(idHash) % 101;    //  0 - 100
  const squared = modded * modded;          // 0 — 10,000 parabolic
  const reduced = squared * .0006;          // 0 - 6
  const listIndex = Math.floor(reduced+.1); // reduced max is actually only 5.99999 for some reason

  const redList = ['LC','NT','VU','EN','CR','EW','EX']
  return redList[listIndex];
}

const PilotDossier = ({
  activePilot
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const MAX_CALLSIGN = 22;

  const slicedCallsign = activePilot.callsign.slice(0, MAX_CALLSIGN)

  const geneStatus = pilotIDToGeneStatus(activePilot.id);

  const hase = activePilot.mechSkills;

  return (
    <div className="PilotDossier">
      <div className="dossier-container">

        <div className="watermark-container asset-lancer ssc-watermark">


          <div className="diamond">
            <img className='portrait asset-lancer ssc-watermark' src={activePilot.cloud_portrait} />

            <div className="ll-tab">
              <div className="license-level">{activePilot.level}</div>
              <div className="label">License Level</div>
            </div>

            <div className="gene-tab">
              <div className="label">Geneline</div>
              <div className={`gene ${geneStatus}`}>{geneStatus}</div>
            </div>
          </div>

          <div className="name-and-callsign">

            <div className={`callsign ${activePilot.callsign.length > MAX_CALLSIGN ? 'sliced' : ''}`}>
                {slicedCallsign}
            </div>
            <div className="name">{activePilot.name}</div>

            <div className="hase">
              <div><span className='attribute'>HULL</span> {hase[0]}</div>
              <div><span className='attribute'>AGI</span> {hase[1]}</div>
              <div><span className='attribute'>SYS</span> {hase[2]}</div>
              <div><span className='attribute'>ENGI</span> {hase[3]}</div>
            </div>

            <div className="background">
              {activePilot.background ? activePilot.background.toLowerCase() : 'Unknown Origin'}
            </div>

          </div>

          <div className="lists-of-things">

            <MechanicsList
              label='Core Bonuses'
              findData={findCoreBonusData}
              mechanicIDList={activePilot.core_bonuses}
              containerClass={'core-bonuses'}
            />

            <MechanicsList
              label='Licenses'
              findData={findFrameData}
              mechanicIDList={activePilot.licenses}
              containerClass={'licenses'}
            />

          </div>

          <div className="lists-of-things secondary">

            <MechanicsList
              label='Talents'
              findData={findTalentData}
              mechanicIDList={activePilot.talents}
              containerClass={'talents'}
            />

            <MechanicsList
              label='Skills'
              findData={findSkillData}
              mechanicIDList={activePilot.skills}
              containerClass={'skills'}
              getRankDisplay={ (number) => { return `+${number * 2}`} }
            />

          </div>
        </div>
      </div>
    </div>
  )
}

export default PilotDossier;
