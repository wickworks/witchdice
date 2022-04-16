import React, { useState } from 'react';
import Clock from './Clock.jsx';
import QAndA from './QAndA.jsx';
import Ideals from './Ideals.jsx';
import BondPowers from './BondPowers.jsx';
import { findBondData } from '../lancerData.js';
import './Bonds.scss';

const Bonds = ({
  activePilot
}) => {
  const [userLabel, setUserLabel] = useState('')

  const bondData = findBondData(activePilot.bondId)

  return (
    <div className='Bonds'>
      <div className='bonds-page'>
        <h2><span className='pilot-name'>{activePilot.name},</span> {bondData.name}</h2>
        <div className='columns'>
          <div className='clocks-column'>
            <Clock typeLabel='XP' defaultSize={8} />
            <Clock typeLabel='Stress' defaultSize={8} />
            <Clock typeLabel='Minor Burden' defaultSize={4} inputEnabled={true} userLabel={userLabel} setUserLabel={setUserLabel} />
            <Clock typeLabel='Minor Burden' defaultSize={4} inputEnabled={true} userLabel={userLabel} setUserLabel={setUserLabel} />
            <Clock typeLabel='Major Burden' defaultSize={8} inputEnabled={true} userLabel={userLabel} setUserLabel={setUserLabel} />
          </div>

          <div className='text-column'>
            <QAndA question='What gives you your powers?' answer={activePilot.bondAnswers[0]}/>
            <QAndA question='What do you speak with?' answer={activePilot.bondAnswers[1]} />
            <Ideals activePilot={activePilot} bondData={bondData} />
            <BondPowers activePilot={activePilot} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bonds ;
