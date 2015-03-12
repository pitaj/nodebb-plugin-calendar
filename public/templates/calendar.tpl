<div class="nodebb-plugin-calendar">
  <div id="editEvent" class="modal fade">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title">[[calendar:edit_event]]</h4>
        </div>
        <div class="modal-body">
          <form>
            <div class="errors"></div>
            <div class="form-group">
              <label for="event-name">[[calendar:event_name]]</label>
              <input id="event-name" class="form-control" placeholder="[[calendar:event_name]]" />
            </div>
            <div class="checkbox">
              <label>
                <input type="checkbox" id="event-allday" /> [[calendar:all_day]]
              </label>
            </div>
            <div class="form-group">
              <label for="event-start">[[calendar:start_date]]</label>
              <div class="input-group date" id="event-start">
                <input type="text" class="form-control" />
                <span class="input-group-addon">
                  <i class="fa fa-calendar"></i>
                </span>
              </div>
            </div>
            <div class="form-group">
              <label for="event-end">[[calendar:end_date]]</label>
              <div class="input-group date" id="event-end">
                <input type="text" class="form-control" />
                <span class="input-group-addon">
                  <i class="fa fa-calendar"></i>
                </span>
              </div>
            </div>
            <div class="form-group">
              <label for="event-place">[[calendar:place]]</label>
              <input id="event-place" class="form-control" placeholder="[[calendar:place]]" />
            </div>
            <div class="form-group">
              <label for="event-editors">[[calendar:editors]]</label>
              <input id="event-editors" class="form-control" placeholder="[[calendar:start_typing]]" />
            </div>
            <div class="checkbox">
              <label>
                <input type="checkbox" id="event-public" /> [[calendar:public]]
              </label>
            </div>
            <div class="form-group">
              <label for="event-viewers">[[calendar:viewers]]</label>
              <input id="event-viewers" type="text" class="form-control" placeholder="[[calendar:start_typing]]" />
            </div>
            <div class="form-group">
              <label for="event-blocked">[[calendar:blocked]]</label>
              <input id="event-blocked" type="text" class="form-control" placeholder="[[calendar:start_typing]]" />
            </div>
            <div class="form-group">
              <label for="event-notifications">[[pages:notifications]]</label>
              <input id="event-notifications" type="text" class="form-control" data-role="tagsinput" placeholder="[[calendar:start_typing]]" />
            </div>
            <div class="form-group">
              <label for="event-description">[[calendar:description]]</label>
              <textarea rows="10" id="event-description" class="form-control" placeholder="[[calendar:description_ext]]"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> [[global:close]]</button>
          <button type="button" class="btn btn-primary save"><i class="fa fa-save"></i> [[global:save_changes]]</button>
          <button type="button" class="btn btn-danger delete"><i class="fa fa-trash-o"></i> [[topic:delete]]</button>
        </div>
      </div>
    </div>
  </div>

  <div id="errors"></div>

  <div id="cal" class="panel panel-default">
    <div id="cal-days-container">
      <table id="cal-days">
        <tbody>

        </tbody>
      </table>
    </div>
    <div id="cal-toolbar">
      <div class="left">
        <!-- IF canCreate -->
        <button data-toggle="modal" data-target="#editEvent" class="button-add-event btn btn-success">
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

  <div id="cal-sidebar" class="panel panel-default">
    <div class="toggle">
      <i class="fa fa-chevron-down"></i>
    </div>
    <div class="panel-heading row">
      <div class="col-xs-6">
        <button class="day btn btn-primary active" href="#" title="" data-original-title="[[calendar:day_title]]">
          [[calendar:day_title]]
        </button>
      </div>
      <div class="col-xs-6">
        <button class="event btn btn-primary" href="#" title="" data-original-title="[[calendar:event_title]]">
          [[calendar:event_title]]
        </button>
      </div>
    </div>
    <div class="content panel-body row">
      <div class="col-xs-6 active">
        <div class="day active panel panel-default">
          <div class="panel-heading">
            <h3 class="date"><!-- date goes here --></h3>
          </div>
          <div class="events panel-body">
            <!-- events go here -->
          </div>
        </div>
      </div>
      <div class="col-xs-6">
        <div class="event topic trans panel panel-default">
          <div class="topic-text panel-body">
            <div class="topic-profile-pic hidden-xs text-center user">
              <a href="/user/{userslug}">
                <img src="{picture}" alt="{username}" class="profile-image user-img" title="" data-original-title="{username}">
              </a>
              <small class="username" title="{username}">
                <a href="/user/{userslug}">{username}</a>
              </small>
            </div>
            <h3 class="topic-title">
              <i class="edit-event-button fa fa-pencil-square-o" data-toggle="modal" data-target="#editEvent"></i>
              <p class="topic-title name" itemprop="name">[[calendar:event_unselected]]</p>
              <hr>
            </h3>
            <div class="post-content" itemprop="text">
              <h3>[[calendar:when]]</h3>
              <p class="dates">
                <strong>[[calendar:starts]]:</strong> <span class="date-timestamp start" data-allday="{allday}" data-timestamp="{timestamp}" data-onlytime="false"></span><br>
                <strong>[[calendar:ends]]:</strong> <span class="date-timestamp end" data-allday="{allday}" data-timestamp="{timestamp}" data-onlytime="false"></span>
              </p>
              <h3>[[calendar:where]]</h3>
              <p>
                <span class="place"><!-- place goes here --></span>
              </p>
              <hr>
              <p class="description">
                <!-- description goes here -->
              </p>
              <h3>[[calendar:responses_title]]</h3>
              <div class="responses">
                <p class="my-response">
                  <small class="username">
                    <a href="/user/{userslug}">{username}</a>
                  </small>
                  <span class="invited selected">[[calendar:response_invited]]</span>
                  <span class="not-attending">[[calendar:response_not_attending]]</span>
                  <span class="maybe">[[calendar:response_maybe]]</span>
                  <span class="attending">[[calendar:response_attending]]</span>
                </p>
                <!-- other responses appended like
                <p class="response">
                  <small class="username" title="{username}">
                    <a href="/user/{userslug}">{username}</a>
                  </small>
                  <span class="{value}">[[calendar:response_{value}]]</span>
                </p>
                -->
              </div>
              <div class="cal-whoisin" style="display:none;"></div>
              <h3>[[calendar:comments_title]]</h3>
              <iframe class="comments" scrolling="no"></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <style>
    @import url("/plugins/nodebb-plugin-calendar/public/css/main.css");
  </style>

  <style>
    #content > div.row:last-child {
      display: none;
    }
    body, html {
      height: 100%;
      overflow: hidden;
    }
    #content,
    .nodebb-plugin-calendar {
      height:100%;
    }
    #data_script {
      display:none;
    }
    body {
      padding-bottom: 5px;
    }
    .tt-suggestion {
      padding: 3px 20px;
      clear: both;
      font-weight: 400;
      line-height: 1.42857143;
      color: #333;
      white-space: nowrap;
    }
    .tt-suggestion.tt-cursor {
      background-color: #f5f5f5;
    }
  </style>

  <div id="data_script">
    {
      "events": {events},
      "canCreate": {canCreate},
      "whoisin": {whoisin},
      "buffer": {buffer}
    }
  </div>
  <script src="/plugins/nodebb-plugin-calendar/public/typeahead.bundle.js"></script>
  <script src="/plugins/nodebb-plugin-calendar/public/cal.js"></script>
</div>
