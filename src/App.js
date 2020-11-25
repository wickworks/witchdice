import React, { useState } from 'react';
import { CURRENT_VERSION } from './version.js';
import ModeChooser from './components/ModeChooser.jsx';
import Main from './components/Main.jsx';
import Footer from './components/Footer.jsx';
import './App.scss';

// whenever we make a change that breaks the old data, bump up the first number
console.log('Welcome to Witch Dice version ', CURRENT_VERSION);

const loadedMode = localStorage.getItem("roll_mode");

function App() {
  const [rollMode, setRollMode] = useState(loadedMode);

  const saveRollMode = (mode) => {
    localStorage.setItem("roll_mode", mode);
    setRollMode(mode);
  }

  return (
    <div className="App">
      <h1 className='site-title'>
        🌺💀<div> ~ Witch Dice ~ <div>💀🌺</div></div>
      </h1>
      <div className='beta-label'>
        beta — v{CURRENT_VERSION}
      </div>

      <ModeChooser
        rollMode={rollMode}
        saveRollMode={saveRollMode}
      />

      { rollMode &&
        <Main rollMode={rollMode}/>
      }

      <Footer />

    </div>
  );
}

export default App;
