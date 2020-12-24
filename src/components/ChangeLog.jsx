import React, { useState } from 'react';
import { CURRENT_VERSION } from '../version.js';
import './ChangeLog.scss';


const ChangeLog = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ChangeLog">
      <div className='beta-label' onClick={() => setIsOpen(!isOpen)}>
        Changelog — Beta v{CURRENT_VERSION}
      </div>

      {isOpen &&
        <div className="change-container">

          <div className='version-label'>v0.4 — December 2020</div>
          <ul>
            <li>Added character presets.</li>
            <li>Added spell presets for attacks.</li>
            <li>Added modifier for dicebag.</li>
            <li>Can click individual damage dice to reroll them.</li>
            <li>Condensed 5e character sheets.</li>
            <li>Can roll a d100 by selecting two d10s.</li>
          </ul>

          <div className='version-label'>v0.3 — December 2020</div>
          <ul>
            <li>Added WITCH+CRAFT character sheet and project roller.</li>
            <li>Added nice site banner & mode selector.</li>
            <li>Added metadata so shortcuts on phones show up properly.</li>
            <li>Fixed bug with deleting damage sources.</li>
            <li>Following a room url now automatically connects to that room.</li>
          </ul>

          <div className='version-label'>v0.2 — October 2020</div>
          <ul>
            <li>Initial release.</li>
            <li>5e attack roller.</li>
            <li>Imported monster SRD.</li>
            <li>Simple dicebag roller.</li>
          </ul>
        </div>
      }
    </div>
  );
}

export default ChangeLog ;
