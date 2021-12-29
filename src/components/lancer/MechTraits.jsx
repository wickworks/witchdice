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
					<TraitBlock
						name={trait.name.toLowerCase()}
						key={trait.name}
						isTitleCase={true}
						activation=''
						description={trait.description}
						isCollapsed={isCollapsed}
						handleClick={() => setIsCollapsed(!isCollapsed)}
					/>
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

				{ coreSystem.passive_name &&
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
							isAction={true}
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
							isAction={true}
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
	description,
	handleClick,
	extraClass = '',
	isTitleCase = false,
	isAction = false,
	isCP = false,
	isCollapsed = false,
}) => {
	const wideClass = description.length > 160 ? 'tall' : ''
	const tallClass = description.length > 460 ? 'wide' : ''

	const titleClass = isTitleCase ? 'title-case' : '';
	const actionClass = isAction ? 'action' : '';
	const cpClass = isCP ? 'core-power' : '';

  return (
		<div className={`TraitBlock ${wideClass} ${tallClass} ${extraClass}`}>
			<button className={`name ${titleClass} ${actionClass} ${cpClass}`}  onClick={handleClick}>
				<div>{name}</div>
				{activation && <div className='detail'>{activation}</div>}
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
