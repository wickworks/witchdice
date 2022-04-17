import React from 'react';
import { findBondData } from '../lancerData.js';
import './BondButton.scss';


const BondButton = ({
  onClick,
  isViewingBond,
  bondID,
}) => {

  const hasBond = !bondID;

  return (
    <div className='BondButton'>
      <button onClick={onClick} disabled={isViewingBond}>
        {hasBond ?
          <span className='no-bond'>Bondless</span>
        :
          findBondData(bondID).name
        }
      </button>
    </div>
  );
}

export default BondButton ;
