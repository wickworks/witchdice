import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import { Helmet } from "react-helmet";
import FocusTrap from 'focus-trap-react'
import './XCard.scss';

function getFirebaseDB() {
  return window.firebase.database().ref()
}

let restoreFocusOnElement = null;

const XCard = ({
  setXCardRaisedBy,
  partyConnected,
  partyRoom,
  partyName,
}) => {

  // When we see a new entry in firebase, we put it here.
  // Whenever it changes, we raise the xcard
  const [latestRaiseEvent, setLatestRaiseEvent] = useState(null);

  // ~~ CREATE / UPDATE ~~
  // There's a new kid in town! let's welcome them and add them to the data
  useEffect(() => {
    if (latestRaiseEvent) {

      // was this raise within the last minute?
      var now = Date.now()
      var cutoff = now - 60 * 1000 // 60 seconds ago
      if (latestRaiseEvent.time > cutoff) {
        setXCardRaisedBy(latestRaiseEvent.name)
      }
    }

  }, [latestRaiseEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (partyConnected) {
      try {
        const dbInitiativeRef = getFirebaseDB().child('emotes').child(partyRoom)

        dbInitiativeRef.on('child_changed', (snapshot) => {
          if (snapshot) setLatestRaiseEvent(snapshot.val())
        })

        dbInitiativeRef.on('child_added', (snapshot) => {
          if (snapshot) setLatestRaiseEvent(snapshot.val())
        })

      } catch (error) {
        console.log('ERROR: ',error.message);
      }
    }

  }, [partyConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRaiseButton = () => {
    setXCardRaisedBy(partyName || "me")
    restoreFocusOnElement = document.activeElement

    if (partyConnected) {
      const dbInitiativeRef = getFirebaseDB().child('emotes').child(partyRoom)

      const raiseEvent = {
        name: partyName,
        time: Date.now()
      }
      dbInitiativeRef.child('xcard').set(raiseEvent)
    }
  }

	return (
    <div className='XCard'>
      <button className='touch' onClick={handleRaiseButton}>
        Raise
      </button>

      <a
        href='http://tinyurl.com/x-card-rpg'
        target="_blank"
        rel="noopener noreferrer nofollow"
      >
        ?
      </a>

      <div className='x-card'>
        x-card
      </div>
    </div>
	);
}

function setFlashTimeout(toggle, setToggle, storeTimeout, interval) {
  storeTimeout(
    setTimeout(() => {
      setToggle(!toggle)
      setFlashTimeout(!toggle, setToggle, storeTimeout, interval)
    }, interval)
  )
}

const XCardModal = ({
  raisedBy,
  handleClose,
}) => {
  const [overrideTitle, setOverrideTitle] = useState(true);
  const [currentFlashTimeout, setCurrentFlashTimeout] = useState(null);

  useEffect(() => {
    setFlashTimeout(
      overrideTitle,
      setOverrideTitle,
      setCurrentFlashTimeout,
      2000
    )

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
      if (restoreFocusOnElement) {
        restoreFocusOnElement.focus()
        restoreFocusOnElement = null
      }
    }
  }, []);

  const closeModal = () => {
    clearTimeout(currentFlashTimeout)
    handleClose()
  }

	return ReactDOM.createPortal(
    <FocusTrap>
      <aside
        className='XCardModal'
        aria-modal='true'
        aria-labelledby='whodunnit'
        role='alertdialogue'
        tabIndex='-1'
        onClick={closeModal}
        onKeyDown={e => { if (e.keyCode === 27) closeModal() }}
      >
        <Helmet>
            {overrideTitle && <title>X-card raised</title>}
        </Helmet>

        <div className='popup' onClick={e => e.stopPropagation()}>
          <div className='whodunnit' id='whodunnit'>X-card raised by {raisedBy}.</div>

          <button aria-label="Close" onClick={closeModal} autoFocus>
            OK
          </button>
        </div>
      </aside>
    </FocusTrap>,
    document.body
  );
}



export { XCard, XCardModal };
