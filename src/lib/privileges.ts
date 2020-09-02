import { Event } from './event';
import {
  filter__privileges_groups_list,
  filter__privileges_list,
  filter__privileges_list_human,
} from './hooks';
import { getSetting } from './settings';

const privileges = require.main?.require('./src/privileges');
const { getCidByPid } = require.main?.require('./src/posts');

const privilegesPostCan = privileges.posts.can;
const privilegesTopicCan = privileges.topics.can;
const filterUidsByCid = privileges.categories.filterUids;
const filterPids = privileges.posts.filter;

const privilegeNames = {
  canPost: 'plugin_calendar:event:post',
  canMandatoryPost: 'plugin_calendar:event:mandatory',
};

const canViewPost = (pid: number, uid: number): Promise<boolean> => privilegesPostCan('topics:read', pid, uid);
const canPostEvent = (tid: number, uid: number): Promise<boolean> => privilegesTopicCan(
  privilegeNames.canPost,
  tid,
  uid
);
const canPostMandatoryEvent = (tid: number, uid: number): Promise<boolean> => privilegesTopicCan(
  privilegeNames.canMandatoryPost,
  tid,
  uid
);

const canRespond = (pid: number, uid: number): Promise<boolean> => getSetting('respondIfCanReply')
  .then((respondIfCanReply) => {
    if (respondIfCanReply) {
      return privilegesPostCan('topics:reply', pid, uid);
    }
    return canViewPost(pid, uid);
  });

const filterUidsByPid = (uids: number[], pid: number): Promise<number[]> => getCidByPid(pid)
  .then((cid: number) => filterUidsByCid('topics:read', cid, uids));

const filterByPid = <T extends Event>(events: T[], uid: number): Promise<T[]> => filterPids('topics:read', events.map(e => e.pid), uid)
  .then((filtered: number[]) => {
    const filteredSet = new Set(filtered);
    return events.filter(e => filteredSet.has(e.pid));
  });

const privilegesList: filter__privileges_list = async list => [
  ...list,
  ...Object.values(privilegeNames),
];
const privilegesGroupsList: filter__privileges_groups_list = async list => [
  ...list,
  ...Object.values(privilegeNames).map(name => `groups:${name}`),
];
const privilegesListHuman: filter__privileges_list_human = async list => [
  ...list,
  { name: 'Post events' },
  { name: 'Post mandatory events' },
];

export {
  canViewPost,
  canPostEvent,
  canPostMandatoryEvent,
  filterUidsByPid,
  privilegesList,
  privilegesGroupsList,
  privilegesListHuman,
  filterByPid,
  canRespond,
  privilegeNames,
};
