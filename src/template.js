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

const postTemplate = (event, lang) => {
  const dateString = formatDates(event.startDate, event.endDate, event.allday, lang);
  const dateStringUTC = formatDates(event.startDate, event.endDate, event.allday, lang, true);

  const html = `
<div class="plugin-calendar-event panel panel-default">
  <div class="plugin-calendar-event-name panel-heading">
    ${event.name}
  </div>
  <div class="plugin-calendar-event-date panel-body">
    <a title="${dateStringUTC}" data-original-title="${dateStringUTC}">${dateString}</a>
  </div>
  <div class="plugin-calendar-event-location panel-body">
    ${event.location}
  </div>
  <div class="plugin-calendar-event-description panel-body">
    ${event.description}
  </div>
</div>`.trim();

  return html;
};

export default postTemplate;
export { formatDates };
