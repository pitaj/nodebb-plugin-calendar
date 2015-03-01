/* event / user spec
  fields for events {
    id: (#) unique identifier for this event
    canEdit: (Boolean) whether the current user can edit this event
    canDelete: (Boolean) whether user can delete event
    start: (Date) Date object of event start time
    end: (Date) Date object of event end time
    uid: (#) the uid of the user who made the event
    pid: (#) the post id of the event
    tid: (#) the topic of the post of the event
    name: ("") the name of the event
    rawPlace: ("") the place this event is happening
    place: ("html") the safe html version of the place, to be seen when viewing
    rawDescription: ("") other information about the event including links
    description: ("html") html version of the description that's safe for serving
    allday: (Boolean) whether this event is allday or at a specific time
    notifications: ([]) Date objects of when notifications should be sent to viewers
    responses: ({}) responses, with uid of the user as key, and value as the value
        value == "invited" || "not-attending" || "maybe" || "attending"
    url: (url) the url of the event post, what will be shown in the iframe
    editors: {
      users: ([]) which users are allowed to edit the event, by uid
      groups: ([]) which groups can edit the event, by groupname
    }
    viewers: {
      users: ([]) which users are allowed to view the event, by uid
      groups: ([]) which groups can view the event, by groupname
    }
    blocked: ([]) which users are blocked from viewing / editing the event, by uid
  }
*/
require.config({
  paths: {
    "moment": "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment-with-locales.min",
  },
  config: {
    moment: {
      noGlobal: true
    }
  }
});
require(["moment"], function (moment) {
  "use strict";

  window.moment = moment;

  (function($, app, translator, templates, socket, moment){

    $.fn.visible = function($container, partial){
      try {
        var viewport = {};
        viewport.top = $container.offset().top;
        viewport.bottom = viewport.top + $container.height();
        var bounds = {};
        bounds.top = this.offset().top;
        bounds.bottom = bounds.top + this.outerHeight();
        if(partial){
          return ((bounds.top <= viewport.bottom) && (bounds.bottom >= viewport.top));
        }
        return ((bounds.bottom <= viewport.bottom) && (bounds.top >= viewport.top));
      } catch(e){
        return false;
      }
    };

    var loaded = JSON.parse($("#data_script").html());

    var calendar = {
      events: loaded.events,
      buffer: loaded.buffer,
      actions: {
        init: function(){
          calendar.actions.appendWeeks(moment().subtract(calendar.buffer, "months"), moment().add(calendar.buffer, "months"));
          calendar.actions.scrollToDate(new Date(), true);
          var mom = moment();
          calendar.days[mom.year()][mom.month()][mom.date()-1].attr("id", "cal-day-selected");
          setTimeout(function(){
            for(var i=0; i<calendar.events.length; i++){
              calendar.actions.postEvent(calendar.events[i]);
            }
          }, 50);
        },
        postEvent: function(event){
          var d = moment(event.start),
          l = moment(event.end).endOf("day"), day, y, m, dt;
          while(d <= l){
            y = d.year(); m = d.month(); dt = d.date() - 1;
            if(calendar.days[y] &&
              calendar.days[y][m] &&
              calendar.days[y][m][dt]){
              day = calendar
                .days[y][m][dt];
              day.find('.event[data-id='+event.id+']').remove();
              day.append(templates.parse(calendar.templates.event, {
                time: d.toISOString(),
                name: event.name,
                id: event.id
              }));
              calendar.event.sortDay(day);
            }
            d.add(1, "day");
          }
        },
        sortDay: function(day){
          var evs = day.events.children().detach();
          evs.sort(function(a, b){
            var an = new Date($(a).data().timestamp),
            bn = new Date($(b).data().timestamp);
            if(an > bn) {
              return 1;
            }
            if(an < bn) {
              return -1;
            }
            return 0;
          });
          evs.appendTo(day);
        },
        appendWeeks: function(start, end){
          var s = moment(start).startOf("week"),
            e = moment(end).endOf("week"), y, m, d, day;
          while(s <= e){
            y = s.year(); m = s.month(); d = s.date();
            if(s.day() === calendar.firstOfWeek){
              calendar.calDays.append("<tr>");
            }
            calendar.days[y] = calendar.days[y] || [];
            calendar.days[y][m] = calendar.days[y][m] || [];
            day = calendar.parse(calendar.templates.day, {
              number: d,
              darkmonth: m%2 ? "dark-month" : ""
            });
            day = $(day).appendTo(calendar.calDays.find("tr:last-child"))
              .data("date", s.toISOString());
            s.add(1, "day");
            calendar.days[y][m][d-1] = day;
          }
        },
        prependWeeks: function(start, end){
          var s = moment(start).startOf("week"),
            e = moment(end).endOf("week"), y, m, d, day;
          while(s <= e){
            y = e.year(); m = e.month(); d = e.date();
            if(e.day() === (calendar.firstOfWeek+6)%7){
              calendar.calDays.prepend("<tr>");
            }
            calendar.days[y] = calendar.days[y] || [];
            calendar.days[y][m] = calendar.days[y][m] || [];
            day = calendar.parse(calendar.templates.day, {
              number: d,
              darkmonth: m%2 ? "dark-month" : ""
            });
            $(day).prependTo(calendar.calDays.find("tr:first-child"))
              .data("date", e.toISOString());
            e.subtract(1, "day");
            calendar.days[y][m][d-1] = day;
          }
        },
        getEvents: function(start, end, callback){
          socket.emit("calendar.getEvents", {
            start: start,
            end: end
          }, function(err, response){
            if(err){
              return app.alertError();
            }
            callback(response.events);
          });
        },
        buildResponses: function(event, callback){
          function todo(out){
            html += out;
            numberDone++;
            if(numberDone === Object.keys(event.responses).length){
              callback(html);
            }
          }
          var x, html = "", numberDone;
          for(x in event.responses){
            if(event.responses.hasOwnProperty(x)){
              translator.translate(templates.parse(calendar.templates.response, {
                username: event.responses[x].username,
                userslug: event.responses[x].userslug,
                value: event.responses[x].value
              }), todo);
            }
          }
        },
        scrollToDate: function(date, instant, callback){
          date = moment(date);
          function scrollIn($obj, cb){
            var o = $obj.parent().parent().parent().parent().scrollTop();
            $obj[0].scrollIntoView();
            var x = $obj.parent().parent().parent().parent().scrollTop() - 120;
            if(!instant){
              $obj.parent().parent().parent().parent().scrollTop(o);
              $obj.parent().parent().parent().parent().animate({
                scrollTop: x
              }, 500, cb);
            } else {
              $obj.parent().parent().parent().parent().scrollTop(x);
              cb();
            }
          }
          var firstOfMonth, lastOfMonth,
            y = date.year(), m = date.month();
          try {
            //console.log("y: ", y, " m: ", m, " d: ", d);
            lastOfMonth = calendar.days[y][m][27];
            firstOfMonth = calendar.days[y][m][0];
          } catch (err) {
            //return console.error(err);
            calendar.actions.build(date);
            lastOfMonth = calendar.days[y][m][27];
            firstOfMonth = calendar.days[y][m][0];
          }
          // console.log("obj: ", obj, " firstOfMonth: ", firstOfMonth);
          if(!firstOfMonth.visible(calendar.calDaysContainer) ||
            !lastOfMonth.visible(calendar.calDaysContainer)){
            scrollIn(firstOfMonth, callback || function(){});
          }
        },
        build: function(date){
          date = moment(date);
          var sixbefore = moment(date).subtract(6, "month"),
            sixafter = moment(date).add(6, "month"),
            last = moment(calendar.lastDay().data("date")),
            first = moment(calendar.firstDay().data("date"));
            // console.log("first", calendar.firstDay());
          if(sixafter > last){
            calendar.actions.appendWeeks(last.add(1, "day"), sixafter);
          } else if(sixbefore < first){
            calendar.actions.prependWeeks(sixbefore, first.subtract(3, "day"));
          } else {
            return;
          }
          last = moment(calendar.lastDay().data("date"));
          first = moment(calendar.firstDay().data("date"));

          calendar.actions.getEvents(first, last, function(events){
            calendar.events = events;
            for(var i=0; i<calendar.events.length; i++){
              calendar.actions.postEvent(calendar.events[i]);
            }
          });
        },
        onscroll: function(){
          var offset = calendar.calDaysContainer.offset();
          offset.left += calendar.calDaysContainer.width() / 2;
          offset.top += calendar.calDaysContainer.height() / 2;
          var date, nextMonth, nextYear, prevMonth, prevYear;
          if(document.elementFromPoint){
            date = $(document.elementFromPoint(offset.left, offset.top));
            if(date.is("span")){
              date = date.parent();
            }
            date = date.data("date");
            //console.log(document.elementFromPoint(offset.left, offset.top));
          } else {
            calendar.incompatible();
          }
          date = moment(date);
          nextYear = prevYear = calendar.currentMonth.year = date.year();
          nextMonth = prevMonth = calendar.currentMonth.month = date.month();

          nextMonth+=6;
          if(nextMonth - 12 >= 0){
            nextMonth -= 12;
            nextYear++;
          }

          if(!Array.isArray(calendar.days[nextYear]) ||
          !Array.isArray(calendar.days[nextYear][nextMonth])){
            calendar.actions.build(date.add(6, "months"));
          }

          prevMonth -= 6;
          if(prevMonth < 0){
            prevMonth += 12;
            prevYear--;
          }

          if(!Array.isArray(calendar.days[prevYear]) ||
          !Array.isArray(calendar.days[prevYear][prevMonth])){
            var scroll = calendar.calDaysContainer.scrollTop();
            calendar.actions.build(date.subtract(6, "months"));
            calendar.calDaysContainer.scrollTop(scroll);
          }
        },
        addevent: function(){
          
        },
      },
      days: {
        // years
          // months
            // days
      },
      templates: {},
      parse: function(template, data){
        var x, out = template + "";
        for(x in data){
          if(data.hasOwnProperty(x)){
            out = out.replace(new RegExp('\\{\\s*'+x.toString()+'\\s*\\}', 'g'), data[x]);
          }
        }
        return out;
      },
      lastDay: function(){ return calendar.calDays.find("td").last(); },
      firstDay: function(){ return calendar.calDays.find("td").first(); },
      calDays: $("#cal-days"),
      firstOfWeek: 0, // 0 for Sunday, 1 for Monday
      calDaysContainer: $("#cal-days-container"),
      currentMonth: {
        monthSelect: $("#cal-month-select .month"),
        yearSelect: $("#cal-year-select"),
        y: 0,
        m: 0,
        get year(){
          return this.y;
        },
        set year(val){
          this.y = val;
          this.yearSelect.val(val);
          // console.log("set year to", val);
        },
        get month(){
          return this.m;
        },
        set month(val){
          this.m = val;
          this.monthSelect.attr("data-value", val);
          $("#cal-month-select li a").filter(function(){
            if(+$(this).parent().attr("data-value") === val){
              calendar.currentMonth.monthSelect.html(this.innerHTML);
            }
          });
          // console.log("set month to", val);
        },
        go: function(){
          calendar.actions.onscroll.disabled = true;
          var mom = moment({
            "year": calendar.currentMonth.y,
            "month": calendar.currentMonth.m
          });
          calendar.actions.scrollToDate(mom, false, function(){
            calendar.actions.onscroll.disabled = false;
          });
        }
      }
    };

    calendar.currentMonth.y = calendar.currentMonth.yearSelect.val();
    calendar.currentMonth.m = calendar.currentMonth.monthSelect.attr("data-value");

    calendar.currentMonth.yearSelect.change(function(){
      calendar.currentMonth.y = this.value;
      calendar.currentMonth.go();
    });

    $("#cal-month-select li a").click(function(){
      calendar.currentMonth.monthSelect.html(this.innerHTML);
      calendar.currentMonth.month = $(this).parent().attr("data-value");
      calendar.currentMonth.go();
    });

    $("#cal-toolbar .left .arrows").children().click(function(){
      if($(this).hasClass("fa-chevron-circle-up")){
        calendar.currentMonth.year = +calendar.currentMonth.yearSelect.val() + 1;
      } else {
        calendar.currentMonth.year = +calendar.currentMonth.yearSelect.val() - 1;
      }
      calendar.currentMonth.go();
    });

    function loadTemplates(callback){
      var templates = ["day", "event", "profilePic", "response", "viewEvent"];
      var n = 0, i;

      function todo(template){
        calendar.templates[this] = template;
        //console.log("template "+this+" loaded");
        n++;
        if(n === templates.length){
          callback();
        }
      }

      //console.log(window.ajaxify);

      for(i=0; i<templates.length; i++){
        window.ajaxify.loadTemplate("partials/calendar/"+templates[i], todo.bind(templates[i]));
      }
    }

    $(function(){ // window).on('action:ajaxify.end',
      //console.log("ajaxify.end fired");
      loadTemplates(function(){
        translator.load(window.config.userLang, "calendar", function(){
          calendar.actions.init();
        });
      });
    });

    $("#cal-sidebar ul.nav > li").click(function(){
      if(!$(this).children().hasClass("active")){
        $(this).siblings().add(this).children().toggleClass("active");
        $("#cal-sidebar .content > .day").toggleClass("active");
      }
    });

    $("#cal-sidebar .toggle").click(function(){
      $(this).parent().toggleClass("down");
      $(this).children().toggleClass("fa-chevron-up fa-chevron-down");
    });

    calendar.templates.iframeStyle = '<style>div[widget-area]{display:none}'+
      '.post-bar.col-xs-12.hide.bottom-post-bar{display:block!important}'+
      '.topic .topic-footer .row{padding:0 10px 0 20px}'+
      '.topic ul li{margin-bottom:5px}.btn-sm{line-height:1}'+
      '.topic .topic-footer .pull-right{line-height:14px}'+
      '.topic .post-bar{padding:6px}.btn.btn-primary.post_reply{float:right}'+
      '.topic-main-buttons.pull-right.inline-block{display:block;width:100%}'+
      '#header-menu,.overlay-container,.alert-window,'+
      '#post-container li.post-row:first-child,#post-container li.post-bar,'+
      '.upvote,.downvote,.votes,.share-dropdown,.move,.breadcrumb,'+
      '.post-bar.bottom-post-bar div:first-child,'+
      '.post-bar.bottom-post-bar .thread-tools,#footer,'+
      '.topic-footer small.pull-right i,.post-tools .quote,'+
      '.post-tools .post_reply{display:none!important}'+
      'body{padding-top:10px!important}.container{width:100%!important}</style>';

    calendar.calDaysContainer.scroll(calendar.actions.onscroll);

    $(".button-today").click(calendar.actions.scrollToDate);

    $(".button-add-event").click(calendar.actions.addEvent);

    window.calendar = calendar;

  })(window.jQuery, window.app, window.translator, window.templates, window.socket, moment);
});
