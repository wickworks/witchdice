import React from 'react';
import Clock from './Clock.jsx';
import QAndA from './QAndA.jsx';
import Ideals from './Ideals.jsx';
import BondPowers from './BondPowers.jsx';
import './Bonds.scss';

const Bonds = ({
  activePilot
}) => {
  return (
    <div className='Bonds'>
      <div className='bonds-page'>
        <h2>The Broker</h2>
        <div className='columns'>
          <div className='clocks-column'>
            <Clock typeLabel='XP' />
            <Clock typeLabel='Stress' />
            <Clock typeLabel='Minor Burden' inputEnabled={true} />
            <Clock typeLabel='Minor Burden' inputEnabled={true} />
            <Clock typeLabel='Major Burden' inputEnabled={true} />
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
