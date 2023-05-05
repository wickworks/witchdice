import React from 'react';
import { Link, useParams, useLocation } from "react-router-dom";
import { allPages, allPageIds } from "../page_data.js";
import './ModeChooser.scss';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ModeChooser = ({
  enabledPages
}) => {
  const { rollmode } = useParams();

  const queryParams = useQuery();
  const urlRoom = queryParams.get('r');
  const roomLink = urlRoom ? `?r=${urlRoom}` : ''

  const rollModeClass = allPageIds().includes(rollmode) ? 'minimized' : 'full'

  // ensures that "settings" is always enabled
  const currentPages = {
    ...enabledPages,
    'settings': true
  }

  return (
    <div className={`ModeChooser ${rollModeClass}`}>
      <div className={`roll-mode ${rollModeClass}`}>

        {allPages.map(page => {
          return (currentPages[page.id] &&
            <Link
              to={`/${page.id}${roomLink}`}
              className={rollmode === page.id ? 'selected' : ''}
              key={page.id}
            >
              <div className='mode-title'>
                <h2>{page.title}</h2>
              </div>
              <p className='mode-desc simple'>
                {page.desc}
              </p>
            </Link>
          )
        })}

      </div>
    </div>
  );
}

export default ModeChooser ;
