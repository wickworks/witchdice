import React, { useState } from 'react';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import MechNumberBar from './MechState/MechNumberBar.jsx'

import {
  findSystemData,
} from './lancerData.js';

import './MechTraits.scss';

const MechTraits = ({
	traitList,
	coreSystem,
}) => {

  return (
		<div className='MechTraits'>
			<div className="label">Frame Traits & Core System</div>

    	<div className='traits-container'>
				{ traitList.map((trait, i) =>
					<React.Fragment key={trait.name}>
						<TraitBlock
							name={trait.name.toLowerCase()}
							isTitleCase={true}
							activation=''
							description={trait.description}
						/>

						{ trait.actions && trait.actions.map((traitAction, i) => {
							return (
								<TraitBlock
									key={traitAction.name}
									name={traitAction.name}
									activation={traitAction.activation}
									frequency={traitAction.frequency}
									description={traitAction.detail}
								/>
							)
						})}
					</React.Fragment>
				)}

				{ coreSystem.passive_effect &&
					<TraitBlock
						key={coreSystem.passive_name}
						name={coreSystem.passive_name}
						activation=''
						description={coreSystem.passive_effect}
					/>
				}

				{ coreSystem.passive_actions && coreSystem.passive_actions.map((passiveAction, i) => {
					return (
						<TraitBlock
							key={passiveAction.name}
							name={passiveAction.name}
							activation={passiveAction.activation}
							description={passiveAction.detail}
						/>
					)
				})}

				<TraitBlock
					name={coreSystem.active_name}
					activation={`Active (1 CP), ${coreSystem.activation}`}
					description={coreSystem.active_effect}
					isCP={true}
				/>

				{ coreSystem.active_actions && coreSystem.active_actions.map((activeAction, i) => {
					return (
						<TraitBlock
							key={activeAction.name}
							name={activeAction.name}
							activation={activeAction.activation}
							description={activeAction.detail}
						/>
					)
				})}
			</div>
    </div>
  );
}


const MechSystemActions = ({
	systems,
	setLimitedCountForSystem
}) => {

	function getLimited(system, systemData) {
		const limitedTag = systemData.tags && systemData.tags.find(tag => tag.id === 'tg_limited')
		let limited = null

		if (limitedTag) {
			limited = {
				current: system.uses || 0,
				max: limitedTag.val,
				icon: 'generic-item'
			}
		}
		return limited
	}

	function renderPassives(system, systemData) {
		return (
			<TraitBlock
				name={systemData.name.toLowerCase()}
				description={systemData.effect}
				isTitleCase={true}
			/>
		)
	}

	function renderActions(system, systemData) {
		let renderedActions = []
		systemData.actions && systemData.actions.map((action, i) => {
			if (action.activation !== 'Invade') { // invades are handled by the weapon roller
				let limited = getLimited(system, systemData)
				if (action.name && action.name.includes('Grenade')) limited.icon = 'grenade'

				renderedActions.push(
					<TraitBlock
						key={`${systemData.name}-action-${i}`}
						name={action.name || systemData.name}
						activation={action.activation}
						range={action.range}
						limited={limited}
						setLimitedCount={(count) => setLimitedCountForSystem(count, i)}
						description={action.detail}
					/>
				)
			}
		})

		return renderedActions
	}

	function renderDeployables(system, systemData) {
		let renderedDeployables = []
		systemData.deployables && systemData.deployables.map((deployable, i) => {
			let limited = getLimited(system, systemData)
			if (deployable.type === 'Mine') limited.icon = 'mine'

			renderedDeployables.push(
				<TraitBlock
					key={`${systemData.name}-deployable-${i}`}
					name={deployable.name}
					activation={deployable.activation}
					range={deployable.range}
					limited={limited}
					setLimitedCount={(count) => setLimitedCountForSystem(count, i)}
					description={deployable.detail}
				/>
			)
		})

		return renderedDeployables
	}


  return (
		<div className='MechSystemActions'>
			<div className="label">Systems</div>
			<div className='traits-container'>
				{ systems.map((system,i) => {
					const systemData = findSystemData(system.id)
					return (
						<React.Fragment key={`${system.id}-${i}`}>
							{systemData.effect && renderPassives(system, systemData)}
						</React.Fragment>
					)
				})}

				{ systems.map((system,i) => {
					const systemData = findSystemData(system.id)
					return (
						<React.Fragment key={`${system.id}-${i}`}>
							{systemData.actions && renderActions(system, systemData)}
							{systemData.deployables && renderDeployables(system, systemData)}
						</React.Fragment>
					)
				})}
			</div>
    </div>
  );
}

const TraitBlock = ({
	name,
	activation = '',
	frequency = '',
	range = null,
	limited = null, // {current: X, max: Y, icon: 'generic-item'}
	setLimitedCount = () => {},
	description = '',
	extraClass = '',
	isTitleCase = false,
	isCP = false,
}) => {
	const [isCollapsed, setIsCollapsed] = useState(true);

	const wideClass = description.length > 160 ? 'tall' : ''
	const tallClass = description.length > 460 ? 'wide' : ''

	const titleClass = isTitleCase ? 'title-case' : '';
	const collapsedClass = isCollapsed ? 'collapsed' : '';
	const cpClass = isCP ? 'core-power' : '';

  return (
		<div className={`TraitBlock ${wideClass} ${tallClass} ${collapsedClass} ${extraClass}`}>
			<button
				className={`name ${titleClass} ${activation.toLowerCase()} ${cpClass} ${collapsedClass}`}
				onClick={() => setIsCollapsed(!isCollapsed)}
			>
				<div>{name}</div>
				{activation &&
					<div className='detail'>
						{activation}
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
					</div>
				}
			</button>


			{!isCollapsed &&
				<>
					{limited &&
						<MechNumberBar
							extraClass='condensed'
							dotIcon={limited.icon || 'generic-item'}
							maxNumber={limited.max}
							currentNumber={limited.current}
							setCurrentNumber={setLimitedCount}
							leftToRight={true}
						/>
					}

					<div className='description'>
						{ReactHtmlParser(description)}
					</div>
				</>
			}
		</div>
  );
}


export { MechTraits, MechSystemActions };
