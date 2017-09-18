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
          <div class="input-group plugin-calendar-event-editor-date"
          id="plugin-calendar-event-editor-startDate">
            <input type="text" class="form-control"
            title="[[calendar:start_date]]"/>
            <span class="input-group-addon">
              <i class="fa fa-play"></i>
            </span>
          </div>
          <div class="input-group plugin-calendar-event-editor-date"
          id="plugin-calendar-event-editor-endDate">
            <input type="text" class="form-control"
            title="[[calendar:end_date]]"/>
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
              <li data-value="600000">
                <a href="#">[[moment:locale-data, relativeTime, 10, true, mm]]</a>
              </li>
              <li data-value="1800000">
                <a href="#">[[moment:locale-data, relativeTime, 30, true, mm]]</a>
              </li>
              <li data-value="3600000">
                <a href="#">[[moment:locale-data, relativeTime, 1, true, hh]]</a>
              </li>
              <li role="separator" class="divider"></li>
              <li data-value="custom">
                <a href="#">[[calendar:reminder_custom]]</a>
                <!-- IMPORT partials/calendar/event-creation-custom-reminder.tpl -->
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
                    <input type="radio" name="repetition-select" value="no-repeat" checked>
                    <i class="fa fa-check"></i>
                    <span>[[calendar:no_repeat]]</span>
                  </label>
                </div>
              </li>
              <li>
                <div class="radio">
                  <label>
                    <input type="radio" name="repetition-select" value="day">
                    <i class="fa fa-check"></i>
                    <span>[[calendar:every_day]]</span>
                  </label>
                </div>
              </li>
              <li>
                <div class="radio">
                  <label>
                    <input type="radio" name="repetition-select" value="week">
                    <i class="fa fa-check"></i>
                    <span>[[calendar:every_week]]</span>
                  </label>
                </div>
              </li>
              <li>
                <div class="radio">
                  <label>
                    <input type="radio" name="repetition-select" value="month">
                    <i class="fa fa-check"></i>
                    <span>[[calendar:every_month]]</span>
                  </label>
                </div>
              </li>
              <li>
                <div class="radio">
                  <label>
                    <input type="radio" name="repetition-select" value="year">
                    <i class="fa fa-check"></i>
                    <span>[[calendar:every_year]]</span>
                  </label>
                </div>
              </li>
              <li role="separator" class="divider"></li>
              <li data-value="custom">
                <div class="radio">
                  <label>
                    <input type="radio" name="repetition-select" value="custom">
                    <i class="fa fa-check"></i>
                    <span>[[calendar:repetition_custom]]</span>
                  </label>
                </div>
                <!-- IMPORT partials/calendar/event-creation-custom-repeat.tpl -->
              </li>
            </ul>
          </div>
        </ul>
      </div>
    </div>
  </div>
</form>