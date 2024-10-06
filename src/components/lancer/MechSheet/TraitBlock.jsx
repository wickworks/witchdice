import React, { useState, useEffect } from 'react';
import MechNumberBar from '../MechState/MechNumberBar.jsx'
import PerRoundBar, { getPerRoundCountShortString } from './PerRoundBar.jsx'
import RechargeBar, { getRechargeString, getRechargeStatusShortString } from './RechargeBar.jsx'
import { DestroySystemButton, BroadcastSystemButton } from './DestroySystemButton.jsx'
import ReactHtmlParser from 'react-html-parser';

import './TraitBlock.scss';

function getSystemDescription(description, isDestroyed) {
	return isDestroyed ? '[ SYSTEM DESTROYED ]' : (description || '')
}

function getSystemTrigger(trigger) {
	return trigger ? `Trigger: ${trigger}` : ''
}

export function getBroadcastObjectForTrait(trait) {
	const stats = [
		trait.activation,
		trait.frequency,
		trait.range && trait.range.map(rangeEntry => `${rangeEntry.type} ${rangeEntry.val}`).join(', '),
		trait.recharge && getRechargeString(trait.recharge),
		trait.limited && `Limited ${trait.limited.max}`,
		trait.selfHeat,
	].filter(attr => !!attr).join(', ')

	const description = [
		getSystemTrigger(trait.trigger),
		trait.statblock && ('〔 ' + Object.keys(trait.statblock).map(stat => `${stat}: ${trait.statblock[stat]}`).join(' | ') + ' 〕'),
		getSystemDescription(trait.description, trait.isDestroyed),
	].filter(attr => !!attr).join('<br>')

	return {
		type: 'text',
		title: trait.name.toUpperCase(),
		message: [stats, description].join('<br>')
	}
}

const TraitBlock = ({
	trait,
	onDestroy = null,
	setLimitedCount = null,
	setRecharged = null,
	setPerRoundCount = null,
	setRollSummaryData = null,

	isSubtrait = false,
	defaultCollapsed = true,
}) => {
	// Sanitize trait props; SOME lcps are sloppy with making sure this an array
	if ('range' in trait) trait.range = trait.range && [trait.range].flat()
	const {
		name,
		activation,
		frequency,
		range,
		selfHeat,
		description,
		statblock,
		isCP,
		isDestructable,
		isDestroyed,
		limited,	// {current: X, max: Y, icon: 'generic-item'}
		recharge,	// {charged: X, rollTarget: Y} >> rollTarget of 0 is just usable/unusable
		perRoundCount,	// {current: X, max: Y, icon: 'generic-item'}
		isTitleCase,
		subTraits
	} = trait

	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
	// if MechTraits toggles what's open, set them all to that.
	useEffect(() => setIsCollapsed(defaultCollapsed), [defaultCollapsed]);

 	// Stack of broadcast objects to... broadcast. Only used when subtraits are present.
	// Can only do one at a time so we have to space them out like this.
	const [broadcastStack, setBroadcastStack] = useState([]);
	useEffect(() => {
		const nextBroadcastObject = broadcastStack[0]
		if (nextBroadcastObject) {
			setRollSummaryData(nextBroadcastObject)
			setBroadcastStack(broadcastStack.slice(1))
		}
	}, [broadcastStack.length]);

	const onBroadcast = () => {
		setRollSummaryData(getBroadcastObjectForTrait(trait))
		if (trait.subTraits) {
			const newBroadcastStack = trait.subTraits.map(subTrait => getBroadcastObjectForTrait(subTrait))
			setBroadcastStack(newBroadcastStack)
		}
	}

	const systemDescription = isDestroyed ? '[ SYSTEM DESTROYED ]' : (description || '')

	const boldedDescription = getSystemDescription(trait.description, trait.isDestroyed).replace('Effect:', '<strong>Effect:</strong>')
	const boldedTrigger = getSystemTrigger(trait.trigger).replace('Trigger:', '<strong>Trigger:</strong>')

	const perRoundFreq = frequency || (perRoundCount && `${perRoundCount.max}/${perRoundCount.interval}`)
	const detailString = [activation, selfHeat, perRoundFreq].filter(detail => detail).join(', ')

	const titleClass = isTitleCase ? 'title-case' : ''
	const collapsedClass = isCollapsed ? 'collapsed' : ''
  const cpClass = isCP ? 'core-power' : ''
	const destroyedClass = isDestroyed ? 'destroyed' : ''
	const activationClass = activation ? activation.toLowerCase() : ''
	const subtraitClass = isSubtrait ? 'subtrait' : ''
	const wideClass = (systemDescription.length > 220 || (subTraits && subTraits.length > 0)) ? 'wide' : ''

  return (
		<div className={`TraitBlock ${collapsedClass} ${subtraitClass} ${wideClass}`}>
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
						{detailString && <div className='detail-string'>{detailString}</div>}

						{range && range.map((rangeType, i) =>
	            <div className='range-icon' key={`range-${i}`}>
	              {rangeType.val}
	              <div className={`asset ${rangeType.type.toLowerCase()}`} />
	            </div>
	          )}

						{limited &&
							<div className='limited'>
								Limited {limited.current}/{limited.max}
							</div>
						}

						{recharge &&
							<div className='recharge'>{getRechargeStatusShortString(recharge)}</div>
						}

						{perRoundCount &&
							<div className='per-round-count'>{getPerRoundCountShortString(perRoundCount)}</div>
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
							<RechargeBar recharge={recharge} setRecharged={setRecharged} />
						}

						{perRoundCount && setPerRoundCount && !isDestroyed &&
							<PerRoundBar perRoundCount={perRoundCount} setPerRoundCount={setPerRoundCount} />
						}

						{statblock && !isDestroyed &&
							<div className={`statblock-bar ${subtraitClass}`}>
								<div className='stat' title="E-Defense">
									<span className='asset edef'/>
									<span>{statblock.edef || 10}</span>
								</div>
								<div className='stat' title="Evasion">
								<span className='asset evasion'/>
									<span>{statblock.evasion || 5}</span>
								</div>
								<div className='stat' title="HP">
									<span className='asset heart'/>
									<span>{statblock.hp || 10*(statblock.size || 1)}</span>
								</div>
								<div className='stat' title="Size">
									<span className='asset hex'/>
									<span>{statblock.size || 1}</span>
								</div>
							</div>
						}

						<div className={`description ${subtraitClass}`}>
							{boldedTrigger && !isDestroyed &&
								<p>{ReactHtmlParser(boldedTrigger)}</p>
							}

	            {ReactHtmlParser(boldedDescription)}

							{subTraits && !isDestroyed && subTraits.map((subTrait,index) =>

								<TraitBlock
									key={`${subTrait.name}-${index}`}
									trait={subTrait}
									isSubtrait={true}
									defaultCollapsed={subTraits.length > 1}
								/>
							)}

						</div>
					</>
				}
			</div>

			{!isCollapsed &&
				<div className='sidebar-buttons'>
					{isDestructable && <DestroySystemButton onDestroy={onDestroy} isDestroyed={isDestroyed}/>}
					{setRollSummaryData && <BroadcastSystemButton onBroadcast={onBroadcast}/>}
				</div>
			}
		</div>
  );
}

export default TraitBlock;
