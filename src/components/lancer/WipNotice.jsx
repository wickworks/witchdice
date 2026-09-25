import React from 'react';

import './WipNotice.scss';

const WipNotice = () => (
  <div className='WipNotice'>
    <p>
      V3 support is now live. LCPs are no longer required.
      Bugs & data loss may occur while the remaining wrinkles are being ironed out.
    </p>
    <p>
      The previous version can temporarily be found at<a
        href='https://old.witchdice.com'
        target="_blank"
        rel="noopener noreferrer"
      >old.witchdice.com</a>— if you find bugs or want to help out, you can submit PRs on<a
        href='https://github.com/wickworks/witchdice'
        target="_blank"
        rel="noopener noreferrer"
      >Github.</a>
    </p>
    {/*<p>
      Witchdice is in support mode; I'll only be fixing critical errors.
      If you find bugs or want to help with the<a
        href='https://trello.com/b/e24TNiu1/witchdice'
        target="_blank"
        rel="noopener noreferrer"
      >backlog,</a>
      you can submit PRs on<a
        href='https://github.com/wickworks/witchdice'
        target="_blank"
        rel="noopener noreferrer"
      >Github.</a>
    </p>*/}
  </div>
)

export default WipNotice;
