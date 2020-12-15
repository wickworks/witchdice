import React from 'react';
import './LoadinSpinner.scss';

const LoadinSpinner = () => (
  <div className="LoadinSpinner">
    <div className="lds-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
);

export default LoadinSpinner;
