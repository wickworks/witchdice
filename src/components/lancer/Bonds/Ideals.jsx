import React from 'react';
import './Ideals.scss';

const Ideals = ({
  activePilot,
}) => {

  return (
    <div className='Ideals'>
      <p className='major-ideal'>
        I addressed challenges with strength, leadership, or force.
      </p>
      <p className='major-ideal'>
        I addressed challenges with strength, leadership, or force.
      </p>
      <p className='major-ideal'>
        I addressed challenges with strength, leadership, or force.
      </p>
      <input type='text' placeholder='Select a minor ideal' />
    </div>
  );
}

export default Ideals ;
