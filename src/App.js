import React, { useState } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import ModeChooser from './components/ModeChooser.jsx';
import Main from './components/Main.jsx';
import Footer from './components/Footer.jsx';
import './App.scss';

function App() {
  const [partyRoom, setPartyRoom] = useState('');
  const [partyConnected, setPartyConnected] = useState(false);

  return (
    <Router>
      <Route path="/:rollmode?/:room?">
        <div className="App">
          <div className='banner-and-chooser'>

            <Route path="/craft">
              <div className='witch-craft banner-container-container'>
                <a
                  className='banner-container'
                  href='http://astrolago.com/'
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className='asset witchcraft_banner' />
                </a>
              </div>
            </Route>

            <div className='witch-dice banner-container-container'>
              <div className='banner-container'>
                <div className='asset site_banner' />
              </div>
            </div>


            <ModeChooser
              partyRoom={partyRoom}
              partyConnected={partyConnected}
            />
          </div>

          <Main
            partyRoom={partyRoom}
            setPartyRoom={setPartyRoom}
            partyConnected={partyConnected}
            setPartyConnected={setPartyConnected}
          />

          <Footer />

        </div>
      </Route>
    </Router>
  );
}

export default App;
