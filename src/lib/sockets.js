const privileges = require.main.require('./src/privileges');
const pluginSockets = require.main.require('./src/socket.io/plugins');
const translator = require.main.require('./public/src/modules/translator');
const user = require.main.require('./src/user');
const meta = require.main.require('./src/meta');

import { getAll as getAllResponses, submitResponse, getUserResponse } from './responses';
import { getEventsByDate, filterByPid, escapeEvent, getEvent } from './event';
import { canViewPost } from './privileges';
import postTemplate from './template';
import Promise from 'bluebird';

const p = Promise.promisify;

const getUserSettings = p(user.getSettings);
const translate = p((text, language, callback) => {
  translator.translate(text, language, content => callback(null, content));
});

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

pluginSockets.calendar.getEventsByDate = ({ uid }, { startDate, endDate }, cb) =>
  (async () => {
    const events = await getEventsByDate(startDate, endDate);
    const filtered = await filterByPid(events, uid);
    const escaped = await Promise.all(filtered.map(escapeEvent));

    return escaped;
  })().asCallback(cb);

pluginSockets.calendar.getParsedEvent = ({ uid }, pid, cb) => {
  (async () => {
    const can = await canViewPost(pid, uid);
    if (!can) {
      throw new Error('[[error:no-privileges]]');
    }

    const event = await getEvent(pid);
    const parsed = await escapeEvent(event);
    const lang = (await getUserSettings(uid)).userLang || meta.config.defaultLang;
    const content = await translate(postTemplate(parsed), lang);

    return { parsed, content };
  })().asCallback(cb);
};
