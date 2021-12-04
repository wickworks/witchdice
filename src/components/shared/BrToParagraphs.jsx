import React from 'react';

const BrToParagraphs = ({
  stringWithBrs,
  extraClass = '',
}) => {
  var splits = stringWithBrs.replace(/<p>/g, '');
  splits = splits.split(/<\/p>|<br>/g);

  return (
    splits.map((paragraph, i) =>
      <p className={extraClass} key={`paragraph-${i}`}>{paragraph}</p>
    )
  );
}

export default BrToParagraphs;
