import React from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import './ModeChooser.scss';

const ModeChooser = ({
  rollMode,
  saveRollMode
}) => {

  const rollModeClass = rollMode ? 'minimized' : 'full'

  return (
    <div className="ModeChooser">
      <RadioGroup
        name={'roll-mode'}
        className={`roll-mode ${rollModeClass}`}
        selectedValue={rollMode}
        onChange={(value) => { saveRollMode(value) }}
      >
        <label className={`mode-container ${rollMode === 'simple' ? 'selected' : ''}`} key='mode-simple'>
          <div className='mode-title'>
            <Radio value='simple' id='mode-simple' />
            <h2>Simple</h2>
          </div>
          <p className='mode-desc simple'>
            Just a bag of dice & a table to share.
          </p>
        </label>

        <label className={`mode-container ${rollMode === '5e' ? 'selected' : ''}`} key='mode-5e'>
          <div className='mode-title'>
            <Radio value='5e' id='mode-5e' />
            <h2>D&D 5e</h2>
          </div>
          <p className='mode-desc'>
            Attack roller for D&D 5e characters & monsters.
          </p>
        </label>

        <label className={`mode-container ${rollMode === 'witchcraft' ? 'selected' : ''}`} key='mode-witchcraft'>
          <div className='mode-title'>
            <Radio value='witchcraft' id='mode-witchcraft' />
            <h2>Witch+Craft</h2>
          </div>
          <p className='mode-desc'>
            Crafting and domestic magic system for 5e.
          </p>
        </label>

      </RadioGroup>
    </div>
  );
}

export default ModeChooser ;
