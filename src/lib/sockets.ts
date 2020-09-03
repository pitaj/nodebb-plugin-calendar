import {
  getAll as getAllResponses,
  submitResponse,
  getUserResponse,
  Response,
  ResponseCollection,
} from './responses';
import { getEventsByDate, escapeEvent, EventWithDeleted } from './event';
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

export interface SocketRequests {
  'plugins.calendar.canPostEvent': { pid?: number, tid?: number, cid?: number, isMain?: boolean },
  'plugins.calendar.getResponses': { pid: number, day: string },
  'plugins.calendar.submitResponse': { pid?: number, value?: Response, day?: string },
  'plugins.calendar.getUserResponse': { pid: number, day: string },
  'plugins.calendar.getEventsByDate': { startDate: number, endDate: number },
}

export interface SocketResponses {
  'plugins.calendar.canPostEvent': { canPost: boolean, canPostMandatory: boolean },
  'plugins.calendar.getResponses': ResponseCollection,
  'plugins.calendar.submitResponse': void,
  'plugins.calendar.getUserResponse': Response,
  'plugins.calendar.getEventsByDate': EventWithDeleted[],
}

export type SocketNamespaces = keyof SocketRequests & keyof SocketResponses;

interface SocketHandler<K extends SocketNamespaces> {
  (socket: { uid: number }, data: SocketRequests[K]): Promise<SocketResponses[K]>
}

const canPostEventSocket: SocketHandler<'plugins.calendar.canPostEvent'> = async (
  { uid },
  { pid, tid, cid, isMain }
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

const getResponsesSocket: SocketHandler<'plugins.calendar.getResponses'> = async (
  { uid },
  { pid, day }
) => await getAllResponses({ uid, pid, day });

const submitResponseSocket: SocketHandler<'plugins.calendar.submitResponse'> = async (
  { uid },
  { pid, value, day } = {}
) => await submitResponse({ uid, pid, value, day });

const getUserResponseSocket: SocketHandler<'plugins.calendar.getUserResponse'> = async (
  { uid },
  { pid, day }
) => await getUserResponse({ uid, pid, day });

const getEventsByDateSocket: SocketHandler<'plugins.calendar.getEventsByDate'> = async (
  { uid },
  { startDate, endDate }
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

pluginSockets.calendar = {
  canPostEvent: canPostEventSocket,
  getResponses: getResponsesSocket,
  submitResponse: submitResponseSocket,
  getUserResponse: getUserResponseSocket,
  getEventsByDate: getEventsByDateSocket,
};
