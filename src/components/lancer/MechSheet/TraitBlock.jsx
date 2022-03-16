import React, { useState, useEffect } from 'react';
import MechNumberBar from '../MechState/MechNumberBar.jsx'
import { DestroySystemButton, BroadcastSystemButton } from './DestroySystemButton.jsx'
import ReactHtmlParser from 'react-html-parser';

import './TraitBlock.scss';

function getRechargeString(recharge) {
	if (recharge && recharge.rollTarget > 0) {
		return `Recharge ${recharge.rollTarget}+`
	}
	return ''
}

const TraitBlock = ({
	name,
  activation = '',
	frequency = '',
	range = null,
	trigger = '',
  description = '',

  limited = null, // {current: X, max: Y, icon: 'generic-item'}
	setLimitedCount = () => {},

	recharge = null, // {charged: X, rollTarget: Y} >> rollTarget of 0 is just usable/unusable
	setRecharged = () => {},

  isDestructable = false,
  isDestroyed = false,
  onDestroy = null,

	extraClass = '',
	isTitleCase = false,
	isCP = false,
	setRollSummaryData = () => {},

	defaultCollapsed = true,
}) => {
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

	// if MechTraits toggles what's open, set them all to that.
	useEffect(() => {
    setIsCollapsed(defaultCollapsed)
  }, [defaultCollapsed]);

	const systemDescription = isDestroyed ? '[ SYSTEM DESTROYED ]' : description
	const systemTrigger = trigger ? `Trigger: ${trigger}` : ''



	let broadcastObject = {
		// characterName: robotInfo.name, //injected upstream
		conditions: [name.toUpperCase()],
		rolls: [{
			name: [
				activation,
				frequency,
				range,
				recharge && getRechargeString(recharge),
				limited && `Limited ${limited.max}`
			].filter(attr => !!attr).join(', '),
			applies: [systemTrigger, systemDescription].filter(attr => !!attr).join('<br>'),
			attack: -100, // it's an ability, I guess?
		}],
		skipTotal: true,
	}

	const boldedDescription = systemDescription.replace('Effect:', '<strong>Effect:</strong>')
	const boldedTrigger = systemTrigger.replace('Trigger:', '<strong>Trigger:</strong>')

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

					<div className='detail'>
						{activation && <div className='activation'>{activation}</div> }

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
								{ recharge.rollTarget > 0 ?
									<>
										{recharge.charged ? '〔Charged〕' : 'Recharge '}
										{recharge.rollTarget}+
									</>
								:
									(recharge.charged ? '〔 Used 〕' : '〔 Available 〕')
								}
							</div>
						}
					</div>
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
								{ recharge.rollTarget > 0 ?
									<>
										{getRechargeString(recharge)}
										{recharge.charged ? ' 〔Charged〕' : ' 〔 ----- 〕'}
									</>
								:
									(recharge.charged ? '〔 Used 〕' : '〔 Available 〕')
								}
							</div>
						}

						<div className='description'>
							{boldedTrigger &&
								<p>{ReactHtmlParser(boldedTrigger)}</p>
							}

	            {ReactHtmlParser(boldedDescription)}

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
