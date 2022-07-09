import React, { useState } from 'react';
import MechNumberBar from './MechNumberBar.jsx';
import { blankDice } from '../../shared/DiceBag/DiceBagData.js';

import './MechCentralDiamond.scss';
import './MechCentralDiamondAnimations.scss';

const DAMAGE_SHAKE_TIME = 200;

const MechCentralDiamond = ({
  maxRepairCap,
  mechSize,
  mechPortraitCloud,
  mechPortraitDefault,

  maxStress,
  currentStress,
  setCurrentStress,

  maxStructure,
  currentStructure,
  setCurrentStructure,
  hasIntactCustomPaintJob = false,

  currentRepairs,
  setCurrentRepairs,

  setDistantDicebagData,
}) => {
  const [damageWarningClass, setDamageWarningClass] = useState('')

  const mechSizeClass = mechSize === 0.5 ? 'size-half' : `size-${mechSize}`
  const smallRepairsClass = maxRepairCap > 12 ? 'small-repairs' : '';

  function handleRepairClick(repairIndex) {
    if (repairIndex+1 <= currentRepairs) {
      setCurrentRepairs(currentRepairs-1)
    } else {
      setCurrentRepairs(currentRepairs+1)
    }
  }

  const handleStructureClick = () => {
    if (currentStructure > 1) {
      let diceData = {...blankDice}
      diceData['6'] = ((maxStructure+1)-currentStructure)

      const postRollMessage = (result, rollData) => {
        const multipleOnes = (rollData.filter(roll => roll.result === 1).length > 1)
        if (multipleOnes) {
          return '<b>Multiple 1s — Crushing Hit</b>: Mech is destroyed.'

        } else if (result === 1) {
          let message = "<b>Direct Hit</b>: The result depends on the mech's remaining structure:<br>"
          if (currentStructure === 4) message += '<b>3 Structure remaining.</b> Mech is STUNNED until the end of its next turn.'
          if (currentStructure === 3) message += "<b>2 Structure remaining.</b> Roll a HULL Check. On success, mech is STUNNED until the end of its next turn. On failure, mech is destroyed."
          if (currentStructure === 2) message += '<b>1 Structure remaining.</b> Mech is destroyed.'
          return message

        } else if (result >= 2 && result <= 4) {
          return '<b>System Trauma: Roll 1d6.</b><br>'+
            '<b>1-3</b>: All weapons on one mount (of choice) are destroyed.<br>'+
            '<b>4-6</b>: One system (of choice) is destroyed. (Weapons or systems with no LIMITED charges are not valid choices.)<br>'+
            'If there are no valid weapons, destroy a system; if there are no valid systems, destroy a weapon. '+
            'If there are no valid weapons or systems, this becomes a Direct Hit instead.'

        } else if (result >= 5) {
          return '<b>Glancing Blow</b>: Mech is IMPAIRED until the end of its next turn.'
        }
      }

      // don't do it immediately to give the animation a chance to play
      setTimeout(
        () => setDistantDicebagData({
          diceData: diceData,
          summaryMode: 'lowest',
          annotation: 'STRUCTURE check',
          postRollMessage: postRollMessage,
        }), DAMAGE_SHAKE_TIME
      )
    }

    const newStructure = Math.max(currentStructure-1, 0)
    setCurrentStructure(newStructure)
    setDamageWarningClass(`damage-anim-${newStructure}`)
  }

  const handleStressClick = () => {
    if (currentStress > 1) {
      let diceData = {...blankDice}
      diceData['6'] = ((maxStress+1)-currentStress)

      const postRollMessage = (result, rollData) => {
        const multipleOnes = (rollData.filter(roll => roll.result === 1).length > 1)
        if (multipleOnes) {
          return '<b>Multiple 1s — Irreversible Meltdown</b>: Mech suffers Reactor Meltdown at end of its next turn.'

        } else if (result === 1) {
          let message = "<b>Meltdown</b>: The result depends on the mech's remaining stress:<br>"
          if (currentStress === 4) message += '<b>3 Stress remaining.</b> Mech becomes EXPOSED.'
          if (currentStress === 3) message += "<b>2 Stress remaining.</b> Roll an ENGINEERING Check. On success, mech is EXPOSED. On failure, mech suffers Reactor Meltdown after 1d6 of the mech's turns. Reactor Meltdown can be prevented by retrying the ENGINEERING check as a free action."
          if (currentStress === 2) message += '<b>1 Stress remaining.</b> Mech suffers a Reactor Meltdown at end of its next turn.'
          return message

        } else if (result >= 2 && result <= 4) {
          return '<b>Destabilized Power Plant</b>: Mech becomes EXPOSED until the status is cleared.'

        } else if (result >= 5) {
          return '<b>Emergency Shunt</b>: Mech becomes IMPAIRED until end of its next turn.'
        }
      }

      setTimeout(
        () => setDistantDicebagData({
          diceData: diceData,
          summaryMode: 'lowest',
          annotation: 'STRESS check',
          postRollMessage: postRollMessage,
        }), DAMAGE_SHAKE_TIME
      )
    }

    const newStress = Math.max(currentStress-1, 0)
    setCurrentStress(newStress)
    setDamageWarningClass(`stress-anim-${newStress}`)
  }


  // <div className="MechCentralDiamond asset ssc-watermark">
  return (
    <div className={`MechCentralDiamond ${damageWarningClass}`}>
      <div className='relative-container'>


        <div className='portrait-container'>
          { mechPortraitCloud ?
            <img className='portrait' src={mechPortraitCloud} alt={'mech portrait'} />
          :
            <div className={`portrait asset ${mechPortraitDefault}`} />
          }
        </div>

        <div className='buttons-container'>

          <MechNumberBar
            extraClass='condensed structure'
            dotIcon='structure'
            zeroIcon='x'
            maxNumber={maxStructure}
            currentNumber={currentStructure}
            setCurrentNumber={setCurrentStructure}
            leftToRight={true}
            showAbsoluteValues={true}
          />
          <button className='mini-label structure' onClick={handleStructureClick}>
            <span className='label'>
              Structure

              { hasIntactCustomPaintJob &&
                <span className='reminder-text'>(paint job intact)</span>
              }
            </span>
            <span className='number'>{currentStructure}</span>
          </button>

          <MechNumberBar
            extraClass='condensed stress'
            dotIcon='reactor'
            zeroIcon='x'
            maxNumber={maxStress}
            currentNumber={currentStress}
            setCurrentNumber={setCurrentStress}
            leftToRight={true}
            showAbsoluteValues={true}
          />
          <button className='mini-label stress' onClick={handleStressClick}>
            <span className='number'>{currentStress}</span>
            <span className='label'>Stress</span>
          </button>

          <div className='repairs-container-container'>
            <div className={`repairs-container ${smallRepairsClass}`}>
              { [...Array(maxRepairCap)].map((undef, i) =>
                <button
                  className={(i+1) <= currentRepairs ? 'available' : 'used'}
                  onClick={() => handleRepairClick(i)}
                  key={`repair-${i}`}
                >
                  <div className='asset repair' />
                </button>
              )}
            </div>
          </div>

          {maxRepairCap <= 12 &&
            <div className='size-container'>
              <div className={`mech-size asset ${mechSizeClass}`} />
            </div>
          }

        </div>
      </div>
    </div>
  );
}



export default MechCentralDiamond;
