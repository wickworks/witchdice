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

    console.log('toggling', pageID, 'current:',currentlyEnabled, 'new data:', newEnabledPages);

    setEnabledPages(newEnabledPages)

    // save the setting to localstorage
    saveEnabledPages(newEnabledPages)

  }

  console.log('site settings enabled pages', enabledPages);

  return (
    <div className='SiteSettings'>
      <h2>Settings</h2>

      <h3>Active tools:</h3>
      <div className='navbar-settings-container'>

        {allPages.map(page =>
          <label key={page.id}>
            <input
              type='checkbox'
              checked={enabledPages[page.id]}
              onChange={() => togglePage(page.id)}
            />
            {page.title}
          </label>
        )}

      </div>
    </div>
  )
}

export default SiteSettings ;
