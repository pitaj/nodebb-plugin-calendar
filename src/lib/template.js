import moment from 'moment';

const justDate = 'dddd, LL';
const justTime = 'LT';
const dateAndTime = 'LLLL';

const formatDates = (s, e, allday, lang, utc) => {
  const mom = utc ? moment.utc : moment;
  moment.locale(lang);

  const start = mom(s);
  const end = mom(e);

  if (Math.abs(s - e) <= 60 * 1000) {
    if (allday) {
      return start.format(justDate);
    }
    return start.format(dateAndTime);
  }

  if (
    start.dayOfYear() === end.dayOfYear() &&
    start.year() === end.year()
  ) {
    if (allday) {
      return start.format(justDate);
    }
    return `${start.format(justDate)}<br>` +
      `${start.format(justTime)} - ${end.format(justTime)}`;
  }

  if (allday) {
    return `${start.format(justDate)} - ${end.format(justDate)}`;
  }
  return `${start.format(dateAndTime)} - ${end.format(dateAndTime)}`;
};

const zero = moment(0);

const makeListElement = (n) => {
  const li = `<li data-value="${n}">${zero.to(n, true)}</li>`;
  return li;
};

const postTemplate = (event, lang) => {
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
  <div class="col-xs-12 col-sm-6">
    <div class="plugin-calendar-event-responses-user btn-group">
      <button data-value="no" type="button" class="btn btn-sm btn-danger">
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
            <i class="fa fa-chevron-down pull-right"></i>
            [[calendar:response_yes]]
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
            <i class="fa fa-chevron-down pull-right"></i>
            [[calendar:response_maybe]]
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
            <i class="fa fa-chevron-down pull-right"></i>
            [[calendar:response_no]]
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
      <a
        data-parsed="false"
        data-allday="${event.allday}"
        data-startDate="${event.startDate}"
        data-endDate="${event.endDate}"
        title="${dateStringUTC}"
        data-original-title="${dateStringUTC}"
        class="plugin-calendar-time-date-view"
      >Hover for UTC date</a>
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
