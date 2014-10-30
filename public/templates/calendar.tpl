
<div class="row">
  <div id="cal-toolbar">
    <div class="arrow-group">
			<!--
      <button class="button-left-arrow" type="button" >&lt;</button>
			<button class="button-right-arrow" type="button" >&gt;</button>
			-->
      <button class="button-today btn btn-primary" type="button" >today</button>
    </div>
    <div class="right">
      <button class="button-add-event btn btn-primary" type="button">add event</button>
    </div>
    <div class="center">
      <span id="cal-month">January</span>
			<select id="cal-month-select">
				<option value="0">
					January
				</option>
				<option value="1">
					February
				</option>
				<option value="2">
					March
				</option>
				<option value="3">
					April
				</option>
				<option value="4">
					May
				</option>
				<option value="5">
					June
				</option>
				<option value="6">
					July
				</option>
				<option value="7">
					August
				</option>
				<option value="8">
					September
				</option>
				<option value="9">
					October
				</option>
				<option value="10">
					November
				</option>
				<option value="11">
					December
				</option>
			</select>
			<input id="cal-year-select" type="number" value="2014"/>
    </div>

  </div>

  <div id="cal-templates" style="display:none;">
    <!-- day template -->
    <td>
      <span class="day-number {{other-month}}">{{day-number}}</span>
      <!-- other-month == "" || "other-month" -->
      <!-- 0 <= day-number <= 31 -->
      {{day-events}}
    </td>

    <!-- event template -->
    <div class="event {{event-width}}">
      <!-- event-width == "" || "twowide" || "threewide" ||
      "fourwide" || "fivewide" || "sixwide" || "sevenwide" -->
      <!-- event-linked == "" || "linked" -->
      <span class="time">{{event-time}}</span> {{event-name}}
    </div>
  </div>
  <div id="cal">
  	<table id="cal-headers">
			<tbody>
				<tr>
					<td>
						Sun
					</td>
					<td>
						Mon
					</td>
					<td>
						Tue
					</td>
					<td>
						Wed
					</td>
					<td>
						Thu
					</td>
					<td>
						Fri
					</td>
					<td>
						Sat
					</td>
				</tr>
			</tbody>
		</table>
		<div id="cal-days-container">
			<table id="cal-days">
				<tbody>

				</tbody>
			</table>
		</div>
  </div>

	<div id="cal-sidebar">
		<ul class="nav">
      <li class="day cal-sb-active">
        <a href="#" title="" data-original-title="Day">
          Day
        </a>
      </li>
			<li class="event">
				<a href="#" title="" data-original-title="Event">
					Event
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
          <div class="name">No Event Selected</div>
          <div class="topic-profile-pic text-center">

          </div>
          <button class="edit-event-button btn"><i class="fa fa-pencil"></i> Edit</button>
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
              <span class="invited">No response</span>
              <span class="not-attending">Not attending</span>
              <span class="maybe">Maybe</span>
              <span class="attending">Attending</span>
            </div>
          </div>
          <hr>
          <span class="comments-title">Comments</span>
          <!-- embed nodebb comments here somehow -->
          <iframe class="comments" scrolling="no"></iframe>

        </div>

        <div class="edit" style="display:none;">
          <button class="save-event-button btn btn-success"><i class="fa fa-save"></i> Save</button>
          <button class="cancel-edit-button btn btn-warning"><i class="fa fa-times"></i> Cancel</button>
          <button class="delete-event-button btn btn-danger"><i class="fa fa-trash-o"></i> Delete</button>

          <span class="title">Edit Event</span>

          <div class="errors"></div>

          <span>Name: </span>
          <input class="name form-control" placeholder="Event name" />
          <input type="checkbox" class="allday" /> All day<br>
          <span>Start time/date: </span>
          <input class="start-time form-control" placeholder="dd / mm / yyyy HH:mm" />
          <span>End time/date: </span>
          <input class="end-time form-control" placeholder="dd / mm / yyyy HH:mm" />
          <span>Place: </span>
          <input class="place form-control" placeholder="Location of event" />
          <span>Editors: </span>
          <small>Comma separated list. Prefix users with (@). To exclude users or groups, prefix with a minus sign (-)</small>
          <input class="editors form-control" placeholder="Groups & users that can edit" />
          <input type="checkbox" class="public" /> Public<br>
          <span>Viewers: </span>
          <small>Comma separated list. Prefix users with (@). To exclude users or groups, prefix with a minus sign (-)</small>
          <input class="viewers form-control" placeholder="Groups & users that can view and get notifications" />
          <span>Notifications: </span>
          <small>Comma separated list of the amount of time before the event.
            The example below shows notifications at 1 day before, 10 minutes before, and 5 hours before the event start.</small>
          <input class="notifications form-control" placeholder="1d, 10m, 5h" />
          <span>Description: </span>
          <textarea class="description form-control" placeholder="Other event information (Markdown only)"></textarea>
        </div>

      </div>

		</div>
	</div>

</div>

<div widget-area="footer">
	<!-- BEGIN widgets -->
	{ widgets.html }
	<!-- END widgets -->
</div>

<style>

  div#content.container {
    width: 100%;
  }

  .row {
    padding-left: 20px;
    padding-right: 10px;
  }
  #cal {
    font-size: 14px;
		border-collapse: collapse;
		font-family: Lato, sans-serif;
		width: 860px;
		overflow: hidden;
		float: left;
		box-shadow: 0 1px 10px rgba(0,0,0,.15);
  }
	#cal table, #cal tbody {
		border-collapse: collapse;
		width: 860px;
	}
  #cal td {
    border: 1px solid #ddd;
    margin: 0;
    padding: 2px;
    max-width: 120px;
    width: 120px;
    position: relative;
  }

  #cal tr {
    height: 120px;
    vertical-align: top;
    text-align:right;
  }

  #cal #cal-headers tr {
    height: 21px;
    color: #444;
    text-align: center;
  }

	#cal #cal-days-container {
		overflow-y: scroll;
		z-index: 2;
		height: 722px;
		width: 900px;
	}

	#cal-days {
		max-width: 860px;
	}

  #cal .event {
    text-align: left;
    font-size: .85em;
    line-height: 1.3;
    border-radius: 3px;
    border: 1px solid #3a87ad;
    background-color: #3a87ad;
    font-weight: normal;
    color: whitesmoke;
    padding: 0 1px;
    overflow: hidden;
    margin-bottom: 2px;
		cursor: pointer;
    z-index: 5;
    position: relative;
    text-overflow: ellipsis;
    height:17px;
  }

  #cal .event .time {
    font-weight: bold;
  }

  #cal .event.linked {
    cursor: pointer;
  }

  #cal .event.twowide {
    width: 240px;
  }

  #cal .event.threewide {
    width: 365px;
  }

  #cal .event.fourwide {
    width: 490px;
  }

  #cal .event.fivewide {
    width: 615px;
  }

  #cal .event.sixwide {
    width: 740px;
  }

  #cal .event.sevenwide {
    width: 865px;
  }

	#cal .event:nth-child(n){
    display: none;
  }

  #cal .event:nth-child(1), #cal .event:nth-child(2), #cal .event:nth-child(3), #cal .event:nth-child(4), #cal .event:nth-child(5){
    display: block;
  }

  #cal .event:nth-child(6){
    text-indent: -9999px;
    position: relative;
    display: block;
    color: black;
    border: none;
    background-color: transparent;
  }

  #cal .event:nth-child(6)::before{
    position: absolute;
    text-indent: 0px;
    content: "more ...";
    display: block;
    color: #3a87ad;
  }

  #cal td .day-number {
    display: block;
    padding-right: 3px;
    color: #444;
    font-family: Lato, sans-serif;
    font-size: 14px;
    font-weight: 300;
    height: 17px;
    margin-bottom: 6px;
    /* opacity: 0.3; */
  }

	/*
  #cal td.this-month .day-number {
		opacity: 1;
	}
  */

  #cal td.dark-month {
    background-color: rgb(228, 228, 228);
  }

  #cal-toolbar {
    margin-bottom: 1em;
    font-family: Lato, sans-serif;
    text-align: center;
    width: 858px;
    margin-left:1px;
  }

  #cal-toolbar .right {
    text-align: right;
  }

  #cal-toolbar .center {
    display: inline-block;
    font-size: 22px;
    color: #444;
		position:relative;
		top:0;
		left:0;
  }

	#cal-month-select {
		position: absolute;
		left: 1px;
		width: 76px;
		height: 21px;
		z-index: -1;
		top: 10px;
	}

  #cal-month:hover {
      background-color: rgb(240, 240, 240); border-radius: 4px;
      cursor: pointer;
  }

	#cal-year-select {
		border: none;
		width: 80px;
		padding-left: 4px;
		background: #FAFAFA;
	}

	#cal-year-select:hover {
		background-color: rgb(240, 240, 240);
		border-radius: 4px;
	}

	#cal-month {
		width: 108px;
		background: #FAFAFA;
		display:inline-block;
	}

	#cal #cal-day-selected {
		background: #CFFFCA;
	}

  #cal-toolbar .arrow-group {
    float: left;
    width: 145px;
    text-align:left;
  }

  #cal-toolbar .right {
    float: right;
    width: 145px;
    height:30px;
  }

  /*

  #cal-toolbar .arrow-group button {
    box-sizing: border-box;
    height: 2.1em;
    padding: 0 .6em;
    font-size: 1em;
    white-space: nowrap;
    cursor: pointer;
    display: inline-block;
    border: 1px solid;
    background-color: #f5f5f5;
    background-image: -moz-linear-gradient(top, #ffffff, #e6e6e6);
    background-image: -o-linear-gradient(top, #ffffff, #e6e6e6);
    background-image: linear-gradient(to bottom, #ffffff, #e6e6e6);
    background-repeat: repeat-x;
    border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
    color: #333;
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.75);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);
    font-family: Arial;
    font-size: 14px;
    height: 30px;
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 0;
    text-shadow: rgba(255, 255, 255, 0.74902) 0px 1px 1px;
  }

  #cal-toolbar .arrow-group .button-left-arrow {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    font-weight: bold;
    margin-left: 1px;
    width: 41px;
  }

  #cal-toolbar .arrow-group .button-right-arrow {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    font-weight: bold;
    margin-left: -5px;
    width: 41px;
  }

  #cal-toolbar .arrow-group .button-today {
    border-radius: 4px;
  }

  #cal-toolbar .arrow-group button:active {
    color: #333333;
    background-color: #cccccc;
    background-image: none;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  #cal-toolbar .arrow-group button:hover {
    background-color: #e6e6e6;
    color: #333333;
    text-decoration: none;
    background-position: 0 -15px;
    transition: background-position 0.1s linear;
  }

  */

	#cal-sidebar {
		box-shadow: 0 1px 10px rgba(0,0,0,.15);
		overflow: hidden;
		margin: 10px;
		margin-left: 870px;
		height:748px;
		border: 1px solid #ddd;
    position:relative;
	}

	#cal-sidebar ul.nav {
		width: 100%;
		text-align: center;
		border-bottom: 1px solid #ddd;
		box-shadow: 0 1px 10px rgba(0,0,0,.15);
	}
	#cal-sidebar ul.nav li {
    width: 50%;
    display: inline-block;
    float: left;
    height: 50px;
    line-height: 30px;
  }
  #cal-sidebar ul.nav li.cal-sb-active {
		background-color: #e6e6e6;
	}
  #cal-sidebar ul.nav li a {
    color: #555;
  }
  #cal-sidebar ul.nav li:first-child {
    border-right: 1px solid lightgrey;
  }
  #cal-sidebar ul.nav li:active, #cal-sidebar ul.nav li.cal-sb-active:active {
    background-color: grey;
  }

  #cal-sidebar ul.nav li:active a {
    color:white;
  }

	#cal-sidebar hr {
		float: left;
		width: 100%;
		margin: 10px 0;
	}

  #cal-sidebar .content {
      font-family: Arial, Sans-serif;
      width:200%;
      height:100%;
  }

  #cal-sidebar .content > .event {
    float: left;
    width: 50%;
    overflow-x: hidden;
    overflow-y: scroll;
    height: 695px;
    position: relative;
  }

  #cal-sidebar .content .event .view iframe.comments {
    border: none;
    padding: 0;
    width: 100%;
    min-height: 300px;
  }

  #cal-sidebar .content .day {
    float: left;
    width: 50%;
    overflow-x: hidden;
    overflow-y: auto;
    border-right: 1px solid #ddd;
    height: 100%;
  }

  #cal-sidebar .content .day .date {
    text-align: center;
    font-size: 20px;
    padding: 10px;
  }

  #cal-sidebar .content .day .event {
    padding: 10px;
    padding-bottom: 15px;
    border-top: 1px solid rgb(231, 231, 231);
    cursor: pointer;
    margin: 0;
    width: 100%;
    height: initial;
    overflow: hidden;
  }

  #cal-sidebar .content .day .event .event-name {
      font-weight: bold;
      font-size: 15px;
  }

  #cal-sidebar .content .day .event .time {
      line-height: 12px;
      margin-top: 2px;
      font-size: 11px;
      font-variant: small-caps;
  }

  #cal-sidebar .content .day .event .place {
      font-size: 13px;
  }

  #cal-sidebar .content .day .event:hover {
      background-color: #F2F2F2;
  }

  #cal-sidebar .content .day .event:active {
      background-color: grey;
      color: white;
  }

  #cal-sidebar .content .day .events {
      overflow-y: auto;
  }
  #cal-sidebar .content .event .view .topic-profile-pic a {
    display: block;
  }
  #cal-sidebar .content .event .view .topic-profile-pic {
    float: left;
    margin: 10px;
    margin-right: 15px;
  }
  #cal-sidebar .content .event .view .name {
    text-align: center; font-size: 20px; padding: 10px;
  }
  #cal-sidebar .content .event .view .date {
    margin-bottom: 5px;
  }
  #cal-sidebar .content .event .view .date::before {
    content: "when: ";
    font-variant: small-caps;
  }
  #cal-sidebar .content .event .view .date span {
    display:block;
  }

  #cal-sidebar .content .event .view .place::before {
    content: "where: ";
    font-variant: small-caps;
  }

  #cal-sidebar .content .event .view .responses div span {
    border-radius: 3px;
    padding:2px 5px;
    cursor: pointer;
    margin-left:3px;
  }
  #cal-sidebar .content .event .view .responses div span.invited {
    background-color: lightgrey;
  }
  #cal-sidebar .content .event .view .responses div span.not-attending {
    background-color: pink;
  }
  #cal-sidebar .content .event .view .responses div span.attending {
    background: lightgreen;
  }
  #cal-sidebar .content .event .view .responses div span.maybe {
    background: lightblue;
  }

  #cal-sidebar .content .event .view .responses div small.username {
    font-size: 15px;
    font-weight: bold;
  }
  #cal-sidebar .content .event .view .responses {
    padding-left:10px;
  }

  #cal-sidebar .content .event .view .responses::before {
    display: block;
    content: "Responses";
    font-size: 16px;
    margin-bottom:5px;
  }

  #cal-sidebar .content .event .view .comments-title {
    display: block;
    padding-left: 10px;
    font-size: 16px;
  }

  #cal-sidebar .content .event .view .description {
    padding-left:10px;
  }

  #cal-sidebar .content .event .view .description::before {
    display: block;
    content: "Description";
    font-size: 16px;
    margin-bottom:5px;
  }

  #cal-sidebar .content .event .view.unselected .name {
    display: block;
  }

  #cal-sidebar .content .event .view.unselected * {
    display: none;
  }

  #cal-sidebar .content .event .view .responses div span.selected {
    border: 1px solid black;
  }

  #cal-sidebar .content .event .view .edit-event-button {
    float: right;
    margin: 10px;
  }

  #cal-sidebar .content .event .edit {
    position: absolute;
    width: 100%;
    height: 685px;
    background: #FAFAFA;
    padding: 10px;
    font-weight: bold;
    left:0;
    top: 10px;
    overflow: auto;
  }

  #cal-sidebar .content .event .edit input, #cal-sidebar .content .event .edit textarea {
    font-weight: normal;
    margin-top: 5px;
    margin-bottom: 10px;
  }

  #cal-sidebar .content .event .edit textarea {
    height: 200px;
  }

  #cal-sidebar .content .event .edit .allday {
    margin-right: 4px;
  }

  #cal-sidebar .content .event .edit .title {
    text-align: center;
    font-size: 20px;
    margin-bottom: 20px;
    display: block;
    font-weight: normal;
    float:none;
  }

  #cal-sidebar .content .event .edit .save-event-button {
    float: right;
  }
  #cal-sidebar .content .event .edit .delete-event-button {
    float: left;
    margin-left: 10px;
  }
  #cal-sidebar .content .event .edit .cancel-edit-button {
    float: left;
  }

  #cal-sidebar.side-by-side .content > div {
      width: 25%;
  }
  #cal-sidebar.side-by-side .content .day {
      margin-left: 0!important;
  }
  #cal-sidebar.side-by-side ul.nav li.cal-sb-active{
      background-color: transparent;
  }
  #cal-sidebar.side-by-side ul.nav li a:hover{
      background-color: transparent;
  }
  #cal-sidebar.side-by-side ul.nav li a {
      cursor: default;
  }
  #cal-sidebar.side-by-side ul.nav li:active, #cal-sidebar ul.nav li.cal-sb-active:active {
    background-color: transparent;
  }

  #cal-sidebar.side-by-side ul.nav li:active a {
    color: initial;
  }

  #cal-sidebar .content .event .edit small {
    font-weight:normal;
    opacity: 0;
    transition: opacity .25s ease-in, max-height .25s;
    display:block;
    max-height:20px;
    text-align:right;
  }

  #cal-sidebar .content .event .edit small:hover {
    opacity:1;
    max-height:50px;
  }

  #cal-sidebar .content .event .edit > span {
    float:left;
    margin-right:10px;
  }

</style>

<script>
  window.calendar = {};
  calendar.events = {events};
  calendar.canCreate = {canCreate};
</script>

<script src="/plugins/nodebb-plugin-calendar/public/cal.js"></script>
