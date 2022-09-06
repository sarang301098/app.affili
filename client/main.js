import { createRouter, logger, getStore } from 'meteor/ssrwpo:ssr';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import promise from 'redux-promise';

import * as appReducers from '../imports/reducers';
import MainApp from '../imports/app/main';
import storeSubscription from '../imports/store';
import localization from '../imports/messages';
import { Meteor } from "meteor/meteor";

// Set logger
let LOG_LEVEL = 'error';
if (process.env.NODE_ENV !== 'production') {
  LOG_LEVEL = 'debug';
}
if (logger.level) {
  logger.level = LOG_LEVEL;
}

// Middlewares
const appMiddlewares = [thunk, promise];
if (process.env.NODE_ENV !== 'production') {
  // Logs in development
  appMiddlewares.push(createLogger({
    actionTransformer(action) { return { ...action, type: String(action.type) }; },
  }));
}

const appCursorNames = ['Bots', 'Plans'];

logger.info('Starting router');
createRouter({
  // Your MainApp as the top component that will get rendered in <div id='react' />
  MainApp,
  // Optional: Store subscription
  storeSubscription,
  // Optional: An object containing your application reducers
  appReducers,
  // Optional: An array of your redux middleware of choice
  appMiddlewares,
  // Optional: An array of your collection names
  appCursorNames,
  // Optional: Add a redux store that watches for URL changes
  hasUrlStore: true,
  // Optional: An i18n config for client side
  localization,
})
  .then(() => {
    // For easing debug
    window.store = getStore();
    logger.info('Router started');

    window.impersonate = (userId) => {
      Meteor.call('impersonate', userId, (err) => {
        if (!err) {
          Meteor.connection.setUserId(userId);
        }
      });
    };

    if (location.search && location.search.indexOf('?impersonate=') === 0) {
      window.impersonate(location.search.substr('?impersonate='.length));
    }
  });
