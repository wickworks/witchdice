import React, { useState } from 'react';
import './TechRoller.scss';
import './WeaponRoller.scss';

const TechRoller = ({
  invadeData,
  techAttackBonus,
  sensorRange,
  setRollSummaryData,
  onClear,
}) => {

  const [allAttackRolls, setAllAttackRolls] = useState([]);
  const [isSettingUpAttack, setIsSettingUpAttack] = useState(true);

  // { invadeOptions.map((invade, i) =>
  //   <button className='invade' key={invade.name}>
  //     {invade.name}
  //   </button>
  // )}

  return (
    <div className='TechRoller WeaponRoller'>
      <h3 className='name'>{invadeData.name}</h3>

      <div className="top-bar">
        <div className='effect-row base-tech-stats'>
          <div>Tech Attack: +{techAttackBonus}</div>
          <div>Sensor range: {sensorRange}</div>
        </div>

        <div className='effect-row'>
          {invadeData.detail}
        </div>
      </div>

      <div className="attacks-bar">

      </div>


      <div className='status-bar'>

      </div>
    </div>
  )
}


export default TechRoller;
