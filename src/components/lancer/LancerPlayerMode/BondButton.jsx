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
          'No bond chosen.'
        }
      </button>
    </div>
  );
}

export default BondButton ;
