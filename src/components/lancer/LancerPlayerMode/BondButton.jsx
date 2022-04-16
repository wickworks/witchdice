import React from 'react';
import { findBondData } from '../lancerData.js';
import './BondButton.scss';


const BondButton = ({
  onClick,
  isViewingBond,
  bondID,
}) => {

  const isDisabled = !bondID;

  return (
    <div className='BondButton'>
      <button onClick={onClick} disabled={isViewingBond || isDisabled}>
        {isDisabled ?
          <span className='no-bond'>No bond.</span>
        :
          findBondData(bondID).name
        }
      </button>
    </div>
  );
}

export default BondButton ;
