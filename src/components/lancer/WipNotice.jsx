import React from 'react';

import './WipNotice.scss';

const WipNotice = () => (
  <div className='WipNotice'>
    <p>
      Lancer is a big game; tell me about bugs or missing mechanics
      <a
        href='https://docs.google.com/forms/d/e/1FAIpQLScs5LFyqCURtVjQDzrscMZhWXC45xZl4sUdLLMig0QQ3fO5GA/viewform'
        target="_blank"
        rel="noopener noreferrer"
      >here</a>
      or on<a
        href='https://twitter.com/jovialthunder'
        target="_blank"
        rel="noopener noreferrer"
      >Twitter.</a>

      The to-do list is on<a
        href='https://trello.com/b/e24TNiu1/witchdice'
        target="_blank"
        rel="noopener noreferrer"
      >Trello.</a>
    </p>
  </div>
)

export default WipNotice;
