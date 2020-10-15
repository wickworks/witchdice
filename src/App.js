import React from 'react';
import './App.scss';
import Main from './components/Main.jsx';
import { CURRENT_VERSION } from './data.js';

function App() {
  return (
    <div className="App">
      <h1>🌺💀 ~ Roll With Love ~ 💀🌺</h1>
      <div className='beta-label'>
        beta — v{CURRENT_VERSION}
      </div>

      <Main />

    </div>
  );
}

export default App;
