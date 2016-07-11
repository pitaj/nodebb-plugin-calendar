const db = require.main.require('./src/database');
const plugins = require.main.require('./src/plugins');
import validator from 'validator';
import Promise from 'bluebird';
import { default as parse } from './parse'; // tagTemplate
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
    l(isArrayOf(event.notifications, 'number'), 'notifications') &&
    l(typeof event.location === 'string', 'location') &&
    l(typeof event.description === 'string', 'description')
  ) {
    return event;
  }
  return null;
};

const postSave = async postData => {
  let event = parse(postData.content);
  event = validateEvent(event);
  if (!event || !(await canPostEvent(postData.pid, postData.uid))) {
    return {
      ...postData,
      content: postData.content.replace(
        /\[\s*(\/*)\s*event\s*\]/g,
        '[$1event-invalid]'
      ),
    };
  }

  event.name = validator.escape(event.name);
  event.pid = postData.pid;
  event = (await fireHook('filter:plugin-calendar:event.post', event));

  await Promise.all([
    sortedSetAdd(listKey, event.startDate, `${listKey}:pid:${event.pid}`),
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
