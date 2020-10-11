import React, { useState, useEffect } from 'react';
import './PartyPanel.scss';


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

  console.log('rendering partyActionData', allPartyActionData);


	return (
		<div className="PartyPanel">
			<h2>Party Rolls</h2>

			<hr className='pumpkin-bar' />
			<div className='party-container'>
        {allPartyActionData && allPartyActionData.map((partyActionData, i) => {
          return (
            <PartyAction
              partyActionData={partyActionData}
              key={i}
            />
          )
        }) }
			</div>
			<hr className='pumpkin-bar' />

      <div className='party-name-container'>
        <label htmlFor='party-name'>Name</label>
        <input type='text' id='party-name' value={partyName} onChange={(value) => setPartyName(value)} />
      </div>

      <div className='party-room-container'>
        { !partyConnected ?
          <>
            <button onClick={() => connectToRoom()}>
              Connect
            </button>
            <input type='text' id='party-room' value={partyRoom} onChange={(value) => setPartyRoom(value)}/>
          </>
        :
          <>
            <label>Party</label>
            <div>{partyRoom}</div>
          </>
        }
      </div>
		</div>
	);
}



// two types of roll data: attack/damage rolls & dicebag rolls
const defaultPartyActionData_attack = {
  'name': 'Olive',
  'conditions': 'advantage',
  'type': 'attack',
  'roll-1': {
    'attack': '11',
    'name': 'Longsword',
    'damage': '14',
    'type': 'slashing',
  }
}

const defaultPartyActionData_dicebag = {
  'name': 'Olive',
  'type': 'dicebag',
  'roll-1': {
    'die': 'd6',
    'result': '2',
  },
  'roll-2': {
    'die': 'd6',
    'result': '4',
  }
}


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
          <div className="dicebag-rolls">
            {(diceBagSum = 0) || ''}
            {
              actionRolls.map((roll, i) => {
                diceBagSum = diceBagSum + parseInt(roll.result);
                return (
                  <PartyRollDicebag
                    dieType={roll.die}
                    result={roll.result}
                    key={i}
                  />
                )
              })
            }
          </div>
          <div className="dicebag-sum">{diceBagSum}</div>
        </div>

      : type === 'attack' &&
        <div className="attack-container">
          { actionRolls.map((roll, i) => {
            return (
              <PartyRollAttack
                attackRoll={roll.attack}
                name={roll.name}
                damage={roll.damage}
                type={roll.type}
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
      {result}
    </div>
  );
}

const PartyRollAttack = ({attackRoll, name, damage, type}) => {
  return (
    <div className="PartyRollAttack">
      <div className='asset d20' />
      <div className="attack-roll">{attackRoll}</div>
      <div className="attack-name">{name}</div>

      { (damage > 0) &&
        <div className="damage">
          {damage}
          <div className={`asset ${type}`} />
        </div>
      }
    </div>
  );
}

export default PartyPanel;
