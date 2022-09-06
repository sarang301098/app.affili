import { WebApp } from 'meteor/webapp';
import { Meteor } from 'meteor/meteor';
import { createRouter, resetSSRCache, logger } from 'meteor/ssrwpo:ssr';
import express from 'express';
import helmet from 'helmet';

import MainApp from '../imports/app/main';
import * as appReducers from '../imports/reducers';
import storeSubscription from '../imports/store';


// localization resources
import localization from '../imports/messages';

// Webhooks
import webhooks from './routes';

// Set logger
let LOG_LEVEL = 'error';
if (process.env.NODE_ENV !== 'production') {
  LOG_LEVEL = 'debug';
}

const webhooksApp = express();
webhooksApp.use(helmet({
  frameguard: false,
  noSniff: false,
  dnsPrefetchControl: false
}));
Object.keys(webhooks).forEach((webhookRoute) => {
  webhooksApp.all(webhookRoute, webhooks[webhookRoute]);
});
WebApp.connectHandlers.use(Meteor.bindEnvironment(webhooksApp));

const appCursors = {};

logger.info('Starting router');

// Your MainApp as the top component rendered and injected in the HTML payload
createRouter(MainApp, {
// Optional: initial localization
  localization,
}, {
  appReducers,
  appCursors,
  // Optional: An object containing the cursors required as data context
  // Optional: Store subscription
  storeSubscription,
  // Optional: An object containing your application reducers
  routes: {
    options: {
      enableCaching: true,
    }
  },
});

// The application needs to instigate it's own SSR cache refreshing policy. This allows
// you to choose your own frequency for cache resets, and to handl your own policy
// for rendering external data souces.
//
// In this example we simply reset the entire cache if any of the collections change.

const globalCollections = [];
globalCollections.forEach((collection) => {
  let initializing = true;
  collection.find().observeChanges({
    added: () => { if (!initializing) resetSSRCache(); },
    changed: () => resetSSRCache(),
    removed: () => resetSSRCache(),
  });
  initializing = false;
});
resetSSRCache();

logger.info('Router started');
