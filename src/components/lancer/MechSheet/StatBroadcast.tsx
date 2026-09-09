import React, { useState } from 'react';
import { capitalize } from '../../../utils';

import type { RobotInfo, RobotStats, RobotState } from '../types';

import './StatBroadcast.scss';

const StatBroadcast = ({
  robotInfo,
  robotStats,
  robotState,
  onBroadcast,
}: {
  robotInfo: RobotInfo,
  robotStats: RobotStats,
  robotState: RobotState,
  onBroadcast: (data: any) => void,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [disabledBroadcasts, setDisabledBroadcasts] = useState<string[]>([])

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


  function broadcastStats(statBlock: string, disableType: string) {
    let newDisabled = [...disabledBroadcasts]
    newDisabled.push(disableType)
    setDisabledBroadcasts(newDisabled)

    onBroadcast({
  		type: 'text',
  		title: [robotInfo.frameSourceText, capitalize(robotInfo.frameName)].join(', '),
  		message: statBlock
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
