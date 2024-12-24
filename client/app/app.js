/**
 *
 * app.js
 *
 */

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

import store, { history } from './store';
import { SocketProvider } from './contexts/Socket';
import { SET_AUTH } from './containers/Authentication/constants';
import Application from './containers/Application';
import ScrollToTop from './scrollToTop';
import setToken from './utils/token';

import { sendInteractionsToBackend } from './utils/interactionTracker';
import ChatWithAI from './components/Common/ChatWithAI';

// Import application sass styles
import './styles/style.scss';

// Import Font Awesome Icons Set
import 'font-awesome/css/font-awesome.min.css';

// Import Simple Line Icons Set
import 'simple-line-icons/css/simple-line-icons.css';

// react-bootstrap-table2 styles
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

// rc-slider style
import 'rc-slider/assets/index.css';

// Authentication
const token = localStorage.getItem('token');

if (token) {
  // authenticate api authorization
  setToken(token);

  // authenticate routes
  store.dispatch({ type: SET_AUTH });
}

const App = () => {
  // Add periodic interaction sending
  useEffect(() => {
    const interval = setInterval(() => {
      sendInteractionsToBackend(); // Send interactions every 5 minutes
    }, 5 * 60 * 1000); // Interval in milliseconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <SocketProvider>
          <ScrollToTop>
            <Application />
            <ChatWithAI />
          </ScrollToTop>
        </SocketProvider>
      </ConnectedRouter>
    </Provider>
  );
};

export default App;
