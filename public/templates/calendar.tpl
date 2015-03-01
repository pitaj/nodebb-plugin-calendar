<div id="cal">
  <div id="cal-days-container">
    <table id="cal-days">
      <tbody>

      </tbody>
    </table>
  </div>
  <div id="cal-toolbar">
    <div class="left">
      <!-- IF canCreate -->
      <button class="button-add-event btn btn-success">
        <span class="hidden-xs">[[calendar:add_event]]</span>
        <i class="fa fa-plus-square-o"></i>
      </button>
      <!-- ENDIF canCreate -->
      <button class="button-today btn btn-primary">
        <span class="hidden-xs">[[calendar:today]]</span>
        <i class="fa fa-calendar-o">{today.date}</i>
      </button>
      <form class="form-inline">
        <div class="form-group">
          <label class="sr-only" for="cal-month-select">[[calendar:month]]</label>
          <div class="dropdown" id="cal-month-select">
            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">
              <span data-value="{today.month}" class="month">[[calendar:month_{today.month}]]</span> <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" role="menu">
              <li data-value="0">
                <a href="#" >[[calendar:month_0]]</a>
              </li>
              <li data-value="1">
                <a href="#" >[[calendar:month_1]]</a>
              </li>
              <li data-value="2">
                <a href="#" >[[calendar:month_2]]</a>
              </li>
              <li data-value="3">
                <a href="#" >[[calendar:month_3]]</a>
              </li>
              <li data-value="4">
                <a href="#" >[[calendar:month_4]]</a>
              </li>
              <li data-value="5">
                <a href="#" >[[calendar:month_5]]</a>
              </li>
              <li data-value="6">
                <a href="#" >[[calendar:month_6]]</a>
              </li>
              <li data-value="7">
                <a href="#" >[[calendar:month_7]]</a>
              </li>
              <li data-value="8">
                <a href="#" >[[calendar:month_8]]</a>
              </li>
              <li data-value="9">
                <a href="#" >[[calendar:month_9]]</a>
              </li>
              <li data-value="10">
                <a href="#" >[[calendar:month_10]]</a>
              </li>
              <li data-value="11">
                <a href="#" >[[calendar:month_11]]</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="form-group btn btn-default">
          <label class="sr-only" for="cal-year-select">[[calendar:year]]</label>
          <input id="cal-year-select" type="tel" value="{today.year}" max="2100" min="1950" size="4" maxlength="4" minlength="4"/>
          <span class="arrows">
            <i class="fa fa-chevron-circle-up"></i>
            <i class="fa fa-chevron-circle-down"></i>
          </span>
        </div>
      </form>
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
  </div>
</div>

<div id="cal-sidebar">
  <div class="toggle">
    <i class="fa fa-chevron-down"></i>
  </div>
  <ul class="nav">
    <li role="presentation" class="day">
      <a href="#" title="" data-original-title="[[calendar:day_title]]" class="active">
          [[calendar:day_title]]
        </a>
    </li>
    <li role="presentation" class="event">
      <a href="#" title="" data-original-title="[[calendar:event_title]]">
          [[calendar:event_title]]
        </a>
    </li>
  </ul>
  <div class="content">
    <div class="day active">
      <div class="date">

      </div>
      <div class="events">

      </div>
    </div>
    <div class="event">

      <div class="view unselected">
        <div class="name"><span class="selected"></span><span class="unselected">[[calendar:event_unselected]]</span></div>
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
            <small class="username">
              <a href="/user/{user.userslug}">{user.username}</a>
            </small>
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
        <button class="save-event-button btn btn-success"><i class="fa fa-save"></i> [[groups:cover-save]]</button>
        <button class="cancel-edit-button btn btn-warning"><i class="fa fa-times"></i> [[calendar:cancel]]</button>
        <button class="delete-event-button btn btn-danger"><i class="fa fa-trash-o"></i> [[topic:delete]]</button>

        <span class="title">[[calendar:edit_event]]</span>

        <div class="errors"></div>

        <span>[[calendar:event_name]]: </span>
        <input class="name form-control" placeholder="Event name" />
        <input type="checkbox" class="allday" /> [[calendar:all_day]]
        <br>
        <span>[[calendar:start_date]]: </span>
        <input class="start-time form-control" />
        <span>[[calendar:end_date]]: </span>
        <input class="end-time form-control" />
        <span>[[calendar:place]]: </span>
        <input class="place form-control" placeholder="[[calendar:place]]" />
        <span>[[calendar:editors]]: </span>
        <input class="editors form-control" placeholder="[[calendar:start_typing]]" />
        <input type="checkbox" class="public" /> [[calendar:public]]
        <br>
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

<style>
  @import url("/plugins/nodebb-plugin-calendar/public/style.css");
</style>

<div id="data_script">
  {
    "events": {events},
    "canCreate": {canCreate},
    "whoisin": {whoisin},
    "buffer": {buffer}
  }
</div>

<script src="/plugins/nodebb-plugin-calendar/public/cal.js"></script>
