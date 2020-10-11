import React, { useState, useEffect } from 'react';
import './PartyPanel.scss';
import { allDamageTypes } from '../data.js';

const PartyPanel = ({
  allPartyActionData,
  partyRoom, partyName,
  setPartyRoom, setPartyName,
  partyConnected, connectToRoom,
}) => {
	// const [rollHistory, setRollHistory] = useState([]);



  //
  // const handleButton = () => {
  //   try {
  //     const dbRef = firebase.database().ref();
  //
  //     dbRef.child("bottles").push({
  //       message: 'somebody loves you',
  //       timestamp: Date.now(),
  //     });
  //
  //   } catch (error) {
  //     console.log('ERROR: ',error.message);
  //   }
  // }

  // console.log('rendering partyActionData', allPartyActionData);


	return (
		<div className="PartyPanel">
			<h2>Party Rolls</h2>

			<hr className='pumpkin-bar' />
			<div className='party-container'>

        { (!partyConnected) ? <>
          <div className='party-name-container'>
            <label htmlFor='party-name'>Name</label>
            <input type='text' id='party-name' value={partyName} onChange={(e) => setPartyName(e.target.value)} />
          </div>

          <div className='party-room-container'>
            <label htmlFor='party-room'>Room</label>
            <input type='text' id='party-room' value={partyRoom} onChange={(e) => setPartyRoom(e.target.value)}/>
          </div>
          <button className='party-connect' onClick={() => connectToRoom()}>Connect</button>

        </> : <>

          {allPartyActionData &&
            allPartyActionData.slice(0).reverse().map((partyActionData, i) => {
              return (
                <PartyAction
                  partyActionData={partyActionData}
                  key={i}
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
//   'roll-1': {
//     'attack': 11,
//     'name': 'Longsword',
//     'slashing': 14,
//     'necrotic': 3,
//   }
// }
//
// const defaultPartyActionData_dicebag = {
//   'name': 'Olive',
//   'type': 'dicebag',
//   'roll-1': {
//     'die': 'd6',
//     'result': '2',
//   },
//   'roll-2': {
//     'die': 'd6',
//     'result': '4',
//   }
// }


const PartyAction = ({partyActionData}) => {
  const {name, conditions, type} = partyActionData;

  // convert the rolls into an array
  let actionRolls = [];
  Object.keys(partyActionData).forEach((key, i) => {
    if (key.startsWith('roll-')) { actionRolls.push(partyActionData[key]) }
  });

  let diceBagSum = 0;
  return (
    <div className="PartyAction">

      <div className="title">
        <div className="name">{name}</div>
        { conditions && <div className="conditions">{conditions}</div> }
      </div>


      { type === 'dicebag' ?
        <div className="dicebag-container">
          { (actionRolls.length > 1) ?
            <>
              <div className="dicebag-rolls">
                { (diceBagSum = 0) || '' }
                { actionRolls.map((roll, i) => {
                  diceBagSum = diceBagSum + parseInt(roll.result);
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
  const {name, attack} = actionRollData;

  // prepare to harvest damage information
  const dataKeys = Object.keys(actionRollData);
  return (
    <div className="PartyRollAttack">
      <div className='asset d20' />
      <div className="attack-roll">{attack}</div>
      <div className="attack-name">{name}</div>

      <div className="damage-container">
        { allDamageTypes.map((damageType, i) => {
          if ((dataKeys.indexOf(damageType) >= 0) && (actionRollData[damageType] > 0)) {
            return (
              <div className="damage" key={i}>
                {actionRollData[damageType]}
                <div className={`asset ${damageType}`} />
              </div>
            )
          }
        }) }
      </div>
    </div>
  );
}

export default PartyPanel;
