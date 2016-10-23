const plugins = require.main.require('./src/plugins');
const meta = require.main.require('./src/meta');
const topics = require.main.require('./src/topics');
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
const getSetting = p(meta.settings.getOne);
const getTopicField = p(topics.getTopicField);

const isMainPost = ({ pid, tid }) =>
  getTopicField(tid, 'mainPid')
    .then((mainPid) =>
      parseInt(mainPid, 10) === parseInt(pid, 10));

const regex = new RegExp(
  '(\\[\\s?event\\s?\\][\\w\\W]*\\[\\s?\\/\\s?event\\s?\\])|' +
  '(\\[\\s?event\\-invalid?\\s?\\][\\w\\W]*\\[\\s?\\/\\s?event\\-invalid?\\s?\\])'
);

const postSave = async (data) => {
  const { post } = data;
  let event = parse(post.content);

  // delete event if no longer in post
  if (!post.content.match(regex)) {
    const existed = await eventExists(post.pid);
    if (existed) {
      await notify({
        event: await getEvent(post.pid),
        message: '[[calendar:event_deleted]]',
      });

      await deleteEvent(post.pid);
      log(`[plugin-calendar] Event (pid:${post.pid}) deleted`);
    }

    return post;
  }

  const invalid = () => {
    post.content = post.content.replace(
      /\[\s?(\/?)\s?event\s?\]/g,
      '[$1event-invalid]'
    );
    return data;
  };

  if (!event) {
    return invalid();
  }

  const [failed, failures] = validateEvent(event);
  if (failed) {
    const obj = failures.reduce((val, failure) => ({
      ...val,
      [failure]: event[failure],
    }), {});
    log(`[plugin-calendar] Event (pid:${post.pid}) validation failed: `, obj);
    return invalid();
  }
  const main = !await isMainPost(post);
  if (main && await getSetting('plugin-calendar', 'mainPostOnly')) {
    return invalid();
  }

  const can = await canPostEvent(post.tid, post.uid);
  if (!can) {
    return invalid();
  }

  event.name = validator.escape(event.name);
  event.location = event.location.trim();
  event.description = event.description.trim();
  event.pid = post.pid;
  event.uid = post.uid;
  event = await fireHook('filter:plugin-calendar.event.post', event);

  if (event) {
    await saveEvent(event);
    log(`[plugin-calendar] Event (pid:${event.pid}) saved`);
  }

  return data;
};

const postSaveCallback = (data, cb) => postSave(data).asCallback(cb);
const postEditCallback = postSaveCallback;

export { postSave, postSaveCallback, postEditCallback };
