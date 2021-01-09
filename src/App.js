import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import ModeChooser from './components/ModeChooser.jsx';
import Footer from './components/Footer.jsx';
import LoadinDots from './components/shared/LoadinDots.jsx';
import './App.scss';

// import Main from './components/Main.jsx';
const Main = lazy(() => import('./components/Main.jsx'));

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Router>
      <Route path="/:rollmode?">
        <div className="App" aria-disabled={isModalOpen}>
          <div className='banner-and-chooser'>
            <Route path="/craft">
              <div className='witch-craft banner-container-container'>
                <a
                  className='banner-container'
                  href='http://astrolago.com/'
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  <div className='asset witchcraft_banner' role="img" alt="Witch+Craft banner" />
                </a>
              </div>
            </Route>

            <div className='witch-dice banner-container-container'>
              <div className='banner-container'>
                <div className='asset site_banner' role="img" alt="WITCH DICE"/>
              </div>
            </div>

            <ModeChooser />
          </div>

          <Suspense fallback={<LoadinDots />}>
            <Main
              setIsModalOpen={setIsModalOpen}
            />
          </Suspense>

          <Footer />

        </div>
      </Route>
    </Router>
  );
}

export default App;
