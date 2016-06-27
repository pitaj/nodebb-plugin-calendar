import Promise from 'bluebird';
const p = Promise.promisify;

const privileges = require.main.require('./src/privileges');
const privilegesPostCan = p(privileges.posts.can);
const canPostEvent = (pid, uid) => privilegesPostCan('plugin-calendar:event:post', pid, uid);

const privilegesList = (list, callback) =>
  callback([...list, 'plugin-calendar:event:post']);
const privilegesGroupsList = (list, callback) =>
  callback([...list, 'groups:plugin-calendar:event:post']);
const privilegesListHuman = (list, callback) =>
  callback([...list, { name: 'Post events' }]);

export {
  canPostEvent,
  privilegesList,
  privilegesGroupsList,
  privilegesListHuman,
};
