import React from 'react';

import './WipNotice.scss';

const WipNotice = () => (
  <div className='WipNotice'>
    <p>
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
    </p>
  </div>
)

export default WipNotice;
