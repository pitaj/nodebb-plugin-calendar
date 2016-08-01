const notifications = require.main.require('./src/notifications');
const posts = require.main.require('./src/posts');
const meta = require.main.require('./src/meta');

// import { fork } from 'child_process';
import { getAll as getResponses } from './responses';
import { getAllEvents } from './event';
import moment from 'moment';
import Promise from 'bluebird';
const p = Promise.promisify;

const createNotif = p(notifications.create);
const pushNotif = p(notifications.push);
const getPostFields = p(posts.getPostFields);
const getSetting = p(meta.settings.getOne);

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

  const { tid, content } = await getPostFields(event.pid, ['tid', 'content']);
  const notif = await createNotif({
    bodyShort: `[[calendar:event_starting, ${message}, ${event.name}]]`,
    bodyLong: content,
    nid: `plugin-calendar:tid:${tid}:pid:${event.pid}:event`,
    pid: event.pid,
    tid,
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

  let lastEnd = Date.now() + checkingInterval;

  const checkReminders = async () => {
    // timespan we check is a checkingInterval in the future
    // so as to avoid sending notifications too late
    const start = lastEnd;
    const end = start + checkingInterval;
    lastEnd = end;

    console.log('start', start, 'end', end);

    const events = await getAllEvents();

    const s = moment(start);

    await Promise.all(
      events
      .map((event) => {
        const reminder = [0, ...event.reminders].find((r) => {
          const remDate = event.startDate - r;
          return remDate > start && remDate <= end;
        });
        if (reminder === 0) {
          return {
            event,
            reminder,
            message: '[[calendar:now]]',
          };
        }
        if (reminder) {
          const message = s.to(event.startDate);
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
