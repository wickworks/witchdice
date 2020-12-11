import React, { useState } from 'react';
import ModeChooser from './components/ModeChooser.jsx';
import Main from './components/Main.jsx';
import Footer from './components/Footer.jsx';
import './App.scss';

// whenever we make a change that breaks the old data, bump up the first number
// console.log('Welcome to Witch Dice version ', CURRENT_VERSION);

const loadedMode = localStorage.getItem("roll_mode");

function App() {
  const [rollMode, setRollMode] = useState(loadedMode);

  const saveRollMode = (mode) => {
    localStorage.setItem("roll_mode", mode);
    setRollMode(mode);
  }

  return (
    <div className="App">
      <div className={`banner-and-chooser ${rollMode ? 'reversed' : ''}`}>
        <div className='witch-dice banner-container-container'>
          <div className='banner-container'>
            <div className='asset site_banner' />
          </div>
        </div>

        { rollMode === 'witchcraft' &&
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
        }

        <ModeChooser
          rollMode={rollMode}
          saveRollMode={saveRollMode}
        />
      </div>

      { rollMode &&
        <Main rollMode={rollMode}/>
      }

      <Footer />

    </div>
  );
}

export default App;
