import React, { useState } from 'react';
import ChangeLog from './ChangeLog.jsx';
import './Footer.scss';


const Footer = () => {
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [oglOpen, setOglOpen] = useState(false);


  return (
    <div className="Footer">

      <div className="meeeeeeeeeeeee-luv-u">
        <a href="https://wick.works/about/" target="_blank">
          Olive Perry
        </a>
        ~
        <a href="https://wick.itch.io/aesthetic" target="_blank" rel="noopener noreferrer">
          <span className="asset trans_pride" />
        </a>
        ~

        {/*<div className="feedback">
          {!showFeedbackLinks ?
            <button className='open-button' onClick={() => setShowFeedbackLinks(!showFeedbackLinks)}>
              feedback/bugs
            </button>
          :
            <>
              olive@wick.works or
              <a href="https://twitter.com/wickglyph"
                target="_blank"
                rel="noopener noreferrer"
              >
                @wickglyph
              </a>
            </>
          }
        </div>*/}

        <a href="https://ko-fi.com/wickworks" target="_blank" rel="noopener noreferrer">
          tip jar
        </a>
      </div>

      {/*
      <a href="https://twitter.com/wickglyph" target="_blank" rel="noopener noreferrer">@wickglyph</a>
      <a href="https://wick.works/" target="_blank" rel="noopener noreferrer">www.wick.works</a>
      */}

      <ChangeLog />

      <div className="license">
        <button className='open-button' onClick={() => setCreditsOpen(!creditsOpen)}>Credits & License Info</button>

        {creditsOpen &&
          <div className="credits">

            <p>
              By
              <a href="https://wick.works/about" target="_blank">
                Olive Perry
              </a>
            </p>

            <p>Coded in React. Designed in Inkscape. Written using Atom.</p>

            <p className="noun-project">
              <strong>
                Icons from
                <a href="https://thenounproject.com/" target="_blank" rel="noopener noreferrer">the Noun Project:</a>
              </strong>
            </p>

            <ul>
              <li>dice by Lonnie Tapscott</li>
              <li>Fire by Bohdan Burmich</li>
              <li>acid by Sean Maldjian</li>
              <li>Cold by Landan Lloyd</li>
              <li>Lightning by Creative Stall</li>
              <li>Skull by Michael Thompson</li>
              <li>Poison by Ayub Irawan</li>
              <li>Clairvoyant by Magicon</li>
              <li>sun by evi1000</li>
              <li>Sound by Kantor Tegalsari</li>
              <li>Hammer by Mourad Mokrane</li>
              <li>impact by Adrien Coquet</li>
              <li>Spear by Deemak Daksina</li>
              <li>Sword by darwis</li>
              <li>Plus by Stan Fisher</li>
              <li>checkmark by unlimicon</li>
              <li>X by Richard Kunák</li>
              <li>Delete by Fantastic</li>
              <li>sprout by Gregor Cresnar</li>
              <li>jewel by pejyt</li>
              <li>Drafting by Anil</li>
              <li>Wood by tesyar azhari</li>
              <li>Anvil by Robert Almeida</li>
              <li>textile by Olena Panasovska</li>
              <li>hibiscus by iconfield</li>
              <li>bookmark by Icon Depot</li>
              <li>edit by Ricki Tri Putra</li>
              <li>Refresh by i cons</li>
              <li>Battery by Adrien Coquet</li>
              <li>DNA by Tresnatiq</li>
            </ul>

            <p>
              <a href="http://tinyurl.com/x-card-rpg"
                target="_blank"
                rel="noopener noreferrer"
              >
                X-Card
              </a>
              by John Stavropoulos
            </p>

            <p>
              5E OGL json data from
              <a href="https://github.com/5e-bits/5e-database/"
                target="_blank"
                rel="noopener noreferrer"
              >
                5e-bits
              </a>
            </p>

            <p>
              Lancer icons from the
              <a href="https://github.com/Eranziel/foundryvtt-lancer"
                target="_blank"
                rel="noopener noreferrer"
              >
                FoundryVTT repo
              </a>
            </p>

            <p>
              Lancer json data from the
              <a href="https://github.com/massif-press/lancer-data"
                target="_blank"
                rel="noopener noreferrer"
              >
                Lancer data repo
              </a>
            </p>

            <p>
              Compendia Jones portrait by
              <a href="https://ashen-victor.itch.io/sci-fi-character-portraits-poject"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ashen Victor
              </a>
              and Tokugawa sprite by
              <a href="https://blobertson.itch.io/lancer-mech-sprites"
                target="_blank"
                rel="noopener noreferrer"
              >
                Blobertson.
              </a>
            </p>


            <p>
              Background textures generated at
              <a href="http://bg.siteorigin.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                bg.siteorigin.com
              </a>
            </p>

            <p>This tool is not affiliated with Wizards of the Coast (D&D), Astrolago Press (Witch+Craft), or Massif Press (Lancer).</p>
            <p>Spells & Monster Manual stat blocks included as per the <button className='open-button' onClick={() => setOglOpen(!oglOpen)}>Open Game License.</button></p>

            { oglOpen &&
              <div className="legalese">
                OPEN GAME LICENSE Version 1.0a
                The following text is the property of Wizards of the Coast, Inc. and is Copyright 2000 Wizards of the Coast, Inc ("Wizards"). All Rights Reserved.
                <p>1. Definitions: (a)"Contributors" means the copyright and/or trademark owners who have contributed</p> Open Game Content; (b)"Derivative Material" means copyrighted material including derivative works and translations (including into other computer languages), potation, modification, correction, addition, extension, upgrade, improvement, compilation, abridgment or other form in which an existing work may be recast, transformed or adapted; (c) "Distribute" means to reproduce, license, rent, lease, sell, broadcast, publicly display, transmit or otherwise distribute; (d)"Open Game Content" means the game mechanic and includes the methods, procedures, processes and routines to the extent such content does not embody the Product Identity and is an enhancement over the prior art and any additional content clearly identified as Open Game Content by the Contributor, and means any work covered by this License, including translations and derivative works under copyright law, but specifically excludes Product Identity. (e) "Product Identity" means product and product line names, logos and identifying marks including trade dress; artifacts; creatures characters; stories, storylines, plots, thematic elements, dialogue, incidents, language, artwork, symbols, designs, depictions, likenesses, formats, poses, concepts, themes and graphic, photographic and other visual or audio representations; names and descriptions of characters, spells, enchantments, personalities, teams, personas, likenesses and special abilities; places, locations, environments, creatures, equipment, magical or supernatural abilities or effects, logos, symbols, or graphic designs; and any other trademark or registered trademark clearly identified as Product identity by the owner of the Product Identity, and which specifically excludes the Open Game Content; (f) "Trademark" means the logos, names, mark, sign, motto, designs that are used by a Contributor to identify itself or its products or the associated products contributed to the Open Game License by the Contributor (g) "Use", "Used" or "Using" means to use, Distribute, copy, edit, format, modify, translate and otherwise create Derivative Material of Open Game Content. (h) "You" or "Your" means the licensee in terms of this agreement.
                <p>2. The License: This License applies to any Open Game Content that contains a notice indicating that the Open Game Content may only be Used under and in terms of this License. You must affix such a notice to any Open Game Content that you Use. No terms may be added to or subtracted from this License except as described by the License itself. No other terms or conditions may be applied to any Open Game Content distributed using this License.</p>
                <p>3. Offer and Acceptance: By Using the Open Game Content You indicate Your acceptance of the terms of this License.</p>
                <p>4. Grant and Consideration: In consideration for agreeing to use this License, the Contributors grant You a perpetual, worldwide, royalty-free, non-exclusive license with the exact terms of this License to Use, the Open Game Content.</p>
                <p>5.Representation of Authority to Contribute: If You are contributing original material as Open Game Content, You represent that Your Contributions are Your original creation and/or You have sufficient rights to grant the rights conveyed by this License.</p>
                <p>6.Notice of License Copyright: You must update the COPYRIGHT NOTICE portion of this License to include the exact text of the COPYRIGHT NOTICE of any Open Game Content You are copying, modifying or distributing, and You must add the title, the copyright date, and the copyright holder's name to the COPYRIGHT NOTICE of any original Open Game Content you Distribute.</p>
                <p>7. Use of Product Identity: You agree not to Use any Product Identity, including as an indication as to compatibility, except as expressly licensed in another, independent Agreement with the owner of each element of that Product Identity. You agree not to indicate compatibility or co-adaptability with any Trademark or Registered Trademark in conjunction with a work containing Open Game Content except as expressly licensed in another, independent Agreement with the owner of such Trademark or Registered Trademark. The use of any Product Identity in Open Game Content does not constitute a challenge to the ownership of that Product Identity. The owner of any Product Identity used in Open Game Content shall retain all rights, title and interest in and to that Product Identity.</p>
                <p>8. Identification: If you distribute Open Game Content You must clearly indicate which portions of the work that you are distributing are Open Game Content.</p>
                <p>9. Updating the License: Wizards or its designated Agents may publish updated versions of this License. You may use any authorized version of this License to copy, modify and distribute any Open Game Content originally distributed under any version of this License.</p>
                <p>10 Copy of this License: You MUST include a copy of this License with every copy of the Open Game Content You Distribute.</p>
                <p>11. Use of Contributor Credits: You may not market or advertise the Open Game Content using the name of any Contributor unless You have written permission from the Contributor to do so.</p>
                <p>12. Inability to Comply: If it is impossible for You to comply with any of the terms of this License with respect to some or all of the Open Game Content due to statute, judicial order, or governmental regulation then You may not Use any Open Game Material so affected.</p>
                <p>13. Termination: This License will terminate automatically if You fail to comply with all terms herein and fail to cure such breach within 30 days of becoming aware of the breach. All sublicenses shall survive the termination of this License.</p>
                <p>14. Reformation: If any provision of this License is held to be unenforceable, such provision shall be reformed only to the extent necessary to make it enforceable.</p>
                <p>15. COPYRIGHT NOTICE Open Game License v 1.0 Copyright 2000, Wizards of the Coast, Inc.</p>
              </div>
            }
          </div>
        }
      </div>
    </div>

  );
}

export default Footer ;
