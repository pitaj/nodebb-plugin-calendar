import validator from 'validator';

import parse, { inPost } from './parse';
import { canPostEvent, canPostMandatoryEvent } from './privileges';
import {
  deleteEvent,
  saveEvent,
  eventExists,
  getEvent,
} from './event';
import validateEvent from './validateEvent';
import { notify } from './reminders';
import { getSetting } from './settings';

const { fireHook } = require.main.require('./src/plugins');
const { getTopicField } = require.main.require('./src/topics');
const { getPostField } = require.main.require('./src/posts');
const winston = require.main.require('winston');

const isMainPost = async (pid, tid) => {
  const mainPid = await getTopicField(tid, 'mainPid');
  return mainPid === pid;
};

const postSave = async (data) => {
  const { post } = data;
  const eventInfo = parse(post.content);

  const uid = post.uid || post.editor || data.uid;
  const pid = parseInt(post.pid || data.data.pid, 10);
  const tid = parseInt(post.tid || await getPostField(pid, 'tid'), 10);

  // delete event if no longer in post
  if (!post.content.match(inPost)) {
    const existed = await eventExists(pid);
    if (existed) {
      const existingEvent = await getEvent(pid);
      await notify({
        event: existingEvent,
        message: `[[calendar:event_deleted, ${existingEvent.name}]]`,
      });

      await deleteEvent({ post: { pid } });
      winston.verbose(`[plugin-calendar] Event (pid:${pid}) deleted`);
    }

    return data;
  }

  const invalid = () => {
    post.content = post.content.replace(/\[(\/?)event\]/g, '[$1event-invalid]');
    return data;
  };

  if (!eventInfo) {
    return invalid();
  }

  const [failed, failures] = validateEvent(eventInfo);
  if (failed) {
    const obj = failures.reduce((val, failure) => ({
      ...val,
      [failure]: failure === 'repeatEndDate' ? eventInfo.repeats.endDate : eventInfo[failure],
    }), {});
    winston.verbose(`[plugin-calendar] Event (pid:${pid}) validation failed: `, obj);
    return invalid();
  }

  const main = post.isMain || data.data.isMain || await isMainPost(pid, tid);
  if (!main && await getSetting('mainPostOnly')) {
    return invalid();
  }

  if (!await canPostEvent(tid, uid)) {
    return invalid();
  }

  if (eventInfo.mandatory && !await canPostMandatoryEvent(tid, uid)) {
    return invalid();
  }

  let event = {
    ...eventInfo,
    name: validator.escape(eventInfo.name),
    location: eventInfo.location.trim(),
    description: eventInfo.description.trim(),
    uid,
    pid,
  };

  event = await fireHook('filter:plugin-calendar.event.post', event);

  if (event) {
    await saveEvent(event);
    winston.verbose(`[plugin-calendar] Event (pid:${event.pid}) saved`);
  }

  return data;
};

export { postSave };
