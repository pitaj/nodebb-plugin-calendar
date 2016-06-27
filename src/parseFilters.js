import validator from 'validator';
import Promise from 'bluebird';
import postTemplate from './template';
import { default as parse, tagTemplate } from './parse';

const p = Promise.promisify;

const cls = require.main.require('./middleware/cls');
const user = require.main.require('./src/user');
const getUserSettings = p(user.getSettings);

const parseRaw = async (content, uid) => {
  const event = parse(content);
  if (!event) {
    return content;
  }
  event.name = validator.escape(event.name);
  const userLang = (await getUserSettings(uid)).userLang;
  return content.replace(
    tagTemplate('event', '[\\w\\W]*'),
    postTemplate(event, userLang)
  );
};

const parsePost = async postData => {
  const content = await parseRaw(postData.content, postData.uid);
  return {
    ...postData,
    content,
  };
};

const parsePostCallback = (postData, cb) => parsePost(postData).asCallback(cb);
const parseRawCallback = (content, cb) => parseRaw(content, cls.get('request').uid).asCallback(cb);

export { parsePostCallback, parsePost, parseRawCallback, parseRaw };
