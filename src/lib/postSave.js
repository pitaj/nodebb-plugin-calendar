import validator from 'validator';
import Promise from 'bluebird';
import parse, { inPost } from './parse';
import { canPostEvent } from './privileges';
import { deleteEvent, saveEvent, eventExists, getEvent } from './event';
import validateEvent from './validateEvent';
import { notify } from './reminders';
import { getSetting } from './settings';

const plugins = require.main.require('./src/plugins');
const topics = require.main.require('./src/topics');
const winston = require.main.require('winston');

const p = Promise.promisify;

const fireHook = p(plugins.fireHook);
const getTopicField = p(topics.getTopicField);

const isMainPost = async ({ pid, tid }) => {
  const mainPid = await getTopicField(tid, 'mainPid');
  return parseInt(mainPid, 10) === parseInt(pid, 10);
};

const postSave = async (data) => {
  const { post } = data;
  let event = parse(post.content);

  // delete event if no longer in post
  if (!post.content.match(inPost)) {
    const existed = await eventExists(post.pid);
    if (existed) {
      await notify({
        event: await getEvent(post.pid),
        message: '[[calendar:event_deleted]]',
      });

      await deleteEvent(post.pid);
      winston.verbose(`[plugin-calendar] Event (pid:${post.pid}) deleted`);
    }

    return data;
  }

  const invalid = () => {
    post.content = post.content.replace(/\[(\/?)event\]/g, '[$1event-invalid]');
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
    winston.verbose(`[plugin-calendar] Event (pid:${post.pid}) validation failed: `, obj);
    return invalid();
  }

  const main = post.isMain || await isMainPost(post);
  if (!main && await getSetting('mainPostOnly')) {
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
    winston.verbose(`[plugin-calendar] Event (pid:${event.pid}) saved`);
  }

  return data;
};

const postSaveCallback = (data, cb) => postSave(data).asCallback(cb);

export { postSave, postSaveCallback };
