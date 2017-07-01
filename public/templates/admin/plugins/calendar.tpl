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
              <input type="checkbox" name="mainPostOnly" id="mainPostOnly" <!-- IF settings.mainPostOnly --> checked <!-- ENDIF settings.mainPostOnly --> />
              Only allow events in the main post of a topic
            </label>
          </div>
          <div class="form-group">
            <label for="respondIfCanReply">
              <input type="checkbox" name="respondIfCanReply" id="respondIfCanReply" <!-- IF settings.respondIfCanReply --> checked <!-- ENDIF settings.respondIfCanReply --> />
              Link the permission to respond to an event to the reply permission, as opposed to (by default) the view permission
            </label>
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