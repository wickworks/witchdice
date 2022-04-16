import React, { useState } from 'react';
import Clock from './Clock.jsx';
import QAndA from './QAndA.jsx';
import Ideals from './Ideals.jsx';
import BondPowers from './BondPowers.jsx';
import { findBondData } from '../lancerData.js';
import { deepCopy } from '../../../utils.js';
import './Bonds.scss';

const emptyBurden = {
  id: '',
  title: '',
  description: '',
  resolution: '',
  segments: 8,
  progress: 0,
}

const Bonds = ({
  activePilot
}) => {
  // const [userLabel, setUserLabel] = useState('')
  const [burdens, setBurdens] = useState([emptyBurden, emptyBurden, emptyBurden])

  const setBurdenTitle = (burdenTitle, index) => {
    var newBurdensData = deepCopy(burdens)
    const burdenToUpdate = newBurdensData[index]

    // is this a new burden?
    if (!burdenToUpdate.id) {
      const newBurden = {...emptyBurden}
      newBurden.id = '12345'
      newBurden.name = burdenTitle
      newBurden.segments = index < 2 ? 4 : 8
      newBurdensData[index] = newBurden
    } else {
      burdenToUpdate.name = burdenTitle
    }

    setBurdens(newBurdensData)
    console.log('newBurdensData',newBurdensData);
  }

  const setBurdenMaxSegments = (maxSegments, index) => {
    var newBurdensData = deepCopy(burdens)
    const burdenToUpdate = newBurdensData[index]
    if (burdenToUpdate.id) burdenToUpdate.segments = maxSegments
    setBurdens(newBurdensData)
    console.log('newBurdensData',newBurdensData);
  }

  const setBurdenProgress = (progress, index) => {
    var newBurdensData = deepCopy(burdens)
    var burdenToUpdate = newBurdensData[index]
    if (burdenToUpdate.id) burdenToUpdate.progress = progress
    setBurdens(newBurdensData)
  }

  const bondData = findBondData(activePilot.bondId)

  return (
    <div className='Bonds'>
      <div className='bonds-page'>
        <h2><span className='pilot-name'>{activePilot.name},</span> {bondData.name}</h2>
        <div className='columns'>
          <div className='clocks-column'>
            <Clock typeLabel='XP' defaultSize={8} />
            <Clock typeLabel='Stress' defaultSize={8} />

            {[...Array(3)].map((_, i) =>
              <Clock
                progress={burdens[i].progress}
                setProgress={progress => setBurdenProgress(progress, i)}
                maxSegments={burdens[i].segments}
                setMaxSegments={maxSegments => setBurdenMaxSegments(maxSegments, i)}
                typeLabel={i < 2 ? 'Minor Burden' : 'Major Burden'}
                userLabel={burdens[i].name}
                setUserLabel={label => setBurdenTitle(label, i)}
                inputEnabled={true}
                key={`burden-${i}`}
              />
            )}
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
