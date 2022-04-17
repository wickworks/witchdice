import React from 'react';
import TextInput from '../../shared/TextInput.jsx'
import './QAndA.scss';

const QAndA = ({
  bondData,
  questionData,
  answer,
  setAnswer,
}) => {

  const randomizeAnswer = () => {
    const currentIndex = questionData.options.findIndex(option => option === answer)
    if (currentIndex >= 0) {
      const nextIndex = (currentIndex + 1) % questionData.options.length
      setAnswer(questionData.options[nextIndex])
    } else {
      setAnswer(questionData.options[0])
    }
  }

  return (
    <div className='QAndA'>
      <div className='question'>
        {questionData.question}
        <button onClick={randomizeAnswer}>☈</button>
      </div>
      <div className='answer'>
        <TextInput
          textValue={answer}
          setTextValue={setAnswer}
          maxLength={256}
          placeholder='Answer truthfully.'
        />
      </div>
    </div>
  );
}

export default QAndA ;
