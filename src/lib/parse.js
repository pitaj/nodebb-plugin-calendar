const tagTemplate = (name, content) =>
  `\\s*\\[\\s*${name}\\s*\\]\\s*(${content})\\s*\\[\\s*\\/${name}\\s*\\]\\s*`;

const regExps = [
  { key: 'name', pattern: '.*' },
  { key: 'allday', pattern: 'true|false' },
  { key: 'startDate', pattern: '[0-9]+' },
  { key: 'endDate', pattern: '[0-9]+' },
  { key: 'reminders', pattern: '\\[[0-9,\\s]*\\]' },
  { key: 'location', pattern: '.*' },
  { key: 'description', pattern: '[\\w\\W]*' },
  { key: 'mandatory', pattern: 'true|false' },
].map(({ key, pattern }) => ({
  key,
  pattern: tagTemplate(key, pattern),
}));

const full = regExps.map((r) => r.pattern).join('');
const eventRegExp = tagTemplate('event', full);

const parse = (text) => {
  const matches = text.match(eventRegExp);
  if (!matches || !matches.length || !Array.isArray(matches)) {
    return null;
  }
  const match = matches[0];
  const results = {};
  regExps.forEach(({ key, pattern }) => {
    results[key] = match.match(pattern)[1].trim();
  });

  return {
    name: results.name,
    allday: results.allday === 'true',
    startDate: parseInt(results.startDate, 10),
    endDate: parseInt(results.endDate, 10),
    reminders: JSON.parse(results.reminders).sort((a, b) => b - a),
    location: results.location,
    description: results.description,
    mandatory: results.mandatory === 'true',
  };
};

const templates = {
  ...regExps,
  event: eventRegExp,
};

export {
  parse as default,
  tagTemplate,
  templates,
};
