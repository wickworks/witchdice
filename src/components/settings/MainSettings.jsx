import React from 'react';
import TipsAndTricks from './TipsAndTricks.jsx';
import SiteSettings from './SiteSettings.jsx';

import './MainSettings.scss';

const MainSettings = () => {

  return (
    <div className='MainSettings'>
      <SiteSettings />
      <TipsAndTricks />
    </div>
  )
}

export default MainSettings ;
