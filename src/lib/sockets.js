const privileges = require.main.require('./src/privileges');
const pluginSockets = require.main.require('./src/socket.io/plugins');
const meta = require.main.require('./src/meta');
const posts = require.main.require('./src/posts');
const topics = require.main.require('./src/topics');

import { getAll as getAllResponses, submitResponse, getUserResponse } from './responses';
import { getEventsByDate, escapeEvent } from './event';
import { filterByPid } from './privileges';
import { getOccurencesOfRepetition } from './repetition';
import Promise from 'bluebird';

const p = Promise.promisify;

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
          getUserResponse({ pid: event.pid, uid, day }).catch(() => null),
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
