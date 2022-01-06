import React, { useState } from 'react';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';

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

const TraitBlock = ({
	name,
	activation,
	frequency,
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


export { MechTraits, MechCoreSystem };
