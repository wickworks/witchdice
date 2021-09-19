import React from 'react';
import { processRollData } from '../DiceBag/DiceBagData.js';
import { allDamageTypes } from '../../5e/data.js';
import './PartyAction.scss';


//
// const defaultPartyActionData_dicebag = {
//   'name': 'Olive',
//   'type': 'dicebag',
//   'createdAt': XXXXXX,
//   'updatedAt': XXXXXX,
//   'conditions': 'total'
//   'roll-1': {
//     'die': 'd6',
//     'result': '2',
//   },
//   'roll-2': {
//     'die': 'd6',
//     'result': '4',
//   }
// }


const PartyActionDicebag = ({actionData, showName}) => {
  const {conditions, updatedAt} = actionData;

  // convert the 'roll-X' keys into roll data:
  // [ {'dieType': '20', 'result': '1'}, {'dieType': '20', 'result': '12'}, ... ]
  let rollData = [];
  Object.keys(actionData).forEach(key => {
    if (key.startsWith('roll-')) rollData.push(actionData[key])
  });

  const resultTotal = processRollData(rollData, conditions)

  const oneLineClass = (rollData.length === 1) ? 'one-liner' : '';

  return (
    <div className={`PartyAction ${oneLineClass}`}>

      <ActionTitle
        actionData={actionData}
        showName={showName}
      />

      <div className="dicebag-container">
        { oneLineClass ?
          <div className='dicebag-single'>
            <div className={`asset ${rollData[0].dieType}`} />
            {rollData[0].result * rollData[0].sign}
          </div>
        : <>
          <div className="dicebag-rolls">
            { rollData.map((roll, i) => {
              return (
                <PartyRollDicebag
                  dieType={roll.dieType}
                  result={roll.result * roll.sign}
                  key={`${updatedAt}-${i}`}
                />
              )
            })}
          </div>
          <div className="dicebag-sum">
            {resultTotal}
          </div>
        </> }
      </div>

    </div>
  );
}


const PartyRollDicebag = ({dieType, result}) => {
  return (
    <div className="PartyRollDicebag">
      <div className={`asset ${dieType}`} />
      <div className="result">{result}</div>
    </div>
  );
}



// const defaultPartyActionData_attack = {
//   'char': 'Kira',
//   'name': 'Olive',
//   'conditions': 'advantage',
//   'type': 'attack',
//   'createdAt': XXXXXX,
//   'updatedAt': XXXXXX,
//   'roll-1': {
//     'attack': 11,
//     'name': 'Longsword',
//     'slashing': 14,
//     'necrotic': 3,
//     'applies': 'Poisoned'
//   },
//   'roll-2': {
//     'name': 'Fireball',
//     'fire': 14
//     'save': "DC 12 Dex",
//     'didsave': 'true',
//   }
// }

const PartyActionAttack = ({actionData, showName}) => {
  const {conditions, updatedAt} = actionData;

  // total up all the damage
  let damageSum = 0;
  let actionRolls = [];
  Object.keys(actionData).forEach(key => {
    if (key.startsWith('roll-')) {
      const actionRollData = actionData[key];
      actionRolls.push(actionRollData);

      allDamageTypes.forEach(damageType => {
        if (Object.keys(actionRollData).indexOf(damageType) >= 0) {
          damageSum = damageSum + Math.floor(actionRollData[damageType])
        }
      })
    }
  });

  return (
    <div className='PartyAction'>

      <ActionTitle
        actionData={actionData}
        showName={showName}
      />

      <div className="attack-container">
        { actionRolls.map((actionRollData, i) => {
          return (
            <PartyRollAttack
              actionRollData={actionRollData}
              key={`${updatedAt}-${i}`}
            />
          )
        }) }

        <div className="total-damage">
          {`${damageSum} damage`}
        </div>
      </div>

    </div>
  );
}


const PartyRollAttack = ({actionRollData}) => {
  const {name, attack, save, didsave, applies} = actionRollData;

  const isAttack = (('attack' in actionRollData) && (attack > 0));
  const isAbility = (('attack' in actionRollData) && !isAttack);
  const isSave = (('save' in actionRollData) && true);

  // prepare to harvest damage information
  const dataKeys = Object.keys(actionRollData);
  return (
    <div className="PartyRollAttack">
      { isAttack && <>
        <div className='asset d20' />
        <div className="attack-roll">{attack}</div>
      </> }

      { isSave &&
        <div className="save">
          <div className={`asset ${didsave ? 'checkmark' : 'x'}`} />
          {save}
        </div>
      }

      { (isAttack || isSave) ?
        <div className="attack-name">{name}</div>
      : isAbility &&
        <div className="ability-name">{name}</div>
      }

      <div className="damage-container">
        { applies &&
          <div className='applied-condition'>{applies}</div>
        }


        { allDamageTypes.map((damageType, i) => {
          if ((dataKeys.indexOf(damageType) >= 0) && (actionRollData[damageType] > 0)) {
            return (
              <div className="damage" key={i}>
                {Math.floor(actionRollData[damageType])}
                <div className={`asset ${damageType}`} />
              </div>
            )
          } else { return null }
        }) }
      </div>
    </div>
  );
}


const ActionTitle = ({actionData, showName}) => {
  const {name, char, conditions} = actionData;

  let conditionsArray = [];
  if (conditions) conditionsArray.push(conditions);
  const conditionsDisplay = conditionsArray.join(', ');

  return (
    <div className="title">
      {showName &&
        <div className="name">{char ? char : name}</div>
      }
      { conditionsDisplay &&
        <div className="conditions">{conditionsDisplay}</div>
      }
    </div>
  )
}

export { PartyActionDicebag, PartyActionAttack };