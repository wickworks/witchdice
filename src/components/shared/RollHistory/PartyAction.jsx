import React from 'react';
import BrToParagraphs from '../BrToParagraphs.jsx';

import { processRollData, firebaseActionDataIntoRollData } from '../DiceBag/DiceBagData.js';
import { allDamageTypes } from '../../5e/data.js';
import { LANCER_DAMAGE_TYPES } from '../../lancer/lancerData.js';
import './PartyAction.scss';


//
// const defaultPartyActionData_broadcast = {
//   'name': 'Olive',
//   'title': 'Kai Bioplating',
//   'message': 'Jump really good.',
//   'type': 'text',
//   'createdAt': XXXXXX,
//   'updatedAt': XXXXXX,
// }

const PartyActionBroadcastText = ({actionData, showName}) => {
  const {name, char, title, message} = actionData;

  return (
    <div className='PartyAction'>
      <div className={'action-container'}>
        <div className="title">
          {showName && <div className="name">{char || name}</div>}
          <div className="conditions">{title}</div>
        </div>

        <div className='broadcast-message'>
          <BrToParagraphs stringWithBrs={message}/>
        </div>
      </div>
    </div>
  );
}

//
// const defaultPartyActionData_dicebag = {
//   'name': 'Olive',
//   'annotation': 'Structure Check',
//   'message': '1: the player is stunned.',
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
  // console.log('actionData',actionData);

  // these are put together into a string
  let [summaryMode, summaryModeValue] = conditions.split(' ')
  summaryModeValue = parseInt(summaryModeValue) || 1

  // convert the 'roll-X' keys into roll data:
  // [ {'dieType': '20', 'result': '1'}, {'dieType': '20', 'result': '12'}, ... ]
  let rollData = firebaseActionDataIntoRollData(actionData);
  const resultTotal = processRollData(rollData, summaryMode, summaryModeValue)

  const oneLineClass = (rollData.length === 1) ? 'one-liner' : '';

  // used by the dicebag in seeing if we change die types
  let prevDieType = ''

  return (
    <div className='PartyAction'>

      <div className={`action-container ${oneLineClass}`}>
        <ActionTitle
          actionData={actionData}
          showName={showName}
        />

        <div className="dicebag-container">
          { oneLineClass ?
            <div className='dicebag-single'>
              <div className={`asset ${rollData[0].dieType}`} />
              <span className="hidden-text-for-copy-paste">{`(${rollData[0].dieType}) `}</span>
              {rollData[0].result}
            </div>
          : <>
            <div className="dicebag-rolls">
              { rollData.map((roll, i) => {

                const hiddenJoinText = (actionData.conditions == 'total' || roll.dieType !== prevDieType) ? ` + ` : ', '
                prevDieType = roll.dieType

                return (
                  <PartyRollDicebag
                    dieType={roll.dieType}
                    result={roll.result}
                    hiddenJoinText={i === 0 ? '' : hiddenJoinText}
                    key={`${updatedAt}-${i}`}
                  />
                )
              })}
            </div>
            <div className="dicebag-sum">
              <span className="hidden-text-for-copy-paste">Result: </span>
              {resultTotal}
            </div>
          </> }
        </div>
      </div>

      {actionData.message &&
        <div className='message'>
          <BrToParagraphs stringWithBrs={actionData.message}/>
        </div>
      }
    </div>
  );
}

const PartyRollDicebag = ({dieType, result, hiddenJoinText}) => {
  return (
    <span className="PartyRollDicebag">
      <span className="hidden-text-for-copy-paste">{hiddenJoinText}</span>
      <span className={`asset ${dieType}`} />
      <span className="hidden-text-for-copy-paste">{`(${dieType}) `}</span>
      <span className="result">{result}</span>
    </span>
  );
}





// const defaultPartyActionData_attack = {
//   'char': 'Kira',
//   'name': 'Olive',
//   'conditions': 'advantage',
//   'type': 'attack',
//   'createdAt': XXXXXX,
//   'updatedAt': XXXXXX,
//   'skipTotal': false,
//   'roll-1': {
//     'attack': 11,
//     'name': 'Longsword',
//     'slashing': 14,
//     'necrotic': 3,
//     'applies': 'Poisoned<br>Prone'
//   },
//   'roll-2': {
//     'name': 'Fireball',
//     'fire': 14
//     'save': "DC 12 Dex",
//     'didsave': 'true',
//   }
// }

const PartyActionAttack = ({actionData, showName}) => {
  const { updatedAt } = actionData;
  const skipTotal = !!actionData.skipTotal;

  // total up all the damage
  let damageSum = 0;
  let actionRolls = [];

  Object.keys(actionData).forEach(key => {
    if (key.startsWith('roll-')) {
      const actionRollData = actionData[key];
      actionRolls.push(actionRollData);

      [...allDamageTypes, ...LANCER_DAMAGE_TYPES].forEach(damageType => {
        if (Object.keys(actionRollData).indexOf(damageType) >= 0) {
          damageSum = damageSum + Math.floor(actionRollData[damageType])
        }
      })
    }
  });

  // console.log('rendering actionData', actionData);

  const skippingTotalClass = skipTotal ? 'skipping-total' : ''

  return (
    <div className='PartyAction'>

      <div className={`action-container ${skippingTotalClass}`}>
        <ActionTitle
          actionData={actionData}
          showName={showName}
        />

        <div className="attack-container">
          { actionRolls.map((actionRollData, i) =>
            <PartyRollAttack
              actionRollData={actionRollData}
              key={`${updatedAt}-${i}`}
            />
          )}

          {!skipTotal &&
            <div className="total-damage">
              {`${damageSum} damage`}
            </div>
          }
        </div>
      </div>
    </div>
  );
}


const PartyRollAttack = ({actionRollData}) => {

  const {name, attack, save, didsave, applies} = actionRollData;

  const isAttack = ('attack' in actionRollData) && (attack > -10); // magic number; abilities set a big negative
  // const isAbility = ('attack' in actionRollData) && !isAttack;
  const isSave = ('save' in actionRollData) && true;

  var nameText = name || '';
  var nameIcon = '';
  var nameIconCount = 0;
  if (nameText.includes('Accuracy')) {
    nameText = nameText.replace('Accuracy', '')
    nameIconCount = parseInt(nameText);
    nameIcon = 'accuracy'
  } else if (nameText.includes('Difficulty')) {
    nameText = nameText.replace('Difficulty', '')
    nameIconCount = parseInt(nameText);
    nameIcon = 'difficulty'
  }

  // find what types of damage we're doing
  let appliedDamageTypes = {};

  // harvest damage information — the fact that we can't rely on matching capitalization makes this ~convoluted~
  const dndAndLancerDamageTypes = [...allDamageTypes, ...LANCER_DAMAGE_TYPES]
  Object.keys(actionRollData).forEach(key => {
    const lowercaseKey = key.toLowerCase()
    const damageType = dndAndLancerDamageTypes.find(damageType => damageType.toLowerCase() === lowercaseKey)
    if (damageType) appliedDamageTypes[damageType] = actionRollData[key]
  });

  // some abilities only care about the effects, no attack roll nonsense
  const showMainRow = isAttack || isSave || Object.keys(appliedDamageTypes).length > 0 || nameText.length > 0 || !!nameIcon

  return (
    <div className="PartyRollAttack">

      {showMainRow &&
        <div className="main-row">
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

          <div className={(isAttack || isSave) ? "attack-name" : "ability-name"}>
            {nameIcon ?
              [...Array(nameIconCount).keys()].map(i =>
                <span className={`asset ${nameIcon}`} key={i}/>
              )
            :
              <span>{nameText}</span>
            }
          </div>

          <div className="damage-container">
            { Object.keys(appliedDamageTypes).map((damageType, i) =>
              <div className="damage" key={i}>
                {Math.floor(appliedDamageTypes[damageType])}
                <div className={`asset ${damageType.toLowerCase()}`} />
              </div>
            )}
          </div>
        </div>
      }

      {applies &&
        <div className="applied-conditions">
          <BrToParagraphs stringWithBrs={applies}/>
        </div>
      }
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
        <div className="conditions">
          { conditionsDisplay.split(',').map((condition, i) =>
            <span key={i}>{condition}</span>
          )}
        </div>
      }
    </div>
  )
}

export { PartyActionDicebag, PartyActionAttack, PartyActionBroadcastText };
