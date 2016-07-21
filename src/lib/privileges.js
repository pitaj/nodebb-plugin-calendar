import Promise from 'bluebird';
const p = Promise.promisify;

const privileges = require.main.require('./src/privileges');
const privilegesPostCan = p(privileges.posts.can);
const privilegesTopicCan = p(privileges.topics.can);
const canViewPost = (pid, uid) => privilegesPostCan('read', pid, uid);
const canPostEvent = (tid, uid) => privilegesTopicCan('plugin-calendar:event:post', tid, uid);

const privilegesList = (list, callback) =>
  callback(null, [...list, 'plugin-calendar:event:post']);
const privilegesGroupsList = (list, callback) =>
  callback(null, [...list, 'groups:plugin-calendar:event:post']);
const privilegesListHuman = (list, callback) =>
  callback(null, [...list, { name: 'Post events' }]);

export {
  canViewPost,
  canPostEvent,
  privilegesList,
  privilegesGroupsList,
  privilegesListHuman,
};
