import React from 'react';

import './WipNotice.scss';

const WipNotice = () => (
  <div className='WipNotice'>
    <p>
      Warning: the
      <a
        href='https://github.com/orgs/massif-press/discussions/64'
        target="_blank"
        rel="noopener noreferrer"
      >recent V3 update on COMP/CON</a>
      introduced major data format changes. V3 Pilots may experience problems; V3 NPCs will certainly not work.
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
