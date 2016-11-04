import validator from 'validator';
import postTemplate from './template';
import { default as parse, tagTemplate } from './parse';

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

  const eventText = postTemplate(event);
  const text = input.replace(eventRX, eventText);
  return text;
};

const parsePost = async (data) => {
  const postData = data.postData;
  postData.content = await parseRaw(postData.content);

  return data;
};

const parsePostCallback = (postData, cb) => parsePost(postData).asCallback(cb);
const parseRawCallback = (content, cb) => parseRaw(content).asCallback(cb);

export { parsePostCallback, parsePost, parseRawCallback, parseRaw };
