import React from 'react';
import './QAndA.scss';

const QAndA = ({
  question,
  answer
}) => {

  return (
    <div className='QAndA'>
      <div className='question'>
        {question}
      </div>
      <div className='answer'>
        {answer}
      </div>
    </div>
  );
}

export default QAndA ;
