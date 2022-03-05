import React, { useState } from 'react';
import { capitalize } from '../../../utils.js';

import './StatBroadcast.scss';

// Frame Traits & Core System        Systems
const StatBroadcast = ({
  robotInfo,
  robotStats,
  robotState,
  onBroadcast,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [disabledBroadcasts, setDisabledBroadcasts] = useState([])

  // [ STATS ]
  //   HULL:1 AGI:0 SYS:1 ENGI:2
  //   STRUCTURE:4 HP:12 ARMOR:1
  //   STRESS:4 HEATCAP:8 REPAIR:10
  //   TECH ATK:+2 LIMITED:+3
  //   SPD:6 EVA:8 EDEF:9 SENSE:8 SAVE:14

  const statsBasic =
    `〔 BASIC STATS 〕<br>` +
    `MAX HP:${robotStats.maxHP} HP:${robotState.hp}<br>` +
    `HEAT:${robotState.heat}<br>` +
    `EVA:${robotStats.evasion} EDEF:${robotStats.eDef}<br>`

  const statsMedium =
    `〔 MEDIUM STATS 〕<br>` +
    `HULL:${robotStats.hull} AGI:${robotStats.agility} SYS:${robotStats.systems} ENGI:${robotStats.engineering}<br>` +
    `MAX HP:${robotStats.maxHP} HP:${robotState.hp} ARMOR:${robotStats.armor}<br>` +
    `SPD:${robotStats.moveSpeed} EVA:${robotStats.evasion} EDEF:${robotStats.eDef}<br>`

  const statsFull =
    `〔 FULL STATS 〕<br>` +
    `HULL:${robotStats.hull} AGI:${robotStats.agility} SYS:${robotStats.systems} ENGI:${robotStats.engineering}<br>` +
    `STRUCTURE:${robotStats.maxStructure} MAX HP:${robotStats.maxHP} HP:${robotState.hp} ARMOR:${robotStats.armor}<br>` +
    `STRESS:${robotStats.maxStress} HEATCAP:${robotStats.maxHeat} HEAT:${robotState.heat}<br>` +
    `SPD:${robotStats.moveSpeed} EVA:${robotStats.evasion} EDEF:${robotStats.eDef} SENSE:${robotStats.sensorRange} SAVE:${robotStats.saveTarget}<br>`


  function broadcastStats(statBlock, disableType) {
    let newDisabled = [...disabledBroadcasts]
    newDisabled.push(disableType)
    setDisabledBroadcasts(newDisabled)

    onBroadcast({
    	// characterName: robotInfo.name, //injected upstream
    	conditions: [robotInfo.frameSourceText, capitalize(robotInfo.frameName)],
    	rolls: [{
    		name: '',
    		applies: statBlock,
    		attack: -100, // it's an ability, I guess?
    	}],
    	skipTotal: true,
    })
  }

  return (
		<div className='StatBroadcast'>
      <button
        className={`toggle ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='hover-text'>
          <strong>BROADCAST OPTIONS</strong>
        </div>
        <div className='asset sensor' />
      </button>

      <div className={`broadcast-options ${isExpanded ? 'expanded' : 'hidden'}`}>
        <button onClick={() => broadcastStats(statsBasic, 'basic')} disabled={disabledBroadcasts.includes('basic')}>
          <div className='desc'>
            <span className='asset evasion'/>,
            <span className='asset edef'/>,
            Heat, HP —
          </div>
          <div className='asset npc-tier-1' />
        </button>
        <button onClick={() => broadcastStats(statsMedium, 'medium')} disabled={disabledBroadcasts.includes('medium')}>
          <div className='desc'>
            <span className='asset skill'/>,
            <span className='asset armor'/>,
            <span className='asset movement'/>,
            <span className='asset evasion'/>,
            <span className='asset edef'/>,
            HP —
          </div>
          <div className='asset npc-tier-2' />
        </button>
        <button onClick={() => broadcastStats(statsFull, 'full')} disabled={disabledBroadcasts.includes('full')}>
          <div className='desc'>
            Everything —
          </div>
          <div className='asset npc-tier-3' />
        </button>
      </div>

    </div>
  );
}

export default StatBroadcast;
