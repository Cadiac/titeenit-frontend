import { StoreProvider } from 'easy-peasy';
import * as React from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { render } from 'react-dom';
import { GameManager } from './GameManager';
import './globalstyles.scss';
import { store } from './store';

// TOOD: what is this hack about?
/Mobile/.test(window.navigator.userAgent) &&
  !window.location.hash &&
  setTimeout(function () {
    if (!window.pageYOffset) window.scrollTo(0, 1);
  }, 500);

// both store providers to support class components (connect)
function Root() {
  return (
    <StoreProvider store={store}>
      <GameManager />
    </StoreProvider>
  );
}

render(<Root />, document.getElementById('root'));
