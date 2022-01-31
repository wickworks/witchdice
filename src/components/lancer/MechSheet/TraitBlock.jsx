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

  isDestructable = false,
  isDestroyed = false,
  onDestroy = null,

	extraClass = '',
	isTitleCase = false,
	isCP = false,
}) => {
	const [isCollapsed, setIsCollapsed] = useState(true);

  const systemDescription = isDestroyed ? '[ SYSTEM DESTROYED ]' : description

	const sizeClass = systemDescription.length > 460 ?
      'wide'
    : systemDescription.length > 280 ?
      'tall-3x'
    : systemDescription.length > 200 ?
      'tall-2x'
    : systemDescription.length > 120 ?
      'tall-1x'
    :
      ''

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
              zeroIcon='dot'
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

            {ReactHtmlParser(systemDescription)}

					</div>
				</>
			}
		</div>
  );
}

export default TraitBlock;
