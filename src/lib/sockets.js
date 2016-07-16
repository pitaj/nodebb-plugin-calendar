const privileges = require.main.require('./src/privileges');
const pluginSockets = require.main.require('./src/socket.io/plugins');

import { getAll as getAllResponses, submitResponse, getUserResponse } from './responses';

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

pluginSockets.calendar.getResponses = (socket, pid, cb) => {
  getAllResponses({ pid, uid: socket.uid }).asCallback(cb);
};

pluginSockets.calendar.submitResponse = (socket, { pid, value }, cb) => {
  submitResponse({ uid: socket.uid, pid, value }).asCallback(cb);
};

pluginSockets.calendar.getUserResponse = (socket, pid, cb) => {
  getUserResponse({ uid: socket.uid, pid }).asCallback(cb);
};
