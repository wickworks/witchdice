import React from 'react';
import MechanicsList from '../MechanicsList.jsx';
import { findSkillData, findPilotGearData, findFrameData, findTalentData, findCoreBonusData } from '../lancerData.js';
import './PilotDossier.scss';

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

  const geneStatus = pilotIDToGeneStatus(activePilot.id);

  const showPilotGear = activePilot.loadout.gear.filter(gear => gear)

  return (
    <div className="PilotDossier">
      <div className="dossier-container">

        <div className="watermark-container asset ssc-watermark">

          <NameAndCallsign activePilot={activePilot} extraClass='mobile-only' />

          <div className="diamond">
            <div className="portrait asset ssc-watermark">
              <img src={activePilot.cloud_portrait} alt={'pilot portrait'} />
            </div>

            <div className="ll-tab">
              <div className="license-level">{activePilot.level}</div>
              <div className="label">License Level</div>
            </div>

            <div className="gene-tab">
              <div className="label">Geneline</div>
              <div className={`gene ${geneStatus}`}>{geneStatus}</div>
            </div>
          </div>

          <NameAndCallsign activePilot={activePilot} extraClass='desktop-only' />

          <div className="lists-of-things primary">

            <MechanicsList
              label='Core Bonuses'
              findData={findCoreBonusData}
              tooltipContentKey='effect'
              tooltipFlavorKey='description'
              tooltipHref='https://compcon.app/#/compendium/corebonuses'
              mechanicIDList={activePilot.core_bonuses}
              containerClass={'core-bonuses'}
            />

            <MechanicsList
              label='Licenses'
              findData={findFrameData}
              tooltipFlavorKey='description'
              tooltipHref={`https://compcon.app/#/compendium/search?search=%TITLE`}
              mechanicIDList={activePilot.licenses}
              containerClass={'licenses'}
            />

          </div>

          <div className="lists-of-things secondary">

            <MechanicsList
              label='Talents'
              findData={findTalentData}
              tooltipContentKey='terse'
              tooltipFlavorKey='description'
              tooltipHref='https://compcon.app/#/compendium/talents'
              mechanicIDList={activePilot.talents}
              containerClass={'talents'}
            />

            {showPilotGear.length > 0 &&
              <MechanicsList
                label='Pilot Gear'
                findData={findPilotGearData}
                tooltipContentKey='description'
                tooltipHref='https://compcon.app/#/compendium/pilot_gear'
                mechanicIDList={showPilotGear}
                containerClass={'gear'}
              />
            }

            <MechanicsList
              label='Skills'
              findData={findSkillData}
              tooltipContentKey='description'
              tooltipHref='https://compcon.app/#/compendium/skills'
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


const NameAndCallsign = ({
  activePilot,
  extraClass,
}) => {

  const MAX_CALLSIGN = 22;
  const slicedCallsign = activePilot.callsign.slice(0, MAX_CALLSIGN)

  const hase = activePilot.mechSkills;

  return (
    <div className={`NameAndCallsign ${extraClass}`}>
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
  )
}

export default PilotDossier;
