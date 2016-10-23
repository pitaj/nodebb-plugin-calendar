<div class="row">
  <div class="col-lg-9">
    <form class="form plugin-calendar-settings">
      <div class="panel panel-default">
        <div class="panel-heading">Calendar</div>
        <div class="panel-body">
          <div class="form-group">
            <label for="checkingInterval">
              Interval on which to check for events coming up (used for reminders)<br>
              Must restart to take effect
            </label>
            <input type="number" name="checkingInterval" id="checkingInterval" value="{settings.checkingInterval}" />
          </div>
          <div class="form-group">
            <label for="mainPostOnly">
              <input type="checkbox" name="mainPostOnly" id="mainPostOnly" <!-- IF settings.mainPostOnly --> checked <!-- ENDIF settings.mainPostOnly --> />
              Only allow events in the main post of a topic
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