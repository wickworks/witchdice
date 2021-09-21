import React from 'react';
import TipsAndTricks from './TipsAndTricks.jsx';
import SiteSettings from './SiteSettings.jsx';
import SiteAbout from './SiteAbout.jsx';
import NouveauDivider from '../shared/NouveauDivider.jsx';

import './MainSettings.scss';

const MainSettings = ({
  enabledPages, setEnabledPages
}) => {

  return (
    <div className='MainSettings'>

      <div className='settings-and-about' >
        <SiteSettings
          enabledPages={enabledPages}
          setEnabledPages={setEnabledPages}
        />

        <SiteAbout />
      </div>

      <TipsAndTricks />

      <NouveauDivider />
    </div>
  )
}

export default MainSettings ;
