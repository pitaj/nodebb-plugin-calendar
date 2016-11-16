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