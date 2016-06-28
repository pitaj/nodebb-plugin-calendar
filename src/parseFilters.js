import validator from 'validator';
import Promise from 'bluebird';
import postTemplate from './template';
import { default as parse, tagTemplate } from './parse';

const p = Promise.promisify;

// const cls = require.main.require('./src/middleware/cls');
// const getLang = () => getUserSettings(cls.get('request').uid).then(x => x.userLang);
const meta = require.main.require('./src/meta');
const getLang = () => Promise.resolve(meta.config.defaultLang || 'en_GB');

const user = require.main.require('./src/user');
const getUserSettings = p(user.getSettings);

const parseRaw = async (content, userLang) => {
  const event = parse(content);
  if (!event) {
    return content;
  }
  event.name = validator.escape(event.name);
  const lang = await userLang;
  const text = content.replace(
    new RegExp(tagTemplate('event', '[\\w\\W]*')),
    postTemplate(event, lang.split(/[_@]/)[0])
  );
  return text;
};

const parsePost = async ({ postData }) => {
  const content = await parseRaw(postData.content,
    getUserSettings(postData.uid).then(x => x.userLang));
  return {
    postData: {
      ...postData,
      content,
    },
  };
};

const parsePostCallback = (postData, cb) => parsePost(postData).asCallback(cb);
const parseRawCallback = (content, cb) => parseRaw(content, getLang()).asCallback(cb);

export { parsePostCallback, parsePost, parseRawCallback, parseRaw };
