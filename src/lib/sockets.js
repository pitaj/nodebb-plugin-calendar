import { promisify as p, callbackify } from 'util';
import { getAll as getAllResponses, submitResponse, getUserResponse } from './responses';
import { getEventsByDate, escapeEvent } from './event';
import { filterByPid, privilegeNames } from './privileges';
import getOccurencesOfRepetition from './repetition';
import { getSetting } from './settings';

const privileges = require.main.require('./src/privileges');
const pluginSockets = require.main.require('./src/socket.io/plugins');
const posts = require.main.require('./src/posts');
const topics = require.main.require('./src/topics');

const can = {
  posts: p(privileges.posts.can),
  topics: p(privileges.topics.can),
  categories: p(privileges.categories.can),
};
const tidFromPid = p((pid, cb) => posts.getPostField(pid, 'tid', cb));
const topicIsDeleted = p((tid, cb) => topics.getTopicField(tid, 'deleted', cb));

pluginSockets.calendar = {};
pluginSockets.calendar.canPostEvent = callbackify(async ({ uid }, { pid, tid, cid, isMain }) => {
  const neither = {
    canPost: false,
    canPostMandatory: false,
  };

  if (!isMain && await getSetting('mainPostOnly')) {
    return neither;
  }

  if (!(pid || tid || cid)) {
    return neither;
  }

  let promises;

  if (pid) {
    promises = [
      can.posts(privilegeNames.canPost, pid, uid),
      can.posts(privilegeNames.canMandatoryPost, pid, uid),
    ];
  }
  if (tid) {
    promises = [
      can.topics(privilegeNames.canPost, tid, uid),
      can.topics(privilegeNames.canMandatoryPost, tid, uid),
    ];
  }
  if (cid) {
    promises = [
      can.categories(privilegeNames.canPost, cid, uid),
      can.categories(privilegeNames.canMandatoryPost, cid, uid),
    ];
  }

  const [canPost, canPostMandatory] = await Promise.all(promises);
  return {
    canPost,
    canPostMandatory,
  };
});

const getAllResponsesCb = callbackify(getAllResponses);
const submitResponseCb = callbackify(submitResponse);
const getUserResponseCb = callbackify(getUserResponse);

pluginSockets.calendar.getResponses = ({ uid }, { pid, day }, cb) => {
  getAllResponsesCb({ uid, pid, day }, cb);
};

pluginSockets.calendar.submitResponse = ({ uid }, { pid, value, day } = {}, cb) => {
  submitResponseCb({ uid, pid, value, day }, cb);
};

pluginSockets.calendar.getUserResponse = ({ uid }, { pid, day }, cb) => {
  getUserResponseCb({ uid, pid, day }, cb);
};

pluginSockets.calendar.getEventsByDate = callbackify(async ({ uid }, { startDate, endDate }) => {
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
      const { pid, day } = event;
      const [response, topicDeleted, escaped] = await Promise.all([
        getUserResponse({ pid, uid, day }).catch(() => null),
        tidFromPid(pid).then(topicIsDeleted),
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

  return withResponses;
});
