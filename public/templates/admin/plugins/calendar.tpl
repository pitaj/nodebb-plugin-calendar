<ul class="nav nav-pills">
  <li class="active"><a href="#settings" data-toggle="tab" aria-expanded="false">[[calendar:tabs.settings]]</a></li>
  <li><a href="#icals" data-toggle="tab" aria-expanded="true">[[calendar:tabs.icals]]</a></li>
</ul>

<div class="tab-content">
  <div class="tab-pane fade active in" id="settings">
    <div class="row">
      <div class="col-lg-12">
        <form class="plugin-calendar-settings" id="plugin-calendar-settings">
          <div class="panel panel-default">
            <div class="panel-body">
              <div class="form-group row">
                <label for="checkingInterval" class="col-xs-12 col-sm-8">
                  Interval on which to check for upcoming events (used for reminders)
                </label>
                <div class="col-xs-12 col-sm-4">
                  <input type="tel" class="form-control" name="checkingInterval" id="checkingInterval" value="{settings.checkingInterval}" />
                </div>
              </div>
              <div class="form-group row">
                <label for="checkingICalInterval" class="col-xs-12 col-sm-8">
                  Interval on which to check for ical updates (in minutes)
                </label>
                <div class="col-xs-12 col-sm-4">
                  <input type="tel" class="form-control" name="checkingICalInterval" id="checkingICalInterval" value="{settings.checkingICalInterval}" />
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
    </div>

    <button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
    	<i class="material-icons">save</i>
    </button>
  </div>

  <div class="tab-pane fade" id="icals">
    <div class="panel panel-default">
      <div class="panel-body">
        <div class="form-group row">
          <div class="col-xs-12 col-sm-10">
          </div>
          <div class="col-xs-12 col-sm-2">
          </div>
        </div>
      </div>
    </div>

    <button id="addICal" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored" data-action="create">
      <i class="material-icons">note_add</i>
    </button>
  </div>
</div>
