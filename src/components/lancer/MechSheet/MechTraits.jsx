import React, { useState } from 'react';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import MechNumberBar from '../MechState/MechNumberBar.jsx'
import DestroySystemButton from './DestroySystemButton.jsx'

import {
  findSystemData,
} from '../lancerData.js';

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
									trigger={traitAction.trigger}
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
							trigger={passiveAction.trigger}
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
							trigger={activeAction.trigger}
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
	setLimitedCountForSystem,
  setDestroyedForSystem,
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

  function isDestructable(systemData) {
    const indestructableTag = (systemData.tags && systemData.tags.find(tag => tag.id === 'tg_indestructible'))
    return !indestructableTag
  }

	function renderPassive(system, systemData, systemIndex) {
		return (
			<TraitBlock
				name={systemData.name.toLowerCase()}
				description={systemData.effect}

        isDestructable={isDestructable(systemData)}
        isDestroyed={system.destroyed}
        onDestroy={() => setDestroyedForSystem(!system.destroyed, systemIndex)}

        isTitleCase={true}
			/>
		)
	}

  function renderInvades(system, systemData, systemIndex) {
    return (
      <TraitBlock
        name={systemData.name.toLowerCase()}
        description={`Gain the following options for Invade: ${systemData.actions.map(action => action.name).join(', ')}`}

        isDestructable={isDestructable(systemData)}
        isDestroyed={system.destroyed}
        onDestroy={() => setDestroyedForSystem(!system.destroyed, systemIndex)}

        isTitleCase={true}
      />
    )
  }

	function renderActions(system, systemData, systemIndex) {
		let renderedActions = []
    let limited = getLimited(system, systemData)

		systemData.actions.forEach((action, i) => {
			if (action.activation !==  'Invade') { // invades are handled by the weapon roller

				if (action.name && action.name.includes('Grenade')) limited.icon = 'grenade'
				renderedActions.push(
					<TraitBlock
						key={`${systemData.name}-action-${i}`}
						name={action.name || systemData.name}
						activation={action.activation}
						trigger={action.trigger}
						range={action.range}
            description={action.detail}

						limited={limited}
						setLimitedCount={(count) => setLimitedCountForSystem(count, systemIndex)}

            isDestructable={isDestructable(systemData)}
            isDestroyed={system.destroyed}
            onDestroy={() => setDestroyedForSystem(!system.destroyed, systemIndex)}
					/>
				)
			}
		})

		return renderedActions
	}

	function renderDeployables(system, systemData, systemIndex) {
		let renderedDeployables = []
    let limited = getLimited(system, systemData)

		systemData.deployables.forEach((deployable, i) => {
			if (deployable.type === 'Mine') limited.icon = 'mine'
			renderedDeployables.push(
				<TraitBlock
					key={`${systemData.name}-deployable-${i}`}
					name={deployable.name}
					activation={deployable.activation}
					trigger={deployable.trigger}
					range={deployable.range}
          description={deployable.detail}

					limited={limited}
					setLimitedCount={(count) => setLimitedCountForSystem(count, systemIndex)}

          isDestructable={isDestructable(systemData)}
          isDestroyed={system.destroyed}
          onDestroy={() => setDestroyedForSystem(!system.destroyed, systemIndex)}
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
          const grantsInvades = systemData.actions && systemData.actions.filter(action => action.activation === 'Invade').length > 0

          console.log(systemData.name, 'grantsInvades', grantsInvades);
					return (
						<React.Fragment key={`${system.id}-${i}`}>
              {systemData.effect && renderPassive(system, systemData, i)}
							{!systemData.effect && grantsInvades &&
                renderInvades(system, systemData, i)
              }
						</React.Fragment>
					)
				})}

				{ systems.map((system,i) => {
					const systemData = findSystemData(system.id)
					return (
						<React.Fragment key={`${system.id}-${i}`}>
							{systemData.actions && renderActions(system, systemData, i)}
							{systemData.deployables && renderDeployables(system, systemData, i)}
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
	trigger = '',
	range = null,
  description = '',

  limited = null, // {current: X, max: Y, icon: 'generic-item'}
	setLimitedCount = () => {},

  isDestructable = false,
  isDestroyed = false,
  onDestroy = null,

	extraClass = '',
	isTitleCase = false,
	isCP = false,
}) => {
	const [isCollapsed, setIsCollapsed] = useState(true);

	const sizeClass = description.length > 460 ? 'wide' : description.length > 160 ? 'tall' : ''

	const titleClass = isTitleCase ? 'title-case' : '';
	const collapsedClass = isCollapsed ? 'collapsed' : '';
  const cpClass = isCP ? 'core-power' : '';
	const destroyedClass = isDestroyed ? 'destroyed' : '';

  return (
		<div className={`TraitBlock ${sizeClass} ${collapsedClass} ${extraClass}`}>
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
					{limited && !isDestroyed &&
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
            {isDestructable &&
              <DestroySystemButton
                onDestroy={onDestroy}
                isDestroyed={isDestroyed}
              />
            }

						{trigger && <p><strong>Trigger:</strong> {trigger}</p>}

            {isDestroyed ?
              '[ SYSTEM DESTROYED ]'
            :
              ReactHtmlParser(description)
            }
					</div>
				</>
			}
		</div>
  );
}


export { MechTraits, MechSystemActions };
