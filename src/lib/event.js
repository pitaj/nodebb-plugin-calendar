import validator from 'validator';
import { removeAll as removeAllResponses } from './responses';

const {
  sortedSetAdd,
  sortedSetRemove,
  getSortedSetRange,
  getSortedSetRangeByScore,
  setObject,
  getObject,
  getObjects,
  exists,
  delete: deleteKey,
} = require.main.require('./src/database');
const { fireHook } = require.main.require('./src/plugins');
const { getCidsByPids, getCidByPid } = require.main.require('./src/posts');

const listKey = 'plugins:calendar:events';
const listByEndKey = `${listKey}:byEnd`;

const saveEvent = (event) => {
  const objectKey = `${listKey}:pid:${event.pid}`;
  const endDate = event.repeats ? event.repeats.endDate || 9999999999999 : event.endDate;

  return Promise.all([
    sortedSetAdd(listKey, event.startDate, objectKey),
    sortedSetAdd(listByEndKey, endDate, objectKey),
    setObject(objectKey, event),
  ]);
};

const deleteEvent = (data) => {
  const objectKey = `${listKey}:pid:${data.post.pid}`;
  return Promise.all([
    sortedSetRemove(listKey, objectKey),
    sortedSetRemove(listByEndKey, objectKey),
  ]);
};

const restoreEvent = async (data) => {
  const objectKey = `${listKey}:pid:${data.post.pid}`;
  const event = await getObject(objectKey);

  if (!event) {
    return null;
  }

  const endDate = event.repeats ? (event.repeats.endDate || 9999999999999) : event.endDate;

  return Promise.all([
    sortedSetAdd(listKey, event.startDate, objectKey),
    sortedSetAdd(listByEndKey, endDate, objectKey),
  ]);
};

const purgeEvent = (data) => {
  const objectKey = `${listKey}:pid:${data.post.pid}`;
  return Promise.all([
    deleteKey(objectKey),
    removeAllResponses(data.post.pid),
  ]);
};

const fixEvent = (event) => {
  let repeats;
  try {
    repeats = JSON.parse(event.repeats);
  } catch (e) {
    repeats = null;
  }
  let reminders;
  try {
    reminders = JSON.parse(event.reminders);
  } catch (e) {
    reminders = [];
  }

  return {
    ...event,
    repeats,
    reminders,
    startDate: parseInt(event.startDate, 10),
    endDate: parseInt(event.endDate, 10),
    mandatory: event.mandatory === true || event.mandatory === 'true',
    allday: event.allday === true || event.allday === 'true',
  };
};

const getEventsByDate = async (startDate, endDate) => {
  // may be possible eventually
  // except I need to do the intersection, not the union, of the sets
  // and I want events whose start date could be before the month starts
  // and whose end date could be after the month ends

  // const keys = await getSortedSetRangeByScore([
  //   listKey,
  //   listByEndKey,
  // ], 0, -1, startDate, endDate);

  // for now we have to do this,
  // and hope it isn't too hard on memory
  const [byStart, byEnd] = await Promise.all([
    // events that start before end date
    getSortedSetRangeByScore(listKey, 0, -1, 0, endDate),
    // events that end after start date
    getSortedSetRangeByScore(listByEndKey, 0, -1, startDate, +Infinity),
  ]);
  // filter to events that only start before the endDate and end after the startDate
  const keys = byStart.filter((x) => byEnd.includes(x));

  const events = (await getObjects(keys)).filter(Boolean);
  const cids = await getCidsByPids(events.map((event) => event.pid));

  return events.map(fixEvent).map((event, i) => ({
    ...event,
    cid: cids[i],
  }));
};

const getAllEvents = async () => {
  const keys = await getSortedSetRange(listKey, 0, -1);
  const events = (await getObjects(keys)).filter(Boolean);

  return events.map(fixEvent);
};

const getEvent = async (pid) => {
  const event = await getObject(`${listKey}:pid:${pid}`);
  const cid = await getCidByPid(event.pid);

  return {
    ...fixEvent(event),
    cid,
  };
};

const getEventsEndingAfter = async (endDate) => {
  const keys = await getSortedSetRangeByScore(listByEndKey, 0, -1, endDate, +Infinity);
  const events = (await getObjects(keys)).filter(Boolean);

  return events.map(fixEvent);
};

const eventExists = (pid) => exists(`${listKey}:pid:${pid}`);

const escapeEvent = async (event) => {
  const [location, description] = await Promise.all([
    fireHook('filter:parse.raw', event.location || ''),
    fireHook('filter:parse.raw', event.description || ''),
  ]);

  return {
    ...event,
    name: validator.escape(event.name),
    location,
    description,
  };
};

export {
  deleteEvent,
  restoreEvent,
  purgeEvent,
  saveEvent,
  eventExists,
  getEvent,
  getEventsByDate,
  escapeEvent,
  getAllEvents,
  listKey,
  listByEndKey,
  getEventsEndingAfter,
};
