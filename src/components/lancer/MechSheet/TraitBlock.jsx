import React, { useState } from 'react';
import MechNumberBar from '../MechState/MechNumberBar.jsx'
import DestroySystemButton from './DestroySystemButton.jsx'
import ReactHtmlParser from 'react-html-parser';

import './TraitBlock.scss';

const TraitBlock = ({
	name,
  activation = '',
	frequency = '',
	trigger = '',
	range = null,
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
}) => {
	const [isCollapsed, setIsCollapsed] = useState(true);

  let systemDescription = isDestroyed ? '[ SYSTEM DESTROYED ]' : description
	systemDescription = systemDescription.replace('Effect:', '<strong>Effect:</strong>')

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
							{trigger &&
								<p>
									<strong>Trigger:</strong> {ReactHtmlParser(trigger)}
								</p>
							}

	            {ReactHtmlParser(systemDescription)}

						</div>
					</>
				}
			</div>

			{!isCollapsed && isDestructable &&
				<DestroySystemButton
					onDestroy={onDestroy}
					isDestroyed={isDestroyed}
				/>
			}
		</div>
  );
}

export default TraitBlock;
