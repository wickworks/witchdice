import React, { useState } from 'react';
import Roll from './Roll.jsx';
import './Roller.scss';


const Roller = ({...props}) => {
  const {
    rollData,
    handleNewRoll,
    rollFunctions //this will get passed down to the RollMods
  } = props;

  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [toHitAC, setToHitAC] = useState(0);


  // calculate damage total & breakdown by type
  let damageTotal = 0;
  let damageBreakdown = {};

  for (let rollID = 0; rollID < rollData.length; rollID++) {
    if (rollData[rollID].hit) {

      const damageRollData = rollData[rollID].damageRollData;
      for (let damID = 0; damID < damageRollData.length; damID++) {
        const type = damageRollData[damID][0];
        const amount = damageRollData[damID][1];

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
          <button className="new-roll" onClick={() => handleNewRoll()}>
            Roll
          </button>

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

        { rollData.map((data, i) => {
          let {rollUse, rollDiscard} = 0;
          const rollSorted = [data.rollOne, data.rollTwo].sort((a,b)=>a-b);

          if (advantage && !disadvantage) {
            rollUse = rollSorted[1];
            rollDiscard = rollSorted[0];
          } else if (disadvantage && !advantage) {
            rollUse = rollSorted[0];
            rollDiscard = rollSorted[1];
          } else {
            rollUse = data.rollOne;
            rollDiscard = 0;
          }

          return (
            <Roll
              rollID={i}
              rollUse={rollUse}
              rollDiscard={rollDiscard}
              toHitAC={toHitAC}
              {...data}
              {...rollFunctions}
            />
          )
        })}

      </div>
    </div>
  );
}
export default Roller ;
