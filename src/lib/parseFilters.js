import validator from 'validator';
import Promise from 'bluebird';
import postTemplate from './template';
import { default as parse, tagTemplate } from './parse';

const p = Promise.promisify;

const translator = require.main.require('./public/src/modules/translator');
const meta = require.main.require('./src/meta');
// const cls = require.main.require('./src/middleware/cls');
// const getLang = () => getUserSettings(cls.get('request').uid).then(x => x.userLang);
const getLang = () => Promise.resolve(meta.config.defaultLang || 'en_GB');

const user = require.main.require('./src/user');
const getUserSettings = p(user.getSettings);
const translate = p((text, language, callback) => {
  translator.translate(text, language, content => callback(null, content));
  // callback(null, text);
});

const eventRX = new RegExp(tagTemplate('event', '[\\w\\W]*'));
const invalidRX = new RegExp(
  `(${tagTemplate('event-invalid', '[\\w\\W]*')})`
);

const parseRaw = async (content, userLang) => {
  const event = parse(content);
  if (!event) {
    return content.replace(invalidRX, '<span class="hide">$1</span>');
  }
  event.name = validator.escape(event.name);
  const lang = await userLang;

  const eventText = await translate(
    postTemplate(event, lang.split(/[_@]/)[0]),
    lang
  );
  const text = content.replace(
    eventRX,
    eventText
  );
  return text;
};

const parsePost = async data => {
  const postData = data.postData;
  const content = await parseRaw(postData.content,
    getUserSettings(postData.uid).then(x => x.userLang));
  postData.content = content;

  return data;
};

const parsePostCallback = (postData, cb) => parsePost(postData).asCallback(cb);
const parseRawCallback = (content, cb) => parseRaw(content, getLang()).asCallback(cb);

export { parsePostCallback, parsePost, parseRawCallback, parseRaw };
