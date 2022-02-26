import React, { useState } from 'react';
import MechNumberBar from '../MechState/MechNumberBar.jsx'
import { DestroySystemButton, BroadcastSystemButton } from './DestroySystemButton.jsx'
import ReactHtmlParser from 'react-html-parser';

import './TraitBlock.scss';


const TraitBlock = ({
	name,
  activation = '',
	frequency = '',
	range = null,
	trigger = '',
  description = '',

  limited = null, // {current: X, max: Y, icon: 'generic-item'}
	setLimitedCount = () => {},

	recharge = null, // {charged: X, rollTarget: Y}
	setRecharged = () => {},

  isDestructable = false,
  isDestroyed = false,
  onDestroy = null,

	extraClass = '',
	isTitleCase = false,
	isCP = false,
	setRollSummaryData = () => {},
}) => {
	const [isCollapsed, setIsCollapsed] = useState(true);

  let systemDescription = isDestroyed ? '[ SYSTEM DESTROYED ]' : description
	systemDescription = systemDescription.replace('Effect:', '<strong>Effect:</strong>')

	const systemTrigger = trigger ? `<strong>Trigger:</strong> ${trigger}` : ''

	let broadcastObject = {
		// characterName: robotInfo.name, //injected upstream
		conditions: [name.toUpperCase()],
		rolls: [{
			name: [
				activation,
				frequency,
				range,
				recharge && `Recharge ${recharge.rollTarget}+`,
				limited && `Limited ${limited.max}`
			].filter(attr => !!attr).join(', '),
			applies: [systemTrigger, systemDescription].filter(attr => !!attr).join('<br>'),
			attack: -100, // it's an ability, I guess?
		}],
		skipTotal: true,
	}


	const sizeClass =  (systemDescription.length > 200 || trigger) ? 'wide' : ''
	const titleClass = isTitleCase ? 'title-case' : '';
	const collapsedClass = isCollapsed ? 'collapsed' : '';
  const cpClass = isCP ? 'core-power' : '';
	const destroyedClass = isDestroyed ? 'destroyed' : '';

  return (
		<div className={`TraitBlock ${sizeClass} ${collapsedClass} ${extraClass}`}>
			<div className='card-container'>
				<button
					className={`name ${titleClass} ${activation.toLowerCase()} ${cpClass} ${collapsedClass}`}
					onClick={() => setIsCollapsed(!isCollapsed)}
				>
					<div className={`title ${destroyedClass}`}>
	          {name}
	          {isDestroyed && ' [ DESTROYED ]'}
	        </div>

					{activation &&
						<div className='detail'>
							<div className='activation'>{activation}</div>
							{frequency && `, ${frequency}`}
							{range && range.map((range, i) =>
		            <div className='range-icon' key={`range-${i}`}>
		              {range.val}
		              <div className={`asset ${range.type.toLowerCase()}`} />
		            </div>
		          )}
							{limited &&
								<div className='limited'>
									Limited {limited.current}/{limited.max}
								</div>
							}
							{recharge &&
								<div className='recharge'>
									{recharge.charged ? '〔Charged〕' : 'Recharge '}
									{recharge.rollTarget}+
								</div>
							}
						</div>
					}
				</button>


				{!isCollapsed &&
					<>
						{limited && !isDestroyed &&
							<MechNumberBar
								extraClass='condensed'
								dotIcon={limited.icon || 'generic-item'}
	              zeroIcon='dot'
								maxNumber={limited.max}
								currentNumber={limited.current}
								setCurrentNumber={setLimitedCount}
								leftToRight={true}
							/>
						}

						{recharge && !isDestroyed &&
							<div className='recharge-bar'>
								<input type='checkbox'
									checked={recharge.charged}
									onChange={() => setRecharged(!recharge.charged)}
								/>
								Recharge {recharge.rollTarget}+
								{recharge.charged ? ' 〔Charged〕' : ' 〔-------〕'}
							</div>
						}

						<div className='description'>
							{systemTrigger &&
								<p>{ReactHtmlParser(systemTrigger)}</p>
							}

	            {ReactHtmlParser(systemDescription)}

						</div>
					</>
				}
			</div>

			{!isCollapsed &&
				<div className='sidebar-buttons'>
					{isDestructable &&
						<DestroySystemButton onDestroy={onDestroy} isDestroyed={isDestroyed}/>
					}
					<BroadcastSystemButton
						onBroadcast={() => setRollSummaryData(broadcastObject)}
					/>
				</div>
			}
		</div>
  );
}

export default TraitBlock;
