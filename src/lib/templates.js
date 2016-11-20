const makeListElement = (n) => {
  const li = `<li data-value="${n}">[[moment:time-duration, ${n}]]</li>`;
  return li;
};

const eventTemplate = ({ event, isEmail, uid }) => {
  const { startDate, endDate, allday } = event;

  let response = 'no';
  if (uid && event.responses && event.responses[uid]) {
    response = event.responses[uid];
  }
  const responsesTemplate = () => `
<div class="plugin-calendar-event-responses">
  <i class="fa fa-reply" aria-hidden="true"></i>
  <div class="col-xs-12 col-sm-6">
    <div class="plugin-calendar-event-responses-user btn-group">
      ${(() => {
        const active = {
          no: '',
          maybe: '',
          yes: '',
        };
        active[response] = 'active';

        return `
      <button data-value="no" type="button" class="btn btn-sm btn-danger ${active.no}">
        [[calendar:response_no]]
      </button>
      <button data-value="maybe" type="button" class="btn btn-sm btn-default ${active.maybe}">
        [[calendar:response_maybe]]
      </button>
      <button data-value="yes" type="button" class="btn btn-sm btn-success ${active.yes}">
        [[calendar:response_yes]]
      </button>
        `;
      })()}
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
  const responses = isEmail ? `
  <div class="plugin-calendar-event-responses">
    <i class="fa fa-reply" aria-hidden="true"></i>
    [[calendar:you_responded, [[calendar:response_${response}]]]]
  </div>
  ` : responsesTemplate();

  const html = `
<div class="plugin-calendar-event panel panel-success" data-translated="false">
  <div class="plugin-calendar-event-name panel-heading">
    ${event.name}
  </div>
  <div class="panel-body">
    <div class="plugin-calendar-event-date">
      <i class="fa fa-clock-o" aria-hidden="true"></i>
      <a
        title="[[moment:time-date-view, utc, ${startDate}, ${endDate}, ${allday}]]"
        class="plugin-calendar-time-date-view"
      >[[moment:time-date-view, local, ${startDate}, ${endDate}, ${allday}]]</a>
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
    ${event.mandatory ? `
    <div class="plugin-calendar-event-mandatory">
      <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
      <span>[[calendar:mandatory]]</span>
    </div>
    ` : responses}
    ${(() => {
      if (event.repeats) {
        const key = ['day', 'week', 'month', 'year'].find((x) => event.repeats.every[x]);
        if (key) {
          return `<div class="plugin-calendar-event-repeats">
            <i class="fa fa-repeat" aria-hidden="true"></i>
            <span>[[calendar:every_${key}]]</span>
          </div>`;
        }
        if (event.repeats.every.daysOfWeek) {
          const days = event.repeats.every.daysOfWeek
            .map((day) => `[[moment:locale-data, _weekdaysShort, ${day}]]`)
            .join(', ');
          const endDateText = `[[moment:time-date-view, utc, ${event.repeats.endDate}, ` +
            `${event.repeats.endDate}, true]]`;
          return `<div class="plugin-calendar-event-repeats">
            <i class="fa fa-repeat" aria-hidden="true"></i>
            <span>
              ${Number.isFinite(event.repeats.endDate) ? `
              [[calendar:repeats_weekly_on_until, ${endDateText}]] ${days}
              ` : `
              [[calendar:repeats_weekly_on_forever]] ${days}
              `}
            </span>
          </div>`;
        }
      }
      return '';
    })()}
  </div>
</div>`;

  return html;
};

export { eventTemplate };
