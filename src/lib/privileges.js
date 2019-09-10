import { getSetting } from './settings';

const privileges = require.main.require('./src/privileges');
const { getCidByPid } = require.main.require('./src/posts');

const privilegesPostCan = privileges.posts.can;
const privilegesTopicCan = privileges.topics.can;
const filterUidsByCid = privileges.categories.filterUids;
const filterPids = privileges.posts.filter;

const privilegeNames = {
  canPost: 'plugin_calendar:event:post',
  canMandatoryPost: 'plugin_calendar:event:mandatory',
};

const canViewPost = (pid, uid) => privilegesPostCan('read', pid, uid);
const canPostEvent = (tid, uid) => privilegesTopicCan(privilegeNames.canPost, tid, uid);
const canPostMandatoryEvent = (tid, uid) => privilegesTopicCan(
  privilegeNames.canMandatoryPost,
  tid,
  uid
);

const canRespond = (pid, uid) => getSetting('respondIfCanReply')
  .then((respondIfCanReply) => {
    if (respondIfCanReply) {
      return privilegesPostCan('topics:reply', pid, uid);
    }
    return canViewPost(pid, uid);
  });

const filterUidsByPid = (uids, pid) => getCidByPid(pid)
  .then((cid) => filterUidsByCid('read', cid, uids));

const filterByPid = (events, uid) => filterPids('read', events.map((e) => e.pid), uid)
  .then((filtered) => events.filter((e) => filtered.includes(e.pid)));

const privilegesList = (list, callback) => callback(null, [
  ...list,
  ...Object.values(privilegeNames),
]);
const privilegesGroupsList = (list, callback) => callback(null, [
  ...list,
  ...Object.values(privilegeNames).map((name) => `groups:${name}`),
]);
const privilegesListHuman = (list, callback) => callback(null, [
  ...list,
  { name: 'Post events' },
  { name: 'Post mandatory events' },
]);

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
