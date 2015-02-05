
<div id="container0">
  <span> 0px </span>
  <span> 100px </span>
  <span> 200px </span>
  <span> 300px </span>
  <span> 400px </span>
  <span> 500px </span>
  <span> 600px </span>
  <span> 700px </span>
  <span> 800px </span>
  <span> 900px </span>
  <span> 1000px </span>
  <span> 1100px </span>
  <span> 1200px </span>
  <span> 1300px </span>
  <span> 1400px </span>
  <span> 1500px </span>
  <span> 1600px </span>
  <span> 1700px </span>
  <span> 1800px </span>
  <span> 1900px </span>
  <span> 2000px </span>
  <span> 2100px </span>
  <span> 2200px </span>
  <span> 2300px </span>
  <span> 2400px </span>
  <span> 2500px </span>
  <span> 2600px </span>
  <span> 2700px </span>
  <span> 2800px </span>
  <span> 2900px </span>
  <span> 3000px </span>
  <span> 3100px </span>
  <span> 3200px </span>
  <span> 3300px </span>
  <span> 3400px </span>
  <span> 3500px </span>
  <span> 3600px </span>
  <span> 3700px </span>
  <span> 3800px </span>
  <span> 3900px </span>
  <span> 4000px </span>
</div>

<div id="scrollTop">0</div>

<div class="row">
  <div>
    <div id="cal">
      <div id="cal-toolbar">
        <div class="button-add-event right">
          <i class="fa fa-plus-square-o"></i>
        </div>
        <div class="button-today arrow-group">
          <i class="fa fa-calendar-o">6</i>
        </div>
        <div class="center">
          <select id="cal-month-select">
            <option value="0">
              [[calendar:month_0]]
            </option>
            <option value="1">
              [[calendar:month_1]]
            </option>
            <option value="2">
              [[calendar:month_2]]
            </option>
            <option value="3">
              [[calendar:month_3]]
            </option>
            <option value="4">
              [[calendar:month_4]]
            </option>
            <option value="5">
              [[calendar:month_5]]
            </option>
            <option value="6">
              [[calendar:month_6]]
            </option>
            <option value="7">
              [[calendar:month_7]]
            </option>
            <option value="8">
              [[calendar:month_8]]
            </option>
            <option value="9">
              [[calendar:month_9]]
            </option>
            <option value="10">
              [[calendar:month_10]]
            </option>
            <option value="11">
              [[calendar:month_11]]
            </option>
          </select>
          <input id="cal-year-select" type="number" value="2014"/>
        </div>
      </div>
      <div id="cal-headers-cont">
      <table id="cal-headers">
        <tbody>
          <tr>
            <td>
              [[calendar:day_0]]
            </td>
            <td>
              [[calendar:day_1]]
            </td>
            <td>
              [[calendar:day_2]]
            </td>
            <td>
              [[calendar:day_3]]
            </td>
            <td>
              [[calendar:day_4]]
            </td>
            <td>
              [[calendar:day_5]]
            </td>
            <td>
              [[calendar:day_6]]
            </td>
          </tr>
        </tbody>
      </table>
    </div>

      <div id="cal-days-container">
        <table id="cal-days">
          <tbody>

          </tbody>
        </table>
      </div>
    </div>

    <div id="cal-sidebar">
    <div class="toggle">
      <i class="fa fa-chevron-up"></i>
    </div>
    <ul class="nav">
      <li class="day cal-sb-active">
        <a href="#" title="" data-original-title="[[calendar:day_title]]">
          [[calendar:day_title]]
        </a>
      </li>
      <li class="event">
        <a href="#" title="" data-original-title="[[calendar:event_title]]">
          [[calendar:event_title]]
        </a>
      </li>
    </ul>
    <div class="content">
    <div class="day">
      <div class="date">

      </div>
      <div class="events">

      </div>
    </div>
    <div class="event">

      <div class="view unselected">
        <div class="name">[[calendar:event_unselected]]</div>
        <div class="topic-profile-pic text-center">

        </div>
        <i class="edit-event-button fa fa-pencil-square-o"></i>
        <div class="date">
        </div>
        <div class="place">
        </div>
        <hr>
        <div class="description">
        </div>
        <hr>
        <div class="responses">
          <div class="my-response">
            <small class="username" title="You"><a href="/user/{{user.name}}">{{user.fullname}}</a></small>
            <span class="invited">[[calendar:response_invited]]</span>
            <span class="not-attending">[[calendar:response_not_attending]]</span>
            <span class="maybe">[[calendar:response_maybe]]</span>
            <span class="attending">[[calendar:response_attending]]</span>
          </div>
        </div>
        <div class="cal-whoisin" style="display:none;"></div>
        <hr>
        <span class="comments-title">[[calendar:comment_title]]</span>
        <!-- embed nodebb comments here somehow -->
        <iframe class="comments" scrolling="no"></iframe>

      </div>

      <div class="edit" style="display:none;">
        <button class="save-event-button btn btn-success"><i class="fa fa-save"></i>  [[groups:cover-save]]</button>
        <button class="cancel-edit-button btn btn-warning"><i class="fa fa-times"></i> [[calendar:cancel]]</button>
        <button class="delete-event-button btn btn-danger"><i class="fa fa-trash-o"></i> [[topic:delete]]</button>

        <span class="title">[[calendar:edit_event]]</span>

        <div class="errors"></div>

        <span>[[calendar:event_name]]: </span>
        <input class="name form-control" placeholder="Event name" />
        <input type="checkbox" class="allday" /> [[calendar:all_day]]<br>
        <span>[[calendar:start_date]]: </span>
        <input class="start-time form-control" />
        <span>[[calendar:end_date]]: </span>
        <input class="end-time form-control" />
        <span>[[calendar:place]]: </span>
        <input class="place form-control" placeholder="[[calendar:place]]" />
        <span>[[calendar:editors]]: </span>
        <input class="editors form-control" placeholder="[[calendar:start_typing]]" />
        <input type="checkbox" class="public" /> [[calendar:public]]<br>
        <span>[[calendar:viewers]]: </span>
        <input class="viewers form-control" placeholder="[[calendar:start_typing]]" />
        <span>[[calendar:blocked]]: </span>
        <input class="blocked form-control" placeholder="[[calendar:start_typing]]" />
        <span>[[pages:notifications]]: </span>
        <input class="notifications form-control" placeholder="[[calendar:start_typing]]" />
        <span>[[calendar:description]]: </span>
        <textarea class="description form-control" placeholder="[[calendar:description_ext]]"></textarea>
      </div>
    </div>
  </div>
  </div>
  </div>
</div>

<style>

@import url("/plugins/nodebb-plugin-calendar/public/style.css");

</style>

<script id="calll">
  window.calendar = {};
  calendar.events = {events};
  calendar.canCreate = {canCreate};
  calendar.whoisin = {whoisin};
</script>

<script src="/plugins/nodebb-plugin-calendar/public/cal.js"></script>
