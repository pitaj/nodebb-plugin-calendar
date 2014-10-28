require.config({
  paths: {
    "moment": "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.3/moment.min",
    "marked": "//cdnjs.cloudflare.com/ajax/libs/marked/0.3.2/marked.min"
  },
  config: {
    moment: {
      noGlobal: true
    }
  }
});

require(["moment", "marked"], function (moment, marked) {

  "use strict";

  function observe(elem, callback){

    if(elem && !callback){
      try {
        $(elem).off("DOMSubtreeModified").data("mutationObserver").disconnect();
      } catch(e){

      }
    } else {
      MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

      if(MutationObserver){
        var observer = new MutationObserver(callback);
        observer.observe(elem, {
          subtree: true,
          attributes: true
        });
        $(elem).data("mutationObserver", observer);
      } else {
        $(elem).on("DOMSubtreeModified", callback);
      }
    }

  }

  var events = [];
  /*
  var events = [
    {
      id: 0,
      startdate: new Date("2014-10-12T09:13:55.054Z"),
      enddate: new Date("2014-10-12T10:13:55.054Z"),
      user: {
        imgsrc: "https://secure.gravatar.com/avatar/b73e2fff665c33621c8a4347cf8074be?size=128&default=identicon&rating=pg",
        name: "pitaj",
        fullname: "PitaJ"
      },
      name: "Testy event",
      place: "Muhammad's ass",
      description: "bladibla",
      usergroups: [],
      allday: false,
      notifications: [],
      responses: [],
      url: "/topic/1/bla"
    },
    {
      id: 1,
      startdate: new Date("2014-10-12T09:13:55.054Z"),
      enddate: new Date("2014-10-12T10:13:55.054Z"),
      user: {
        imgsrc: "https://secure.gravatar.com/avatar/b73e2fff665c33621c8a4347cf8074be?size=128&default=identicon&rating=pg",
        name: "pitaj",
        fullname: "PitaJ"
      },
      name: "Testy event",
      place: "Muhammad's ass",
      description: "bladibla",
      usergroups: [],
      allday: false,
      notifications: [],
      responses: [],
      url: "/topic/1/bla"
    },
    {
      id: 2,
      startdate: new Date("2014-10-12T09:13:55.054Z"),
      enddate: new Date("2014-10-12T10:13:55.054Z"),
      user: {
        imgsrc: "https://secure.gravatar.com/avatar/b73e2fff665c33621c8a4347cf8074be?size=128&default=identicon&rating=pg",
        name: "pitaj",
        fullname: "PitaJ"
      },
      name: "Testy event",
      place: "Muhammad's ass",
      description: "bladibla",
      usergroups: [],
      allday: false,
      notifications: [],
      responses: [],
      url: "/topic/1/bla"
    },
    {
      id: 3,
      startdate: new Date("2014-10-12T09:13:55.054Z"),
      enddate: new Date("2014-10-12T10:13:55.054Z"),
      user: {
        imgsrc: "https://secure.gravatar.com/avatar/b73e2fff665c33621c8a4347cf8074be?size=128&default=identicon&rating=pg",
        name: "pitaj",
        fullname: "PitaJ"
      },
      name: "Testy event",
      place: "Muhammad's ass",
      description: "bladibla",
      usergroups: [],
      allday: false,
      notifications: [],
      responses: [],
      url: "/topic/1/bla"
    },
    {
      id: 4,
      startdate: new Date("2014-10-12T09:13:55.054Z"),
      enddate: new Date("2014-10-12T10:13:55.054Z"),
      user: {
        imgsrc: "https://secure.gravatar.com/avatar/b73e2fff665c33621c8a4347cf8074be?size=128&default=identicon&rating=pg",
        name: "pitaj",
        fullname: "PitaJ"
      },
      name: "Testy event",
      place: "Muhammad's ass",
      description: "bladibla",
      usergroups: [],
      allday: false,
      notifications: [],
      responses: [],
      url: "/topic/1/bla"
    },
    {
      id: 5,
      startdate: new Date("2014-10-12T09:13:55.054Z"),
      enddate: new Date("2014-10-12T10:13:55.054Z"),
      user: {
        imgsrc: "https://secure.gravatar.com/avatar/b73e2fff665c33621c8a4347cf8074be?size=128&default=identicon&rating=pg",
        name: "pitaj",
        fullname: "PitaJ"
      },
      name: "Testy event",
      place: "Muhammad's ass",
      description: "bladibla",
      usergroups: [],
      allday: false,
      notifications: [],
      responses: [],
      url: "/topic/1/bla"
    },
    {
      id: 6,
      startdate: new Date("2014-10-12T09:13:55.054Z"),
      enddate: new Date("2014-10-12T10:13:55.054Z"),
      user: {
        imgsrc: "https://secure.gravatar.com/avatar/b73e2fff665c33621c8a4347cf8074be?size=128&default=identicon&rating=pg",
        name: "pitaj",
        fullname: "PitaJ"
      },
      name: "Testy event",
      place: "Muhammad's ass",
      description: "bladibla",
      usergroups: [],
      allday: false,
      notifications: [],
      responses: [],
      url: "/topic/1/bla"
    }
  ];
  */

  window.theEvents = events;

  /* event / user spec
    fields for events {
      id: (#) unique identifier for this event
      editable: (true || false) boolean whether the current user can edit this event
      startdate: (Date) Date object of event start time
      enddate: (Date) Date object of event end time
      user: ({}) the user who made the event, with properties `imgsrc`, `fullname`, and `name`
      name: ("") the name of the event
      place: ("markdown") the place this event is happening (can be a link as well)
      htmlPlace: ("html") the safe html version of the place, to be seen when viewing
      description: ("markdown") other information about the event including links
      html: ("html") html version of the description that's safe for serving
      allday: (true || false) boolean whether this event is allday or at a specific time
      notifications: ([]) array of times in minutes before the start event time
                        that users in usergroups should get notifications
      responses: ({}) object of response objects, with `cid` as key, each with properties
                      `user` (user object), `value` (classname)
                        `value` == "invited" || "not-attending" || "maybe" || "attending"
      url: (url) the url of the event post, what will be shown in the iframe
      editors: ("") which users / groups are allowed / disallowed to edit the event
                users are prefixed with "@", negated values are prefixed with "-"
      viewers: ("") which users / groups are allowed / disallowed to view the event
                users are prefixed with "@", negated values are prefixed with "-"
    }
    fields for user {
      imgsrc: the user's profile image url
      fullname: capitalized username
      name: user slug
      cid: the unique id of the user
    }
  */

  var nicevalue = {
    "invited" : "No response",
    "not-attending" : "Not attending",
    "maybe" : "Maybe",
    "attending" : "Attending"
  };

  var validate = {
    name: function(val){
      return [val.length >= 3, "Name must be three characters or longer."];
    },
    startdate: function(val){
      return [!isNaN((new Date(val)).valueOf()), "The start date is in an unrecognizable format."];
    },
    enddate: function(val){
      return [!isNaN((new Date(val)).valueOf()), "The end date is in an unrecognizable format."];
    },
    notifications: function(val){
      val = val.replace(/\s/g, '');
      val = val.split(",");
      var bool = true;
      for(var i=0; i<val.length; i++){
        if(!isFinite(+val[i])){
          bool = false;
        }
      }
      return [bool, "Notifications must be numbers separated by commas"];
    },
    viewers: function(val){
      return [true, "Viewer groups and users must be separated by commas"];
    },
    editors: function(val){
      return [true, "Editor groups and users must be separated by commas"];
    },
  };

  ///* JSON request
  $.getJSON('api/calendar', function(data){

    //console.log(data);
    data.events = JSON.parse(data.events);
    console.log(data);

    if(data.events){
      var x;
      for(x in data.events){
        if(data.events.hasOwnProperty(x) && data.events[x] && data.events[x].name){
          events[x] = data.events[x];
          events[x].startdate = new Date(events[x].startdate);
          events[x].enddate = new Date(events[x].enddate);
          events[x].allday = events[x].allday === "false" ? false : true;
        }
      }
    }

    if(!data.canCreate){
      $(".button-add-event").css("display", "none");
    }

    renderCalendar(new Date());
    goToDate(new Date());
  });
  //*/

  function save(callback){
    callback = callback || function(){};

    $.post('api/plugins/calendar/save', {
      event: JSON.stringify(currentEvent)
    }, function(data){

      console.log(data);

      if(data.message) {
        app.alertSuccess(data.message);
      }
      if(data.url) {
        currentEvent.url = data.url;
        currentEvent.pid = data.pid;
        currentEvent.tid = data.tid;

        console.log(data.url);
      }
      callback();
    })
    .fail(function(xhr){
      if(+xhr.status === 500){
        app.alertFailure("Error while saving");
      } else if(+xhr.status === 401){
        app.alertFailure("One of more fields entered were invalid, try again");
      }
      callback();
    });
  }

  var templates = {
    day: '<span class="day-number">{{day-number}}</span>',
    event: '<div class="event {{event-width}}"><span class="time">{{event-time}}</span> {{event-name}}</div>',
    response: '<div><small class="username" title="{{thisuser.fullname}}"><a href="/user/{{thisuser.name}}">{{thisuser.fullname}}</a></small><span class="{{value}}">{{nicevalue}}</span></div>',
    iframestyle: '<style>.post-bar.col-xs-12.hide.bottom-post-bar { display: block!important; } .topic .topic-footer .row { padding: 0 10px 0 20px; } .topic ul li { margin-bottom: 5px; } .btn-sm { line-height: 1; } .topic .topic-footer .pull-right { line-height: 14px; } .topic .post-bar { padding: 6px; } .btn.btn-primary.post_reply { float: right; } .topic-main-buttons.pull-right.inline-block { display: block; width: 100%; } #header-menu, .overlay-container, .alert-window,  #post-container li.post-row:first-child,  #post-container li.post-bar,  .upvote,  .downvote,  .votes,  .share-dropdown,  .move,  .breadcrumb,  .post-bar.bottom-post-bar div:first-child,  .post-bar.bottom-post-bar .thread-tools,  #footer,  .topic-footer small.pull-right i,  .post-tools .quote,  .post-tools .post_reply { display: none!important; } body { padding-top: 10px!important; } .container { width:100%!important; }</style>',
    profilepic: '<a href="/user/{{user.name}}"><img src="{{user.imgsrc}}" alt="{{user.fullname}}" class="profile-image user-img" title="" data-original-title="{{user.fullname}}"></a><small class="username" title="{{user.fullname}}"><a href="/user/{{user.name}}">{{user.fullname}}</a></small>',

  };

  // actual calendar stuff

    var d = {
      month : [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ],
      day : [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
      ],
      numOfDays : [
        31, // jan
        28, // feb
        31, // mar
        30, // apr
        31, // may
        30, // jun
        31, // jul
        31, // aug
        30, // sep
        31, // oct
        30, // nov
        31, // dec
      ],
      mon : [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ],
      width : [
        "",
        "twowide",
        "threewide",
        "fourwide",
        "fivewide",
        "sixwide",
        "sevenwide"
      ]
    };

    var dayArray = {};

    function lastDate(){
      var lastYear = 0;
      var x;
      for(x in dayArray){
        if(dayArray.hasOwnProperty(x)){
          if(+x > lastYear){
            lastYear = +x;
          }
        }
      }
      var ret = new Date();
      ret.setFullYear(lastYear);
      var lastMonth = dayArray[lastYear].length-1;
      ret.setMonth(lastMonth);
      ret.setDate(dayArray[lastYear][lastMonth].length);

      return ret;
    }

    //window.fd = firstDate;
    //window.ls = lastDate;

    function firstDate(){
      var firstYear = 10000;
      var x;
      for(x in dayArray){
        if(dayArray.hasOwnProperty(x)){
          if(+x < firstYear){
            firstYear = +x;
          }
        }
      }

      var firstMonth = 0;
      while(!dayArray[firstYear][firstMonth]){
        firstMonth++;
      }


      var i;
      for(i = 0; i<dayArray[firstYear][firstMonth].length; i++){
        if(dayArray[firstYear][firstMonth][i]){
          break;
        }
      }


      return new Date(firstYear, firstMonth, i+1);
    }

    /* dayArray spec
      how dayArray works:
        the top level object is an object of year arrays with key as year number
        each year array has an array of month arrays
        each month array has an array of days
        each day is a jQuery object of the <td> element of that day
      for one day:
        dayArray = {
          2014: [
            [
              januaryFirst2014tdNode
            ]
          ]
        }
      this makes it easy to add events to the days later. example:
         dayArray[Date.getFullYear()][Date.getMonth()][Date.getDate()-1].append(eventHTML);
    */

    var tbody = $("#cal-days").children();

    function renderCalendar(d){

      //console.log(d);

      function createDay(year, month, date, direction){

        //console.log([year, month, date, direction]);

        if(direction === 1){

          var lastTR = tbody.children().last();
          if(!lastTR.length || lastTR.children().length === 7){
            lastTR = $("<tr>").appendTo(tbody);
          }

          //console.log(lastTR);

          if(!Array.isArray(dayArray[year])){
            dayArray[year] = [];
          }
          if(!Array.isArray(dayArray[year][month])){
            dayArray[year][month] = [];
          }

          var thees = dayArray[year][month][date-1] = $("<td>").html(templates.day.replace("{{day-number}}", date)).data("date", new Date(year, month, date)).appendTo(lastTR);
          //console.log(lastTR);
          //console.log(thees);

        } else if(direction === -1){

          var firstTR = tbody.children().first();
          if(!firstTR.length || firstTR.children().length === 7){
            firstTR = $("<tr>").prependTo(tbody);
          }

          //console.log(firstTR);

          if(!Array.isArray(dayArray[year])){
            dayArray[year] = [];
          }
          if(!Array.isArray(dayArray[year][month])){
            dayArray[year][month] = [];
          }

          var theesi = dayArray[year][month][date-1] = $("<td>").html(templates.day.replace("{{day-number}}", date)).data("date", new Date(year, month, date)).prependTo(firstTR);
          //console.log(firstTR);
          //console.log(theesi);
        }

      }

      var i;

      if(tbody.children().length === 0){
        d.setFullYear(d.getFullYear()-1);
        d.setDate(1);
        d.setMonth(0);

        d.setDate(d.getDate()+7-d.getDay());
        i = new Date(d);
        i.setFullYear(i.getFullYear()+3);

        makeDays(d, i, 1);

        //console.log(1);
      } else if(d < firstDate()) {
        i = firstDate();
        d.setFullYear(d.getFullYear()-2);
        i.setDate(i.getDate()-1);

        makeDays(d, i, -1);

        //console.log(2);
      } else if(d > lastDate()){
        i = new Date(d);
        d = lastDate();
        i.setFullYear(i.getFullYear()+1);
        d.setDate(d.getDate()+1);

        makeDays(d, i, 1);

        //console.log(3);
      }

      function makeDays(d, i, direction){

        //console.log([d, i, direction]);

        if(direction === 1){
          while(d <= i){
            createDay(d.getFullYear(), d.getMonth(), d.getDate(), direction);

            d.setDate(d.getDate()+1);
          }
        } else if(direction === -1){
          while(d <= i){
            createDay(i.getFullYear(), i.getMonth(), i.getDate(), direction);

            i.setDate(i.getDate()-1);
          }
        }

      }

      initEvents();

    }

    // window.renderCal = renderCalendar;

    function initEvents(){

      function daydiff(first, second) {
        return (second-first)/(1000*60*60*24);
      }

      for(var i=0; i<events.length; i++){

        if(events[i]){

          var sdate = events[i].startdate;
          var edate = events[i].enddate;

          if(sdate < firstDate() ){
            renderCalendar(sdate);
          }
          if(edate > lastDate()){
            renderCalendar(edate);
          }

          var eventWidth = Math.round(daydiff(edate, sdate));
          eventWidth = d.width[eventWidth];

          var hours = sdate.getHours();
          var minutes = sdate.getMinutes();

          if(minutes === 0){
            minutes = "";
          } else {
            minutes = ":"+minutes;
          }

          if(hours > 12){
            hours = hours - 12 + minutes + "p";
          } else {
            hours = hours + minutes + "a";
          }

          var day = dayArray[sdate.getFullYear()][sdate.getMonth()][sdate.getDate()-1];
          var event = $(templates
                          .event
                            .replace("{{event-width}}", eventWidth)
                            .replace("{{event-time}}", hours)
                            .replace("{{event-name}}", events[i].name));

          if(day.children(".event").filter(event).length === 0){

            event.data("event", events[i]);

            day.append(event);
          }

        }

      }

    }

    function visible($obj, partialobject){

      try {
        var viewport = {};
        viewport.top = $("#cal-days-container").offset().top;
        viewport.bottom = viewport.top + $("#cal-days-container").height();
        var bounds = {};
        bounds.top = $obj.offset().top;
        bounds.bottom = bounds.top + $obj.outerHeight();
        if(partialobject){
          return ((bounds.top <= viewport.bottom) && (bounds.bottom >= viewport.top));
        }
        return ((bounds.bottom <= viewport.bottom) && (bounds.top >= viewport.top));
      } catch(e){
        //console.error(e);
        //console.log($obj);
        return false;
      }

    }

    var whenScrollEnabled = true;

    function goToDate(date){

      function scrollIn($obj, cb){
        var o = $obj.parent().parent().parent().parent()[0].scrollTop;
        $obj[0].scrollIntoView();
        var x = $obj.parent().parent().parent().parent()[0].scrollTop;
        $obj.parent().parent().parent().parent()[0].scrollTop = o;

        $obj.parent().parent().parent().parent().animate({
          scrollTop: x
        }, 1000, cb);
      }

      var obj, firstOfMonth;

      try {
        obj = dayArray[date.getFullYear()][date.getMonth()][date.getDate()-1];
        firstOfMonth = dayArray[date.getFullYear()][date.getMonth()][0];
      } catch (err) {
        renderCalendar(date);
        obj = dayArray[date.getFullYear()][date.getMonth()][date.getDate()-1];
        firstOfMonth = dayArray[date.getFullYear()][date.getMonth()][0];
      }

      //console.log(obj);

      if(!visible(obj)){
        whenScrollEnabled = false;
        scrollIn(firstOfMonth, function(){
          whenScrollEnabled = true;
          setTimeout(whenScroll, 100);
        });
      }

      $("#cal-day-selected").removeAttr("id");
      obj.attr("id", "cal-day-selected");

      showDay(obj);

      cleanCache();
    }

    //window.whenSc = whenScroll;

    function whenScroll(e){

      //console.log(e);

      if(!whenScrollEnabled){
        return false;
      }

      var toDo = function(el){ if(!el){ return; } return el[0]; };

      var x;
      for(x in dayArray){
        if(dayArray.hasOwnProperty(x)){
          for(var i=0; i<dayArray[x].length; i++){
            var nextYear = x;
            var nextMonth = i+1;
            if(nextMonth - 12 >= 0){
              nextMonth = nextMonth-12;
              nextYear++;
            }
            if(dayArray[x] &&
              dayArray[x][i] &&
              dayArray[nextYear] &&
              dayArray[nextYear][nextMonth] &&
              visible(dayArray[x][i][0]) &&
              visible(dayArray[nextYear][nextMonth][0], true)){
              $("#cal-month").html(d.month[i]);
              $("#cal-month-select").val(i);
              $("#cal-year-select").val(x);

              $(".this-month").removeClass("this-month");

              $($.map(dayArray[x][i], toDo)).addClass("this-month");

              nextMonth+=6;
              if(nextMonth - 12 >= 0){
                nextMonth -= 12;
                nextYear++;
              }

              if(!Array.isArray(dayArray[nextYear]) || !Array.isArray(dayArray[nextYear][nextMonth])){
                //console.log("got here");
                renderCalendar(new Date(nextYear, nextMonth, 0));
              }

              var prevMonth = i-6;
              var prevYear = x;
              if(prevMonth < 0){
                prevMonth += 12;
                prevYear--;
              }

              if(!Array.isArray(dayArray[prevYear]) || !Array.isArray(dayArray[prevYear][prevMonth])){
                //console.log("got there");
                renderCalendar(new Date(prevYear, prevMonth, 0));
              }

              break;
            }
          }
        }
      }

      cleanCache();

    }

    var cleaning = false;

    function cleanCache(){

      if(cleaning){
        return false;
      }

      cleaning = true;

      function removeYear(year){

        var toDo = function(el){ if(!el || !el.length){ return; }  return el.get(0); };

        for(var i=0; i<year.length; i++){
          //console.log(year[i]);
          $($.map(year[i], toDo)).remove();
        }
        tbody.children().filter(function(){ return this.childNodes.length === 0; }).remove();
      }

      var firstyear = 10000, lastyear = 0;
      var x;
      for(x in dayArray){
        if(dayArray.hasOwnProperty(x)){
          if(x > lastyear){
            lastyear = x;
          }
          if(x < firstyear){
            firstyear = x;
          }
        }
      }

      //console.log([lastyear, firstyear, lastyear-firstyear]);

      if(lastyear - firstyear > 10){
        var currentyear = $("#cal-year-select").val();
        firstyear = currentyear - 5;
        lastyear = currentyear + 5;

        for(x in dayArray){
          if(dayArray.hasOwnProperty(x)){
            if(x > lastyear || x < firstyear){
              removeYear(dayArray[x]);
              delete dayArray[x];
            }
          }
        }
      }

      cleaning = false;

    }

  // sidebar stuff

    var sidebar = $("#cal-sidebar").children(".content");

    var currentEvent;

    function niceDate(event){
      var start = {utc: moment.utc(event.startdate), yours: moment(event.startdate)},
        end = {utc: moment.utc(event.enddate), yours: moment(event.enddate)};

      var utc, yours,
        datedate = "DD MMM YYYY",
        datetimeutc = "DD MMM YYYY H:mm",
        datetime = "DD MMM YYYY h:mm a",
        timetime = "h:mm a",
        timetimeutc = "H:mm";

      if(start.yours.format(datedate) !== end.yours.format(datedate)){
        if(event.allday){
          utc = start.utc.format(datedate) + " - " + end.utc.format(datedate);
          yours = start.yours.format(datedate) + " - " + end.yours.format(datedate);
        } else {
          utc = start.utc.format(datetimeutc) + " - " + end.utc.format(datetimeutc);
          yours = start.yours.format(datetime) + " - " + end.yours.format(datetime);
        }
      } else {
        if(event.allday){
          utc = start.utc.format(datedate);
          yours = start.yours.format(datedate);
        } else {
          utc = start.utc.format(timetimeutc) + " - " + end.utc.format(timetimeutc);
          yours = start.yours.format(timetime) + " - " + end.yours.format(timetime);
        }
      }

      return { utc: utc, yours: yours };
    }

    function goToDay(){
      // go to the day part of the sidebar, if necessary

      //console.log("switching to day");

      sidebar.children(".day").animate({ marginLeft: "0%" });

      $("#cal-sidebar").find(".nav .cal-sb-active").removeClass("cal-sb-active");
      $("#cal-sidebar").find(".nav .day").addClass("cal-sb-active");
    }

    function goToEvent(){
      // go to the event part of the sidebar, if necessary

      //console.log("switching to event");

      sidebar.children(".day").animate({ marginLeft: "-100%" });

      $("#cal-sidebar").find(".nav .cal-sb-active").removeClass("cal-sb-active");
      $("#cal-sidebar").find(".nav .event").addClass("cal-sb-active");
    }

    function showEvent(obj, event){

      event = event || obj.data("event");

      currentEvent = event;

      //console.log("showing event: ", event);

      var e = sidebar.children(".event").children(".view"), c = e.children(".responses"), nice = niceDate(event), iframe = e.children(".comments");

      if(iframe.contents()[0]){
        observe(iframe.contents()[0], false);
      }

      function adjustiFrame(ifr){
        ifr.height(ifr.contents().find("#content").height()+20);
      }

      if(obj.parents("td").length){
        showDay(obj.parents("td"), true);
      }

      e.fadeTo(300, 0, function(){

        if(event.editable === false){
          e.children(".edit-event-button").css("display", "none");
        }

        e.removeClass("unselected");

        e.children(".topic-profile-pic")
          .html(templates.profilepic
                  .replace(/\{\{user\.name\}\}/g, event.user.name)
                  .replace(/\{\{user\.imgsrc\}\}/g, event.user.imgsrc)
                  .replace(/\{\{user\.fullname\}\}/g, event.user.fullname));

        e.children(".name").html(event.name);
        e.children(".date").html("<span>" + nice.utc + " utc</span><span>" + nice.yours + " your time</span>");

        e.children(".place").html(event.htmlPlace);

        e.children(".description").html(event.html);

        c.children(".my-response")
          .children(".username")
            .children("a")
            .attr("href", "/user/"+app.userslug)
            .html(app.username);

        c.children(".my-response").children(".selected").removeClass("selected");

        var x;
        for(x in event.responses){

          if(event.responses.hasOwnProperty(x)){

            console.log(x == app.uid);

            if(event.responses.hasOwnProperty(x) && x != app.uid){

                c.append(templates.response
                          .replace(/\{\{thisuser\.fullname\}\}/g, event.responses[x].user.fullname)
                          .replace(/\{\{thisuser\.name\}\}/g, event.responses[x].user.name)
                          .replace(/\{\{value\}\}/g, event.responses[x].value)
                          .replace(/\{\{nicevalue\}\}/g, nicevalue[event.responses[x].value]));

            }

          }
        }

        c.children(".my-response").children("."+( event.responses[app.uid] ? event.responses[app.uid].value : "invited" ))
          .addClass("selected");

        iframe
          .attr("src", event.url)
          .on("load", function(){
            iframe.contents().find("head")
              .append(templates.iframestyle);

            observe(iframe.contents()[0], function(){
              adjustiFrame(iframe);
            });

            e.fadeTo(300, 1);
            goToEvent();
          });

      });

    }

    function newEvent(callback){
      var l = events.length, now = new Date(), anhour = new Date();
      anhour.setHours(anhour.getHours()+1);

      sidebar.find(".event .edit .cancel-edit-button").css("display", "none");

      getUserImage(app.userslug, function(imgurl){
        var thenewone = {
          id: l,
          user: {
            name: app.userslug,
            fullname: app.username,
            imgsrc: imgurl,
            cid: app.uid
          },
          startdate: now,
          enddate: anhour,
          name: "",
          place: "",
          htmlPlace: "",
          description: "",
          html: "",
          allday: false,
          notifications: "",
          responses: {},
          url: "",
          perms: {
            edit: {},
            view: {}
          },
          notificationDates: [],
          sentNotifications: []

        };

        //events[l] = thenewone;
        currentEvent = thenewone;

        callback();
      });

    }

    var edit = sidebar.children(".event").children(".edit");

    function editEvent(){

      edit.find(".name").val(currentEvent.name);
      edit.find(".allday").prop("checked", currentEvent.allday);
      edit.find(".start-time").val(moment(currentEvent.startdate).format("M/D/YYYY h:mm A"));
      edit.find(".end-time").val(moment(currentEvent.enddate).format("M/D/YYYY h:mm A"));
      edit.find(".place").val(currentEvent.place);
      edit.find(".description").val(currentEvent.description);

      edit.find(".editors").val(currentEvent.editors);
      edit.find(".viewers").val(currentEvent.viewers);

      edit.find(".notifications").val(currentEvent.notifications);

      sidebar.children(".event").css("overflow", "hidden");
      edit.fadeIn();
    }

    function showDay(obj, dontShow){

      var template = '<div class="event"><div class="event-name">{{event-name}}</div><div class="time">{{event-time-utc}} utc<br>{{event-time}} your time</div><div class="place">{{event-place}}</div></div>';

      var date = obj.data("date");
      date = moment(date);
      //console.log("showing day: " + date.toString());

      sidebar.children(".day").children(".date").html(date.format("D MMM YYYY"));

      var events = sidebar.children(".day").children(".events");

      events.html("");

      obj.children(".event").each(function(){
        var event = $(this).data("event");

        var nice = niceDate(event);

        $(template
          .replace("{{event-name}}", event.name)
          .replace("{{event-time-utc}}", nice.utc)
          .replace("{{event-time}}", nice.yours)
          .replace("{{event-place}}", event.htmlPlace)).data("event", event).appendTo(events);

      });

      $("#cal-day-selected").removeAttr("id");
      obj.attr("id", "cal-day-selected");

      if(!dontShow){
        goToDay();
      }

    }

    function updateEvent(olddate){

      function daydiff(first, second) {
        return (second-first)/(1000*60*60*24);
      }

      var sdate = currentEvent.startdate;
      //console.log(sdate);
      var day = dayArray[sdate.getFullYear()][sdate.getMonth()][sdate.getDate()-1];
      var oldday = dayArray[olddate.getFullYear()][olddate.getMonth()][olddate.getDate()-1];

      var thisEvent = oldday
        .children(".event")
        .filter(function(){
          return ($(this).data("event").id === currentEvent.id);
        });

      //console.log(thisEvent);
      //console.log(currentEvent);
      //console.log(oldday);
      //console.log(day);

      if(currentEvent.id > -1){

        var eventWidth = Math.round(daydiff(sdate, currentEvent.enddate));

        console.log(eventWidth);

        eventWidth = d.width[eventWidth];

        var hours = sdate.getHours();
        var minutes = sdate.getMinutes();

        if(minutes === 0){
          minutes = "";
        } else {
          minutes = ":"+minutes;
        }

        if(hours > 12){
          hours = hours - 12 + minutes + "p";
        } else {
          hours = hours + minutes + "a";
        }

        if(oldday === day && thisEvent.length){

          thisEvent = $(templates
            .event
              .replace("{{event-width}}", eventWidth)
              .replace("{{event-time}}", hours)
              .replace("{{event-name}}", currentEvent.name))
            .data("event", currentEvent)
            .replaceAll(thisEvent);

        } else {

          thisEvent.remove();

          thisEvent = $(templates
            .event
              .replace("{{event-width}}", eventWidth)
              .replace("{{event-time}}", hours)
              .replace("{{event-name}}", currentEvent.name))
            .data("event", currentEvent)
            .appendTo(day);

        }


        showEvent(thisEvent, currentEvent);
        showDay(day, false);

      } else {

        thisEvent.remove();
        showDay(day, false);

      }

    }

    function saveEvent(){

      var oldDate = new Date(currentEvent.startdate);

      currentEvent.name = edit.find(".name").val();
      currentEvent.allday = edit.find(".allday").prop("checked");
      currentEvent.startdate = new Date(edit.find(".start-time").val());
      currentEvent.enddate = new Date(edit.find(".end-time").val());
      currentEvent.place = edit.find(".place").val();
      currentEvent.description = edit.find(".description").val();
      currentEvent.html = marked(currentEvent.description);
      currentEvent.htmlPlace = marked(currentEvent.place);

      currentEvent.editors = edit.find(".editors").val();
      currentEvent.viewers = edit.find(".viewers").val();

      currentEvent.notifications = edit.find(".notifications").val();

      sidebar.children(".event").css("overflow", "");
      edit.fadeOut(function(){
        sidebar.find(".event .edit .cancel-edit-button").css("display", "");
      });

      events[currentEvent.id] = currentEvent;

      save(function(){
        updateEvent(oldDate);
      });
    }

    function getUserImage(slug, callback){
      $.getJSON("/api/user/"+slug, function(data){
        //data = data.match(/<img src=".*" class="user-profile-picture/g)[0].match(/".*?"/)[0].replace(/"/g, "");
        callback(data.gravatarpicture || data.uploadedpicture || data.picture);
      });
    }

    //window.getImg = getUserImage;

    function changeResponse(e){
      var obj = $(this);

      //console.log(obj);
      //console.log(currentEvent);

      obj.siblings(".selected").removeClass("selected");

      if(!currentEvent.responses[app.uid]){
        currentEvent.responses[app.uid] = {
          user: {
            name: app.userslug,
            fullname: app.username,
            cid: app.uid
          }
        };
      }

      currentEvent.responses[app.uid].value = obj.attr("class");
      obj.addClass("selected");

      //console.log(currentEvent);

      save();

    }

  // taskbar functionality events

    $(".button-today").click(function(){
      goToDate(new Date());
    });

    $("#cal-month").click(function(ev){
      ev.preventDefault();

      var elem = $("#cal-month-select")[0];

      if (document.createEvent) {
          var e = document.createEvent("MouseEvents");
          e.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          elem.dispatchEvent(e);
      } else if (elem.fireEvent) {
          elem.fireEvent("onmousedown");
      }
    });
    $("#cal-month-select").change(function(){
      var date = new Date($("#cal-year-select").val(), $("#cal-month-select").val(), 1);
      goToDate(date);
    });

    $("#cal-year-select").change(function(){
      var date = new Date($("#cal-year-select").val(), $("#cal-month-select").val(), 1);
      goToDate(date);
    });

  // day selection event

    tbody.on("click", "td", function(e){

      e.stopPropagation();

      var it = $(e.target);
      if(it.parents(".event").length){
        it = it.parents(".event");
      }


      if(it.is(".event:nth-child(5)")){
        it = it.parents("td");
        $("#cal-day-selected").removeAttr("id");
        it.attr("id", "cal-day-selected");
        return showDay(it);
      }

      if(it.is(".event")){
        return showEvent(it);
      }

      if(!it.is("td")){
        it = it.parents("td");
      }

      if(it.is("#cal-day-selected")){
        return;
      }

      showDay(it);
    });

  // figure out what month it is

    $("#cal-days-container").scroll(whenScroll);

  // sidebar functionality events

    sidebar.find(".day .events").on("click", ".event", function(e){
      var it = $(e.target);
      if(!it.is(".event")){
        it = it.parents(".event");
      }
      showEvent(it);
    });

    $("#cal-sidebar").find(".nav .event a").click(goToEvent);
    $("#cal-sidebar").find(".nav .day a").click(goToDay);

    sidebar.find(".event .view .responses .my-response span").click(changeResponse);

    sidebar.find(".event .view .edit-event-button").click(editEvent);

    sidebar.find(".event .edit .delete-event-button").click(function(){
      currentEvent.oldId = currentEvent.id;
      currentEvent.id = -1;
      sidebar.children(".event").css("overflow", "");
      sidebar.children(".event").children(".view").addClass("unselected").children(".name").html("No Event Selected");
      edit.fadeOut();

      updateEvent(currentEvent.startdate);
      save();
    });

    sidebar.find(".event .edit .save-event-button").click(saveEvent);

    sidebar.find(".event .edit .cancel-edit-button").click(function(){
      sidebar.children(".event").css("overflow", "");
      edit.fadeOut();
    });

    sidebar.children(".event").children(".edit").children(".start-time, .end-time").datetimepicker();

    sidebar.children(".event").children(".edit").children(".allday").change(function(){
      $(this).siblings(".start-time, .end-time").datetimepicker({timepicker: false});
    });

  // add event

    $(".button-add-event").click(function(){
      newEvent(function(){
        editEvent();
        goToEvent();
      });
    });

  //renderCalendar(new Date());
  //goToDate(new Date());

  // figure out size sidebar should be
    function onresize(){
      // check if the sidebar should be side-by-side or not
      // then set it as so
      $(window).off("resize");
      observe(document, false);

      var width = $("#cal-sidebar").width();
      if(width >= 820){
        $("#cal-sidebar").addClass("side-by-side");
      } else {
        $("#cal-sidebar").removeClass("side-by-side");
      }

      setTimeout(function(){
        $(window).resize(onresize);

        observe(document, onresize);
      }, 500);

    }
    onresize();

});
