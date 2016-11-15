const privileges = require.main.require('./src/privileges');
const pluginSockets = require.main.require('./src/socket.io/plugins');
const translator = require.main.require('./public/src/modules/translator');
const user = require.main.require('./src/user');
const meta = require.main.require('./src/meta');
const posts = require.main.require('./src/posts');
const topics = require.main.require('./src/topics');

import { getAll as getAllResponses, submitResponse, getUserResponse } from './responses';
import { getEventsByDate, escapeEvent, getEvent } from './event';
import { canViewPost, filterByPid } from './privileges';
import { getOccurencesOfRepetition } from './repetition';
import postTemplate from './template';
import Promise from 'bluebird';

const p = Promise.promisify;

const getUserSettings = p(user.getSettings);
const translate = p((text, language, callback) => {
  translator.translate(text, language, (content) => callback(null, content));
});
const getSetting = p(meta.settings.getOne);
const can = {
  posts: p(privileges.posts.can),
  topics: p(privileges.topics.can),
  categories: p(privileges.categories.can),
};
const tidFromPid = p((pid, cb) => posts.getPostField(pid, 'tid', cb));
const topicIsDeleted = p((tid, cb) => topics.getTopicField(tid, 'deleted', cb));

const perm = 'plugin-calendar:event:post';

pluginSockets.calendar = {};
pluginSockets.calendar.canPostEvent = (sock, data, cb) => {
  (async ({ uid }, { pid, tid, cid, isMain }) => {
    if (!uid) {
      return false;
    }

    if (!isMain && await getSetting('plugin-calendar', 'mainPostOnly')) {
      return false;
    }

    if (pid) {
      return can.posts(perm, pid, uid);
    }
    if (tid) {
      return can.topics(perm, tid, uid);
    }
    if (cid) {
      return can.categories(perm, cid, uid);
    }
    return false;
  })(sock, data).asCallback(cb);
};

pluginSockets.calendar.getResponses = ({ uid }, { pid, day }, cb) => {
  getAllResponses({ uid, pid, day }).asCallback(cb);
};

pluginSockets.calendar.submitResponse = ({ uid }, { pid, value, day } = {}, cb) => {
  submitResponse({ uid, pid, value, day }).asCallback(cb);
};

pluginSockets.calendar.getUserResponse = ({ uid }, { pid, day }, cb) => {
  getUserResponse({ uid, pid, day }).asCallback(cb);
};

pluginSockets.calendar.getEventsByDate = (sock, data, cb) => {
  (async ({ uid }, { startDate, endDate }) => {
    const events = await getEventsByDate(startDate, endDate);
    const filtered = await filterByPid(events, uid);
    const occurences = filtered.reduce((prev, event) => {
      if (event.repeats) {
        return [...prev, ...getOccurencesOfRepetition(event, startDate, endDate)];
      }
      return [...prev, event];
    }, []);
    const withResponses = await Promise.all(
      occurences.map(async (event) => {
        const day = event.day;
        const [response, topicDeleted, escaped] = await Promise.all([
          getUserResponse({ pid: event.pid, uid, day }),
          tidFromPid(event.pid).then(topicIsDeleted),
          escapeEvent(event),
        ]);
        return {
          ...escaped,
          responses: {
            [uid]: response,
          },
          topicDeleted,
        };
      })
    );

    return withResponses;
  })(sock, data).asCallback(cb);
};

pluginSockets.calendar.getParsedEvent = ({ uid }, pid, cb) => {
  (async () => {
    const canView = await canViewPost(pid, uid);
    if (!canView) {
      throw Error('[[error:no-privileges]]');
    }

    const event = await getEvent(pid);
    const parsed = await escapeEvent(event);
    const lang = (await getUserSettings(uid)).userLang || meta.config.defaultLang;
    const content = await translate(postTemplate(parsed), lang);

    return { parsed, content };
  })().asCallback(cb);
};
