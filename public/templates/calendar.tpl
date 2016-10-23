<button type="button" id="plugin-calendar-cal-only-yes" title="[[calendar:only_yes_long]]">[[calendar:only_yes]]</button>
<div id="calendar"></div>

<script src="{relative_path}/plugins/nodebb-plugin-calendar/bundles/calendar.js"></script>
<style type="text/css" class="plugin-calendar-cal-styles">{{calendarEventsStyle}}</style>

<div class="modal fade" id="plugin-calendar-cal-event-display" tabindex="-1"
role="dialog" aria-labelledby="plugin-calendar-cal-event-display-title">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close dismiss" data-dismiss="modal"
        aria-label="[[global:buttons.close]]">
          <i aria-hidden="true" class="fa fa-times"></i>
        </button>
        <h4 class="modal-title" id="plugin-calendar-cal-event-display-title">
          [[calendar:event_title]]
        </h4>
      </div>
      <div class="modal-body">
        <div class="plugin-calendar-event panel panel-success"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default dismiss" data-dismiss="modal">
          [[global:buttons.close]]
        </button>
        <a type="button" href="#" itemprop="url" class="btn btn-primary" data-dismiss="modal">
          [[calendar:go_to_post]]
        </a>
      </div>
    </div>
  </div>
</div>
