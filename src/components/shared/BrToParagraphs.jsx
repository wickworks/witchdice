import React from 'react';

// const turndownService = new TurndownService()
import ReactHtmlParser from 'react-html-parser';


const BrToParagraphs = ({
  stringWithBrs,
  extraClass = '',
  limitToFirstParagraph = false,
}) => {
  var splits = stringWithBrs.replace(/<p>/g, '');
  splits = splits.split(/<\/p>|<br>/g);

  if (limitToFirstParagraph) splits = [splits[0]]

  // {turndownService.turndown(paragraph)}
  return (
    splits.map((paragraph, i) =>
      <p className={extraClass} key={`paragraph-${i}`}>
        {ReactHtmlParser(paragraph)}
      </p>
    )
  );
}

export default BrToParagraphs;
