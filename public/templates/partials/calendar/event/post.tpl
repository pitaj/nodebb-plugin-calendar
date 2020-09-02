<span class="hidden">plugin-calendar-event-wrapper:start |||{event.name}|||</span>
<div class="plugin-calendar-event panel panel-success" data-translated="false">
  <div class="plugin-calendar-event-name panel-heading">
    {event.name}
  </div>
  <div class="panel-body">
    <div class="plugin-calendar-event-date">
      <i class="fa fa-clock-o" aria-hidden="true"></i>
      <a
        title="[[moment:time-date-view, utc, {event.startDate}, {event.endDate}, {event.allday}]] UTC"
        class="plugin-calendar-time-date-view"
      >[[moment:time-date-view, local, {event.startDate}, {event.endDate}, {event.allday}]]</a>
    </div>
    {{{ if event.location }}}
    <div class="plugin-calendar-event-location">
      <i class="fa fa-location-arrow" aria-hidden="true"></i>
      <span>{event.location}<span>
    </div>
    {{{ end }}}
    {{{ if event.description }}}
    <div class="plugin-calendar-event-description">
      <i class="fa fa-info-circle" aria-hidden="true"></i>
      <div>{event.description}</div>
    </div>
    {{{ end }}}
    {{{ if reminders }}}
    <div class="plugin-calendar-event-reminders">
      <i class="fa fa-bell" aria-hidden="true"></i>
      <ul>
        {{{ each reminders }}}
        <li data-value="{@value}">[[moment:time-duration, {@value}]]</li>
        {{{ end }}}
      </ul>
    </div>
    {{{ end }}}
    {{{ if repeatsEveryUnit }}}
    <div class="plugin-calendar-event-repeats">
      <i class="fa fa-repeat" aria-hidden="true"></i>
      <span>[[calendar:every_{repeatsEveryUnit}]]</span>
    </div>
    {{{ end }}}
    {{{ if event.repeats.every.daysOfWeek }}}
      <div class="plugin-calendar-event-repeats">
        <i class="fa fa-repeat" aria-hidden="true"></i>
        <span>
          {{{ if repeatsEndDateFinite }}}
          [[calendar:repeats_weekly_on_until, [[moment:time-date-view, utc, {event.repeats.endDate}, {event.repeats.endDate}, true]]]]
          {{{ else }}}
          [[calendar:repeats_weekly_on_forever]]
          {{{ end }}}

          {{{ each event.repeats.every.daysOfWeek }}}
            [[moment:locale-data, weekdaysShort, {@value}]]{{{ if !@last }}}, {{{ end }}}
          {{{ end }}}
        </span>
      </div>
    {{{ end }}}
    {{{ if event.mandatory }}}
    <div class="plugin-calendar-event-mandatory">
      <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
      <span>[[calendar:mandatory]]</span>
    </div>
    {{{ else }}}
      <!-- IMPORT partials/calendar/event/responses.tpl -->
    {{{ end }}}
  </div>
</div>
<span class="hidden">plugin-calendar-event-wrapper:end</span>
