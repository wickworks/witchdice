import React, { useState } from 'react';

import {
  findFrameData,
} from '../../lancerData.js';

import {
  diagnosticMessages,
  workingMessagesByManufacturer,
  finishingMessages,
} from './fullRepairMessages.js';

import {
  getMechMaxHP,
  getMechMaxRepairCap,
} from '../../MechState/mechStateUtils.js';

import './FullRepairButton.scss';
import './FullRepairDnaSync.scss';

// Too long? Find out how to add:
// Castigating The Enemies Of— Wait, that doesn’t happen yet! Haha.
// YOU BETTER NOT GET ME THAT SCRATCHED NEXT TIME, PILOT.

const MESSAGE_COUNT = 10 // in total, minus the 4 startup and ending ones

const MESSAGE_SPEED = 400;

const STAGE_UNCLICKED = 'unclicked'
const STAGE_PLEASE_CONFIRM = 'please-confirm'
const STAGE_ANIMATING = 'animating'
const STAGE_COMPLETED = 'completed'

const FullRepairButton = ({
  activeMech,
  activePilot,
  updateMechState
}) => {
  const [stage, setStage] = useState(STAGE_UNCLICKED);
  const [repairingMessages, setRepairingMessages] = useState([])
  const [repairingMessageIndex, setRepairingMessageIndex] = useState(0);

  function onFullRepair() {
    const frameData = findFrameData(activeMech.frame)

    updateMechState({
      repairAllWeaponsAndSystems: true,
      conditions: [],
      // custom_counters: [],
      // counter_data: [],
      overshield: 0,
      current_hp: getMechMaxHP(activeMech, activePilot, frameData),
      current_heat: 0,
      burn: 0,
      current_overcharge: 0,
      current_core_energy: 1,
      current_repairs: getMechMaxRepairCap(activeMech, activePilot, frameData),
      current_structure: 4,
      current_stress: 4,
    })
  }

  function assembleMessages() {
    var messages = []

    const shuffledDiagnostics = diagnosticMessages.sort(() => 0.5 - Math.random())
    messages.push(...shuffledDiagnostics.slice(0, 2))


    const frameData = findFrameData(activeMech.frame)
    const manufacturer = frameData.source.replace('-','').toLowerCase()
    const workingMessages = workingMessagesByManufacturer[manufacturer] || workingMessagesByManufacturer['ipsn']
    const shuffledWorking = workingMessages.sort(() => 0.5 - Math.random())
    messages.push(...shuffledWorking.slice(0, MESSAGE_COUNT-4))

    const shuffledFinishing = finishingMessages.sort(() => 0.5 - Math.random())
    messages.push(...shuffledFinishing.slice(0, 2))

    setRepairingMessages(messages)
  }

  const advanceRepairMessage = (currentIndex) => {
    const newIndex = currentIndex + 1
    if (newIndex >= MESSAGE_COUNT) {
      onFullRepair()
      setStage(STAGE_COMPLETED)
    } else {
      setRepairingMessageIndex(newIndex)
      setTimeout(() => advanceRepairMessage(newIndex), MESSAGE_SPEED)
    }
  }

  const initiateRepairs = () => {
    assembleMessages()
    setRepairingMessageIndex(0)
    advanceRepairMessage(-1)
    setStage(STAGE_ANIMATING)
  }


  return (
    <div className={`FullRepairButton ${stage}`}>
      <FullRepairDnaSync stage={stage} />

      <div className={`status-text-container ${stage}`}>
        { stage === STAGE_COMPLETED ?
          <button className={`status-bar ${stage}`} onClick={() => setStage(STAGE_UNCLICKED)}>
            FULL REPAIR COMPLETE
          </button>
        : stage === STAGE_ANIMATING ?
          <div className='status-text'>
            {repairingMessages[repairingMessageIndex]}
          </div>
        : stage === STAGE_PLEASE_CONFIRM &&
          <div className='confirm-cancel-container'>
            <button className={`status-bar ${stage}`} onClick={initiateRepairs}>
              Confirm FULL REPAIR
            </button>
            <button className={`status-bar ${stage}`} onClick={() => setStage(STAGE_UNCLICKED)}>
              CANCEL
            </button>
          </div>
        }
      </div>


      <div className='pseudo-panel-container'>
        <div className='pseudo-panel'>
          <button
            className='unclicked'
            onClick={() => setStage(STAGE_PLEASE_CONFIRM)}
            disabled={stage !== STAGE_UNCLICKED}
          >
            Full Repair
          </button>
        </div>
      </div>
    </div>
  );
}

const FullRepairDnaSync = ({
  stage
}) => {

  return (
    <div className={`FullRepairDnaSync ${stage}`}>
      <div className='asset dna_left' />
      <div className='asset dna_right' />
    </div>
  );
}




export default FullRepairButton;
