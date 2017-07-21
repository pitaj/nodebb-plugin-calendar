import Promise from 'bluebird';
import ICAL from 'ical.js';
import { getAll as getAllResponses, submitResponse, getUserResponse } from './responses';
import { getEventsByDate, getExternalEventsByDate, escapeEvent } from './event';
import { filterByPid, privilegeNames } from './privileges';
import { getOccurencesOfRepetition } from './repetition';
import { getSetting } from './settings';

const privileges = require.main.require('./src/privileges');
const pluginSockets = require.main.require('./src/socket.io/plugins');
const posts = require.main.require('./src/posts');
const topics = require.main.require('./src/topics');

const p = Promise.promisify;

const can = {
  posts: p(privileges.posts.can),
  topics: p(privileges.topics.can),
  categories: p(privileges.categories.can),
};
const tidFromPid = p((pid, cb) => posts.getPostField(pid, 'tid', cb));
const topicIsDeleted = p((tid, cb) => topics.getTopicField(tid, 'deleted', cb));

pluginSockets.calendar = {};
pluginSockets.calendar.canPostEvent = (sock, data, cb) => {
  (async ({ uid }, { pid, tid, cid, isMain }) => {
    if (!isMain && await getSetting('mainPostOnly')) {
      return false;
    }

    if (pid) {
      return can.posts(privilegeNames.canPost, pid, uid);
    }
    if (tid) {
      return can.topics(privilegeNames.canPost, tid, uid);
    }
    if (cid) {
      return can.categories(privilegeNames.canPost, cid, uid);
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
      if (event.repeats && event.repeats.every) {
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
          topicDeleted: !!parseInt(topicDeleted, 10),
        };
      })
    );

    const externalEvents = await getExternalEventsByDate(startDate, endDate);

    return [...withResponses, ...externalEvents];
  })(sock, data).asCallback(cb);
};
