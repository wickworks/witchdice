import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import Header from './components/siteframe/Header.jsx';
import Footer from './components/siteframe/Footer.jsx';
import LoadinDots from './components/shared/LoadinDots.jsx';
import { loadEnabledPages } from "./components/page_data.js";
import './App.scss';

// import Main from './components/Main.jsx';
const Main = lazy(() => import('./components/Main.jsx'));

const IFRAME_PATH = '/owlbear'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enabledPages, setEnabledPages] = useState( loadEnabledPages() )

  return (
    <Router>
      <Route path="/:rollmode?">
        <div className="App" aria-disabled={isModalOpen}>

          <Route render={
            ({ location }) => !location.pathname.includes(IFRAME_PATH)
              ? <Header enabledPages={enabledPages} />
              : null
            }
          />

          <Suspense fallback={<LoadinDots />}>
            <Main
              setIsModalOpen={setIsModalOpen}
              enabledPages={enabledPages}
              setEnabledPages={setEnabledPages}
            />
          </Suspense>

          <Route render={
            ({ location }) => !location.pathname.includes(IFRAME_PATH)
              ? <Footer enabledPages={enabledPages} />
              : null
            }
          />

        </div>
      </Route>
    </Router>
  );
}

export default App;
