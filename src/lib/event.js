const db = require.main.require('./src/database');
const privileges = require.main.require('./src/privileges');
const plugins = require.main.require('./src/plugins');
const topics = require.main.require('./src/topics');

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
const filterPids = p(privileges.posts.filter);
const fireHook = p(plugins.fireHook);
const getTopicsFields = p(topics.getTopicsFields);
const getTopicField = p(topics.getTopicField);

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
  const keys = await getSortedSetRangeByScore(listKey, 0, -1, startDate, endDate);
  const events = await getObjects(keys);

  const topicsWithCids = await getTopicsFields(events.map(ev => ev.tid), ['cid']);

  return events.map((ev, i) => ({
    ...ev,
    cid: topicsWithCids[i].cid,
  }));
};

const eventExists = pid => exists(`${listKey}:pid:${pid}`);

const getEvent = async pid => {
  const event = await getObject(`${listKey}:pid:${pid}`);
  const { cid } = await getTopicField(event.tid, 'cid');

  return {
    ...event,
    cid,
  };
};

const filterByPid = (events, uid) =>
  filterPids('read', events.map(e => e.pid), uid)
  .then(filtered => events.filter(e => filtered.includes(e.pid)));

const escapeEvent = async event => {
  const [location, description] = await Promise.all([
    fireHook('filter:parse.raw', event.location),
    fireHook('filter:parse.raw', event.description),
  ]);

  return {
    ...event,
    location,
    description,
  };
};

export {
  deleteEvent,
  saveEvent,
  eventExists,
  getEvent,
  getEventsByDate,
  filterByPid,
  escapeEvent,
};
