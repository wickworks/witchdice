import React from 'react';

import './LancerTacticsBanner.scss';

const LancerTacticsBanner = ({

}) => {

  return (
    <div className='LancerTacticsBanner'>
		<a href='https://wick.itch.io/lancer-tactics' referrerPolicy='origin' target='_blank'>
			<div className='asset lancer_tactics_banner' />
			{/*<p>We're making a Lancer video game!</p>*/}
			{/*<div className='asset gen_nelson' />*/}
		</a>
		<p>( Like Witchdice? Help support my work by buying my Lancer video game! )</p>
		</div>
  )
}

export default LancerTacticsBanner ;
