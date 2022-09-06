/* eslint-disable no-undef, import/no-extraneous-dependencies, import/no-unresolved, import/extensions, max-len */
import { combineReducers, createStore } from 'redux';
/* eslint-enable */
import { resetSSRCache } from './cache';
import * as packageReducers from '../../shared/reducers';
import { createCollectionReducers } from '../../shared/reducers/utils';
import * as optionalReducers from '../../shared/reducers/optionals';
import {
  collectionAdd,
  collectionChange,
  collectionRemove,
} from '../../shared/actions/utils';


const createAppAndPackageStore = (appReducers, appCursors, platformTransformers, storeEnhancers) => {
  let isStoreInitDone = false;
  const cursorNames = Object.keys(appCursors);
  const cursorReducers = createCollectionReducers(cursorNames);
  // Create a redux store
  const allReducers = combineReducers({ ...appReducers, ...packageReducers, ...cursorReducers, ...(!platformTransformers ? optionalReducers : {}) });

  const store = createStore(allReducers, {}, storeEnhancers);
  // Observe changes on cursors from the app
  cursorNames.forEach((cursorName) => {
    const cursor = appCursors[cursorName];
    cursor.observeChanges({
      added(id, fields) {
        if (isStoreInitDone) {
          resetSSRCache();
        }
        store.dispatch(collectionAdd(cursorName, id, fields));
      },
      changed(id, fields) {
        resetSSRCache();
        store.dispatch(collectionChange(cursorName, id, fields));
      },
      removed(id) {
        resetSSRCache();
        store.dispatch(collectionRemove(cursorName, id));
      },
    });
  });
  isStoreInitDone = true;

  return store;
};

export default createAppAndPackageStore;
