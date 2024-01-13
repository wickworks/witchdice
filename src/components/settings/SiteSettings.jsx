import React from 'react';
import ManageLocalContent from "./ManageLocalContent.jsx";
import { allPages, saveEnabledPages } from "../page_data.js";

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

  const isPageHidden = (pageID) => {
    return ['terms','owlbear','view','draft'].includes(pageID)
  }

  const pageClass = (pageID) => {
    return [
      isPageLocked(pageID) ? 'unavailable' : '',
      enabledPages[pageID] ? 'active' : ''
    ].join(' ')
  }

  const toggleablePages = allPages.filter(page => !isPageHidden(page.id))

  return (
    <div className='SiteSettings'>

      <h2>Settings</h2>

      <h3>Active Pages</h3>
      <div className='settings-section'>
        <div className='navbar-settings-container'>
          {toggleablePages.map(page =>
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

      <ManageLocalContent />
    </div>
  )
}

export default SiteSettings ;
