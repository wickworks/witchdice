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
  // Not actual p tags anymore because validateDOMNesting kept complaining about uls inside of them
  return (
    splits.map((paragraph, i) =>
      <div className={`paragraph ${extraClass}`} key={`paragraph-${i}`}>
        {ReactHtmlParser(paragraph)}
      </div>
    )
  );
}

export default BrToParagraphs;
