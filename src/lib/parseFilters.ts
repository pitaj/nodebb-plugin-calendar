import validator from 'validator';

import eventTemplate from './templates';
import { parse, tagTemplate } from './parse';
import {
  filter__parse_post,
  filter__parse_raw,
  filter__post_getPostSummaryByPids,
  filter__teasers_get,
} from './hooks';
import { getResponsesCount } from './responses';

const eventRX = new RegExp(tagTemplate('event', '[\\s\\S]*'));
const invalidRX = new RegExp(`(${tagTemplate('event-invalid', '[\\s\\S]*')})`);

const reescape = (str: string) => validator.escape(validator.unescape(str));

const parseRawWithPid = async (content: string, pid?: number) => {
  const input = content.replace(
    /\[description\]([\s\S]*)\[\/description\]/,
    '[description]<p>$1</p>[/description]'
  );
  const event = parse(input);
  if (!event) {
    return input.replace(invalidRX, '<div class="hide">$1</div>');
  }
  event.name = reescape(event.name);
  if (pid) {
    event.responsesCount = await getResponsesCount({ pid });
  }

  const eventText = await eventTemplate({ event });
  // must use function to avoid `$` being treated specially
  const text = input.replace(eventRX, () => eventText);
  return text;
};

const parseRaw: filter__parse_raw = async content => parseRawWithPid(content);

const parsePost: filter__parse_post = async (data) => {
  const { postData } = data;
  postData.content = await parseRawWithPid(postData.content, +postData.pid);

  return data;
};

const rawPattern = /\[event\]\s*\[name\](.*)\[\/name\][\s\S]*\[\/event\]/;
const wrapperPattern = /(?:<span class="hidden">)?plugin-calendar-event-wrapper:start \|\|\|(.*?)\|\|\|(<\/span>)?[\s\S]*(?:<span class="hidden">)?plugin-calendar-event-wrapper:end(<\/span>)?/;
const shortEvent = (full: string, name: string) => `<p>| [[calendar:event_title]]: ${reescape(name)} |</p>`;

const postSummary: filter__post_getPostSummaryByPids = async (data) => {
  data.posts.forEach((post) => {
    if (post && post.content) {
      // eslint-disable-next-line no-param-reassign
      post.content = post.content
        .replace(rawPattern, shortEvent)
        .replace(wrapperPattern, shortEvent);
    }
  });

  return data;
};

const topicTeaser: filter__teasers_get = async (data) => {
  data.teasers.forEach((post) => {
    if (post && post.content) {
      // eslint-disable-next-line no-param-reassign
      post.content = post.content.replace(wrapperPattern, shortEvent);
    }
  });

  return data;
};

export {
  parsePost,
  parseRaw,
  postSummary,
  topicTeaser,
};
