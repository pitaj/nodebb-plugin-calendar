import Promise from 'bluebird';
import ICAL from 'ical.js';
import rp from 'request-promise';
import { removeAll as removeAllResponses } from './responses';

const db = require.main.require('./src/database');
const plugins = require.main.require('./src/plugins');
const posts = require.main.require('./src/posts');

const p = Promise.promisify;

const sortedSetAdd = p(db.sortedSetAdd);
const sortedSetRemove = p(db.sortedSetRemove);
const getSortedSetRangeByScore = p(db.getSortedSetRangeByScore);
const getSortedSetRange = p(db.getSortedSetRange);
const setObject = p(db.setObject);
const getObject = p(db.getObject);
const getObjects = p(db.getObjects);
const deleteKey = p(db.delete);
const exists = p(db.exists);
const fireHook = p(plugins.fireHook);
const getCidsByPids = p(posts.getCidsByPids);
const getCidByPid = p(posts.getCidByPid);

const listKey = 'plugins:calendar:events';
const listExternalKey = 'plugins:calendar:icals';
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
    deleteKey(objectKey),
    removeAllResponses(data.post.pid),
  ]);
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
  const keys = byStart.filter(x => byEnd.includes(x));

  const events = await getObjects(keys);

  const cids = await getCidsByPids(events.map(event => event.pid));

  return events.map((event, i) => ({
    ...event,
    cid: cids[i],
    startDate: parseInt(event.startDate, 10),
    endDate: parseInt(event.endDate, 10),
    repeats: (typeof event.repeats === 'string') ? JSON.parse(event.repeats) : event.repeats,
    mandatory: event.mandatory === true || event.mandatory === 'true',
    allday: event.allday === true || event.allday === 'true',
  }));
};

const getExternalEventsByDate = async (startDate, endDate) => {
  const keys = await getSortedSetRange(listExternalKey, 0, -1);
  const events = await getObjects(keys.map((key) => 'plugins:calendar:ical:' + key));
  const preparedEvents = [];

  await Promise.all(
    events.filter((event) => event.url).map(async (event) => {
      const body = await rp(event.url);
      const jcalData = ICAL.parse(body);
      const vcalendar = new ICAL.Component(jcalData);
      const vevents = await Promise.all(
        vcalendar.getAllSubcomponents('vevent').filter((vevent) => {
          const dtstart = vevent.getFirstPropertyValue('dtstart');
          const dtend = vevent.getFirstPropertyValue('dtend');

          return (dtstart.toUnixTime() + '000') >= startDate && (dtend.toUnixTime() + '999') <= endDate;
        }).map(async (vevent) => {
          const dtstart = vevent.getFirstPropertyValue('dtstart');
          const dtend = vevent.getFirstPropertyValue('dtend');
          const summary = vevent.getFirstPropertyValue('summary') || '';
          const location = vevent.getFirstPropertyValue('location') || '';
          const url = vevent.getFirstPropertyValue('url') || '';
          const description = (vevent.getFirstPropertyValue('description') || '')
            .replace(/^\s+/g, '')
            .replace(/\n/g, '<br>');

          return {
            external: true,
            source: event.name,
            url: url,

            allday: true,
            day: dtstart.toString().substring(0,10),
            description: description,
            endDate: Number(dtend.toUnixTime() + '999'),
            location: location,
            name: summary,
            startDate: Number(dtstart.toUnixTime() + '000'),
          }
        })
      );

      preparedEvents.push(...vevents);
      return
    })
  );

  return preparedEvents;
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

const getEventsEndingAfter = async (endDate) => {
  const keys = await getSortedSetRangeByScore(listByEndKey, 0, -1, endDate, +Infinity);
  const events = await getObjects(keys);

  return events;
};

const eventExists = pid => exists(`${listKey}:pid:${pid}`);

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
  getExternalEventsByDate,
  escapeEvent,
  getAllEvents,
  listKey,
  listExternalKey,
  listByEndKey,
  getEventsEndingAfter,
};
