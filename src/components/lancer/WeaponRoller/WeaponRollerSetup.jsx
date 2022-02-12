import React, { useState, useEffect } from 'react';
import DiamondRollButton from './DiamondRollButton.jsx';
import Tooltip from '../../shared/Tooltip';

import {
  getAvailableAccuracySources,
  getStartingSourceIDs,
  newAccSource,
} from './accuracySourceUtils.js';

import './WeaponRollerSetup.scss';




const WeaponRollerSetup = ({
  activeMech,
  activePilot,

  weaponData,
  weaponMod,
  invadeData,

  rollBonus,
  rollBonusLabel = '',
  createNewAttackRoll,
}) => {
  // const isTechAttack = !weaponData && invadeData;

  // IDs of available accuracy sources
  const [currentSourceIDs, setCurrentSourceIDs] = useState(getStartingSourceIDs(activeMech, activePilot, weaponData, invadeData, weaponMod));
  const [manualMod, setManualMod] = useState(0);

  // =============== CHANGE WEAPON ==================
  useEffect(() => {
    resetModifiers();
  }, [weaponData, invadeData]);

  const resetModifiers = () => {
    setCurrentSourceIDs(getStartingSourceIDs(activeMech, activePilot, weaponData, invadeData, weaponMod));
    setManualMod(0);
  }

  const availableSources = getAvailableAccuracySources(activeMech, activePilot, weaponData, invadeData, weaponMod)
  var currentSourceIDsPlusManual = [...currentSourceIDs]
  let accuracySources = availableSources.filter(source => source.accBonus > 0)
  let difficultySources = availableSources.filter(source => source.accBonus < 0)

  const manualName = `Other (${manualMod > 0 ? '+' : ''}${manualMod})`
  const MANUAL_SOURCE = newAccSource(manualName, 'manual', '', manualMod > 0, true)
  if (manualMod !== 0) {
    currentSourceIDsPlusManual.push(MANUAL_SOURCE.id)
    if (manualMod > 0) accuracySources.push(MANUAL_SOURCE)
    if (manualMod < 0) difficultySources.push(MANUAL_SOURCE)
  }

  const toggleSource = (sourceID) => {
    let newSourceIDs = [...currentSourceIDs];

    if (sourceID === MANUAL_SOURCE.id) {
      setManualMod(0)

    } else {
      const sourceIndex = newSourceIDs.indexOf(sourceID);
      if (sourceIndex >= 0) {
        newSourceIDs.splice(sourceIndex, 1) // REMOVE source
      } else {
        newSourceIDs.push(sourceID);          // ADD source

        // soft and hard cover are mutually exclusive
        if (sourceID === 'cover_soft' && newSourceIDs.includes('cover_hard')) {
          newSourceIDs.splice(newSourceIDs.indexOf('cover_hard'), 1)
        } else if (sourceID === 'cover_hard' && newSourceIDs.includes('cover_soft')) {
          newSourceIDs.splice(newSourceIDs.indexOf('cover_soft'), 1)
        }
      }
      setCurrentSourceIDs(newSourceIDs);
    }
  }

  // tally up all the accuracy and difficulty sources
  var currentMod = manualMod;
  availableSources
    .filter(source => currentSourceIDs.includes(source.id))
    .forEach(source => currentMod += source.accBonus);
  currentMod = Math.max(Math.min(currentMod, 9), -9)

  const clickNumberLine = (mod) => {
    var shiftInManualMod = mod - currentMod;
    // click the current number to reset manualMod
    if (shiftInManualMod === 0) { shiftInManualMod = -manualMod; }
    // adjust the current mod to the clicked number
    setManualMod( manualMod + shiftInManualMod )
  }

  const difficultyArray = Array.from({length: 9}, (x, i) => i - 9);
  const accuracyArray = Array.from({length: 9}, (x, i) => i + 1);

  const isConsumingLock = !!currentSourceIDs.find(id => id === 'lock_on');

  return (
    <div className="WeaponRollerSetup">

      <DiamondRollButton
        rollBonus={rollBonus}
        rollBonusLabel={rollBonusLabel}
        currentMod={currentMod}
        createNewAttackRoll={
          (flatBonus, accuracyMod) => createNewAttackRoll(flatBonus, accuracyMod, isConsumingLock)
        }
      />

      <div className="column-container">
        <div className="column difficulty">
          <div className='column-label difficulty'>
            <span className='asset difficulty' />
            Difficulty
          </div>

          <NumberLine
            modArray={difficultyArray}
            currentMod={currentMod}
            handleClick={clickNumberLine}
          />

          <SourcesContainer
            possibleSources={difficultySources}
            currentSourceIDs={currentSourceIDsPlusManual}
            onSourceClick={toggleSource}
          />
        </div>

        <div className="column accuracy">
          <div className='column-label accuracy'>
            Accuracy
            <span className='asset accuracy' />
          </div>

          <NumberLine
            modArray={accuracyArray}
            currentMod={currentMod}
            handleClick={clickNumberLine}
          />

          <SourcesContainer
            possibleSources={accuracySources}
            currentSourceIDs={currentSourceIDsPlusManual}
            onSourceClick={toggleSource}
          />
        </div>
      </div>
    </div>
  )
}


const NumberLine = ({
  modArray,
  currentMod,
  handleClick,
}) => (
  <div className="NumberLine">
    { modArray.map(mod => {
      var numberClass = 'number';
      if (currentMod === mod) numberClass += ' current'

      var numberHidden = false;
      if (Math.sign(currentMod) === Math.sign(mod)) {
        if (Math.abs(currentMod) - Math.abs(mod) > 2) numberHidden = true;
        if (Math.abs(mod) > 4 && Math.abs(mod) > (Math.abs(currentMod) + 1)) numberHidden = true;
      } else {
        if (Math.abs(mod) > 4) numberHidden = true
      }

      if (numberHidden) numberClass += ' hidden';

      return (
        <button
          onClick={() => handleClick(mod)}
          className={numberClass}
          key={mod}
          disabled={numberHidden}
        >
          <span className='sign'>{mod > 0 ? '+' : '-'}</span>
          <span className='count'>{Math.abs(mod)}</span>
        </button>
      )
    })}
  </div>
)

const SourcesContainer = ({
  possibleSources,
  currentSourceIDs,
  onSourceClick,
}) => (
  <div className="SourcesContainer">
    { possibleSources.map(source =>
      <Source
        source={source}
        onSourceClick={onSourceClick}
        isCurrent={currentSourceIDs.includes(source.id)}
        key={source.id}
      />
    )}
  </div>
)

const Source = ({
  source,
  isCurrent,
  onSourceClick,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className='Source'
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <button
        onClick={() => onSourceClick(source.id)}
        className={isCurrent ? 'current' : ''}
      >
        {source.name.toLowerCase()}
      </button>
      {isHovering && source.desc &&
        <Tooltip
          title={source.name}
          content={source.desc}
          onClose={() => setIsHovering(false)}
        />
      }
    </div>
  )
}


export default WeaponRollerSetup;
