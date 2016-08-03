const notifications = require.main.require('./src/notifications');
const posts = require.main.require('./src/posts');
const meta = require.main.require('./src/meta');
const user = require.main.require('./src/user');
const emailer = require.main.require('./src/emailer');
const translator = require.main.require('./public/src/modules/translator');
const nconf = require.main.require('nconf');

// import { fork } from 'child_process';
import { getAll as getResponses } from './responses';
import { getAllEvents, escapeEvent } from './event';
import { filterUidsByPid } from './privileges';
import postTemplate from './template';
import moment from 'moment';
import Promise from 'bluebird';
import { decode } from 'html-entities';
const p = Promise.promisify;

const createNotif = p(notifications.create);
const pushNotif = p(notifications.push);
const getPostFields = p(posts.getPostFields);
const getSetting = p(meta.settings.getOne);
const getUidsFromSet = p(user.getUidsFromSet);
const sendEmail = p(emailer.send);
const getUserSettings = p(user.getSettings);
const getUserFields = p(user.getUserFields);
const translate = p((text, language, callback) => {
  translator.translate(text, language, (content) => callback(null, content));
});

const emailNotification = async ({ uid, event, message, postData }) => {
  if (parseInt(meta.config.disableEmailSubscriptions, 10) === 1) {
    return;
  }

  const [userData, userSettings] = await Promise.all(
    getUserFields(uid, ['username', 'userslug']),
    getUserSettings(uid)
  );

  if (userSettings.sendPostNotifications) {
    const parsed = await escapeEvent(event);
    const lang = userSettings.userLang || meta.config.defaultLang;
    const content = await translate(postTemplate(parsed), lang);

    const title = decode(postData.title);
    // const titleEscaped = title.replace(/%/g, '&#37;').replace(/,/g, '&#44;');

    await sendEmail('notif_plugin_calendar_event_reminder', uid, {
      pid: event.pid,
      subject: `[${meta.config.title || 'NodeBB'}] ${title}`,
      intro: `[[calendar:event_starting, ${message}, ${event.name}]]`,
      content: content.replace(/"\/\//g, '"https://'),
      site_title: meta.config.title || 'NodeBB',
      username: userData.username,
      userslug: userData.userslug,
      url: `${nconf.get('url')}/post/${event.pid}`,
      base_url: nconf.get('url'),
    });
  }
};

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

  const postData = await getPostFields(event.pid, ['tid', 'content', 'title']);

  await Promise.all(
    createNotif({
      bodyShort: `[[calendar:event_starting, ${message}, ${event.name}]]`,
      bodyLong: postData.content,
      nid: `plugin-calendar:tid:${postData.tid}:pid:${event.pid}:event`,
      pid: event.pid,
      tid: postData.tid,
      from: event.uid,
      path: `/post/${event.pid}`,
      importance: 1,
    }).then((notif) => pushNotif(notif, uids)),
    ...uids.map((uid) => emailNotification({
      event,
      message,
      uid,
      postData,
    })),
  );
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
