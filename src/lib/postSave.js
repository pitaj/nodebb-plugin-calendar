const plugins = require.main.require('./src/plugins');
// const winston = require.main.require('winston');

import validator from 'validator';
import Promise from 'bluebird';
import { default as parse } from './parse';
import { canPostEvent } from './privileges';
import { deleteEvent, saveEvent } from './event';

const log = (...args) => console.log(...args);
const p = Promise.promisify;

const fireHook = p(plugins.fireHook);

const isArrayOf = (arr, type) => {
  const isType = typeof type === 'function' ? type : it => typeof it === type;
  if (!Array.isArray(arr)) {
    return false;
  }
  for (const x of arr) {
    if (!isType(x)) {
      return false;
    }
  }
  return true;
};

const validateEvent = event => {
  const l = (bool, message) => {
    if (!bool) {
      log('[plugin-calendar] Event validation failed at ', message);
    }
    return bool;
  };

  if (
    l(typeof event.name === 'string', 'name') &&
    l(typeof event.allday === 'boolean', 'allday') &&
    l(new Date(event.startDate).getTime() === event.startDate, 'startDate') &&
    l(new Date(event.endDate).getTime() === event.endDate, 'endDate') &&
    l(isArrayOf(event.reminders, 'number'), 'reminders') &&
    l(typeof event.location === 'string', 'location') &&
    l(typeof event.description === 'string', 'description')
  ) {
    return event;
  }
  return null;
};

const regex = new RegExp(
  '(\\[\\s?event\\s?\\][\\w\\W]*\\[\\s?\\/\\s?event\\s?\\])|' +
  '(\\[\\s?event\\-invalid?\\s?\\][\\w\\W]*\\[\\s?\\/\\s?event\\-invalid?\\s?\\])'
);

const postSave = async postData => {
  let event = parse(postData.content);

  // delete event if no longer in post
  if (!postData.content.match(regex)) {
    await deleteEvent(postData.pid);
    log(`[plugin-calendar] Event (pid:${postData.pid}) saved`);

    return postData;
  }

  event = validateEvent(event);
  if (!event || !(await canPostEvent(postData.pid, postData.uid))) {
    return {
      ...postData,
      content: postData.content.replace(
        /\[\s?(\/?)\s?event\s?\]/g,
        '[$1event-invalid]'
      ),
    };
  }

  event.name = validator.escape(event.name);
  event.pid = postData.pid;
  event.tid = postData.tid;
  event.uid = postData.uid;
  event = (await fireHook('filter:plugin-calendar:event.post', event));

  await saveEvent(event);
  log(`[plugin-calendar] Event (pid:${event.pid}) saved`);

  return postData;
};

const postSaveCallback = (postData, cb) => postSave(postData).asCallback(cb);
const postEditCallback = (data, cb) =>
  postSave(data.post).then(postData => ({
    ...data,
    post: postData,
  })).asCallback(cb);

export { postSave, postSaveCallback, postEditCallback };
