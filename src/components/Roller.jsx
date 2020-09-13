import React, { useState } from 'react';

import './Roller.scss';

const Roller = () => {
  const [rollData, setRollData] = useState(null);
  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [toHitAC, setToHitAC] = useState(0);

  return (
    <div className="Roller">
      <div className="controls-and-results">

        <div className="controls">
          <button className="new-roll">Roll</button>

          <div className="conditions">
            <label>
              <input
                name="advantage"
                type="checkbox"
                checked={advantage}
                onChange={() => setAdvantage(!advantage)}
              />
              Advantage
            </label>

            <label>
              <input
                name="disadvantage"
                type="checkbox"
                checked={disadvantage}
                onChange={() => setDisadvantage(!disadvantage)}
              />
              Disadvantage
            </label>

            <label className="armor-class">
              <input
                type="number"
                value={toHitAC}
                onChange={e => setToHitAC(e.target.value)}
              />
              AC (optional)
            </label>
          </div>
        </div>

        <div className="results">
          <ul className="type-breakdown">
            <li>16</li>
            <li>5</li>
            <li>2</li>
          </ul>
          <div className="total">
            <div className="label">Total Damage:</div>
            <div className="count">23</div>
          </div>
        </div>
      </div>
      <hr />
      <div className="rolls">
        <p>20 8 8 8 5 CRIT</p>
        <p>5 —</p>
      </div>
    </div>
  );
}
export default Roller ;
