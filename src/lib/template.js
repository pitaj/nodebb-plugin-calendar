import moment from 'moment';
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
  const dateString = formatDates(
    event.startDate,
    event.endDate,
    event.allday,
    lang
  );
  const dateStringUTC = formatDates(
    event.startDate,
    event.endDate,
    event.allday,
    lang,
    true
  ).replace('<br>', ' | ');

  const responsesTemplate = `
<div class="plugin-calendar-event-responses">
  <i class="fa fa-reply" aria-hidden="true"></i>
  <div>
    <div class="plugin-calendar-event-responses-user btn-group">
      <button data-value="no" type="button" class="btn btn-sm btn-danger active">
        [[calendar:response_no]]
      </button>
      <button data-value="maybe" type="button" class="btn btn-sm btn-default">
        [[calendar:response_maybe]]
      </button>
      <button data-value="yes" type="button" class="btn btn-sm btn-success">
        [[calendar:response_yes]]
      </button>
    </div>
    <div class="panel-group plugin-calendar-event-responses-lists" data-loaded="false">
      <div class="panel panel-default closed">
        <div class="panel-heading">
          <a role="button" data-toggle="collapse" href="#"
          class="btn btn-sm btn-info" aria-expanded="true">
            [[calendar:response_yes]]
            <i class="fa fa-chevron-down pull-right"></i>
          </a>
        </div>
        <div class="panel-collapse">
          <div class="panel-body">
            <ul class="plugin-calendar-event-responses-list-yes">
              <!-- yes responses go here -->
            </ul>
          </div>
        </div>
      </div>
      <div class="panel panel-default closed">
        <div class="panel-heading">
          <a role="button" data-toggle="collapse" href="#"
          class="btn btn-sm btn-link" aria-expanded="true">
            [[calendar:response_maybe]]
            <i class="fa fa-chevron-down pull-right"></i>
          </a>
        </div>
        <div class="panel-collapse">
          <div class="panel-body">
            <ul class="plugin-calendar-event-responses-list-maybe">
              <!-- maybe responses go here -->
            </ul>
          </div>
        </div>
      </div>
      <div class="panel panel-default closed">
        <div class="panel-heading">
          <a role="button" data-toggle="collapse" href="#"
          class="btn btn-sm btn-warning" aria-expanded="true">
            [[calendar:response_no]]
            <i class="fa fa-chevron-down pull-right"></i>
          </a>
        </div>
        <div class="panel-collapse">
          <div class="panel-body">
            <ul class="plugin-calendar-event-responses-list-no">
              <!-- no responses go here -->
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;

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
    ${event.location.length ? `
    <div class="plugin-calendar-event-location">
      <i class="fa fa-location-arrow" aria-hidden="true"></i>
      <span>${event.location}<span>
    </div>
    ` : ''}
    ${event.description.length ? `
    <div class="plugin-calendar-event-description">
      <i class="fa fa-info-circle" aria-hidden="true"></i>
      <div>${event.description}</div>
    </div>
    ` : ''}
    ${event.reminders.length ? `
    <div class="plugin-calendar-event-reminders">
      <i class="fa fa-bell" aria-hidden="true"></i>
      <ul>
        ${event.reminders
          .sort((a, b) => a - b)
          .map(makeListElement).join('\n')}
      </ul>
    </div>
    ` : ''}
    ${responsesTemplate}
  </div>
</div>`.trim();

  return html;
};

export default postTemplate;
export { formatDates };
