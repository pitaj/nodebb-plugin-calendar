const makeListElement = (n) => {
  const li = `<li data-value="${n}">[[time:duration, ${n}]]</li>`;
  return li;
};

const postTemplate = (event) => {
  const { startDate, endDate, allday } = event;

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
<div class="plugin-calendar-event panel panel-success" data-translated="false">
  <div class="plugin-calendar-event-name panel-heading">
    ${event.name}
  </div>
  <div class="panel-body">
    <div class="plugin-calendar-event-date">
      <i class="fa fa-clock-o" aria-hidden="true"></i>
      <a
        title="[[time-date-view:utc, ${startDate}, ${endDate}, ${allday}]]"
        class="plugin-calendar-time-date-view"
      >[[time-date-view:local, ${startDate}, ${endDate}, ${allday}]]</a>
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
    ` : responsesTemplate}
  </div>
</div>`.trim();

  return html;
};

export default postTemplate;
