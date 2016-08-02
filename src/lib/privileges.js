import Promise from 'bluebird';
const p = Promise.promisify;

const privileges = require.main.require('./src/privileges');
const posts = require.main.require('./src/posts');
const privilegesPostCan = p(privileges.posts.can);
const privilegesTopicCan = p(privileges.topics.can);
const filterUidsByCid = p(privileges.categories.filterUids);
const filterPids = p(privileges.posts.filter);

const canViewPost = (pid, uid) => privilegesPostCan('read', pid, uid);
const canPostEvent = (tid, uid) => privilegesTopicCan('plugin-calendar:event:post', tid, uid);
const getCidByPid = p(posts.getCidByPid);

const filterUidsByPid = (uids, pid) =>
  getCidByPid(pid)
  .then((cid) => filterUidsByCid('read', cid, uids));

const filterByPid = (events, uid) =>
  filterPids('read', events.map((e) => e.pid), uid)
  .then((filtered) => events.filter((e) => filtered.includes(e.pid)));

const privilegesList = (list, callback) =>
  callback(null, [...list, 'plugin-calendar:event:post']);
const privilegesGroupsList = (list, callback) =>
  callback(null, [...list, 'groups:plugin-calendar:event:post']);
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
};
