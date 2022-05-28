import React from 'react';
import MechNumberBar from './MechNumberBar.jsx';
import { blankDice } from '../../shared/DiceBag/DiceBagData.js';

import './MechCentralDiamond.scss';

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
      diceData['6'] = (5-currentStructure)

      const postRollMessage = (result) => {
        if (result >= 5) {
          return 'Glancing Blow: Mech is IMPAIRED until the end of its next turn.'
        } else if (result >= 2 && result <= 4) {
          return 'System Trauma: Roll 1d6.<br>'+
            'On 1-3, all weapons on one mount (of choice) are destroyed.<br>'+
            'On 4-6, one system (of choice) is destroyed. (Weapons or systems with no LIMITED charges are not valid choices.)<br>'+
            'If there are no valid weapons, destroy a system; if there are no valid systems, destroy a weapon. '+
            'If there are no valid weapons or systems, this becomes a Direct Hit instead.'
        } else if (result === 1) {
          return "Direct Hit: The result depends on the mech's remaining structure:<br>" +
            '3+ Structure: Mech is STUNNED until the end of its next turn.<br>'+
            '2 Structure: Roll a HULL Check. On success, mech is STUNNED until the end of its next turn. On failure, mech is destroyed.<br>'+
            '1 Structure: Mech is destroyed.'
        } else { // need to check for multiple 1s somehow
          return 'Crushing Hit: Mech is destroyed.'
        }
      }

      setDistantDicebagData({
        diceData: diceData,
        summaryMode: 'low',
        annotation: 'STRUCTURE check',
        postRollMessage: postRollMessage,
      });
    }

    setCurrentStructure(Math.max(currentStructure-1, 0))
  }

  const handleStressClick = () => {
    if (currentStress > 1) {
      let diceData = {...blankDice}
      diceData['6'] = (5-currentStress)

      setDistantDicebagData({
        diceData: diceData,
        summaryMode: 'low',
        annotation: 'STRESS check'
      });
    }

    setCurrentStress(Math.max(currentStress-1, 0))
  }


  // <div className="MechCentralDiamond asset ssc-watermark">
  return (
    <div className="MechCentralDiamond">
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
