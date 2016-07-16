const db = require.main.require('./src/database');

import Promise from 'bluebird';
import { removeAll as removeAllResponses } from './responses';

const p = Promise.promisify;

const sortedSetAdd = p(db.sortedSetAdd);
const setObject = p(db.setObject);
const deleteKey = p(db.delete);
const sortedSetRemove = p(db.sortedSetRemove);

const listKey = 'plugins:calendar:events';

const saveEvent = event => Promise.all([
  sortedSetRemove(listKey, `${listKey}:pid:${event.pid}`),
  sortedSetAdd(listKey, event.startDate, `${listKey}:pid:${event.pid}`),
  setObject(`${listKey}:pid:${event.pid}`, event),
]);

const deleteEvent = pid => Promise.all([
  sortedSetRemove(listKey, `${listKey}:pid:${event.pid}`),
  deleteKey(`${listKey}:pid:${event.pid}`),
  removeAllResponses(pid),
]);

export { deleteEvent, saveEvent };
