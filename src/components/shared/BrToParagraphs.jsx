import React from 'react';

const BrToParagraphs = ({
  stringWithBrs,
}) => {
  var splits = stringWithBrs.replace(/<p>/g, '');
  splits = splits.split(/<\/p>|<br>/g);

  return (
    splits.map((paragraph, i) =>
      <p key={`paragraph-${i}`}>{paragraph}</p>
    )
  );
}

export default BrToParagraphs;
