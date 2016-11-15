const eventTemplate = (event) => (
  `[event][name]${event.name}[/name][allday]${event.allday}[/allday]` +
  `[startDate]${event.startDate}[/startDate][endDate]${event.endDate}[/endDate]` +
  `[reminders]${JSON.stringify(event.reminders)}[/reminders]` +
  `[location]${event.location}[/location]` +
  `[description]${event.description}[/description][mandatory]${event.mandatory}[/mandatory]` +
  `${event.repeats ? `[repeats]${JSON.stringify(event.repeats)}[/repeats]` : ''}[/event]`
);

const customReminderTemplate = () => `
<div class="well well-sm" id="plugin-calendar-event-editor-reminder-custom"
style="display:none;">
  <form class="form-inline">
    <div class="form-group">
      <label for="plugin-calendar-event-editor-reminder-custom-number">
        [[calendar:reminder_custom_title]]
      </label>
      <input type="tel" class="form-control" value="2"
      id="plugin-calendar-event-editor-reminder-custom-number" />
    </div>
    <div class="form-group" id="plugin-calendar-event-editor-reminder-custom-unit">
      <div class="btn-group" data-toggle="buttons">
        <label class="btn btn-sm btn-default">
          <input type="radio" value="mm" name="reminder-custom-unit">
          [[moment:locale-data, relativeTime, , true, mm]]
        </label>
        <label class="btn btn-sm btn-default active">
          <input type="radio" value="hh" name="reminder-custom-unit" checked>
          [[moment:locale-data, relativeTime, , true, hh]]
        </label>
        <label class="btn btn-sm btn-default">
          <input type="radio" value="dd" name="reminder-custom-unit">
          [[moment:locale-data, relativeTime, , true, dd]]
        </label>
      </div>
    </div>
    <button type="button" class="btn btn-sm btn-primary">
      <span class="sr-only">[[topic:composer.submit]]</span>
      <i class="fa fa-check"></i>
    </button>
  </form>
</div>
`;

const customRepetitionTemplate = () => `
<div class="well well-sm" id="plugin-calendar-event-editor-repetition-custom"
style="display:none">
  <form>
    <label for="plugin-calendar-event-editor-repetition-custom-daysOfWeek">
      [[calendar:repeat_weekly]]
    </label>
    <div class="form-group" id="plugin-calendar-event-editor-repetition-custom-daysOfWeek">
      <ul>
        ${[0, 1, 2, 3, 4, 5, 6].map((i) => `
        <li data-value="${i}">
          <a href="#">[[moment:locale-data, _weekdaysShort, ${i}]]</a>
        </li>
        `).join('')}
      </ul>
    </div>
    <div class="form-group plugin-calendar-event-editor-repetition-custom-end">
      <div class="radio">
        <label>
          <input type="radio" name="repetition-end" value="forever" checked>
          [[calendar:repeat_forever]]
        </label>
      </div>
      <div class="radio">
        <label>
          <input type="radio" name="repetition-end" value="end">
          [[calendar:repeat_until_date]]
        </label>
      </div>
      <div class="date plugin-calendar-event-editor-date"
      id="plugin-calendar-event-editor-repetition-endDate" style="display:none">
        <input type="text" class="form-control"/>
      </div>
      <p class="text-danger error-message">[[calendar:invalid_date]]</p>
    </div>
    <div class="text-center">
      <button type="button" class="btn btn-sm btn-primary">
        <span class="sr-only">[[topic:composer.submit]]</span>
        <i class="fa fa-check"></i>
      </button>
    </div>
  </form>
</div>
`;

const formTemplate = () => `
<form>
  <div class="plugin-calendar-event panel panel-success">
    <div class="plugin-calendar-event-name panel-heading">
      <div class="form-group">
        <input type="text" class="form-control" id="plugin-calendar-event-editor-name"
        placeholder="[[calendar:event_name]]">
        <p class="text-danger error-message">[[calendar:name_too_short]]</p>
      </div>
    </div>
    <div class="panel-body">
      <div class="form-group">
        <div class="checkbox">
          <label>
            <input type="checkbox" id="plugin-calendar-event-editor-allday">
            [[calendar:all_day]]
          </label>
        </div>
      </div>
      <div class="form-group">
        <label>
          <i class="fa fa-clock-o" aria-hidden="true"></i> [[calendar:dates]]
        </label>
        <div class="form-inline plugin-calendar-event-editor-dates">
          <div class="input-group date plugin-calendar-event-editor-date"
          id="plugin-calendar-event-editor-startDate">
            <input type="text" class="form-control"
            placeholder="[[calendar:start_date]]"/>
            <span class="input-group-addon">
              <i class="fa fa-play"></i>
            </span>
          </div>
          <div class="input-group date plugin-calendar-event-editor-date"
          id="plugin-calendar-event-editor-endDate">
            <input type="text" class="form-control"
            placeholder="[[calendar:end_date]]"/>
            <span class="input-group-addon">
              <i class="fa fa-stop"></i>
            </span>
          </div>
        </div>
        <p class="text-danger error-message">[[calendar:invalid_date]]</p>
      </div>
      <div class="form-group">
        <label for="plugin-calendar-event-editor-location">
          <i class="fa fa-location-arrow"></i> [[calendar:location]]
        </label>
        <input type="text" class="form-control"
        id="plugin-calendar-event-editor-location" />
        <p class="text-danger error-message">[[calendar:invalid_location]]</p>
      </div>
      <div class="form-group">
        <label for="plugin-calendar-event-editor-description">
          <i class="fa fa-info-circle"></i> [[calendar:description]]
        </label>
        <textarea class="form-control" rows="10"
        id="plugin-calendar-event-editor-description"></textarea>
      </div>
      <div class="form-group">
        <div class="checkbox">
          <label>
            <input type="checkbox" id="plugin-calendar-event-editor-mandatory">
            [[calendar:mandatory]]
          </label>
        </div>
      </div>
      <div class="form-group plugin-calendar-event-reminders">
        <label for="plugin-calendar-event-editor-reminders">
          <i class="fa fa-bell" aria-hidden="true"></i> [[calendar:reminders]]
        </label>
        <br>
        <ul id="plugin-calendar-event-editor-reminders">
          <div class="dropdown dropup" id="plugin-calendar-event-editor-reminders-add">
            <a class="dropdown-toggle" href="#"
            id="plugin-calendar-event-editor-reminders-add-button"
            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              [[calendar:add_reminder]]
              <span class="caret"></span>
            </a>
            <ul class="dropdown-menu"
            aria-labelledby="plugin-calendar-event-editor-reminders-add-button">
              <li data-value="${10 * 60 * 1000}">
                <a href="#">[[moment:locale-data, relativeTime, 10, true, mm]]</a>
              </li>
              <li data-value="${30 * 60 * 1000}">
                <a href="#">[[moment:locale-data, relativeTime, 30, true, mm]]</a>
              </li>
              <li data-value="${60 * 60 * 1000}">
                <a href="#">[[moment:locale-data, relativeTime, 1, true, hh]]</a>
              </li>
              <li role="separator" class="divider"></li>
              <li data-value="custom">
                <a href="#">[[calendar:reminder_custom]]</a>
                ${customReminderTemplate()}
              </li>
            </ul>
          </div>
        </ul>
      </div>

      <div class="form-group plugin-calendar-event-repetition">
        <label for="plugin-calendar-event-editor-repetition">
          <i class="fa fa-repeat" aria-hidden="true"></i> [[calendar:repetition]]
        </label>
        <br>
        <ul id="plugin-calendar-event-editor-repetition">
          <div class="dropdown dropup" id="plugin-calendar-event-editor-repetition-change">
            <a class="dropdown-toggle" href="#"
            id="plugin-calendar-event-editor-repetition-change-button"
            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span class="text">[[calendar:no_repeat]]</span>
              <span class="caret"></span>
            </a>
            <ul class="dropdown-menu"
            aria-labelledby="plugin-calendar-event-editor-repetition-change-button">
              <li>
                <div class="radio">
                  <label>
                    <span>[[calendar:no_repeat]]</span>
                    <input type="radio" name="repetition-select" value="no-repeat" checked>
                    <i class="fa fa-check"></i>
                  </label>
                </div>
              </li>
              <li>
                <div class="radio">
                  <label>
                    <span>[[calendar:every_day]]</span>
                    <input type="radio" name="repetition-select" value="day">
                    <i class="fa fa-check"></i>
                  </label>
                </div>
              </li>
              <li>
                <div class="radio">
                  <label>
                    <span>[[calendar:every_week]]</span>
                    <input type="radio" name="repetition-select" value="week">
                    <i class="fa fa-check"></i>
                  </label>
                </div>
              </li>
              <li>
                <div class="radio">
                  <label>
                    <span>[[calendar:every_month]]</span>
                    <input type="radio" name="repetition-select" value="month">
                    <i class="fa fa-check"></i>
                  </label>
                </div>
              </li>
              <li>
                <div class="radio">
                  <label>
                    <span>[[calendar:every_year]]</span>
                    <input type="radio" name="repetition-select" value="year">
                    <i class="fa fa-check"></i>
                  </label>
                </div>
              </li>
              <li role="separator" class="divider"></li>
              <li data-value="custom">
                <div class="radio">
                  <label>
                    <span>[[calendar:repetition_custom]]</span>
                    <input type="radio" name="repetition-select" value="custom">
                    <i class="fa fa-check"></i>
                  </label>
                </div>
                ${customRepetitionTemplate()}
              </li>
            </ul>
          </div>
        </ul>
      </div>
    </div>
  </div>
</form>
`;

const modalTemplate = () => `
<div class="modal fade" id="plugin-calendar-event-editor" tabindex="-1"
role="dialog" aria-labelledby="plugin-calendar-event-editor-title">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal"
        aria-label="[[global:buttons.close]]">
          <i aria-hidden="true" class="fa fa-times"></i>
        </button>
        <h4 class="modal-title" id="plugin-calendar-event-editor-title">
          [[calendar:edit_event]]
        </h4>
      </div>
      <div class="modal-body">
        ${formTemplate()}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">
          [[modules:bootbox.cancel]]
        </button>
        <button type="button" class="btn btn-danger pull-left" aria-label="[[topic:delete]]"
        id="plugin-calendar-event-editor-delete">
          <i class="fa fa-trash-o"></i>
        </button>
        <button type="button" class="btn btn-primary" aria-label="[[global:save_changes]]"
        id="plugin-calendar-event-editor-submit">
          <i class="fa fa-save"></i>
        </button>
      </div>
    </div>
  </div>
</div>
`;

export {
  eventTemplate,
  modalTemplate,
  customReminderTemplate,
};
