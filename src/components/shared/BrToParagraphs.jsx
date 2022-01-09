import React from 'react';

import TurndownService from 'turndown';
const turndownService = new TurndownService()


const BrToParagraphs = ({
  stringWithBrs,
  extraClass = '',
  limitToFirstParagraph = false,
}) => {
  var splits = stringWithBrs.replace(/<p>/g, '');
  splits = splits.split(/<\/p>|<br>/g);

  if (limitToFirstParagraph) splits = [splits[0]]

  return (
    splits.map((paragraph, i) =>
      <p className={extraClass} key={`paragraph-${i}`}>
        {turndownService.turndown(paragraph)}
      </p>
    )
  );
}

export default BrToParagraphs;
