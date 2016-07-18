const db = require.main.require('./src/database');

import Promise from 'bluebird';
import { removeAll as removeAllResponses } from './responses';

const p = Promise.promisify;

const sortedSetAdd = p(db.sortedSetAdd);
const sortedSetRemove = p(db.sortedSetRemove);
const getSortedSetRangeByScore = p(db.getSortedSetRangeByScore);
const setObject = p(db.setObject);
const getObject = p(db.getObject);
const getObjects = p(db.getObjects);
const deleteKey = p(db.delete);
const exists = p(db.exists);

const listKey = 'plugins:calendar:events';

const saveEvent = event => Promise.all([
  sortedSetAdd(listKey, event.startDate, `${listKey}:pid:${event.pid}`),
  setObject(`${listKey}:pid:${event.pid}`, event),
]);

const deleteEvent = pid => Promise.all([
  sortedSetRemove(listKey, `${listKey}:pid:${pid}`),
  deleteKey(`${listKey}:pid:${pid}`),
  removeAllResponses(pid),
]);

const getEventsByDate = async (startDate, endDate) => {
  const keys = await getSortedSetRangeByScore(listKey, null, null, startDate, endDate);
  const events = await getObjects(keys);

  return events;
};

const eventExists = pid => exists(`${listKey}:pid:${pid}`);

const getEvent = pid => getObject(`${listKey}:pid:${pid}`);

export { deleteEvent, saveEvent, eventExists, getEvent, getEventsByDate };
