import React, { useState } from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import Main from './components/Main.jsx';
import Footer from './components/Footer.jsx';
import { CURRENT_VERSION } from './data.js';
import './App.scss';

// whenever we make a change that breaks the old data, bump up the first number
console.log('Welcome to Witch Dice version ', CURRENT_VERSION);

const loadedMode = localStorage.getItem("roll_mode");


function App() {
  const [rollMode, setRollMode] = useState(loadedMode);

  const rollModeClass = rollMode ? 'minimized' : 'full'
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

      <RadioGroup
        name={'roll-mode'}
        className={`roll-mode ${rollModeClass}`}
        selectedValue={rollMode}
        onChange={(value) => { saveRollMode(value) }}
      >
        <label className={`mode-container ${rollMode === 'simple' ? 'selected' : ''}`} key='mode-simple'>
          <div className='mode-title'>
            <Radio value='simple' id='mode-simple' />
            <h2>Simple</h2>
          </div>
          <p className='mode-desc simple'>
            Just a bag of dice & a table to share.
          </p>
        </label>

        <label className={`mode-container ${rollMode === '5e' ? 'selected' : ''}`} key='mode-5e'>
          <div className='mode-title'>
            <Radio value='5e' id='mode-5e' />
            <h2>D&D 5e</h2>
          </div>
          <p className='mode-desc'>
            Attack roller for D&D 5e characters & monsters.
          </p>
        </label>

      </RadioGroup>

      { rollMode &&
        <Main rollMode={rollMode}/>
      }

      <Footer />

    </div>
  );
}

export default App;
