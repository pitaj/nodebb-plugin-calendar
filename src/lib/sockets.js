const privileges = require.main.require('./src/privileges');
const pluginSockets = require.main.require('./src/socket.io/plugins');

import { getAll as getAllResponses, submitResponse, getUserResponse } from './responses';
import { getEventsByDate, filterByPid, escapeEvent } from './event';

const perm = 'plugin-calendar:event:post';

pluginSockets.calendar = {};
pluginSockets.calendar.canPostEvent = ({ uid }, { pid, tid, cid }, cb) => {
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

pluginSockets.calendar.getResponses = ({ uid }, pid, cb) => {
  getAllResponses({ pid, uid }).asCallback(cb);
};

pluginSockets.calendar.submitResponse = ({ uid }, { pid, value }, cb) => {
  submitResponse({ uid, pid, value }).asCallback(cb);
};

pluginSockets.calendar.getUserResponse = ({ uid }, pid, cb) => {
  getUserResponse({ uid, pid }).asCallback(cb);
};

// pluginSockets.calendar.getCategoryColors = ({ uid }, cb) => (async () => {
//   const cats = await getAllCategoryFields(['cid', 'bgColor']);
//   const filtered = await filterCids('read', cats.map(c => c.cid), uid);
//
//   return cats.filter(c => filtered.includes(c.cid));
// })().asCallback(cb);

pluginSockets.calendar.getEventsByDate = ({ uid }, { startDate, endDate }, cb) =>
  (async () => {
    const events = await getEventsByDate(startDate, endDate);
    const filtered = await filterByPid(events, uid);
    const escaped = await Promise.all(filtered.map(escapeEvent));

    return escaped;
  })().asCallback(cb);
