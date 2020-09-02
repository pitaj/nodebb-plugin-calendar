import { getAll as getAllResponses, submitResponse, getUserResponse, Response } from './responses';
import { getEventsByDate, escapeEvent } from './event';
import { filterByPid, privilegeNames } from './privileges';
import getOccurencesOfRepetition from './repetition';
import { getSetting } from './settings';

const privileges = require.main.require('./src/privileges');
const pluginSockets = require.main.require('./src/socket.io/plugins');
const posts = require.main.require('./src/posts');
const topics = require.main.require('./src/topics');

const can = {
  posts: privileges.posts.can,
  topics: privileges.topics.can,
  categories: privileges.categories.can,
};
const tidFromPid = (pid: number) => posts.getPostField(pid, 'tid');
const topicIsDeleted = (tid: number) => topics.getTopicField(tid, 'deleted');

pluginSockets.calendar = {};
pluginSockets.calendar.canPostEvent = async (
  { uid }: { uid: number },
  { pid, tid, cid, isMain }: { pid: number, tid: number, cid: number, isMain: boolean }
) => {
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
};

pluginSockets.calendar.getResponses = async (
  { uid }: { uid: number },
  { pid, day }: { pid: number, day: string }
) => await getAllResponses({ uid, pid, day });

pluginSockets.calendar.submitResponse = async (
  { uid }: { uid: number },
  { pid, value, day }: { pid?: number, value?: Response, day?: string } = {}
) => await submitResponse({ uid, pid, value, day });

pluginSockets.calendar.getUserResponse = async (
  { uid }: { uid: number },
  { pid, day }: { pid: number, day: string }
) => await getUserResponse({ uid, pid, day });

pluginSockets.calendar.getEventsByDate = async (
  { uid }: { uid: number },
  { startDate, endDate }: { startDate: number, endDate: number }
) => {
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
};
