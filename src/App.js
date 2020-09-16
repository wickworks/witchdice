import React from 'react';
import './App.scss';
import Attack from './components/Attack.jsx';

function App() {
  return (
    <div className="App">
      <h1>🌺💀 ~ Roll To Hit ~ 💀🌺</h1>
      <div>(click to increase attack rolls, right-click to decrease)</div>
      <Attack />
    </div>
  );
}

export default App;
