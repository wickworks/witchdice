import React, { useState } from 'react';
import { CURRENT_VERSION } from '../../version.js';
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
          <div className='version-label'>v1.3.8 — May 2025</div>
          <ul>
            <li>Added a Lancer Tactics banner ad. You can dismiss it by clicking it. :)</li>
            <li>Added a link to istealyourzs' how-to guide in the Owlbear extension settings.</li>
            <li>Turned off notification on rolls by default; I found it to be too buggy.</li>
          </ul>

          <div className='version-label'>v1.3.7 — Apr 2025</div>
          <ul>
            <li>Another attempt at fixing the spotty connection to OBR extension library.</li>
          </ul>

          <div className='version-label'>v1.3.2-6 — Mar 2025</div>
          <ul>
            <li>Update owlbear SDK to 3.1.0.</li>
            <li>Stabilize loading the OBR extension / add button to retry.</li>
            <li>Downcase dice strings before parsing to allow for e.g. "1D6" in LCPs.</li>
          </ul>

          <div className='version-label'>v1.3.1 — Mar 2025</div>
          <ul>
            <li>Was forced to do a buncha long-waiting upgrades, which likely broke things. Javascript web development is a bad place.</li>
            <li>Added 5e mode to the owlbear extension.</li>
            <li>Added Shadow of the Wolf Massif LCP.</li>
          </ul>

          <div className='version-label'>v1.2.15 — Jan 2025</div>
          <ul>
            <li>Correctly parse reliable & other tiered values for NPCs.</li>
            <li>Add a warning when multiple mech loadouts are detected.</li>
            <li>Added Winter Scar player-facing LCP by default.</li>
          </ul>

          <div className='version-label'>v1.2.13-14 — Nov 2024</div>
          <ul>
            <li>Fix crash when Lucifer NHP is applied to a profiled weapon.</li>
            <li>Skip loading deleted cloud NPCs from compcon.</li>
          </ul>

          <div className='version-label'>v1.2.11 — Oct 2024</div>
          <ul>
            <li>Update official LCP packages.</li>
            <li>Traits marked `"use": "Encounter"` get appropriate checkbox.</li>
            <li>Leave custom counters alone when doing a full repair.</li>
            <li>Gave Armament Redundancy a manual checkbox.</li>
            <li>Custom weapon descriptions show up.</li>
          </ul>

          <div className='version-label'>v1.2.10 — July 2024</div>
          <ul>
            <li>Mirror broadcasts & basic dicebag to Rumble! chatbox.</li>
          </ul>

          <div className='version-label'>v1.2.2-4 — March 2024</div>
          <ul>
            <li>Added a name/class filter to the NPC roster.</li>
            <li>LCP reader loads pilot skills from LCPs correctly. You will have to delete and re-add any LCPs to get them to start showing up.</li>
            <li>Fix squad X button not always removing the right pilot.</li>
            <li>Custom NPC system descriptions come through correctly.</li>
            <li>Better e.g. "+1 difficulty to agility" detection in custom NPC system descriptions.</li>
            <li>Better detection of NPC tech attacks (Hive, Nightmare).</li>
            <li>Weapon profiles inherit tags from base weapon.</li>
            <li>Fixed crash on selecting weapon with no tags // terishima blade.</li>
          </ul>

          <div className='version-label'>v1.2.0-1 — Jan 2024</div>
          <ul>
            <li>Include all first-party LCPs automatically.</li>
            <li>Added secret /draft url for prototype NPC PvP gamemode.</li>
            <li>Fix NPC tech actions incorrectly being labelled as Quick.</li>
            <li>Fix crash when first slot of a flex is empty.</li>
          </ul>

          <div className='version-label'>v1.1.22 — Dec 2023</div>
          <ul>
            <li>Allow numbers in room/user names.</li>
            <li>Discord bot returns error when given an invalid room name.</li>
            <li>Fix discord bot not showing negative roll results.</li>
            <li>Added bonus damage for Lucifer NHP using current heat.</li>
            <li>Track thermal charge uses.</li>
          </ul>

          <div className='version-label'>v1.1.20-21 — Oct-Nov 2023</div>
          <ul>
            <li>Fix detection of NPC tech actions vs invades.</li>
            <li>First overcharge bumps up the heat for you.</li>
            <li>Grit doesn't increase Emperor HP.</li>
            <li>Added download/upload for data backups.</li>
            <li>Fix crash when using dice bookmarks.</li>
            <li>Fix the same skill roll popping back up multiple times.</li>
          </ul>

          <div className='version-label'>v1.1.18-19 — Aug-Sept 2023</div>
          <ul>
            <li>NPC tech attack rolls use listed bonuses instead of SYS score.</li>
            <li>Added plain roll history page (for iframes) at /view?r=room-name</li>
          </ul>

          <div className='version-label'>v1.1.14-17 — July 2023</div>
          <ul>
            <li>Can leave joined rooms (it refreshes the page)</li>
            <li>OBR extension can input what room they would like to join.</li>
            <li>Fix missing remove-pilot buttons in the mobile squad layout.</li>
            <li>Fix lancer banner link.</li>
            <li>Dropped "less math, more stories" from preview. Always bugged me.</li>
            <li>Cast slightly wider net in looking for 1/round abilities.</li>
            <li>Added preliminary integration with Marked! on OBR.</li>
            <li>Fix clocks not finishing.</li>
            <li>Added hidden text to roll history for copy+paste.</li>
            <li>Better detection of custom skills.</li>
          </ul>

          <div className='version-label'>v1.1.13 — June 2023</div>
          <ul>
            <li>Show Dustgrave Superheavy Mount CB</li>
            <li>Add x/round tracking checkboxes and corresponding reset button.</li>
          </ul>

          <div className='version-label'>v1.1.0-12 — May 2023</div>
          <ul>
            <li>Support for Owlbear Rodeo extension.</li>
            <li>Collapsible pilot card for Lancer sheet.</li>
            <li>Collapsible npc roster for GM mode, moved encounter name input.</li>
            <li>Changing player name updates name you roll as.</li>
            <li>Fixed the extension's roll history breaking when already in a room.</li>
            <li>Fail gracefully when localstorage is not enabled.</li>
            <li>Show roll history at bottom of owlbear lancer mode.</li>
            <li>Fix the squad panel crashing when switching modes.</li>
            <li>Use the updated @massif/lancer-data repo.</li>
            <li>Refactored clocks to keep them synced better.</li>
            <li>Fix Aceso Stabilizer (+ other systems) missing limited tag.</li>
            <li>Fix crash on attacks with invalid range types.</li>
            <li>Fix layout bug in expanded lancer mode for OBR ext.</li>
          </ul>

          <div className='version-label'>v1.0.1-3 — Feb, Mar, Apr 2023</div>
          <ul>
            <li>Added Chomolungma invades to the attack roller.</li>
            <li>Added kinetic compensation accuracy button for demolisher.</li>
            <li>Added terms of use and privacy policy as required for the discord bot.</li>
          </ul>

          <div className='version-label'>v1.0.0 — Jan 2023</div>
          <ul>
            <li>Bumped version up to 1.0.0; development has shifted to small enhancements and bugfixes for now.</li>
            <li>Can expand conditions to get detailed rules text.</li>
          </ul>

          <div className='version-label'>v0.13.9-11 — Nov 2022</div>
          <ul>
            <li>Mech list pays attention to and saves which one is active.</li>
            <li>Fixed the wrong weapon getting destroyed for npcs.</li>
            <li>Added little resets under CP / OC so right clicks aren't required.</li>
          </ul>

          <div className='version-label'>v0.13.8 — Oct 2022</div>
          <ul>
            <li>Fixed typo.</li>
          </ul>

          <div className='version-label'>v0.13.0-7 — July, Aug, Sept 2022</div>
          <ul>
            <li>Handle faulty LCP weapon profile data without crashing.</li>
            <li>Added warning for GM mode on missing NPC LCP file.</li>
            <li>Fix limited charges on mechs with multiple integrated mounts.</li>
            <li>Fix skill difficulty being incorrectly applied on some NPCs.</li>
            <li>Fix pilot gear import from homebrew LCPS.</li>
            <li>Fix talents for weapons with profiles.</li>
            <li>Player systems report X/round.</li>
            <li>Utilize custom names for weapons and systems.</li>
            <li>Cleaner damage total summary for attacks.</li>
            <li>Core bonuses show up alongside pilot talent cards.</li>
            <li>Fix destructability of systems with a single action.</li>
            <li>Added count mode for dicebag.</li>
            <li>Can keep X highest/lowest rolls instead of just one.</li>
            <li>Fix import of core bonuses & deployables from custom LCPs.</li>
            <li>Mechs in squad panel can be clicked for detailed build.</li>
          </ul>

          <div className='version-label'>v0.12.1-10 — May, June 2022</div>
          <ul>
            <li>Added status/condition indicator for statuses/conditions.</li>
            <li>Added a generic action "cheat sheet".</li>
            <li>Added color to cards depending on their action type.</li>
            <li>Fixed bug where broadcasts didn't work while attacking.</li>
            <li>Condensed cards into 1/system.</li>
            <li>Fixed siege ram and brawler modification of actions.</li>
            <li>Bonus damage sources for juggernaut.</li>
            <li>Show protocol and per/round info for NPC systems.</li>
            <li>NPC tech attacks can recharge.</li>
            <li>Combat drill can calculate its runaway overkill damage.</li>
            <li>Deadly trait & variable sword get bonus damage on crits.</li>
            <li>Correct math for stress/structure rolls for NPCs.</li>
            <li>Fixed NPC base traits not able to be recharged.</li>
            <li>Fixed NPC custom mech images not showing up.</li>
            <li>Added monarch frame traits to weapon roller.</li>
            <li>Can broadcast summaries for weapons and tech attacks.</li>
            <li>Pilot talents show up on the mech sheet.</li>
            <li>Added rolling animation for dicebag.</li>
            <li>Can change accuracy/difficulty after attack rolls.</li>
            <li>Compendia Jones stays deleted when you delete her.</li>
            <li>Fix crash when using some systems from Liminal Space.</li>
            <li>Click overcharge to queue it to roll.</li>
            <li>Click structure/stress to queue them to roll.</li>
            <li>Click pilot skills to queue them to roll.</li>
            <li>Can import all NPCs saved on compcon account via API.</li>
            <li>Can delete NPCs from the GM roster.</li>
            <li>Bugfixes for melee synergies, reliable, statuses, npc invades.</li>
            <li>NPC abilities replace scaling numbers by tier.</li>
            <li>Can select bond powers from any class.</li>
          </ul>

          <div className='version-label'>v0.12.0 — Apr 2022</div>
          <ul>
            <li>New clocks panel for Lancer + Dicebag, synced to the room.</li>
            <li>New Bond character sheet with clocks, powers, etc.</li>
            <li>Can upload and re-sync pilots via their COMPCON share code.</li>
            <li>Added pilot gear to the dossier card.</li>
          </ul>

          <div className='version-label'>v0.11.1-5 — Mar 2022</div>
          <ul>
            <li>Fixed your name in rooms not saving after you update it.</li>
            <li>NPCs from non-core LCPs should show up correctly.</li>
            <li>Fixed Engineer weapon; shows max number of uses.</li>
            <li>Deployables show their stats and granted actions.</li>
            <li>Fixed and added several accuracy options.</li>
            <li>Range bonuses from systems and CBs now come through.</li>
            <li>Added bonus damage from roland chamber.</li>
            <li>Added button to re-export pilot data.</li>
            <li>Full repair reloads & repairs secondary aux weapons correctly.</li>
            <li>Uploading a new version of a pilot correctly replaces the old one.</li>
            <li>Integrated systems show up (e.g. Walking Armory).</li>
            <li>Accuracy/Difficulty labels can be clicked to bump it up/down.</li>
            <li>Fixed improper range/type synergies both being applied.</li>
            <li>Death's Head applies its +1 to all ranged attacks.</li>
            <li>Reliable kicks in on hits to ensure a minimum damage.</li>
            <li>Redesigned the squad panel to be more condensed (but still stylish).</li>
            <li>Smaller attack buttons so they don't take up the whole screen.</li>
            <li>Can mass-expand/collapse all trait and system blocks.</li>
            <li>Player squad shows up in GM view.</li>
            <li>NPC roster is sorted by collapsible labels.</li>
            <li>Added Impaired to the list of difficulty toggles.</li>
            <li>Last Argument of Kings shows up properly.</li>
            <li>Ability save and check bonuses from core bonuses come through.</li>
            <li>NucCav and Hacker I bonuses come through for tech attacks.</li>
          </ul>

          <div className='version-label'>v0.11.0 — Mar 2022</div>
          <ul>
            <li>!!Discord Bot!! — can subscribe to rolls in a channel.</li>
            <li>Added Lancer GM mode to manage NPCs and encounters.</li>
            <li>Can import NPCs via individual jsons or full COMPCON backups.</li>
            <li>Broadcast mech or NPC systems/traits/stats to the room.</li>
            <li>Can mark mech systems e.g. custom paint job as used.</li>
            <li>Buttons to queue up HASE saves and checks.</li>
            <li>Weapons can mark off limited uses & loading status.</li>
            <li>Fix limited-system bonuses from ENG and CBs.</li>
            <li>Can annotate rolls in the dicebag.</li>
          </ul>

          <div className='version-label'>v0.10.7 — Feb 2022</div>
          <ul>
            <li>Self-heat only shows up on first attack.</li>
            <li>Melee and ranged talents show up correctly in accuracy list.</li>
            <li>Custom skill triggers named correctly.</li>
            <li>Show special actions from lancer weapons.</li>
            <li>Tech attacks use accuracy correctly, fixed roll results display.</li>
            <li>Moved lancer multipliers to their own row.</li>
            <li>5e roller can toggle crits.</li>
            <li>Improved 5e auto-hit system for 10+ attacks.</li>
          </ul>

          <div className='version-label'>v0.10.1-6 — Jan 2022</div>
          <ul>
            <li>Custom counters on lancer sheet.</li>
            <li>/simple/some-room-id will join a room (hi, Gather visitors!)</li>
            <li>Lancer invades added to mounts list</li>
            <li>Talents & systems that give accuracy are listed when relevant.</li>
            <li>Show systems as collapsible blocks instead of tooltips.</li>
            <li>Can mark systems and weapons as destroyed.</li>
            <li>Can track charges for limited systems.</li>
            <li>Performance optimization pass.</li>
            <li>Grapple/ram/improvised attacks added to mounts list.</li>
            <li>Non-invade tech attacks added to mounts list.</li>
            <li>Added full repair button + animation.</li>
            <li>Full repair messages from the Pilot.net lancer discord.</li>
            <li>Weapon mods i.e. UNCLE can affect accuracy.</li>
          </ul>

          <div className='version-label'>v0.10.0 — Dec 2021</div>
          <ul>
            <li>Mech character sheet; hp, heat etc.</li>
            <li>Can add lancers to a room-synced squad panel.</li>
            <li>Top jumplink navi bar for the lancer page.</li>
          </ul>

          <div className='version-label'>v0.9.1-5 — Dec 2021</div>
          <ul>
            <li>Made Lancer tool responsive for mobile phones.</li>
            <li>Exposed condition only doubles basic damage types.</li>
            <li>Mount core bonuses and weapon mods are displayed.</li>
            <li>Weapon mods can add bonus damage or effects.</li>
            <li>Brutal talent maximizes damage on nat 20s.</li>
            <li>Can enter manual damage for Kobold's plasma rife.</li>
            <li>Core bonuses get toggleable buttons.</li>
            <li>Tooltips for pilot dossier & bonus damage sources.</li>
            <li>Can directly paste pilot json data to import.</li>
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
            <li>Advanced functions are explained in Settings → Tips & Tricks.</li>
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
