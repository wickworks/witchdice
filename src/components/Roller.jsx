import React, { useState } from 'react';
import Roll from './Roll.jsx';
import './Roller.scss';

const initialRollData =
[
  {hit: true, rollUse: 18, rollDiscard: 0, damageData: [['fire', 3],['slashing', 8],['piercing', 8],['psychic', 8]]},
  {hit: false, rollUse: 15, rollDiscard: 8, damageData: [['necrotic', 22],['radiant', 4],['bludgeoning', 8],['thunder', 8]]},
  {hit: false, rollUse: 2, rollDiscard: 18, damageData: [['poison', 1],['force', 1],['acid', 3],['cold', 8],['lightning', 8]]},
];

const Roller = () => {
  const [rollData, setRollData] = useState(initialRollData);
  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  // const [toHitAC, setToHitAC] = useState(0);

  const updateRollData = (key, value, id) => {
    let newData = [...rollData]
    newData[id][key] = value
    setRollData(newData);
  }

  const rollFunctions = {
    setHit: (hit, id) => updateRollData('hit', hit, id)
  }

  const generateNewRoll = () => {

  }


  // calculate damage total & breakdown by type
  let damageTotal = 0;
  let damageBreakdown = {};

  for (let rollID = 0; rollID < rollData.length; rollID++) {
    if (rollData[rollID].hit) {

      const damageData = rollData[rollID].damageData;
      for (let damID = 0; damID < damageData.length; damID++) {
        const type = damageData[damID][0];
        const amount = damageData[damID][1];

        damageTotal = damageTotal + amount;
        if (type in damageBreakdown) {
          damageBreakdown[type] = damageBreakdown[type] + amount
        } else {
          damageBreakdown[type] = amount
        }
      }
    }
  }


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

            {/*<label className="armor-class">
              <input
                type="number"
                value={toHitAC}
                onChange={e => setToHitAC(e.target.value)}
              />
              AC (optional)
            </label>*/}
          </div>
        </div>

        <div className="results">
          <div className="type-breakdown">
            { Object.keys(damageBreakdown).map((type, i) => {
              return (
                <div className="damage-type" key={i}>
                  <div className='amount'>{damageBreakdown[type]}</div>
                  <div className={`asset ${type}`} />
                </div>
              )
            })}

          </div>
          <div className="total">
            <div className="label">Total Damage:</div>
            <div className="count">{damageTotal}</div>
          </div>
        </div>
      </div>

      <hr />

      <div className="rolls">
        <div className="hit-label">Hit?</div>

        <Roll rollID={0} {...rollData[0]} {...rollFunctions} />
        <Roll rollID={1} {...rollData[1]} {...rollFunctions} />
        <Roll rollID={2} {...rollData[2]} {...rollFunctions} />
      </div>
    </div>
  );
}
export default Roller ;
