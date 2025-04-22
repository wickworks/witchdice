import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import OBR from "@owlbear-rodeo/sdk";

/* Gather was directing to a /path for the longest time, no easy fix besides manually redirecting those. */
if (window.location.pathname.startsWith('/simple/')) {
  const urlRoom = window.location.pathname.slice(8)
  if (urlRoom && urlRoom.length >= 1) {
    window.location.href = `/simple?r=${urlRoom}`
    console.log('REDIRECTING malformed (probably gather) link to a room to use url params. Room: ', urlRoom);
  }
}

// this owlbear onReady call needs to be as high as possible in the tree to work in chrome
if (window.location.pathname.startsWith('/owlbear') && !OBR.isReady) {
  console.log('Witchdice: waiting for OBR to be ready; OBR.isAvailable / OBR.isReady', OBR.isAvailable, OBR.isReady);
  OBR.onReady(
    async () => ReactDOM.render(
      <App />,
      document.getElementById('root')
    )
  );

// normal rendering
} else {
  ReactDOM.render(
    <App />,
    document.getElementById('root')
  );
}





// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
