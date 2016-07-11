const moment = require('moment');
import IntlPolyfill from 'intl';
Intl.NumberFormat = IntlPolyfill.NumberFormat;
Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;

const stringOptions = {
  date: {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  time: {
    hour: 'numeric',
    minute: 'numeric',
  },
  full: {},
};

stringOptions.full = {
  ...stringOptions.date,
  ...stringOptions.time,
};

stringOptions.UTC = Object.keys(stringOptions).reduce((utc, key) => ({
  ...utc,
  [key]: {
    ...stringOptions[key],
    timeZone: 'UTC',
    timeZoneName: 'short',
  },
}), {});

const formatDates = (s, e, allday, lang, utc) => {
  const start = new Date(s);
  const end = new Date(e);

  const options = utc ? stringOptions.UTC : stringOptions;

  if (Math.abs(s - e) <= 60 * 1000) {
    if (allday) {
      return start.toLocaleDateString(lang, options.date);
    }
    return start.toLocaleString(lang, options.full);
  }

  if (
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getYear() === end.getYear()
  ) {
    if (allday) {
      return start.toLocaleDateString(lang, options.date);
    }
    return `${start.toLocaleDateString(lang, options.date)}<br>` +
      `${start.toLocaleTimeString(lang, options.time)}` +
      ` - ${end.toLocaleTimeString(lang, options.time)}`;
  }

  if (allday) {
    return `${start.toLocaleDateString(lang, options.date)}` +
      ` - ${end.toLocaleDateString(lang, options.date)}`;
  }
  return `${start.toLocaleString(lang, options.full)} - ` +
    `${end.toLocaleString(lang, options.full)}`;
};

const zero = moment(0);

const makeListElement = n => {
  const li = `<li data-value="${n}">${zero.to(n, true)}</li>`;
  return li;
};

const postTemplate = (event, lang) => {
  const dateString = formatDates(event.startDate, event.endDate, event.allday, lang);
  const dateStringUTC = formatDates(event.startDate, event.endDate, event.allday, lang, true)
    .replace('<br>', '; ');

  const given = (bool, text) => (bool ? text : '');

  const html = `
<div class="plugin-calendar-event panel panel-success">
  <div class="plugin-calendar-event-name panel-heading">
    ${event.name}
  </div>
  <div class="panel-body">
    <div class="plugin-calendar-event-date">
      <i class="fa fa-clock-o" aria-hidden="true"></i>
      <a title="${dateStringUTC}" data-original-title="${dateStringUTC}">${dateString}</a>
    </div>
    ${given(event.location.length, `
    <div class="plugin-calendar-event-location">
      <i class="fa fa-location-arrow" aria-hidden="true"></i>
      <span>${event.location}<span>
    </div>
    `)}
    ${given(event.description.length, `
    <div class="plugin-calendar-event-description">
      <i class="fa fa-info-circle" aria-hidden="true"></i>
      <span>${event.description}</span>
    </div>
    `)}
    ${given(event.notifications.length, `
    <div class="plugin-calendar-event-notifications">
      <i class="fa fa-bell" aria-hidden="true"></i>
      <ul>
        ${event.notifications.map(makeListElement).join('\n')}
      </ul>
    </div>
    `)}
  </div>
</div>`.trim();

  return html;
};

export default postTemplate;
export { formatDates };
