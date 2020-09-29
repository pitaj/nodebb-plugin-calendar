import { EventInfo, Keys } from './event';

const tagTemplate = (name: string, content: string): string => `\\s*\\[${name}\\](${content})\\[\\/${name}\\]\\s*`;

const regExps: {
  key: Keys,
  pattern: string,
}[] = [
  { key: 'name', pattern: '.*' },
  { key: 'allday', pattern: 'true|false' },
  { key: 'startDate', pattern: '[0-9]+' },
  { key: 'endDate', pattern: '[0-9]+' },
  { key: 'reminders', pattern: '\\[[0-9, ]*\\]' },
  { key: 'location', pattern: '.*' },
  { key: 'description', pattern: '[\\s\\S]*' },
  { key: 'mandatory', pattern: 'true|false' },
].map(({ key, pattern }: { key: Keys, pattern: string }) => ({
  key,
  pattern: tagTemplate(key, pattern),
}));

regExps.push({
  key: 'repeats',
  pattern: '\\s*(?:\\[repeats\\](.*)\\[\\/repeats\\])?\\s*',
});

const inPost = new RegExp(
  '(\\[event(?:\\-invalid)?\\][\\s\\S]+\\[\\/event(?:\\-invalid)?\\])'
);

const full = regExps.map(r => r.pattern).join('');
const eventRegExp = tagTemplate('event', full);

const parse = (text: string): EventInfo => {
  const matches = text.match(eventRegExp);
  if (!matches || !matches.length) {
    return null;
  }
  const match = matches[1];
  const results: { [K in Keys]?: string } = {};
  regExps.forEach(({ key, pattern }) => {
    const m = match.match(pattern);
    results[key] = m && m[1] && m[1].trim();
  });

  const repeats = match.match(/\[repeats\](.*)\[\/repeats\]/);
  results.repeats = repeats ? repeats[1] : null;

  try {
    return {
      name: results.name,
      allday: results.allday === 'true',
      startDate: parseInt(results.startDate, 10),
      endDate: parseInt(results.endDate, 10),
      reminders: JSON.parse(results.reminders),
      location: results.location,
      description: results.description,
      mandatory: results.mandatory === 'true',
      repeats: results.repeats ? JSON.parse(results.repeats.replace(/&quot;/g, '"')) : null,
    };
  } catch (e) {
    return null;
  }
};

const templates = {
  ...regExps,
  event: eventRegExp,
};

export {
  parse as default,
  tagTemplate,
  templates,
  inPost,
};