import React from 'react';
import { BrowserRouter as Router, Route, useLocation } from "react-router-dom";
import ModeChooser from './components/ModeChooser.jsx';
import Main from './components/Main.jsx';
import Footer from './components/Footer.jsx';
import './App.scss';

function App() {
  return (
    <Router>
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



          <ModeChooser />
        </div>

        <Main />

        <Footer />

      </div>
    </Router>
  );
}

export default App;
