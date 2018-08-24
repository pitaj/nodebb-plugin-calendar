import validator from 'validator';
import { callbackify } from 'util';

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
  const text = input.replace(eventRX, eventText);
  return text;
};

const parsePost = async (data) => {
  const { postData } = data;
  postData.content = await parseRaw(postData.content);

  return data;
};

const parsePostCallback = callbackify(parsePost);
const parseRawCallback = callbackify(parseRaw);

export { parsePostCallback, parsePost, parseRawCallback, parseRaw };
