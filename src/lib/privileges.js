import Promise from 'bluebird';
import { getSetting } from './settings';

const p = Promise.promisify;

const privileges = require.main.require('./src/privileges');
const posts = require.main.require('./src/posts');
const privilegesPostCan = p(privileges.posts.can);
const privilegesTopicCan = p(privileges.topics.can);
const filterUidsByCid = p(privileges.categories.filterUids);
const filterPids = p(privileges.posts.filter);

const privilegeNames = {
  canPost: 'plugin_calendar:event:post',
};

const canViewPost = (pid, uid) => privilegesPostCan('read', pid, uid);
const canPostEvent = (tid, uid) => privilegesTopicCan(privilegeNames.canPost, tid, uid);
const getCidByPid = p(posts.getCidByPid);

const canRespond = (pid, uid) =>
  getSetting('respondIfCanReply')
    .then((respondIfCanReply) => {
      if (respondIfCanReply) {
        return privilegesPostCan('reply', pid, uid);
      }
      return canViewPost(pid, uid);
    });

const filterUidsByPid = (uids, pid) =>
  getCidByPid(pid)
  .then(cid => filterUidsByCid('read', cid, uids));

const filterByPid = (events, uid) =>
  filterPids('read', events.map(e => e.pid), uid)
  .then(filtered => events.filter(e => filtered.includes(e.pid)));

const privilegesList = (list, callback) =>
  callback(null, [...list, privilegeNames.canPost]);
const privilegesGroupsList = (list, callback) =>
  callback(null, [...list, `groups:${privilegeNames.canPost}`]);
const privilegesListHuman = (list, callback) =>
  callback(null, [...list, { name: 'Post events' }]);

export {
  canViewPost,
  canPostEvent,
  filterUidsByPid,
  privilegesList,
  privilegesGroupsList,
  privilegesListHuman,
  filterByPid,
  canRespond,
  privilegeNames,
};
