import React from 'react';
import TipsAndTricks from './TipsAndTricks.jsx';
import SiteSettings from './SiteSettings.jsx';

import './MainSettings.scss';

const MainSettings = ({
  enabledPages, setEnabledPages
}) => {

  return (
    <div className='MainSettings'>
      <SiteSettings
        enabledPages={enabledPages}
        setEnabledPages={setEnabledPages}
      />
      <TipsAndTricks />
    </div>
  )
}

export default MainSettings ;
