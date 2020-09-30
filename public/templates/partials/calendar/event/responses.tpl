<div class="plugin-calendar-event-responses" data-day="{event.day}">
  <i class="fa fa-reply" aria-hidden="true"></i>
  <div class="col-xs-12 col-sm-6">
    {{{ if event.repeats }}}
    <div class="input-group plugin-calendar-event-responses-day">
      <input class="form-control" title="[[calendar:select_day]]" type="text">
      <span class="input-group-addon">
        <i class="fa fa-calendar-check-o"></i>
      </span>
    </div>
    {{{ end }}}
    
    <div class="plugin-calendar-event-responses-user btn-group" {{{ if !canRespond }}} style="display: none" {{{ end }}}>
      <button data-value="no" type="button" class="btn btn-sm btn-danger {active.no}">
        [[calendar:response_no]]
      </button>
      <button data-value="maybe" type="button" class="btn btn-sm btn-default {active.maybe}">
        [[calendar:response_maybe]]
      </button>
      <button data-value="yes" type="button" class="btn btn-sm btn-success {active.yes}">
        [[calendar:response_yes]]
      </button>
    </div>

    <div class="panel-group plugin-calendar-event-responses-lists" data-loaded="false">
      <div class="panel panel-default closed">
        <div class="panel-heading">
          <a role="button" href="#"
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
          <a role="button" href="#"
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
          <a role="button" href="#"
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
</div>