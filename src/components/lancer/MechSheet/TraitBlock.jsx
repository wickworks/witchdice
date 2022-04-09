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
	trait,
	onDestroy = null,
	setLimitedCount = null,
	setRecharged = null,
	setRollSummaryData = null,

	isSubtrait = false,
	defaultCollapsed = true,
}) => {
	const {
		name,
		activation,
		trigger,
		frequency,
		range,
		description,
		statblock,
		isCP,
		isDestructable,
		isDestroyed,
		limited,	// {current: X, max: Y, icon: 'generic-item'}
		recharge,	// {charged: X, rollTarget: Y} >> rollTarget of 0 is just usable/unusable
		isTitleCase,
		subTraits
	} = trait

	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

	// if MechTraits toggles what's open, set them all to that.
	useEffect(() => {
    setIsCollapsed(defaultCollapsed)
  }, [defaultCollapsed]);

	const systemDescription = isDestroyed ? '[ SYSTEM DESTROYED ]' : description
	const systemTrigger = trigger ? `Trigger: ${trigger}` : ''

	let broadcastStats = statblock && ('〔 ' + Object.keys(statblock).map(stat => `${stat}: ${statblock[stat]}`).join(' — ') + ' 〕')
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
			applies: [systemTrigger, systemDescription, broadcastStats].filter(attr => !!attr).join('<br>'),
			attack: -100, // it's an ability, I guess?
		}],
		skipTotal: true,
	}

	const boldedDescription = systemDescription.replace('Effect:', '<strong>Effect:</strong>')
	const boldedTrigger = systemTrigger.replace('Trigger:', '<strong>Trigger:</strong>')

	const titleClass = isTitleCase ? 'title-case' : '';
	const collapsedClass = isCollapsed ? 'collapsed' : '';
  const cpClass = isCP ? 'core-power' : '';
	const destroyedClass = isDestroyed ? 'destroyed' : '';
	const activationClass = activation && activation.toLowerCase();
	const subtraitClass = isSubtrait && 'subtrait'

  return (
		<div className={`TraitBlock ${collapsedClass} ${subtraitClass}`}>
			<div className='card-container'>
				<button
					className={`name ${titleClass} ${activationClass} ${cpClass} ${collapsedClass}`}
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
						{limited && setLimitedCount && !isDestroyed &&
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

						{recharge && setRecharged && !isDestroyed &&
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

						{statblock && !isDestroyed &&
							<div className='statblock-bar'>
								<div className='stat'>
									<span className='asset edef'/>
									<span>{statblock.edef || 10}</span>
								</div>
								<div className='stat'>
								<span className='asset evasion'/>
									<span>{statblock.evasion || 5}</span>
								</div>
								<div className='stat'>
									<span className='asset heart'/>
									<span>{statblock.hp || 10*(statblock.size || 1)}</span>
								</div>
								<div className='stat'>
									<span className='asset hex'/>
									<span>{statblock.size || 1}</span>
								</div>
							</div>
						}

						<div className={`description ${subtraitClass}`}>
							{boldedTrigger &&
								<p>{ReactHtmlParser(boldedTrigger)}</p>
							}

	            {ReactHtmlParser(boldedDescription)}

							{subTraits && !isDestroyed && subTraits.map((subTrait,index) =>

								<TraitBlock
									key={`${subTrait.name}-${index}`}
									trait={subTrait}
									isSubtrait={true}
									defaultCollapsed={false}
								/>
							)}

						</div>
					</>
				}
			</div>

			{!isCollapsed &&
				<div className='sidebar-buttons'>
					{isDestructable &&
						<DestroySystemButton onDestroy={onDestroy} isDestroyed={isDestroyed}/>
					}
					{setRollSummaryData &&
						<BroadcastSystemButton
							onBroadcast={() => setRollSummaryData(broadcastObject)}
						/>
					}
				</div>
			}
		</div>
  );
}

export default TraitBlock;
