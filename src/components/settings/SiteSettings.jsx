import React, {useState} from 'react';
import { allPages, loadEnabledPages, saveEnabledPages } from "../page_data.js";

import './SiteSettings.scss';

const SiteSettings = ({
  enabledPages, setEnabledPages
}) => {

  const togglePage = (pageID) => {
    const currentlyEnabled = enabledPages[pageID];

    // modify the local state
    const newEnabledPages = {...enabledPages}
    if (currentlyEnabled) {
      newEnabledPages[pageID] = false;
    } else {
      newEnabledPages[pageID] = true;
    }

    setEnabledPages(newEnabledPages)  // save the local state
    saveEnabledPages(newEnabledPages) // save the setting to localstorage
  }

  const isPageLocked = (pageID) => {
    return ['settings','simple'].includes(pageID)
  }

  const pageClass = (pageID) => {
    return [
      isPageLocked(pageID) ? 'unavailable' : '',
      enabledPages[pageID] ? 'active' : ''
    ].join(' ')
  }

  return (
    <div className='SiteSettings'>

      <h3>Active tools:</h3>
      <div className='navbar-settings-container'>

        {allPages.map(page =>
          <label
            className={pageClass(page.id)}
            key={page.id}
          >
            <input
              type='checkbox'
              checked={enabledPages[page.id]}
              onChange={() => togglePage(page.id)}
              disabled={isPageLocked(page.id)}
            />
            <div className={'title-and-desc'}>
              <div className='title'>{page.title}</div>
              <div className='desc'>{page.desc}</div>
            </div>
          </label>
        )}

      </div>
    </div>
  )
}

export default SiteSettings ;
