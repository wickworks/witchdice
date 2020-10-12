import React from 'react';
import './PartyPanel.scss';
import { allDamageTypes } from '../data.js';

const PartyPanel = ({
  allPartyActionData,
  partyRoom, partyName,
  setPartyRoom, setPartyName,
  partyConnected, connectToRoom,
}) => {


  const updatePartyRoom = (value) => {
    const filtered = value.replace(/[^A-Za-z\-]/ig, '')
    setPartyRoom(filtered)
  }

  const updatePartyName = (value) => {
    const filtered = value.replace(/[^A-Za-z \-]/ig, '')
    setPartyName(filtered)
  }

  const connectDisabled = (partyRoom.length <= 6 || partyName.length <= 0);

	return (
		<div className="PartyPanel">
			<h2>Party Rolls</h2>

			<hr className='pumpkin-bar' />
			<div className='party-container'>

        { (!partyConnected) ? <>
          <div className='party-name-container'>
            <label htmlFor='party-name'>Name</label>
            <input type='text' id='party-name' value={partyName} onChange={(e) => updatePartyName(e.target.value)} />
          </div>

          <div className='party-room-container'>
            <label htmlFor='party-room'>Room</label>
            <input type='text' id='party-room' value={partyRoom} onChange={(e) => updatePartyRoom(e.target.value)}/>
          </div>

          <button
            className='party-connect'
            onClick={() => connectToRoom()}
            disabled={connectDisabled}
          >
            Connect
          </button>

        </> : <>

          {allPartyActionData &&
            allPartyActionData.slice(0).reverse().map((actionData, i) => {
              return (
                <PartyAction
                  actionData={actionData}
                  key={actionData.timestamp}
                />
              )
            })
          }
        </> }
			</div>
			<hr className='pumpkin-bar' />

      { partyConnected && <>
        <div className='party-name-container'>
          <label>Name:</label>
          <div>{partyName}</div>
        </div>

        <div className='party-room-container'>
          <label>Party:</label>
          <div>{partyRoom}</div>
        </div>
      </> }
		</div>
	);
}



// two types of roll data: attack/damage rolls & dicebag rolls
// const defaultPartyActionData_attack = {
//   'name': 'Olive',
//   'conditions': 'advantage',
//   'type': 'attack',
//   'timestamp': XXXXXX,
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
//
// const defaultPartyActionData_dicebag = {
//   'name': 'Olive',
//   'type': 'dicebag',
//   'timestamp': XXXXXX,
//   'roll-1': {
//     'die': 'd6',
//     'result': '2',
//   },
//   'roll-2': {
//     'die': 'd6',
//     'result': '4',
//   }
// }


const PartyAction = ({actionData}) => {
  const {name, conditions, type} = actionData;

  // convert the rolls into an array & sum them
  let actionRolls = [];
  let diceBagSum = 0;
  let damageSum = 0;

  Object.keys(actionData).forEach((key, i) => {
    if (key.startsWith('roll-')) {
      const rollData = actionData[key];
      actionRolls.push(rollData)

      if (type === 'dicebag') {
        diceBagSum = diceBagSum + parseInt(rollData.result);

      } else if (type === 'attack') {
        allDamageTypes.forEach((damageType) => {
          if (Object.keys(rollData).indexOf(damageType) >= 0) {
            damageSum = damageSum + Math.floor(rollData[damageType])
          }
        })
      }
    }
  });

  return (
    <div className="PartyAction">

      <div className="title">
        <div className="name">{name}</div>
        { conditions ?
          <div className="conditions">{conditions}</div>
        : (type === 'attack' && actionRolls.length > 1) &&
          <div className="conditions">{damageSum} total</div>
        }
      </div>

      { type === 'dicebag' ?
        <div className="dicebag-container">
          { (actionRolls.length > 1) ?
            <>
              <div className="dicebag-rolls">
                { actionRolls.map((roll, i) => {
                  return (
                    <PartyRollDicebag
                      dieType={roll.die}
                      result={roll.result}
                      key={i}
                    />
                  )
                })}
              </div>
              <div className="dicebag-sum">{diceBagSum}</div>
            </>
          :
            <div className='dicebag-single'>
              <div className={`asset ${actionRolls[0].die}`} />
              {actionRolls[0].result}
            </div>
          }

        </div>

      : type === 'attack' &&
        <div className="attack-container">
          { actionRolls.map((actionRollData, i) => {
            return (
              <PartyRollAttack
                actionRollData={actionRollData}
                key={i}
              />
            )
          }) }
        </div>
      }
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

export default PartyPanel;
