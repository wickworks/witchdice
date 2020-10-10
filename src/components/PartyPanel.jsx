import React, { useState, useEffect } from 'react';
import './PartyPanel.scss';

import firebase from 'firebase';

const config = {
  apiKey: "AIzaSyBQJ2LG4nrCBhoIxg94rYi7AzzNf-GqgTM",
  authDomain: "roll-to-hit.firebaseapp.com",
  databaseURL: "https://roll-to-hit.firebaseio.com",
  projectId: 'roll-to-hit',
};

const PartyPanel = () => {
	// const [rollHistory, setRollHistory] = useState([]);
  const [connected, setConnected] = useState(false);
  const [partyRoom, setPartyRoom] = useState('sargasso-sea');
  const [myName, setMyName] = useState('olive');

  const [allPartyActionData, setAllPartyActionData] = useState([defaultPartyActionData_dicebag,defaultPartyActionData_attack]);

  useEffect(() => {
    firebase.initializeApp(config);
    // const dbRef = firebase.database().ref();
    // dbRef.child('message').on('value', (snapshot) => setMessage(snapshot.val()));

  }, []);


  const connectToRoom = (roomName) => {
    console.log('Clicked button to connect to room : ', roomName);

    try {
      console.log('Attempting to connect to room : ', roomName);
      if (roomName === null || roomName.length === 0) { throw('Invalid room name!') }

      const dbRef = firebase.database().ref()
      dbRef.child(roomName).on('value',
        (snapshot) => setAllPartyActionData(snapshot.val())
      );
      setConnected(true);

    } catch (error) {
      console.log('ERROR: ',error.message);
      setConnected(false);
    }
  }

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


	return (
		<div className="PartyPanel">
			<h2>Party Rolls</h2>

			<hr className='pumpkin-bar' />
			<div className='party-container'>
        { allPartyActionData.map((partyActionData, i) => {
          return (
            <PartyAction partyActionData={partyActionData} />
          )
        }) }
			</div>
			<hr className='pumpkin-bar' />

      <div className='party-my-name-container'>
        <label htmlFor='party-my-name'>Name</label>
        <input type='text' id='party-my-name' value={myName} onChange={(value) => setMyName(value)} />
      </div>

      <div className='party-room-container'>
        { !connected ?
          <>
            <button onClick={() => connectToRoom(partyRoom)}>
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
