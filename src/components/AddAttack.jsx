import React, { useState } from 'react';
import {RadioGroup, Radio} from 'react-radio-group';
import './AddAttack.scss';

const AddAttack = () => {
  const [die, setDie] = useState('d4');
  const [type, setType] = useState('slashing');

  return (
    <div className="AddAttack">
      <div className='icons-container'>

        <div className='dice'>
          <IconMenu
            groupName={'select-die-type'}
            allIcons={['d4','d6','d8','d10','d12','flat']}
            selectedIcon={die}
            setIcon={setDie}
            showLabels={true}
          />
        </div>

        <div className='horiz-divider' />

        <div className='types'>
          <IconMenu
            groupName={'select-damage-type'}
            allIcons={['slashing','piercing','bludgeoning','fire','cold','lightning','thunder','acid','poison','psychic','necrotic','radiant','force']}
            selectedIcon={type}
            setIcon={setType}
            showLabels={false}
          />
        </div>
      </div>

      <div className='buttons-container'>
        <div>Accept</div>
        <div>Cancel</div>
        <div>Delete</div>
      </div>
    </div>
  );
}

const IconMenu = (props) => {
  const {
    allIcons, groupName,
    selectedIcon, setIcon,
    showLabels,
  } = props;


  return (
    <RadioGroup
      name={groupName}
      className={'IconMenu'}
      selectedValue={selectedIcon}
      onChange={(value) => { setIcon(value) }}
    >
      { allIcons.map((icon, i) => {
        const radioID = `${groupName}-${i}`;
        return (
          <>
            <Radio value={icon} id={radioID} />
            <label for={radioID}>
              <div className={`asset ${icon}`} />
              { showLabels && <div className='label'>{icon}</div> }
            </label>
          </>
        )
      })}

    </RadioGroup>
  )
}
//
// const IconButton = (props) => {
//   const {
//     icon, setIcon, showLabel
//   } = props;
//
//   console.log('icon', icon);
//
//   return (
//     <button className='IconButton' onClick={() => setIcon(icon)}>
//       <div className={`asset ${icon}`} />
//       { showLabel &&
//         <div className='label'>{icon}</div>
//       }
//     </button>
//   )
// }


export default AddAttack;
