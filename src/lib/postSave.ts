import validator from 'validator';

import parse, { inPost } from './parse';
import { canPostEvent, canPostMandatoryEvent } from './privileges';
import {
  deleteEvent,
  saveEvent,
  eventExists,
  getEvent,
  Event,
} from './event';
import validateEvent from './validateEvent';
import { notify } from './reminders';
import { getSetting } from './settings';

const { fireHook } = require.main.require('./src/plugins');
const { getTopicField } = require.main.require('./src/topics');
const winston = require.main.require('winston');

const isMainPost = async ({ pid, tid }: { pid: number, tid: number }) => {
  const mainPid = await getTopicField(tid, 'mainPid');
  return parseInt(mainPid, 10) === parseInt(pid.toString(), 10);
};

const postSave: filter__post_save = async (data) => {
  const { post } = data;
  const eventInfo = parse(post.content);

  // delete event if no longer in post
  if (!post.content.match(inPost)) {
    const existed = await eventExists(post.pid);
    if (existed) {
      const existingEvent = await getEvent(post.pid);
      await notify({
        event: existingEvent,
        message: `[[calendar:event_deleted, ${existingEvent.name}]]`,
      });

      await deleteEvent({ post: { pid: post.pid } });
      winston.verbose(`[plugin-calendar] Event (pid:${post.pid}) deleted`);
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
    winston.verbose(`[plugin-calendar] Event (pid:${post.pid}) validation failed: `, obj);
    return invalid();
  }

  const main = post.isMain || data.data.isMain || await isMainPost(post);
  if (!main && await getSetting('mainPostOnly')) {
    return invalid();
  }

  if (!await canPostEvent(post.tid, post.uid)) {
    return invalid();
  }

  if (eventInfo.mandatory && !await canPostMandatoryEvent(post.tid, post.uid)) {
    return invalid();
  }

  let event: Event = {
    ...eventInfo,
    name: validator.escape(eventInfo.name),
    location: eventInfo.location.trim(),
    description: eventInfo.description.trim(),
    pid: post.pid,
    uid: post.uid,
  };

  event = await fireHook('filter:plugin-calendar.event.post', event);

  if (event) {
    await saveEvent(event);
    winston.verbose(`[plugin-calendar] Event (pid:${event.pid}) saved`);
  }

  return data;
};

export { postSave };
