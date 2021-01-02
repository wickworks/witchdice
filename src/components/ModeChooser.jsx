import React from 'react';
import { Link, useParams, useLocation } from "react-router-dom";
import './ModeChooser.scss';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ModeChooser = () => {
  const { rollmode } = useParams();

  const queryParams = useQuery();
  const urlRoom = queryParams.get('r');
  const roomLink = urlRoom ? `?r=${urlRoom}` : ''

  const rollModeClass = ['simple','5e','craft'].includes(rollmode) ? 'minimized' : 'full'

  return (
    <div className={`ModeChooser ${rollModeClass}`}>
      <div className={`roll-mode ${rollModeClass}`}>

        <Link to={`/simple${roomLink}`} className={rollmode === 'simple' ? 'selected' : ''}>
          <div className='mode-title'>
            <h2>Simple</h2>
          </div>
          <p className='mode-desc simple'>
            Just a bag of dice & a table to share.
          </p>
        </Link>

        <Link to={`/5e${roomLink}`} className={rollmode === '5e' ? 'selected' : ''}>
          <div className='mode-title'>
            <h2>D&D 5e</h2>
          </div>
          <p className='mode-desc'>
            Attack and damage dice for characters & monsters.
          </p>
        </Link>

        <Link to={`/craft${roomLink}`} className={rollmode === 'craft' ? 'selected' : ''}>
          <div className='mode-title'>
            <h2>Witch+Craft</h2>
          </div>
          <p className='mode-desc'>
            Crafting and domestic magic system for 5e.
          </p>
        </Link>

      </div>
    </div>
  );
}

export default ModeChooser ;
