const privileges = require.main.require('./src/privileges');
const pluginSockets = require.main.require('./src/socket.io/plugins');

const perm = 'plugin-calendar:event:post';

pluginSockets.calendar = {};
pluginSockets.calendar.canPostEvent = (socket, { pid, tid, cid }, cb) => {
  const uid = socket.uid;
  if (!uid) {
    cb(null, false);
    return;
  }
  if (pid) {
    privileges.posts.can(perm, pid, uid, cb);
    return;
  }
  if (tid) {
    privileges.topics.can(perm, tid, uid, cb);
    return;
  }
  if (cid) {
    privileges.categories.can(perm, cid, uid, cb);
    return;
  }
  cb(null, false);
};
