import React, { useState } from 'react';
import { CURRENT_VERSION } from '../version.js';
import './ChangeLog.scss';


const ChangeLog = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ChangeLog">
      <button className='beta-label' onClick={() => setIsOpen(!isOpen)}>
        Changelog — v{CURRENT_VERSION}
      </button>

      {isOpen &&
        <div className="change-container">

          <div className='version-label'>v0.9.1-4 — Dec 2021</div>
          <ul>
            <li>Made Lancer tool responsive for mobile phones.</li>
            <li>Exposed condition only doubles basic damage types.</li>
            <li>Mount core bonuses and weapon mods are displayed.</li>
            <li>Weapon mods can add bonus damage or effects.</li>
            <li>Brutal talent maximizes damage on nat 20s.</li>
          </ul>

          <div className='version-label'>v0.9 — Nov 2021</div>
          <ul>
            <li>Added support for Lancer.</li>
            <li>Can import pilots from COMP/CON.</li>
            <li>Can import lancer content packs files (.lcp)</li>
            <li>Slight restyling of the roll summary panel for attacks.</li>
            <li>Cut 5E OGL data out of source code, importing it instead.</li>
            <li><a href='https://github.com/wickworks/witchdice' target="_blank" rel="noopener noreferrer">
              Released Witch Dice source code under GNU GPLv3.
            </a></li>
          </ul>

          <div className='version-label'>v0.8 — Sept 2021</div>
          <ul>
            <li>Added Settings tab, with Witch+Dice defaulted to hidden.</li>
            <li>Advanced functions are explained in Settings > Tips & Tricks.</li>
            <li>Added "delete all local data" button in Settings.</li>
            <li>Added bug report/feature request link in Settings.</li>
            <li>Changed high/low logic: it now takes max/min of each die group.</li>
            <li>Added "negative" dice: right-click a die group to subtract it.</li>
            <li>Added new dX die; you can set a custom number between 1-99.</li>
            <li>Can clear dicebag rolls.</li>
            <li>Can bookmark last roll without having to re-queue it up.</li>
            <li>Dicebag bookmarks show up on mobile.</li>
            <li>Bugfix: now able to remove 5e damage tags by clicking their X.</li>
          </ul>

          <div className='version-label'>v0.7.1 — June 2021</div>
          <ul>
            <li>Bugfix: triggered save-for-half damage halves appropriately.</li>
          </ul>

          <div className='version-label'>v0.7 — January 2021</div>
          <ul>
            <li>Can raise an x-card, alerting everyone in the room. </li>
            <li>Collapsible descriptions for attacks.</li>
            <li>5e hit/miss checkboxes say what they mean.</li>
            <li>Fixed bug where long/strange room names didn't work.</li>
          </ul>

          <div className='version-label'>v0.6 — January 2021</div>
          <ul>
            <li>Initiative tracker; syncs for everyone in the room.</li>
            <li>Little summary message for each mode at the top of the screen.</li>
          </ul>

          <div className='version-label'>v0.5 — December 2020</div>
          <ul>
            <li>Total aesthetic overhaul. Now with color & arty borders!</li>
            <li>Hid some redundant 5e damage icons for mobile.</li>
            <li>Can click dice and then press a number key as a shortcut.</li>
          </ul>

          <div className='version-label'>v0.4 — December 2020</div>
          <ul>
            <li>Added character presets.</li>
            <li>Added spell presets for attacks.</li>
            <li>Added modifier for dicebag.</li>
            <li>Can click individual 5e damage dice to reroll them.</li>
            <li>Condensed 5e character sheets.</li>
            <li>Dice bag gives a summary of what you're about to roll.</li>
            <li>Can roll a d100 by selecting two d10s.</li>
            <li>Can reroll last set of dice by clicking the result.</li>
            <li>Can clear selected dice by clicking top-right X.</li>
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
