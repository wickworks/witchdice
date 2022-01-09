import React, { useState } from 'react';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';

import {
  findSystemData,
} from './lancerData.js';

import './MechTraits.scss';

const MechTraits = ({
	traitList,
}) => {
	const [isCollapsed, setIsCollapsed] = useState(true);

  return (
		<div className='MechTraits'>
			<div className="label">Traits</div>

    	<div className='traits-container'>
				{ traitList.map((trait, i) =>
					<React.Fragment key={trait.name}>
						<TraitBlock
							name={trait.name.toLowerCase()}
							isTitleCase={true}
							activation=''
							description={trait.description}
							isCollapsed={isCollapsed}
							handleClick={() => setIsCollapsed(!isCollapsed)}
						/>

						{ trait.actions && trait.actions.map((traitAction, i) => {
							return (
								<TraitBlock
									key={traitAction.name}
									name={traitAction.name}
									activation={traitAction.activation}
									frequency={traitAction.frequency}
									description={traitAction.detail}
									isCollapsed={isCollapsed}
									handleClick={() => setIsCollapsed(!isCollapsed)}
								/>
							)
						})}
					</React.Fragment>
				)}
			</div>
    </div>
  );
}

const MechCoreSystem = ({
	coreSystem,
}) => {
	const [isCollapsed, setIsCollapsed] = useState(true);

  return (
		<div className='MechCoreSystem'>
			<div className="label">Core System — {coreSystem.name}</div>

			<div className='traits-container'>

				{ coreSystem.passive_effect &&
					<TraitBlock
						key={coreSystem.passive_name}
						name={coreSystem.passive_name}
						activation=''
						description={coreSystem.passive_effect}
						isCollapsed={isCollapsed}
						handleClick={() => setIsCollapsed(!isCollapsed)}
					/>
				}

				{ coreSystem.passive_actions && coreSystem.passive_actions.map((passiveAction, i) => {
					return (
						<TraitBlock
							key={passiveAction.name}
							name={passiveAction.name}
							activation={passiveAction.activation}
							description={passiveAction.detail}
							isCollapsed={isCollapsed}
							handleClick={() => setIsCollapsed(!isCollapsed)}
						/>
					)
				})}

				<TraitBlock
					name={coreSystem.active_name}
					activation={`Active (1 CP), ${coreSystem.activation}`}
					description={coreSystem.active_effect}
					isCP={true}
					isCollapsed={isCollapsed}
					handleClick={() => setIsCollapsed(!isCollapsed)}
				/>

				{ coreSystem.active_actions && coreSystem.active_actions.map((activeAction, i) => {
					return (
						<TraitBlock
							key={activeAction.name}
							name={activeAction.name}
							activation={activeAction.activation}
							description={activeAction.detail}
							isCollapsed={isCollapsed}
							handleClick={() => setIsCollapsed(!isCollapsed)}
						/>
					)
				})}
			</div>
    </div>
  );
}

const MechSystemActions = ({
	systems,
}) => {
	const [isCollapsed, setIsCollapsed] = useState(true);

	function renderActions(system) {
		let renderedActions = []
		const systemData = findSystemData(system.id)

		systemData.actions && systemData.actions.map((action, i) => {
			if (action.activation !== 'Invade') { // invades are handled by the weapon roller
				renderedActions.push(
					<TraitBlock
						key={`${systemData.name}-action-${i}`}
						name={action.name || systemData.name}
						activation={action.activation}
						range={action.range}
						description={action.detail}
						isCollapsed={isCollapsed}
						handleClick={() => setIsCollapsed(!isCollapsed)}
					/>
				)
			}
		})

		return renderedActions
	}

	function renderDeployables(system) {
		let renderedDeployables = []
		const systemData = findSystemData(system.id)

		systemData.deployables && systemData.deployables.map((deployable, i) => {
			renderedDeployables.push(
				<TraitBlock
					key={`${systemData.name}-deployable-${i}`}
					name={deployable.name}
					activation={deployable.activation}
					range={deployable.range}
					description={deployable.detail}
					isCollapsed={isCollapsed}
					handleClick={() => setIsCollapsed(!isCollapsed)}
				/>
			)
		})

		console.log('RENDER DEPOLOTS', systemData.deployables);

		return renderedDeployables
	}

  return (
		<div className='MechSystemActions'>
			<div className='traits-container'>
				{ systems.map(system =>
					<>
						{renderActions(system)}
						{renderDeployables(system)}
					</>
				)}
			</div>
    </div>
  );
}

const TraitBlock = ({
	name,
	activation,
	frequency,
	range,
	description,
	handleClick,
	extraClass = '',
	isTitleCase = false,
	isCP = false,
	isCollapsed = false,
}) => {
	const wideClass = description.length > 160 ? 'tall' : ''
	const tallClass = description.length > 460 ? 'wide' : ''

	const titleClass = isTitleCase ? 'title-case' : '';
	const collapsedClass = isCollapsed ? 'collapsed' : '';
	const cpClass = isCP ? 'core-power' : '';

  return (
		<div className={`TraitBlock ${wideClass} ${tallClass} ${extraClass}`}>
			<button
				className={`name ${titleClass} ${activation.toLowerCase()} ${cpClass} ${collapsedClass}`}
				onClick={handleClick}
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
					</div>
				}
			</button>

			{!isCollapsed &&
				<div className='description'>
					{ReactHtmlParser(description)}
				</div>
			}
		</div>
  );
}


export { MechTraits, MechCoreSystem, MechSystemActions };
