<div class="row">
  <div class="col-lg-9">
    <form class="plugin-calendar-settings" id="plugin-calendar-settings">
      <div class="panel panel-default">
        <div class="panel-heading">Calendar</div>
        <div class="panel-body">
          <div class="form-group row">
            <label for="checkingInterval" class="col-xs-12 col-sm-8">
              Interval on which to check for upcoming events (used for reminders)
            </label>
            <div class="col-xs-12 col-sm-4">
              <input type="tel" class="form-control" name="checkingInterval" id="checkingInterval" value="{settings.checkingInterval}" />
            </div>
          </div>
          <div class="form-group">
            <label for="mainPostOnly">
              <input type="checkbox" name="mainPostOnly" id="mainPostOnly" {{{ if settings.mainPostOnly }}} checked {{{ end }}} />
              Only allow events in the main post of a topic
            </label>
          </div>
          <div class="form-group">
            <label for="respondIfCanReply">
              <input type="checkbox" name="respondIfCanReply" id="respondIfCanReply" {{{ if settings.respondIfCanReply }}} checked {{{ end }}} />
              Link the permission to respond to an event to the reply permission, as opposed to (by default) the view permission
            </label>
          </div>
          <div class="form-group row">
            <label for="calendarViews" class="col-xs-12 col-sm-8">
              Available views on the calendar page. Options are 
              <code>month</code>, <code>agendaDay</code>, <code>agendaWeek</code>, <code>listDay</code>, 
              <code>listWeek</code>, <code>listMonth</code>, and <code>listYear</code>.
              <br>
              Examples of these can be found at <a href="https://fullcalendar.io/docs" target="_blank">the FullCalendar Documentation</a>.
            </label>
            <div class="col-xs-12 col-sm-4">
              <input type="text" class="form-control" name="calendarViews" id="calendarViews" value="{settings.calendarViews}" />
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
  <div class="col-lg-3">
    <div class="panel panel-default">
      <div class="panel-heading">Control Panel</div>
      <div class="panel-body">
        <button class="btn btn-primary" id="save">Save Settings</button>
      </div>
    </div>
  </div>
</div>