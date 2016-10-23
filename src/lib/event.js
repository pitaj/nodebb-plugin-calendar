const db = require.main.require('./src/database');
const plugins = require.main.require('./src/plugins');
const posts = require.main.require('./src/posts');

import Promise from 'bluebird';
import { removeAll as removeAllResponses } from './responses';

const p = Promise.promisify;

const sortedSetAdd = p(db.sortedSetAdd);
const sortedSetRemove = p(db.sortedSetRemove);
const getSortedSetRangeByScore = p(db.getSortedSetRangeByScore);
const getSortedSetRange = p(db.getSortedSetRange);
// const getObjectsFields = p(db.getObjectsFields);
const setObject = p(db.setObject);
const getObject = p(db.getObject);
const getObjects = p(db.getObjects);
const deleteKey = p(db.delete);
const exists = p(db.exists);
const fireHook = p(plugins.fireHook);
const getCidsByPids = p(posts.getCidsByPids);
const getCidByPid = p(posts.getCidByPid);

const listKey = 'plugins:calendar:events';
const listByEndKey = `${listKey}:byEnd`;

const saveEvent = (event) => {
  const objectKey = `${listKey}:pid:${event.pid}`;
  return Promise.all([
    sortedSetAdd(listKey, event.startDate, objectKey),
    sortedSetAdd(listByEndKey, event.endDate, objectKey),
    setObject(objectKey, event),
  ]);
};

const deleteEvent = (pid) => {
  const objectKey = `${listKey}:pid:${pid}`;
  return Promise.all([
    sortedSetRemove(listKey, objectKey),
    sortedSetRemove(listByEndKey, objectKey),
    deleteKey(objectKey),
    removeAllResponses(pid),
  ]);
};

const getEventsByDate = async (startDate, endDate) => {
  // should be possible eventually
  // const keys = await getSortedSetRangeByScore([
  //   listKey,
  //   listByEndKey,
  // ], 0, -1, startDate, endDate);

  // for now we have to do this:
  const [byStart, byEnd] = await Promise.all([
    getSortedSetRangeByScore(listKey, 0, -1, startDate, endDate),
    getSortedSetRangeByScore(listByEndKey, 0, -1, startDate, endDate),
  ]);
  const temp = byStart.concat(byEnd);
  const keys = temp.filter((x, i) => temp.indexOf(x) === i);

  const events = await getObjects(keys);

  const cids = await getCidsByPids(events.map((event) => event.pid));

  return events.map((event, i) => ({
    ...event,
    cid: cids[i],
  }));
};

const getAllEvents = async () => {
  const keys = await getSortedSetRange(listKey, 0, -1);
  const events = await getObjects(keys);

  return events;
};

const getEvent = async (pid) => {
  const event = await getObject(`${listKey}:pid:${pid}`);
  const cid = await getCidByPid(event.pid);

  return {
    ...event,
    cid,
  };
};

const eventExists = (pid) => exists(`${listKey}:pid:${pid}`);

const escapeEvent = async (event) => {
  const [location, description] = await Promise.all([
    fireHook('filter:parse.raw', event.location || ''),
    fireHook('filter:parse.raw', event.description || ''),
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
  escapeEvent,
  getAllEvents,
};
