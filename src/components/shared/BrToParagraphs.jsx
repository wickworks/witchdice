import React from 'react';

const BrToParagraphs = ({
  stringWithBrs,
}) => {
  return (
    stringWithBrs.split('<br>').map((paragraph, i) =>
      <p key={`paragraph-${i}`}>{paragraph}</p>
    )
  );
}

export default BrToParagraphs;
