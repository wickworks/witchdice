import React from 'react';
import './Roller.scss';

const Roller = () => {

  return (
    <div className="Roller">
      <button>Roll</button>
      <p>Advantage</p>
      <p>14 AC</p>
      <p>Total Damage: 21</p>
      <div className="attack-rolls">
        <p>20 8 8 8 5 CRIT</p>
        <p>5 —</p>
      </div>
    </div>
  );
}
export default Roller ;
