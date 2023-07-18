import React, { useState } from 'react';
import { setupLancerStatusesPreset } from './marked_integration_utils.js';


import './MarkedIntegration.scss';

const MarkedIntegration = ({
  markedMetadata,
}) => {

  const [pressedButton, setPressedButton] = useState(false)

  const hasLancerPresetApplied = (
    markedMetadata &&
    markedMetadata['saveData'] &&
    markedMetadata['saveData']['Groups'] &&
    markedMetadata['saveData']['Groups'][0].Name === 'Conditions' &&
    markedMetadata['saveData']['Groups'][1].Name === 'Statuses' &&
    markedMetadata['saveData']['Labels'] &&
    markedMetadata['saveData']['Labels'].length === 15
  )

  return (
    <div className='MarkedIntegration'>
      <h3>Marked! integration</h3>
      { !markedMetadata ?
        <>
          <p>
            If you install the <a href='https://extensions.owlbear.rodeo/marked' target="_blank" rel="noopener noreferrer">Marked! extension</a>,
            you can apply a preset for Lancer statuses and conditions here.
          </p>
          <p>This will allow you to easily attach tags like Jammed to tokens.</p>
        </>
      :
        <>
          { pressedButton ?
            <p>Lancer statuses preset applied. Please refresh the page.</p>
          : !hasLancerPresetApplied ?
            <button onClick={() => { if (setupLancerStatusesPreset()) setPressedButton(true) }}>
              Set Marked! to use Lancer statuses
            </button>
          :
            <p>Lancer statuses preset applied.</p>
          }
        </>
      }
    </div>
  )
}

export default MarkedIntegration ;
