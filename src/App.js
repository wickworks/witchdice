import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import ModeChooser from './components/ModeChooser.jsx';
import Footer from './components/Footer.jsx';
import LoadinDots from './components/shared/LoadinDots.jsx';
import { loadEnabledPages } from "./components/page_data.js";
import './App.scss';

// import Main from './components/Main.jsx';
const Main = lazy(() => import('./components/Main.jsx'));

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enabledPages, setEnabledPages] = useState( loadEnabledPages() )

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
                  rel="noopener noreferrer"
                >
                  <div className='asset witchcraft_banner' role="img" alt="Witch+Craft banner" />
                </a>
              </div>
            </Route>

            <Route path="/lancer">
              <div className='lancer banner-container-container'>
                <a
                  className='banner-container'
                  href='https://massif.netlify.app/lancer'
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className='asset lancer_banner' role="img" alt="Lancer banner" />
                </a>
              </div>
            </Route>

            <div className='witch-dice banner-container-container'>
              <div className='banner-container'>
                <div className='asset site_banner' role="img" alt="WITCH DICE"/>
              </div>
            </div>

            <ModeChooser enabledPages={enabledPages} />
          </div>

          <Suspense fallback={<LoadinDots />}>
            <Main
              setIsModalOpen={setIsModalOpen}
              enabledPages={enabledPages}
              setEnabledPages={setEnabledPages}
            />
          </Suspense>

          <Footer />

        </div>
      </Route>
    </Router>
  );
}

export default App;
