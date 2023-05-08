import React, { useState } from 'react';
import './OwlbearExtensionNotice.scss';


const OWLBEAR_LINK = 'https://www.owlbear.app/'
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
            <a href={OWLBEAR_LINK} target="_blank" rel="noopener noreferrer"><div className='asset owlbear' /></a>
            <p>Owlbear Rodeo is a virtual tabletop that handles the maps and tokens for playing online games.</p>
            <p>Add the <a href={EXTENSION_LINK} target="_blank" rel="noopener noreferrer">Witchdice extension</a> to stop jumping between tabs!</p>

            <ol>
              <li><div>
                <a href={OWLBEAR_LINK} target="_blank" rel="noopener noreferrer">Create a free room on Owlbear Rodeo.</a>
              </div></li>
              <li><div>
                <a href={EXTENSION_LINK} target="_blank" rel="noopener noreferrer">Copy the install link for Witchdice.</a>
              </div></li>
              <li><div>
                Subscribe a channel to your room by running the command:
              </div></li>
            </ol>
          </div>

          <div className='border'>

          </div>
        </div>
      }


    </div>


  );
}

export default OwlbearExtensionNotice;
