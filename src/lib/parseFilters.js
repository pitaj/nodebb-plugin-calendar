import validator from 'validator';

import eventTemplate from './templates';
import parse, { tagTemplate } from './parse';

const eventRX = new RegExp(tagTemplate('event', '[\\s\\S]*'));
const invalidRX = new RegExp(`(${tagTemplate('event-invalid', '[\\s\\S]*')})`);

const parseRaw = async (content) => {
  const input = content.replace(
    /\[description\]([\s\S]*)\[\/description\]/,
    '[description]<p>$1</p>[/description]'
  );
  const event = parse(input);
  if (!event) {
    return input.replace(invalidRX, '<div class="hide">$1</div>');
  }
  event.name = validator.escape(event.name);

  const eventText = await eventTemplate({ event });
  // must use function to avoid `$` being treated specially
  const text = input.replace(eventRX, () => eventText);
  return text;
};

const parsePost = async (data) => {
  const { postData } = data;
  postData.content = await parseRaw(postData.content);

  return data;
};

const reescape = (str) => validator.escape(validator.unescape(str));

const rawPattern = /\[event\]\s*\[name\](.*)\[\/name\][\s\S]*\[\/event\]/;
const wrapperPattern = /(?:<span class="hidden">)?plugin-calendar-event-wrapper:start \|\|\|(.*?)\|\|\|(<\/span>)?[\s\S]*(?:<span class="hidden">)?plugin-calendar-event-wrapper:end(<\/span>)?/;
const shortEvent = (full, name) => `<p>| [[calendar:event_title]]: ${reescape(name)} |</p>`;

const postSummary = (data, callback) => {
  data.posts.forEach((post) => {
    if (post && post.content) {
      // eslint-disable-next-line no-param-reassign
      post.content = post.content
        .replace(rawPattern, shortEvent)
        .replace(wrapperPattern, shortEvent);
    }
  });

  callback(null, data);
};

const topicTeaser = (data, callback) => {
  data.teasers.forEach((post) => {
    if (post && post.content) {
      // eslint-disable-next-line no-param-reassign
      post.content = post.content.replace(wrapperPattern, shortEvent);
    }
  });

  callback(null, data);
};

export {
  parsePost,
  parseRaw,
  postSummary,
  topicTeaser,
};
