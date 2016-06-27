const db = require.main.require('./src/database');
const plugins = require.main.require('.src/plugins');
import validator from 'validator';
import Promise from 'bluebird';
import { default as parse, tagTemplate } from './parse';
import { canPostEvent } from './privileges';

const p = Promise.promisify;

const sortedSetAdd = p(db.sortedSetAdd);
const setObject = p(db.setObject);
const fireHook = p(plugins.fireHook);

const listKey = 'plugins:calendar:events';
const objectKey = `${listKey}:id`;

const postSave = async postData => {
  let event = parse(postData.content);

  if (!event) {
    return postData;
  }
  if (!(await canPostEvent(postData.pid, postData.uid))) {
    // throw new Error('[[plugin-calendar:no-privileges-post-event]]');
    return {
      ...postData,
      content: postData.content.replace(
        tagTemplate('event', '[\\w\\W]*'),
        ''
      ),
    };
  }

  event.name = validator.escape(event.name);

  event = (await fireHook('plugin-calendar:event.post', event)) || event;

  await Promise.all([
    sortedSetAdd(listKey, event.startDate, event.id),
    setObject(`${objectKey}:${event.id}`, event),
  ]);

  return postData;
};

const postSaveCallback = (postData, cb) => postSave(postData).asCallback(cb);

export { postSave, postSaveCallback };
