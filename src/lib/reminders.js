const db = require.main.require('./src/database');
const notifications = require.main.require('./src/notifications');
const posts = require.main.require('./src/posts');
const meta = require.main.require('./src/meta');

// import { fork } from 'child_process';
import { getAll as getResponses } from './responses';
import moment from 'moment';
import Promise from 'bluebird';
const p = Promise.promisify;

const getSortedSetRange = p(db.getSortedSetRange);
const getObjectsFields = p(db.getObjectsFields);
const createNotif = p(notifications.create);
const pushNotif = p(notifications.push);
const getPostField = p(posts.getPostField);
const getSetting = p(meta.settings.getOne);

const listKey = 'plugins:calendar:events';

const getAll = async () => {
  const keys = await getSortedSetRange(listKey, 0, -1);
  const events = await getObjectsFields(keys, ['pid', 'reminders', 'startDate']);

  return events;
};

const notify = async ({ event, reminder, message }) => {
  let uids;
  // if reminder is for the event start
  // notify 'maybe' and 'yes' responders
  // otherwise, notify only 'yes' responders
  if (reminder === 0) {
    const responses = await getResponses({
      pid: event.pid,
      selection: ['yes', 'maybe'],
    });
    uids = [...responses.yes, ...responses.maybe];
  } else {
    const responses = await getResponses({
      pid: event.pid,
      selection: ['yes'],
    });
    uids = responses.yes;
  }

  const content = await getPostField(event.pid, 'content');
  const notif = await createNotif({
    bodyShort: `[[calendar:event_starting, ${message}, ${event.name}]]`,
    bodyLong: content,
    nid: `plugin-calendar:tid:${event.tid}:pid:${event.pid}:event`,
    pid: event.pid,
    tid: event.tid,
    from: event.uid,
    path: `/post/${event.pid}`,
    importance: 1,
  });
  await pushNotif(notif, uids);
};

const initNotifierDaemon = async () => {
  // ms between checking for reminders
  // pulled from settings
  const checkingInterval = await getSetting('plugin-calendar', 'checkingInterval');

  const checkReminders = async () => {
    // timespan we check is a checkingInterval in the future
    // so as to avoid sending notifications too late
    const start = Date.now() + checkingInterval;
    const end = start + checkingInterval;

    const events = await getAll();

    const mom = moment(start);

    await Promise.all(
      events
      .map(event => {
        const reminder = [0, ...event.reminders].find(r => {
          const remDate = event.startDate - r;
          return remDate > start && remDate < end;
        });
        if (reminder === 0) {
          return {
            event,
            reminder,
            message: '[[calendar:now]]',
          };
        }
        if (reminder) {
          const message = mom.to(event.startDate);
          return { event, reminder, message };
        }
        return null;
      })
      .filter(Boolean)
      .map(notify)
    );
  };

  const daemon = () => {
    checkReminders().asCallback(() => setTimeout(daemon, checkingInterval));
  };
  daemon();
};

export { initNotifierDaemon, notify };
