import React, {useState} from 'react';

import './SiteSettings.scss';

const ACTIVE_TOOLS_STORAGE_NAME = 'settings-active-tools';
const ACTIVE_TOOLS_DEFAULT = ['simple', '5e']

const SiteSettings = () => {

  // const [activeSimple, setActiveSimple] = useState(true);
  // const [active5E, setActive5E] = useState(true);
  // const [activeWitchCraft, setActiveWitchCraft] = useState(true);

  const [activeTools, setActiveTools] = useState(
    localStorage.getItem(ACTIVE_TOOLS_STORAGE_NAME) || ACTIVE_TOOLS_DEFAULT
  )

  const toggleTool = (tool) => {
    console.log('toggling tool', tool);
    const newActiveTools = [...activeTools]

    if (activeTools.includes(tool)) {
      newActiveTools.splice(activeTools.indexOf(tool), 1);
    } else {
      newActiveTools.push(tool)
    }


    setActiveTools(newActiveTools)
    localStorage.setItem(ACTIVE_TOOLS_STORAGE_NAME, JSON.stringify(newActiveTools))
  }

  return (
    <div className='SiteSettings'>
      <h2>Settings</h2>

      <h3>Active tools:</h3>
      <div className='navbar-settings-container'>

        <label>
          <input
            type='checkbox'
            checked={activeTools.includes('simple')}
            onChange={() => toggleTool('simple')}
          />
          Simple
        </label>

        <label>
          <input
            type='checkbox'
            checked={activeTools.includes('5e')}
            onChange={() => toggleTool('5e')}
          />
          D&D 5e
        </label>

        <label>
          <input
            type='checkbox'
            checked={activeTools.includes('craft')}
            onChange={() => toggleTool('craft')}
          />
          Witch+Craft
        </label>

        <label className='disabled'>
          <input
            type='checkbox'
            checked={true}
            onChange={() => {}}
            disabled={true}
          />
          Settings
        </label>
      </div>
    </div>
  )
}

export default SiteSettings ;
