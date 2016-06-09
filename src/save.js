const db = require.main.require('./src/database');
import Promise from 'bluebird';
import validator from 'validator';
import parse from './parse';

const sortedSetAdd = p(db.sortedSetAdd);
const setObject = p(db.setObject);

const listKey = 'plugins:calendar:events';
const objectKey = `${listKey}:id`;

const save = async event => {
  const name = validator.escape(event.name);
  await Promise.all([
    sortedSetAdd(listKey, event.startDate, event.id),
    setObject(`${objectKey}:${event.id}`, { ...event, name }),
  ]);
};

const formatDates = (s, e, allday, lang) => {
  const start = new Date(s);
  const end = new Date(e);

  const formatTime = d => {
    const y = d.toLocaleTimeString(lang).split(':');
    return `${y[0]}:${y[1]}${y[2].replace(/[0-9]/g, '')}`;
  };

  if (
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getYear() === end.getYear()
  ) {
    if (allday) {
      return start.toLocaleDateString(lang);
    }
    return `${start.toLocaleDateString(lang)}<br>
            ${formatTime(start)} - ${formatTime(end)}`;
  }

  if (allday) {
    return `${start.toLocaleDateString(lang)} - ${end.toLocaleDateString(lang)}`;
  }
  return `${start.toLocaleString(lang)} - ${end.toLocaleString(lang)}`;
};

const postTemplate = (event, lang) => {
  const html = `
  <div class="plugin-calendar-event panel panel-default">
    <div class="plugin-calendar-event-name panel-heading">
      ${event.name}
    </div>
    <div class="plugin-calendar-event-date panel-body">
      ${formatDates(event.startDate, event.endDate, event.allday, lang)}
    </div>
    <div class="plugin-calendar-event-location panel-body">
      ${event.location}
    </div>
    <div class="plugin-calendar-event-description panel-body">
      ${event.description}
    </div>
  </div>`;

  return html;
};

const parsePost = async postData => {
  const event = parse(postData.content);
  event.id = postData.pid;

};

// export default event;
