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
  const [message, setMessage] = useState('');

  useEffect(() => {
    firebase.initializeApp(config);

    const dbRef = firebase.database().ref().child('message');
    dbRef.on('value', (snapshot) => setMessage(snapshot.val()));

  }, []);




	return (
		<div className="PartyPanel">
			<h2>Party Panel</h2>
			<hr className='pumpkin-bar' />
			<div className='party-container'>
				DM rolls well, message:
        {message}
			</div>
			<hr className='pumpkin-bar' />
		</div>
	);
}

export default PartyPanel;
