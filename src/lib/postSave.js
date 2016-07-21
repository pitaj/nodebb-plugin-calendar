const plugins = require.main.require('./src/plugins');
// const winston = require.main.require('winston');

import validator from 'validator';
import Promise from 'bluebird';
import parse from './parse';
import { canPostEvent } from './privileges';
import { deleteEvent, saveEvent, eventExists, getEvent } from './event';
import validateEvent from './validateEvent';
import { notify } from './reminders';

const log = (...args) => console.log(...args);
const p = Promise.promisify;

const fireHook = p(plugins.fireHook);

const regex = new RegExp(
  '(\\[\\s?event\\s?\\][\\w\\W]*\\[\\s?\\/\\s?event\\s?\\])|' +
  '(\\[\\s?event\\-invalid?\\s?\\][\\w\\W]*\\[\\s?\\/\\s?event\\-invalid?\\s?\\])'
);

const postSave = async postData => {
  let event = parse(postData.content);

  // delete event if no longer in post
  if (!postData.content.match(regex)) {
    const existed = await eventExists(postData.pid);
    if (existed) {
      await notify({
        event: await getEvent(postData.pid),
        message: '[[calendar:event_deleted]]',
      });

      await deleteEvent(postData.pid);
      log(`[plugin-calendar] Event (pid:${postData.pid}) deleted`);
    }

    return postData;
  }

  const invalid = () => ({
    ...postData,
    content: postData.content.replace(
      /\[\s?(\/?)\s?event\s?\]/g,
      '[$1event-invalid]'
    ),
  });

  if (!event) {
    return invalid();
  }

  const [failed, failures] = validateEvent(event);
  if (failed) {
    const obj = failures.reduce((val, failure) => ({
      ...val,
      [failure]: event[failure],
    }), {});
    log(`[plugin-calendar] Event (pid:${postData.pid}) validation failed: `, obj);
    return invalid();
  }

  const can = await canPostEvent(postData.tid, postData.uid);
  if (!can) {
    return invalid();
  }

  event.name = validator.escape(event.name);
  event.pid = postData.pid;
  event.uid = postData.uid;
  event = await fireHook('filter:plugin-calendar:event.post', event);

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
