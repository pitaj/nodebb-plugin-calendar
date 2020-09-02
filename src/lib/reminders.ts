import { callbackify } from 'util';

import { getAll as getResponses, getUserResponse } from './responses';
import { getEventsEndingAfter, escapeEvent, Event } from './event';
import { filterUidsByPid } from './privileges';
import { getOccurencesOfRepetition, repeats } from './repetition';
import eventTemplate from './templates';
import { getSetting } from './settings';

const {
  create: createNotif,
  push: pushNotif,
} = require.main?.require('./src/notifications');
const { getPostFields } = require.main?.require('./src/posts');
const meta = require.main?.require('./src/meta');
const {
  getUidsFromSet,
  getUserFields,
  getSettings: getUserSettings,
} = require.main?.require('./src/user');
const { send: sendEmail } = require.main?.require('./src/emailer');
const nconf = require.main?.require('nconf');
const winston = require.main?.require('winston');

const emailNotification = async (
  { uid, event, message }:
  { uid: number, event: Event, message: string }
) => {
  if (parseInt(meta.config.disableEmailSubscriptions, 10) === 1) {
    return;
  }

  const [userData, userSettings, response] = await Promise.all([
    getUserFields(uid, ['username', 'userslug']),
    getUserSettings(uid),
    getUserResponse({ pid: event.pid, uid, day: event.day }),
  ]);

  if (userSettings.sendPostNotifications) {
    const parsed = await escapeEvent(event);
    parsed.responses = {
      [uid]: response,
    };

    const content = await eventTemplate({ event: parsed, uid, isEmail: true });

    /* eslint-disable camelcase */
    await sendEmail('notif_plugin_calendar_event_reminder', uid, {
      pid: event.pid,
      subject: `[${meta.config.title || 'NodeBB'}] ` +
        `[[calendar:event_starting, ${message}, ${event.name}]]`,
      content: content.replace(/"\/\//g, '"https://'),
      site_title: meta.config.title || 'NodeBB',
      username: userData.username,
      userslug: userData.userslug,
      url: `${nconf.get('url')}/post/${event.pid}`,
      base_url: nconf.get('url'),
    });
    /* eslint-enable camelcase */
  }
};

const notify = async (
  { event, reminder, message }:
  { event: Event, reminder?: number, message: string }
): Promise<void> => {
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
    uids = users.map(u => u.uid);
  }

  const postData = await getPostFields(event.pid, ['tid', 'content', 'title']);

  const notif = await createNotif({
    bodyShort: `[[calendar:event_starting, ${message}, ${event.name}]]`,
    bodyLong: postData.content,
    nid: `plugin-calendar:events:pid:${event.pid}:event_starting`,
    pid: event.pid,
    tid: postData.tid,
    from: event.uid,
    path: `/post/${event.pid}`,
  });
  await pushNotif(notif, uids);

  await Promise.all(
    uids.map(uid => emailNotification({ uid, event, message }))
  );
};

const initNotifierDaemon = async (): Promise<void> => {
  // sec between checking for reminders
  // pulled from settings
  let checkingInterval = await getSetting('checkingInterval');

  winston.verbose(`[plugins/calendar] Notifier Daemon initialized with
    interval of ${checkingInterval} seconds`);

  let lastEnd = Date.now();

  const checkReminders = callbackify(async () => {
    checkingInterval = await getSetting('checkingInterval');
    // timespan we check is a checkingInterval in the future
    // so as to avoid sending notifications too late
    const start = lastEnd;
    const end = Date.now() + (checkingInterval * 1000);
    lastEnd = end;

    const events = await getEventsEndingAfter(start);

    const occurences = events.flatMap((event) => {
      if (repeats(event)) {
        const max = Math.max(0, ...event.reminders);
        return getOccurencesOfRepetition(event, start, end + max);
      }
      return event;
    });

    const mapped = occurences
      .map((event) => {
        const reminder = [0, ...event.reminders].find((r) => {
          const remDate = event.startDate - r;
          return remDate > start && remDate <= end;
        });
        if (!Number.isFinite(reminder)) {
          return null;
        }
        const message = `[[moment:time-in, ${event.startDate - start}]]`;
        return { event, reminder, message };
      });

    // TS can't figure out that filtered can't include `null` values
    const filtered = mapped.filter(Boolean) as {
      event: Event;
      reminder?: number;
      message: string;
    }[];

    await Promise.all(filtered.map(notify));
  });

  const daemon = () => {
    checkReminders((err) => {
      if (err) {
        winston.error(err);
      }
      setTimeout(daemon, checkingInterval * 1000);
    });
  };
  daemon();
};

export { initNotifierDaemon, notify };
