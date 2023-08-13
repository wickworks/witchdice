import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import Header from './components/siteframe/Header.jsx';
import Footer from './components/siteframe/Footer.jsx';
import LoadinDots from './components/shared/LoadinDots.jsx';
import { loadEnabledPages } from "./components/page_data.js";
import './App.scss';

// import Main from './components/Main.jsx';
const Main = lazy(() => import('./components/Main.jsx'));

const OWLBEAR_IFRAME_PATH = '/owlbear'
const VIEW_IFRAME_PATH = '/view'
window.witchdiceIsInOwlbearIframe = window.location.href.includes(OWLBEAR_IFRAME_PATH)
window.witchdiceIsInViewIframe = window.location.href.includes(VIEW_IFRAME_PATH)
const isRenderingToIframe = window.witchdiceIsInOwlbearIframe || window.witchdiceIsInViewIframe

try {
  window.localStorageEnabled = (window.localStorage && true)
} catch (e) {
  console.log('Local storage not enabled; Witchdice requires access for its advanced features.');
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enabledPages, setEnabledPages] = useState(
    window.localStorageEnabled ? loadEnabledPages() : ['simple']
  )

  return (
    <Router>
      <Route path="/:rollmode?">
        <div className="App" aria-disabled={isModalOpen}>

          <Route render={
            ({ location }) => !isRenderingToIframe
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
            ({ location }) => !isRenderingToIframe
              ? <Footer />
              : null
            }
          />

        </div>
      </Route>
    </Router>
  );
}

export default App;
