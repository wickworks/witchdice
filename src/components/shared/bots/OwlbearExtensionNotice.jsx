import React, { useState } from 'react';
import './OwlbearExtensionNotice.scss';


const OWLBEAR_LINK = 'https://www.owlbear.app/'
const OWLBEAR_PROFILE_LINK = 'https://www.owlbear.app/profile/'
const EXTENSION_LINK = 'https://extensions.owlbear.rodeo/witchdice'

const OwlbearExtensionNotice = ({
}) => {

  const [instructionsVisible, setInstructionsVisible] = useState(false);
  return (
    <div className='OwlbearExtensionNotice'>
      {!instructionsVisible ?
        <div className='intro-container'>
          <div className='new-attention'>
            New!
          </div>

          <button onClick={() => setInstructionsVisible(true)}>
            <div className='text'>
              VTT extension for
            </div>
            <div className='asset owlbear' />
          </button>
        </div>
      :
        <div className='instructions-container'>
          <button className='asset x' onClick={() => setInstructionsVisible(false)} />
          <div className='border'>
            <a href={OWLBEAR_LINK} target="_blank"><div className='asset owlbear' /></a>
            <p>Owlbear Rodeo is a virtual tabletop that handles the maps and tokens for playing online games.</p>
            <p>Add the Witchdice extension to stop jumping between tabs!</p>

            <ol>
              <li><div>
                Click "Copy Install Link" from <a href={EXTENSION_LINK} target="_blank">Witchdice's extension page.</a>
              </div></li>
              <li><div>
                <a href={OWLBEAR_PROFILE_LINK} target="_blank">Log into Owlbear Rodeo</a> and press "Add Extension". Paste the install link.
              </div></li>
              <li><div>
                Open your Owlbear Rodeo room, click the kebab in the bottom left, and press "Extensions".
              </div></li>
              <li><div>
                Enable Witchdice.
              </div></li>
            </ol>
          </div>
        </div>
      }


    </div>


  );
}

export default OwlbearExtensionNotice;
