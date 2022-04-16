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
        <h2>{bondData.name}</h2>
        <div className='columns'>
          <div className='clocks-column'>
            <Clock typeLabel='XP' defaultSize={8} />
            <Clock typeLabel='Stress' defaultSize={8} />
            <Clock typeLabel='Minor Burden' defaultSize={4} inputEnabled={true} userLabel={userLabel} setUserLabel={setUserLabel} />
            <Clock typeLabel='Minor Burden' defaultSize={4} inputEnabled={true} userLabel={userLabel} setUserLabel={setUserLabel} />
            <Clock typeLabel='Major Burden' defaultSize={8} inputEnabled={true} userLabel={userLabel} setUserLabel={setUserLabel} />
          </div>

          <div className='text-column'>
            <QAndA question='What gives you your powers?' answer={'Deep-seated trauma'}/>
            <QAndA question='What do you speak with?' answer={'My clothes'} />
            <Ideals activePilot={activePilot} />
            <BondPowers activePilot={activePilot} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bonds ;
