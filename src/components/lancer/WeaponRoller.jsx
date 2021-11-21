import React, { useState } from 'react';

import './WeaponRoller.scss';


const WeaponRoller = ({
  weaponData
}) => {

  return (
    <div className="WeaponRoller">
      <h2>{weaponData.id}</h2>
    </div>
  )
}


export default WeaponRoller;
