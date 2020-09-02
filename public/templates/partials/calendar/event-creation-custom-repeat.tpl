<div class="well well-sm" id="plugin-calendar-event-editor-repetition-custom"
style="display:none">
  <form>
    <label for="plugin-calendar-event-editor-repetition-custom-daysOfWeek">
      [[calendar:repeat_weekly]]
    </label>
    <div class="form-group" id="plugin-calendar-event-editor-repetition-custom-daysOfWeek">
      <ul>
        <li data-value="0">
          <a href="#">[[moment:locale-data, weekdaysShort, 0]]</a>
        </li>
        
        <li data-value="1">
          <a href="#">[[moment:locale-data, weekdaysShort, 1]]</a>
        </li>
        
        <li data-value="2">
          <a href="#">[[moment:locale-data, weekdaysShort, 2]]</a>
        </li>
        
        <li data-value="3">
          <a href="#">[[moment:locale-data, weekdaysShort, 3]]</a>
        </li>
        
        <li data-value="4">
          <a href="#">[[moment:locale-data, weekdaysShort, 4]]</a>
        </li>
        
        <li data-value="5">
          <a href="#">[[moment:locale-data, weekdaysShort, 5]]</a>
        </li>
        
        <li data-value="6">
          <a href="#">[[moment:locale-data, weekdaysShort, 6]]</a>
        </li>
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