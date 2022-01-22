import React, { useState } from 'react';

import {
  findFrameData,
} from './lancerData.js';

import {
  getMechMaxHP,
  getMechMaxHeatCap,
  getMechMoveSpeed,
  getMechEvasion,
  getMechEDef,
  getMechSaveTarget,
  getMechMaxRepairCap,
} from './MechState/mechStateUtils.js';

import './FullRepairButton.scss';


const diagnosticMessages = [
  'Diagnosing damage...',
  'Diagnostics: REPAIRS NEEDED',
  'Diagnostics: Warranty voided!',
  'Diagnostics: Complete',
]

const workingMessages = [
  'Dispatching repair nanites...',
  'Running self test...',
  'Charging solidcore...',
  'Swinging wrench...',
  'Constructing pylons...',
  'Facing the gazebo...',
  'Reversing the polarity...',
  'Attempting percussive maintenance...',
  'Deleting system32...',
  'Deploying duct tape...',
  'Reinstalling propaganda...',
  'Pending 2FA...',
  'Scheduling unscheduled disassembly...',
  'Rolling ability scores...',
  'Calculating THAC0...',
  'Initiating virus scan...',
  'Praising the sun...',
  'Assuming direct control...',
  'Considering a spherical [mech part]...',
  'Condensing magic smoke...',
  'Reticulating splines...',
  'g  o  o  t  s',
  '# pacman -Syu',
  '/r 4d6kh3',
  '$ sudo killall sshd',
]

const finishingMessages = [
  'Reactor: ONLINE',
  'Sensors: ONLINE',
  'Weapons: ONLINE',
]

// Too long? Find out how to add:
// Castigating The Enemies Of— Wait, that doesn’t happen yet! Haha.
// YOU BETTER NOT GET ME THAT SCRATCHED NEXT TIME, PILOT.

const MESSAGE_COUNT = 12 // in total, minus the 4 startup and ending ones

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
      custom_counters: [],
      counter_data: [],
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

    const shuffledWorking = workingMessages.sort(() => 0.5 - Math.random())
    messages.push(...shuffledWorking.slice(0, 8))

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
      const delay = 200 + (Math.random() * 200)
      setRepairingMessageIndex(newIndex)
      setTimeout(() => advanceRepairMessage(newIndex), delay)
    }
  }

  const initiateRepairs = () => {
    assembleMessages()
    setRepairingMessageIndex(0)
    advanceRepairMessage(-1)
    setStage(STAGE_ANIMATING)
  }


  return (
    <div className='FullRepairButton'>
      <div className={`dna-container ${stage}`}>
        <div className='asset dna_left' />
        <div className='asset dna_right' />
      </div>

      { stage === STAGE_COMPLETED ?
        <button className='status-bar' onClick={() => setStage(STAGE_UNCLICKED)}>
          All systems nominal!
        </button>
      : stage === STAGE_ANIMATING ?
        <button className='status-bar' disabled>
          {repairingMessages[repairingMessageIndex]}
        </button>
      : stage === STAGE_PLEASE_CONFIRM ?
        <button className='status-bar' onClick={initiateRepairs}>
          Confirm FULL REPAIR.
        </button>
      : stage === STAGE_UNCLICKED &&
        <button className='unclicked' onClick={() => setStage(STAGE_PLEASE_CONFIRM)}>
          Full Repair
        </button>
      }
    </div>
  );
}




export default FullRepairButton;
