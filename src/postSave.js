const db = require.main.require('./src/database');
const plugins = require.main.require('./src/plugins');
import validator from 'validator';
import Promise from 'bluebird';
import { default as parse, tagTemplate } from './parse'; // tagTemplate
import { canPostEvent } from './privileges';

const p = Promise.promisify;

const sortedSetAdd = p(db.sortedSetAdd);
const setObject = p(db.setObject);
const fireHook = p(plugins.fireHook);

const listKey = 'plugins:calendar:events';

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
      console.warn('Validation failed at ', message);
    }
    return bool;
  };

  if (
    l(typeof event.name === 'string', 'name') &&
    l(typeof event.allday === 'boolean', 'allday') &&
    l(new Date(event.startDate).getTime() === event.startDate, 'startDate') &&
    l(new Date(event.endDate).getTime() === event.endDate, 'endDate') &&
    l(isArrayOf(event.notifications, it => new Date(it).getTime() === it), 'notifications') &&
    l(typeof event.location === 'string', 'location') &&
    l(typeof event.description === 'string', 'description')
  ) {
    return event;
  }
  return null;
};

const postSave = async postData => {
  console.log('postSave');
  let event = parse(postData.content);
  console.log('parsed event', !!event);
  event = validateEvent(event);
  console.log('validated event', !!event);
  if (!event || !(await canPostEvent(postData.pid, postData.uid))) {
    // throw new Error('[[plugin-calendar:no-privileges-post-event]]');
    // return {
    //   ...postData,
    //   content: postData.content.replace(
    //     tagTemplate('event', '[\\w\\W]*'),
    //     '[[plugin-calendar:no-privileges-post-event]]'
    //   ),
    // };
    console.log('NOT saving event', event, 'cuz canpostevent is ', await canPostEvent(postData.pid, postData.uid));
    return {
      ...postData,
      content: postData.content.replace(
        new RegExp(tagTemplate('event', '[\\w\\W]*')),
        ''
      ),
    };
  }

  event.name = validator.escape(event.name);

  event = (await fireHook('filter:plugin-calendar:event.post', event));

  console.log('saving event', event);

  await Promise.all([
    sortedSetAdd(listKey, event.startDate, event.pid),
    setObject(`${listKey}:pid:${event.pid}`, event),
  ]);

  return postData;
};

const postSaveCallback = (postData, cb) => postSave(postData).asCallback(cb);
const postEditCallback = (data, cb) =>
  postSave(data.post).then(postData => ({
    ...data,
    post: postData,
  })).asCallback(cb);

export { postSave, postSaveCallback, postEditCallback };
