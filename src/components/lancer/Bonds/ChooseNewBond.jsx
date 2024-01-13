import React from 'react';
import { findAllGameData } from '../lancerData.js';
import './ChooseNewBond.scss';

const ChooseNewBond = ({
  currentBondId,
  setPilotBond,
}) => {
  const allBondData = findAllGameData('bonds')

  return (
    <div className='ChooseNewBond'>
      {Object.keys(allBondData).map(bondId =>
          <button
            className={`select-bond ${currentBondId === bondId ? 'selected' : ''}`}
            onClick={() => setPilotBond(bondId)}
            key={bondId}
          >
            <div className='bond-name'>{allBondData[bondId].name}</div>
            <div className={`asset ${bondId in allBondData ? bondId : 'card'}`} />
          </button>
        )
      }
    </div>
  );
}

export default ChooseNewBond ;
