
import React from 'react';
import { Router } from "react-router-dom";

import { fireEvent, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import ModeChooser from './ModeChooser';

// Set up an isolated history/router

const history = createMemoryHistory();
const route = '/rollmode/simple';
history.push(route);

// Tests to make sure titles/descriptions render properly.
test('renders settings link even when empty array is passed to enabledPages.', () => {

  const { queryAllByText } = render(
    <Router history={history}>
      <ModeChooser enabledPages={[]}/>
    </Router>,
  );
  const linkElement = queryAllByText(/Settings/i)[0];
  expect(linkElement).toBeInTheDocument();
});

test('renders settings description even when empty array is passed to enabledPages.', () => {

  const { queryAllByText } = render(
    <Router history={history}>
      <ModeChooser enabledPages={[]}/>
    </Router>,
  );
  const linkElement = queryAllByText(/Settings, tips, and tricks./i)[0];
  expect(linkElement).toBeInTheDocument();
});

test('renders mode title when one mode is passed to enabledPages.', () => {
  const { queryAllByText } = render(
    <Router history={history}>
      <ModeChooser enabledPages={{'simple': true}}/>
    </Router>,
  );
  const linkElement = queryAllByText(/Simple/i)[0];
  expect(linkElement).toBeInTheDocument();
});

test('renders mode description when one mode is passed to enabledPages.', () => {
  const { queryAllByText } = render(
    <Router history={history}>
      <ModeChooser enabledPages={{'simple': true}}/>
    </Router>,
  );
  const linkElement = queryAllByText(/Just a bag of dice & a table to share./i)[0];
  expect(linkElement).toBeInTheDocument();
});


test('renders all mode titles when multiple modes are passed to enabledPages.', () => {
  const { queryAllByText } = render(
    <Router history={history}>
      <ModeChooser enabledPages={{'simple': true, '5e':true, 'lancer': true}}/>
    </Router>,
  );

  const simpleElement = queryAllByText(/Simple/i)[0];
  const dndElement = queryAllByText(/D&D 5e/i)[0];
  const lancerElement = queryAllByText(/Lancer/i)[0];

  expect(simpleElement).toBeInTheDocument();
  expect(dndElement).toBeInTheDocument();
  expect(lancerElement).toBeInTheDocument();

});

test('renders all mode descriptions when multiple modes are passed to enabledPages.', () => {
  const { queryAllByText } = render(
    <Router history={history}>
      <ModeChooser enabledPages={{'simple': true, '5e':true, 'lancer': true}}/>
    </Router>,
  );
  const simpleElement = queryAllByText(/Just a bag of dice & a table to share./i)[0];
  const dndElement = queryAllByText(/Damage roller and initiative tracker for D&D 5e./i)[0];
  const lancerElement = queryAllByText(/A mud-and-lasers RPG of modular mechs and the pilots that crew them./i)[0];

  expect(simpleElement).toBeInTheDocument();
  expect(dndElement).toBeInTheDocument();
  expect(lancerElement).toBeInTheDocument();
});

test('should not render links for random / unregistered modes', () => {
  const { queryAllByText } = render(
    <Router history={history}>
      <ModeChooser enabledPages={{'simple': true, 'foo': true, 'bar': true}}/>
    </Router>,
  );
  const linkElements = queryAllByText(/Simple/i)[0];
  expect(linkElements.length).toEqual();

  const fooElements = queryAllByText(/Foo/i);
  expect(fooElements.length).toEqual(0)

});

test('does not render modes that are set to false.', () => {
  const { queryAllByText } = render(
    <Router history={history}>
      <ModeChooser enabledPages={{'simple': true, '5e':false, 'lancer': true}}/>
    </Router>,
  );
  
  const simpleElement = queryAllByText(/Simple/i)[0];
  const dndElement = queryAllByText(/D&D 5e/i);
  const lancerElement = queryAllByText(/Lancer/i)[0];

  expect(simpleElement).toBeInTheDocument();
  expect(dndElement.length).toEqual(0);
  expect(lancerElement).toBeInTheDocument();
});

// tests that links point to the right routes

test('click on "settings" link triggers re-route to "/setting"', () => {
  const { queryAllByText } = render(
    <Router history={history}>
      <ModeChooser enabledPages={{}}/>
    </Router>,
  );

  const simpleElement = queryAllByText(/Settings/i)[0];
  expect(history.location.pathname).toEqual('/rollmode/simple')

  fireEvent.click(simpleElement);

  expect(history.location.pathname).toEqual('/settings');

  history.goBack()
})

test('click on "simple" link triggers re-route to "/simple"', () => {
  const { queryByText } = render(
    <Router history={history}>
      <ModeChooser enabledPages={{'simple': true}}/>
    </Router>,
  );

  const simpleElement = queryByText(/Simple/i);
  expect(history.location.pathname).toEqual('/rollmode/simple')

  fireEvent.click(simpleElement);

  expect(history.location.pathname).toEqual('/simple')
  history.goBack();
})