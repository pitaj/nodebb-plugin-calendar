const notifications = require.main.require('./src/notifications');
const posts = require.main.require('./src/posts');
const meta = require.main.require('./src/meta');
const user = require.main.require('./src/user');

// import { fork } from 'child_process';
import { getAll as getResponses } from './responses';
import { getAllEvents } from './event';
import { filterUidsByPid } from './privileges';
import moment from 'moment';
import Promise from 'bluebird';
const p = Promise.promisify;

const createNotif = p(notifications.create);
const pushNotif = p(notifications.push);
const getPostFields = p(posts.getPostFields);
const getSetting = p(meta.settings.getOne);
const getUidsFromSet = p(user.getUidsFromSet);


const notify = async ({ event, reminder, message }) => {
  let uids;

  // if event is mandatory, notify all the users who can view it
  if (event.mandatory) {
    const all = await getUidsFromSet('users:joindate', 0, -1);
    uids = await filterUidsByPid(all, event.pid);
  } else {
    let users;

    // if reminder is for the event start
    // notify 'maybe' and 'yes' responders
    // otherwise, notify only 'yes' responders
    if (reminder === 0) {
      const responses = await getResponses({
        pid: event.pid,
        selection: ['yes', 'maybe'],
      });
      users = [...responses.yes, ...responses.maybe];
    } else {
      const responses = await getResponses({
        pid: event.pid,
        selection: ['yes'],
      });
      users = responses.yes;
    }
    uids = users.map((u) => u.uid);
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

  console.log(`Notifier Daemon initialized with
    interval of ${Math.floor(checkingInterval / 1000)} seconds`);

  const lang = (meta.config.defaultLang || 'en-GB')
    .toLowerCase()
    .replace('_', '-');
  moment.locale(lang);

  let lastEnd = Date.now() + checkingInterval;

  const checkReminders = async () => {
    // timespan we check is a checkingInterval in the future
    // so as to avoid sending notifications too late
    const start = lastEnd;
    const end = lastEnd + checkingInterval;

    lastEnd += checkingInterval;
    const s = moment(start);

    const events = await getAllEvents();

    const filtered = events
    .map((event) => {
      const reminder = [0, ...event.reminders].find((r) => {
        const remDate = event.startDate - r;
        return remDate > start && remDate <= end;
      });
      if (!reminder) {
        return null;
      }
      if (reminder === 0) {
        return {
          event,
          reminder,
          message: '[[calendar:now]]',
        };
      }
      const message = s.to(event.startDate);
      return { event, reminder, message };
    })
    .filter(Boolean);

    await Promise.all(
      filtered
      .map(notify)
    );
  };

  const daemon = () => {
    checkReminders().asCallback((err) => {
      if (err) {
        console.error(err);
      }
      setTimeout(daemon, checkingInterval);
    });
  };
  daemon();
};

export { initNotifierDaemon, notify };
