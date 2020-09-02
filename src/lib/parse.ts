import { EventInfo, Keys } from './event';

const tagTemplate = (name: string, content: string): string => `\\[${name}\\](${content})\\[\\/${name}\\]`;

const parts: { key: Keys, pattern: string, optional?: boolean }[] = [
  { key: 'name', pattern: '.*' },
  { key: 'allday', pattern: 'true|false' },
  { key: 'startDate', pattern: '[0-9]+' },
  { key: 'endDate', pattern: '[0-9]+' },
  { key: 'reminders', pattern: '\\[[0-9, ]*\\]' },
  { key: 'location', pattern: '.*' },
  { key: 'description', pattern: '[\\s\\S]*' },
  { key: 'mandatory', pattern: 'true|false' },
  { key: 'repeats', pattern: '.*', optional: true },
];

const regExps: {
  key: Keys,
  pattern: string,
  optional?: boolean,
}[] = parts.map(({ key, pattern, optional }) => ({
  key,
  pattern: tagTemplate(key, pattern),
  optional,
}));

const inPost = new RegExp(
  '(\\[event(?:\\-invalid)?\\][\\s\\S]+\\[\\/event(?:\\-invalid)?\\])'
);

const full = regExps.map(r => (r.optional ? `(?:${r.pattern})?` : r.pattern)).join('\\s*');
const eventRegExp = tagTemplate('event', full);

const parse = (text: string): EventInfo | null => {
  const matches = text.match(eventRegExp);
  if (!matches || !matches.length) {
    return null;
  }
  const match = matches[1];

  const results = Object.fromEntries(regExps.map(({ key, pattern }) => {
    const m = match.match(pattern);
    return [key, (m && m[1] && m[1].trim()) || ''];
  }));

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
