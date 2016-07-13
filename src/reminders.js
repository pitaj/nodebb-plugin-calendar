const db = require.main.require('./src/database');
const notifications = require.main.require('./src/notifications');
const posts = require.main.require('./src/posts');

// import { fork } from 'child_process';
import moment from 'moment';
import Promise from 'bluebird';
const p = Promise.promisify;

const getSortedSetRange = p(db.getSortedSetRange);
const getObjectsFields = p(db.getObjectsFields);
const createNotif = p(notifications.create);
const pushNotif = p(notifications.push);
const getPostField = p(posts.getPostField);

// ms between checking for reminders
const checkingInterval = 1000 * 60 * 5; // 5 min

const listKey = 'plugins:calendar:events';

const initNotifierDaemon = () => {
  const getAll = async () => {
    const keys = await getSortedSetRange(listKey, 0, -1);
    const events = await getObjectsFields(keys, ['pid', 'reminders', 'startDate']);

    return events;
  };
  const notify = async (event, n, till) => {
    // TODO: get users to notify for the event
    const uids = [];

    const content = await getPostField(event.pid, 'content');
    const notif = await createNotif({
      bodyShort: `[[calendar:event_starting, ${till}, ${event.name}]]`,
      bodyLong: content,
      nid: `plugin-calendar:tid:${event.tid}:pid:${event.pid}:event`,
      pid: event.pid,
      tid: event.tid,
      from: event.uid,
      path: `/post/${event.pid}`,
      importance: 6,
    });
    await pushNotif(notif, uids);
  };

  const zero = moment(0);

  const checkReminders = async () => {
    const now = Date.now();
    const then = now + checkingInterval;
    const events = await getAll();

    await Promise.all(
      events
      .map(e => {
        const reminder = [0, ...e.reminders].find(r => {
          const remDate = e.startDate - r;
          return remDate > now && remDate < then;
        });
        if (reminder === 0) {
          return [e, reminder, '[[calendar:now]]'];
        }
        if (reminder) {
          const till = zero.to(reminder);
          return [e, reminder, till];
        }
        return null;
      })
      .filter(Boolean)
      .map(([event, notif, till]) => notify(event, notif, till))
    );
  };

  const daemon = () => {
    checkReminders().asCallback(() =>
      setTimeout(daemon, checkingInterval)
    );
  };
};

export { initNotifierDaemon };
