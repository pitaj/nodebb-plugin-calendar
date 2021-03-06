import {
  getAll as getAllResponses,
  submitResponse,
  getUserResponse,
  Response,
  ResponseCollection,
} from './responses';
import { getEventsByDate, escapeEvent, EventWithDeleted } from './event';
import { filterByPid, privilegeNames } from './privileges';
import { getOccurencesOfRepetition, repeats } from './repetition';
import { getSetting } from './settings';

const privileges = require.main?.require('./src/privileges');
const pluginSockets = require.main?.require('./src/socket.io/plugins');
const posts = require.main?.require('./src/posts');
const topics = require.main?.require('./src/topics');

const can = {
  posts: privileges.posts.can,
  topics: privileges.topics.can,
  categories: privileges.categories.can,
};
const tidFromPid = (pid: number) => posts.getPostField(pid, 'tid');
const topicIsDeleted = (tid: number) => topics.getTopicField(tid, 'deleted');

export interface SocketReqRes {
  'plugins.calendar.canPostEvent': {
    Request: { pid?: number, tid?: number, cid?: number, isMain?: boolean },
    Response: { canPost: boolean, canPostMandatory: boolean },
  },
  'plugins.calendar.getResponses': {
    Request: { pid: number, day?: string },
    Response: ResponseCollection,
  },
  'plugins.calendar.submitResponse': {
    Request: { pid: number, value: Response, day?: string },
    Response: void,
  },
  'plugins.calendar.getUserResponse': {
    Request: { pid: number, day?: string },
    Response: Response,
  },
  'plugins.calendar.getEventsByDate': {
    Request: { startDate: number, endDate: number },
    Response: EventWithDeleted[],
  },
}

export type SocketNamespaces = keyof SocketReqRes;

interface SocketHandler<K extends SocketNamespaces> {
  (socket: { uid: number }, data: SocketReqRes[K]['Request']): Promise<SocketReqRes[K]['Response']>
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

  let promises: Promise<boolean>[] = [];

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
  { pid, value, day }
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

  const occurences = filtered.flatMap((event) => {
    if (repeats(event)) {
      return getOccurencesOfRepetition(event, startDate, endDate);
    }
    return event;
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
        responses: response ? {
          [uid]: response,
        } : {},
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
