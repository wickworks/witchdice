import React from 'react';
import { findBondData } from '../lancerData.js';
import './BondButton.scss';


const BondButton = ({
  onClick,
  isViewingBond,
  bondID,
}) => {

  return (
    <div className='BondButton'>
      <button onClick={onClick} disabled={isViewingBond}>
        {!!bondID ?
          findBondData(bondID).name
        :
          <span className='no-bond'>No bond.</span>
        }
      </button>
    </div>
  );
}

export default BondButton ;
