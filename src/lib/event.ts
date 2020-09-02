import validator from 'validator';
import { removeAll as removeAllResponses } from './responses';
import { Repeats } from './repetition';

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
} = require.main?.require('./src/database');
const { fireHook } = require.main?.require('./src/plugins');
const { getCidsByPids, getCidByPid } = require.main?.require('./src/posts');

const listKey = 'plugins:calendar:events';
const listByEndKey = `${listKey}:byEnd`;

export type Keys = 'name' | 'allday' | 'startDate' | 'endDate' | 'reminders' | 'location' | 'description' | 'mandatory' | 'repeats';

interface Responses {
  [uid: number]: 'yes' | 'maybe' | 'no',
}

export interface EventInfo {
  name: string,
  startDate: number,
  endDate: number,
  reminders: number[],
  mandatory: boolean,
  allday: boolean,
  location: string,
  description: string,
  repeats: null | Repeats,
  day?: string,
  responses?: Responses,
}

export interface Event extends EventInfo {
  pid: number,
  uid: number,
}

interface JsonEvent {
  pid: number | string,
  uid: number | string,
  name: string,
  startDate: number | string,
  endDate: number | string,
  reminders: string,
  mandatory: boolean | string,
  allday: boolean | string,
  location: string,
  description: string,
  repeats: null | string,
}

const saveEvent = async (event: Event): Promise<void> => {
  const objectKey = `${listKey}:pid:${event.pid}`;
  const endDate = event.repeats ? event.repeats.endDate || 9999999999999 : event.endDate;

  const eventData: JsonEvent = {
    ...event,
    reminders: JSON.stringify(event.reminders),
    repeats: JSON.stringify(event.repeats),
  };

  await Promise.all([
    sortedSetAdd(listKey, eventData.startDate, objectKey),
    sortedSetAdd(listByEndKey, endDate, objectKey),
    setObject(objectKey, eventData),
  ]);
};

const deleteEvent = async (data: { post: { pid: number } }): Promise<void> => {
  const objectKey = `${listKey}:pid:${data.post.pid}`;
  await Promise.all([
    sortedSetRemove(listKey, objectKey),
    sortedSetRemove(listByEndKey, objectKey),
  ]);
};

const restoreEvent = async (data: { post: { pid: number } }): Promise<void> => {
  const objectKey = `${listKey}:pid:${data.post.pid}`;
  const event: JsonEvent = await getObject(objectKey);

  if (!event) {
    return;
  }

  let repeats;
  try {
    repeats = event.repeats && JSON.parse(event.repeats);
  } catch (e) {
    repeats = null;
  }

  const endDate = repeats ? (repeats.endDate || 9999999999999) : event.endDate;

  await Promise.all([
    sortedSetAdd(listKey, event.startDate, objectKey),
    sortedSetAdd(listByEndKey, endDate, objectKey),
  ]);
};

const purgeEvent = async (data: { post: { pid: number } }): Promise<void> => {
  const objectKey = `${listKey}:pid:${data.post.pid}`;
  await Promise.all([
    deleteKey(objectKey),
    removeAllResponses(data.post.pid),
  ]);
};

const fixEvent = (event: JsonEvent): Event => {
  let repeats;
  try {
    repeats = event.repeats && JSON.parse(event.repeats);
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
    pid: parseInt(event.pid.toString(), 10),
    uid: parseInt(event.uid.toString(), 10),
    repeats,
    reminders,
    startDate: parseInt(event.startDate.toString(), 10),
    endDate: parseInt(event.endDate.toString(), 10),
    mandatory: event.mandatory === true || event.mandatory === 'true',
    allday: event.allday === true || event.allday === 'true',
  };
};

export interface EventWithCid extends Event {
  cid: number,
}

export interface EventWithDeleted extends EventWithCid {
  topicDeleted: boolean,
}

const getEventsByDate = async (startDate: number, endDate: number): Promise<EventWithCid[]> => {
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
  const [byStart, byEnd]: [string[], string[]] = await Promise.all([
    // events that start before end date
    getSortedSetRangeByScore(listKey, 0, -1, 0, endDate),
    // events that end after start date
    getSortedSetRangeByScore(listByEndKey, 0, -1, startDate, +Infinity),
  ]);
  // filter to events that only start before the endDate and end after the startDate
  const byEndSet = new Set(byEnd);
  const keys = byStart.filter(x => byEndSet.has(x));

  const events: JsonEvent[] = (await getObjects(keys)).filter(Boolean);
  const cids = await getCidsByPids(events.map(event => event.pid));

  return events.map(fixEvent).map((event, i) => ({
    ...event,
    cid: cids[i],
  }));
};

const getAllEvents = async (): Promise<Event> => {
  const keys = await getSortedSetRange(listKey, 0, -1);
  const events = (await getObjects(keys)).filter(Boolean);

  return events.map(fixEvent);
};

const getEvent = async (pid: number): Promise<EventWithCid> => {
  const event = await getObject(`${listKey}:pid:${pid}`);
  const cid = await getCidByPid(event.pid);

  return {
    ...fixEvent(event),
    cid,
  };
};

const getEventsEndingAfter = async (endDate: number): Promise<Event[]> => {
  const keys = await getSortedSetRangeByScore(listByEndKey, 0, -1, endDate, +Infinity);
  const events = (await getObjects(keys)).filter(Boolean);

  return events.map(fixEvent);
};

const eventExists = (pid: number): Promise<boolean> => exists(`${listKey}:pid:${pid}`);

const escapeEvent = async <T extends Event>(event: T): Promise<T> => {
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
