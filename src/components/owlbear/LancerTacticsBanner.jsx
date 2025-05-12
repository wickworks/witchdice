import React, { useState } from 'react';

import './LancerTacticsBanner.scss';

const CLICKED_BANNER_KEY = 'hide-lancer-tactics-banner'

const LancerTacticsBanner = ({}) => {
	const [bannerHidden, setBannerHidden] = useState(String(localStorage.getItem(CLICKED_BANNER_KEY)) === 'true')

	const onHideBanner = () => {
		localStorage.setItem(CLICKED_BANNER_KEY, 'true')
		setBannerHidden(true)
	}

	return (
		<div className='LancerTacticsBanner'>
			{ (!bannerHidden) && <>
				<a href='https://wick.itch.io/lancer-tactics' referrerPolicy='origin' target='_blank' onClick={onHideBanner}>
					<div className='asset lancer_tactics_banner' />
				</a>
				<p>( Like Witchdice? Help support my work by buying my Lancer video game! )</p>
			</>}
		</div>
	)
}

export default LancerTacticsBanner ;
