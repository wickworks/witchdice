import React from 'react';

import './WipNotice.scss';

const WipNotice = () => (
  <div className='WipNotice'>
    <p>
      <strong>Warning:</strong> Witchdice will be dropping V2 support in favor of the
      <a
        href='https://github.com/orgs/massif-press/discussions/64'
        target="_blank"
        rel="noopener noreferrer"
      >V3 COMP/CON updates</a>
      sometime in the coming months. Please update your PCs and NPCs at your earliest convenience.
    </p>
    {/*<p>
      Lancer is a big game; tell me about bugs or missing mechanics
      <a
        href='https://docs.google.com/forms/d/e/1FAIpQLScs5LFyqCURtVjQDzrscMZhWXC45xZl4sUdLLMig0QQ3fO5GA/viewform'
        target="_blank"
        rel="noopener noreferrer"
      >here.</a>

      The to-do list is on<a
        href='https://trello.com/b/e24TNiu1/witchdice'
        target="_blank"
        rel="noopener noreferrer"
      >Trello.</a>
    </p>*/}
  </div>
)

export default WipNotice;
