import React, { useState } from 'react';
import './PartyPanel.scss';

import firebase from 'firebase';



const config = {
  apiKey: "AIzaSyBQJ2LG4nrCBhoIxg94rYi7AzzNf-GqgTM",
  authDomain: "roll-to-hit.firebaseapp.com",
  databaseURL: "https://roll-to-hit.firebaseio.com"
};
firebase.initializeApp(config);
export const auth = firebase.auth;
export const db = firebase.database();

const PartyPanel = (rollData, diceBagData) => {
	const [rollHistory, setRollHistory] = useState([]);


	return (
		<div className="PartyPanel">
			<h2>PartyPanel</h2>
			<hr className='pumpkin-bar' />
			<div className='party-container'>
				DM rolls well
			</div>
			<hr className='pumpkin-bar' />
		</div>
	);
}

export default PartyPanel;
