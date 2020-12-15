import React from 'react';
import './LoadinDots.scss';

const LoadinDots = () => (
  <div className="LoadinDots">
    <div className="lds-ellipsis">
      <div />
      <div />
      <div />
      <div />
    </div>
  </div>
);

export default LoadinDots;
