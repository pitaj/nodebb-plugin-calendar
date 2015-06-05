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
    "moment": config.relative_path + "/plugins/nodebb-plugin-calendar/public/moment-with-locales.min",
    "datetimepicker": config.relative_path + "/plugins/nodebb-plugin-calendar/public/bootstrap-datetimepicker.min"
  },
  config: {
    moment: {
      noGlobal: true
    }
  }
});

require(["moment", "datetimepicker", "translator"], function (moment, dtp, translator) {
  "use strict";

  window.moment = moment;

  translator = translator || window.translator;

  (moment.locale || moment.lang)(window.config.userLang || "en_GB");

  (function($, app, templates, socket){

    function observe(elem, callback){

      var Observer = window.MutationObserver ||
          window.WebKitMutationObserver ||
          window.MozMutationObserver;

      if(Observer){
        if(elem && !callback){
          var data = elem.data("mutationObserver");
          if(data){
            data.disconnect();
          }
        } else {
          var observer = new Observer(callback);
          observer.observe(elem[0], {
            subtree: true,
            attributes: true
          });
          elem.data("mutationObserver", observer);
        }
      } else {
        if(elem && !callback){
          elem.off("DOMSubtreeModified");
        } else {
          elem.on("DOMSubtreeModified", callback);
        }
      }

    }

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

    var calendar = {
      events: [],
      buffer: 6,
      whoisin: false,
      socket: {
        getEvents: function(start, end, callback){
          socket.emit("plugins.calendar.getEvents", {
            start: start,
            end: end
          }, function(err, response){
            if(err){
              console.error(err);
              return app.alertError();
            }
            callback(response);
          });
        },
        createEvent: function(event, callback){
          socket.emit("plugins.calendar.createEvent", event, function(err, data){
            if(err || !data){
              console.error(err, data);
              return app.alertError();
            }
            callback(data);
          });
        },
        editEvent: function(event, callback){
          socket.emit("plugins.calendar.editEvent", event, function(err, data){
            if(err || !data){
              console.error(err);
              return app.alertError();
            }
            //console.log("received", data);
            callback(data);
          });
        },
        deleteEvent: function(event, callback){
          socket.emit("plugins.calendar.deleteEvent", {
            id: event.id
          }, function(err, response){
            if(err){
              console.error(err);
              return app.alertError();
            }
            callback(response);
          });
        },
        respond: function(event, response, callback){
          socket.emit("plugins.calendar.respond", {
            uid: response.uid,
            value: response.value,
            event: event
          }, function(err, response){
            if(err || !response){
              console.error(err);
              return app.alertError();
            }
            callback(response);
          });
        },
        update: {
          deleteEvent: function(data){
            calendar.events[data.event.id] = null;
            $(".event[data-id="+data.event.id+"]").remove();
            if(calendar.currentEvent.id === data.event.id){
              calendar.viewEvent.it.addClass("trans");
            }
          },
          createEvent: function(data){
            calendar.events[data.event.id] = data.event;
            calendar.actions.postEvent(data.event);
            calendar.actions.viewEvent(data.event);
          },
          editEvent: function(data){
            $.extend(calendar.events[data.event.id], data.event);
            $(".event[data-id="+data.event.id+"]").remove();
            calendar.actions.postEvent(data.event);
            calendar.actions.viewDay($("#cal-day-selected"));
            if(calendar.currentEvent.id === data.event.id){
              calendar.actions.viewEvent(data.event);
            }
          },
          response: function(response){
            //console.log("event recieved: ", response);
            calendar.events[response.event.id].responses[response.uid].value = response.value;
            var data = calendar.events[response.event.id].responses[response.uid];
            data.uid = response.uid;
            var html = calendar.parse(calendar.templates.response, data);
            translator.translate(html, function(trans){
              calendar.viewEvent.responses.find('[data-uid="'+response.uid+'"]').replaceWith(trans);
            });
          }
        }
      },
      actions: {
        init: function(){
          console.log("Initializing Calendar");
          var start = moment().subtract(calendar.buffer, "months");
          var end = moment().add(calendar.buffer, "months");
          calendar.actions.appendWeeks(start, end);
          calendar.actions.scrollToDate(new Date(), true);
          var mom = moment();
          var day = calendar.days[mom.year()][mom.month()][mom.date()-1].attr("id", "cal-day-selected");

          console.log("Initializing Events");

          calendar.socket.getEvents(start, end, function(events){
            calendar.events = events;
            for(var i=0; i<calendar.events.length; i++){
              calendar.actions.postEvent(calendar.events[i]);
            }
            calendar.actions.viewDay(day);
          });
        },
        postEvent: function(event){
          if(!event){
            return false;
          }
          var d = moment(event.start),
          l = moment(event.end), day, y, m, dt;
          calendar.calDays.find('.event[data-id='+event.id+']').remove();
          while(d <= l){
            y = d.year(); m = d.month(); dt = d.date() - 1;
            if(calendar.days[y] &&
                calendar.days[y][m] &&
                calendar.days[y][m][dt]){
              day = calendar.days[y][m][dt];
              $(calendar.parse(calendar.templates.event, {
                time: d.toISOString(),
                name: event.name,
                id: event.id
              })).data("event", event).appendTo(day);
              calendar.actions.sortDay(day);
            }
            d.add(1, "day");
          }
        },
        sortDay: function(day){
          var evs = day.children(".event").detach();
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
            day = $(day).prependTo(calendar.calDays.find("tr:first-child"))
              .data("date", e.toISOString());
            e.subtract(1, "day");
            calendar.days[y][m][d-1] = day;
          }
        },
        buildResponses: function(responses, callback){
          var x, html = "", sub;

          function thing(sub){
            html += sub;
          }

          for(x in responses){
            if(responses.hasOwnProperty(x)
            && typeof responses[x] === "object"
            && +x !== +app.user.uid){
              sub = calendar.parse(calendar.templates.response, {
                username: responses[x].username,
                userslug: responses[x].userslug,
                value: responses[x].value,
                uid: x
              });
              translator.translate(sub, thing);
            }
          }
          callback(html);
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

          if(!calendar.days[y] || !calendar.days[y][m] ||
              !calendar.days[y][m][0] || !calendar.days[y][m][27]){
            calendar.actions.build(date);
          }
          lastOfMonth = calendar.days[y][m][27];
          firstOfMonth = calendar.days[y][m][0];
          //console.log("firstOfMonth: ", firstOfMonth, "lastofmonth: ", lastOfMonth);
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
            calendar.actions.prependWeeks(sixbefore, first.subtract(1, "day"));
          } else {
            return;
          }
          last = moment(calendar.lastDay().data("date"));
          first = moment(calendar.firstDay().data("date"));

          calendar.socket.getEvents(first, last, function(events){
            $.extend(calendar.events, events);
            events.forEach(calendar.actions.postEvent);
          });
        },
        onscroll: function(){
          var offset = calendar.calDaysContainer.offset();
          offset.left += calendar.calDaysContainer.width() / 2;
          offset.top += calendar.calDaysContainer.height() / 2;
          var date, first, last;
          if(document.elementFromPoint){
            date = $(document.elementFromPoint(offset.left, offset.top));
            if(date.is("span")){
              date = date.parent();
            }
            date = moment(date.data("date"));
            //console.log(document.elementFromPoint(offset.left, offset.top));
          } else {
            calendar.incompatible();
          }
          calendar.currentMonth.year = date.year();
          calendar.currentMonth.month = date.month();

          first = moment(calendar.firstDay().data("date"));
          last = moment(calendar.lastDay().data("date"));

          if(moment(date).add(6, "M").valueOf() > last.valueOf()){
            calendar.actions.build(moment(date).add(1, "y"));
          } else if(moment(date).subtract(6, "M").valueOf() < first.valueOf()){
            calendar.actions.build(moment(date).subtract(1, "y"));
            calendar.days[date.year()][date.month()][0][0].scrollIntoView();
          }
        },
        editEvent: function(isnew){
          var event = !isnew ? calendar.currentEvent : {
            start: moment().startOf("h"),
            end: moment().startOf("h").add(1, "h"),
            uid: app.user.uid,
            name: "",
            rawPlace: "",
            rawDescription: "",
            place: "",
            description: "",
            allday: false,
            notifications: [],
            editors: {
              users: [],
              groups: []
            },
            public: false,
            viewers: {
              users: [],
              groups: []
            },
            blocked: []
          };

          var edit = calendar.editEvent;
          edit.name.val(event.name);
          edit.allday.prop("checked", event.allday);
          edit.start.data("DateTimePicker").date(new Date(event.start));
          edit.end.data("DateTimePicker").date(new Date(event.end));
          edit.place.val(event.rawPlace);
          edit.editors.tagsinput('removeAll');
          edit.viewers.tagsinput('removeAll');
          edit.blocked.tagsinput('removeAll');
          if(event.allday){
            edit.start.data("DateTimePicker").format("LL");
            edit.end.data("DateTimePicker").format("LL");
          } else {
            edit.start.data("DateTimePicker").format("LLL");
            edit.end.data("DateTimePicker").format("LLL");
          }
          event.editors.users.forEach(function(user){
            edit.editors.tagsinput("add", user);
          });
          event.editors.groups.forEach(function(group){
            edit.editors.tagsinput("add", group);
          });
          event.viewers.users.forEach(function(user){
            edit.viewers.tagsinput("add", user);
          });
          event.viewers.groups.forEach(function(group){
            edit.viewers.tagsinput("add", group);
          });
          event.blocked.forEach(function(user){
            edit.blocked.tagsinput("add", user);
          });
          edit.public.prop("checked", event.public);
          edit.notifications.tagsinput('removeAll');
          Object.keys(event.notifications).forEach(function(key){
            var date = event.notifications[key];
            edit.notifications.tagsinput("add", {
              show: moment(event.start).diff(date),
              date: moment(date)
            });
          });
          edit.description.val(event.rawDescription);
          if(isnew){
            edit.delete.hide();
          } else {
            edit.delete.show();
          }
          edit.save.off("click").click(function(){
            event.name = edit.name.val();
            event.allday = edit.allday.prop("checked");
            event.start = edit.start.data("DateTimePicker").date();
            event.end = edit.end.data("DateTimePicker").date();
            event.rawPlace = edit.place.val();
            event.public = edit.public.prop("checked");
            event.rawDescription = edit.description.val();
            event.editors = {
              users: [],
              groups: []
            };
            event.viewers = {
              users: [],
              groups: []
            };
            event.blocked = [];
            var editors = edit.editors.tagsinput("items");
            var viewers = edit.viewers.tagsinput("items");
            var blocked = edit.blocked.tagsinput("items");
            editors.forEach(function(it){
              if(it.type === "group"){
                event.editors.groups.push(it.name);
              } else {
                event.editors.users.push(it.uid);
              }
            });
            viewers.forEach(function(it){
              if(it.type === "group"){
                event.viewers.groups.push(it.name);
              } else {
                event.viewers.users.push(it.uid);
              }
            });
            event.blocked = blocked.map(function(it){
              return it.uid;
            });
            event.notifications = edit.notifications.tagsinput("items").map(function(it){
              if(it.date){
                return it.date;
              }
              var str = it.show;
              str = str.replace(/(?:([0-9]*)([smhd])[a-zA-Z]*)/g, "$1$2");
              var date = moment(event.start), match;
              while(str.length){
                match = str.match(/([0-9]+)([smhd])/);
                date.subtract(match[1], match[2]);
                str = str.replace(/([0-9]+)([smhd])/);
              }
              return date;
            });
            function next(){
              app.alertSuccess();
              edit.it.modal("hide");
            }
            if(isnew){
              calendar.socket.createEvent(event, next);
            } else {
              calendar.socket.editEvent(event, next);
            }
          });
        },
        viewEvent: function(event){
          var view = calendar.viewEvent;

          var aftercnt = 0;

          function after(/*mess*/){
            aftercnt++;
            if(aftercnt >= 2){
              view.it.removeClass("trans");
            }
            //console.log(mess, aftercnt, aftercnt >= 2);
          }

          calendar.currentEvent = event;

          view.it.addClass("trans");

          setTimeout(function(){
            view.user.a.attr("href", config.relative_path + "/user/"+event.user.userslug);
            view.user.smalla.html(event.user.username);
            view.user.img.attr({
              src: event.user.picture,
              alt: event.user.username,
              "data-original-title": event.user.username
            });
            view.user.small.attr("title", event.user.username);

            view.name.html(event.name);
            view.start.attr({
              "data-timestamp": new Date(event.start).toISOString(),
              "data-allday": event.allday
            });
            view.end.attr({
              "data-timestamp": new Date(event.end).toISOString(),
              "data-allday": event.allday
            });
            window.initTimestamp($([view.start[0], view.end[0]]));
            view.place.html(event.place);
            view.description.html(event.description);

            view.edit[event.canEdit ? "show" : "hide"](0);

            if(window.WhoisinPlugin && event.whoisin && calendar.whoisin){
              view.whoisin.html(event.whoisin).show(0);
              window.WhoisinPlugin.setup();
              after();
            } else {
              calendar.actions.buildResponses(event.responses, function(html){
                var my = view.myResponse.detach();
                view.responses.html(html).prepend(my);
                after("responses");
              });

              if(!app.user.uid){
                view.myResponse.css("display", "none");
              } else {
                view.myResponse.find("small > a")
                  .attr("href", config.relative_path + "/user/"+app.user.userslug)
                  .html(app.user.username);
                view.myResponse.find(".selected").removeClass("selected");
                view.myResponse
                  .find("."+(event.responses[app.user.uid] ?
                    event.responses[app.user.uid].value : "invited"))
                  .addClass("selected");
              }
            }

            if(view.comments.contents()){
              observe(view.comments.contents(), false);
            }

            view.comments.off("load").on("load", function(){
              var self = $(this);
              self.contents().find("head")
                .append(calendar.templates.frameStyle);
              observe(self.contents(), function(){
                self.height(self.contents().find("body").height()+20);
              });

              after("comments");
            }).attr("src", event.url);
          }, 250);
        },
        viewDay: function(day){
          $("#cal-day-selected").attr("id", "");
          day.attr("id", "cal-day-selected");

          calendar.sidebarDay.find(".date").html(moment(day.data("date")).format("LL"));

          var events = calendar.sidebarDay.children(".events").empty();

          day.find(".event").each(function(){
            var event = calendar.events[$(this).attr("data-id")],
            onlytime = moment(event.start).date() === moment(event.end).date();
            var elem = calendar.parse(calendar.templates.dayEvent, {
              start: event.start,
              end: event.end,
              allday: event.allday,
              onlytime: onlytime,
              place: event.place,
              name: event.name,
              id: event.id
            });
            elem = $(elem);
            if(event.allday && onlytime){
              elem.find("p.time").html("all day");
            }
            elem.appendTo(events);
          });
          window.initTimestamp(events.find(".date-timestamp"));
        },
      },
      editEvent: {
        it: $('#editEvent'),
        name: $("#event-name"),
        allday: $("#event-allday"),
        start: $("#event-start"),
        end: $("#event-end"),
        place: $("#event-place"),
        editors: $("#event-editors"),
        viewers: $("#event-viewers"),
        public: $("#event-public"),
        blocked: $("#event-blocked"),
        notifications: $("#event-notifications"),
        description: $("#event-description"),
        delete: $("#editEvent button.delete"),
        save: $("#editEvent button.save")
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
      firstOfWeek: 1, // 0 for Sunday, 1 for Monday
      calDaysContainer: $("#cal-days-container"),
      sidebarDay: $("#cal-sidebar > .content > div > .day"),
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
          $("#cal-month-select li a").each(function(){
            if(+$(this).parent().attr("data-value") === val){
              calendar.currentMonth.monthSelect.html(this.innerHTML);
            }
          });
          // console.log("set month to", val);
        },
        go: function(instant){
          calendar.actions.onscroll.disabled = true;
          var mom = moment({
            "year": calendar.currentMonth.y,
            "month": calendar.currentMonth.m
          });
          calendar.actions.scrollToDate(mom, instant, function(){
            calendar.actions.onscroll.disabled = false;
          });
        }
      },
      currentEvent: {},
    };

    (function(){
      var it = $("#cal-sidebar > .content > div > .event");

      calendar.viewEvent = {
        it: $("#cal-sidebar > .content > div > .event"),
        user: {
          a: it.find(".topic-profile-pic a"),
          smalla: it.find(".topic-profile-pic small > a"),
          img: it.find(".topic-profile-pic img"),
          small: it.find(".topic-profile-pic small")
        },
        name: it.find(".topic-title.name"),
        start: it.find(".dates .start"),
        end: it.find(".dates .end"),
        place: it.find(".place"),
        description: it.find(".description"),
        responses: it.find(".responses"),
        myResponse: it.find(".responses .my-response"),
        whoisin: it.find(".cal-whoisin"),
        comments: it.find(".comments"),
        edit: it.find(".edit-event-button")
      };

      calendar.viewEvent.myResponse.children("span").click(function(){
        var $this = $(this);
        if(!$this.hasClass("selected")){
          calendar.socket.respond(calendar.currentEvent, {
            uid: app.user.uid,
            value: this.className.split(" ").filter(function(val){
              return val === "attending" ||
                  val === "maybe" ||
                  val === "not-attending" ||
                  val === "invited";
            })[0]
          }, function(){
            $this.parent().children().removeClass("selected");
            $this.addClass("selected");
            app.alertSuccess();
          });
        }
      });
    })();

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
    $(".button-today").click(calendar.actions.scrollToDate);

    (function(){
      function contains(string, arr){
        string = string.toLowerCase();
        for(var i = 0, l = arr.length; i<l; i++){
          if(string.indexOf(arr[i]) > -1){
            return arr[i];
          }
        }
      }

      var tr = $("#cal-headers").find("tr");
      if(contains(window.config.userLang, ["ca", "us", "mx", "cn", "jp"])){
        calendar.firstOfWeek = 0;
      } else if(contains(window.config.userLang, ["ar", "fa"])){
        calendar.firstOfWeek = 6;
        tr.children().last().detach().prependTo(tr);
      } else {
        calendar.firstOfWeek = 1;
        tr.children().first().detach().appendTo(tr);
      }

      var raf = window.requestAnimationFrame ||
            window.mozRequestAnimationframe ||
            window.webkitRequestAnimationFrame;

      function rpt(){
        calendar.actions.onscroll();
        raf(rpt);
      }
      raf(rpt);
    })();

    $("#cal-sidebar .panel-heading button").click(function(){
      if(!$(this).hasClass("active")){
        $("#cal-sidebar .panel-heading button").toggleClass("active");
        $("#cal-sidebar .content").children().toggleClass("active");
      }
    });
    $("#cal-sidebar .toggle").click(function(){
      $(this).children().toggleClass("fa-chevron-up fa-chevron-down");
      $(this).parent().toggleClass("down");
    });

    (function(update){
      socket.on("calendar.event.delete", update.deleteEvent);
      socket.on("calendar.event.edit", update.editEvent);
      socket.on("calendar.event.create", update.createEvent);
      socket.on("calendar.event.respond", update.response);
    })(calendar.socket.update);

    (function(edit){

      edit.it.on('show.bs.modal', function(event) {
        calendar.actions.editEvent($(event.relatedTarget).hasClass("button-add-event"));
      });

      var options = {
        icons: {
          time: "fa fa-clock-o",
          date: "fa fa-calendar",
          up: "fa fa-arrow-up",
          down: "fa fa-arrow-down",
          previous: "fa fa-arrow-left",
          next: "fa fa-arrow-right"
        }
      };

      edit.start.datetimepicker(options).on("dp.change", function(e){
        if(edit.end.data("DateTimePicker").date() < e.date){
          edit.end.data("DateTimePicker").date(e.date);
        }
      });
      edit.end.datetimepicker(options).on("dp.change", function(e){
        if(edit.start.data("DateTimePicker").date() > e.date){
          edit.start.data("DateTimePicker").date(e.date);
        }
      });

      edit.allday.change(function(){
        if(this.checked){
          edit.start.data("DateTimePicker").format("LL");
          edit.end.data("DateTimePicker").format("LL");
        } else {
          edit.start.data("DateTimePicker").format("LLL");
          edit.end.data("DateTimePicker").format("LLL");
        }
      });

      function groups(query, callback){
        socket.emit("groups.search", {
          query: query
        }, function(err, data){
          if(err){
            return app.alertError();
          }
          callback(data.map(function(group){
            group = {
              name: group.name,
              slug: group.slug
            };
            return group;
          }));
        });
      }
      function users(query, callback){
        socket.emit("user.search", {
          query: query
        }, function(err, data){
          if(err){
            return app.alertError();
          }
          callback(data.users);
        });
      }

      $([edit.editors[0], edit.viewers[0]]).tagsinput({
        itemText: function(item){
          return item.username || item.name;
        },
        itemValue: function(item){
          return item.uid || item.name;
        },
        confirmKeys: [32, 44],
        freeInput: false,
        typeaheadjs: [
          {
            name: 'users',
            displayKey: 'username',
            source: users
          },
          {
            name: 'groups',
            displayKey: 'name',
            source: groups
          }
        ]
      });
      edit.blocked.tagsinput({
        itemText: function(item){
          return item.username || item.name;
        },
        itemValue: function(item){
          return item.uid || item.name;
        },
        confirmKeys: [32, 44],
        freeInput: false,
        typeaheadjs: {
          name: 'users',
          displayKey: 'username',
          source: users
        }
      });

      edit.delete.click(function(){
        calendar.socket.deleteEvent(calendar.currentEvent, function(){
          app.alertSuccess();
          edit.it.modal("hide");
        });
      });

    })(calendar.editEvent);

    app.enterRoom("calendar");

    $("#cal-sidebar .content .day .events").on("click", ".event", function(){
      calendar.actions.viewEvent(calendar.events[$(this).attr("data-id")]);
    });

    calendar.calDays.on("click", function(e){
      var t = $(e.target);
      if(!t.hasClass("event")){
        t = t.parents(".event");
      }
      if(t.length){
        calendar.actions.viewEvent(calendar.events[t.attr("data-id")]);
      } else {
        t = $(e.target);
      }
      if(!t.is("td")){
        t = t.parents("td");
      }
      if(t.length){
        calendar.actions.viewDay(t);
      }
    });

    calendar.translator = translator;
    calendar.moment = moment;

    window.calendar = calendar;

    $(document).ready(function(){

      try {
        var loaded = JSON.parse($("#data_script").html());
        calendar.buffer = loaded.buffer;
        calendar.whoisin = loaded.whoisin;
        console.log("Successfully loaded initial data");
      } catch(e){
        console.error("Failed to load initial data", e);
      }

      function loadTemplates(callback){
        var templates = ["day", "event", "profilePic", "response", "viewEvent", "dayEvent", "frameStyle"];
        var n = 0, i;

        function todo(template){
          calendar.templates[this] = template;
          //console.log("template "+this+" loaded");
          n++;
          if(n === templates.length){
            callback();
          }
        }
        for(i=0; i<templates.length; i++){
          window.ajaxify.loadTemplate("partials/calendar/"+templates[i], todo.bind(templates[i]));
        }
      }

      loadTemplates(function(){
        console.log("Calendar templates loaded");
        translator.load(window.config.userLang, "calendar", function(){
          console.log("Calendar translation loaded");
          calendar.actions.init();
        });
      });

      var cal = $("#nodebb-plugin-calendar");
      if(cal.length){
        console.log("Init fixing content styling...");
        $("#content").fadeTo(200, 0, function(){
          cal = cal.detach();
          $("#content").empty().append(cal);
          $("#content").fadeTo(200, 1);
        });
      }

    });
    /*
    $(window).on("action:ajaxify.end", function(){
      var cal = $("#nodebb-plugin-calendar");
      if(cal.length){
        console.log("Fixing content styling...");
        $("#content").fadeTo(200, 0, function(){
          cal = cal.detach();
          $("#content").empty().append(cal);
          $("#content").fadeTo(200, 1);
        });
      }
    });
    */

  })(window.jQuery, window.app, window.templates, window.socket);
});

require(["moment"], function(moment) {
  "use strict";
  window.initTimestamp = function(elems){
    elems.each(function(){
      var $this = $(this), data = {
        onlytime: $this.attr("data-onlytime") === "true",
        allday: $this.attr("data-allday") === "true",
        timestamp: $this.attr("data-timestamp")
      }, utc;

      if(data.onlytime && data.allday){
        $this.html("all day");
        return;
      } else if(data.onlytime){
        $this.html(moment(data.timestamp).format("LT"));
        utc = moment.utc(data.timestamp).format("LT");
      } else if(data.allday) {
        $this.html(moment(data.timestamp).format("LL"));
        utc = moment.utc(data.timestamp).format("LL");
      } else {
        $this.html(moment(data.timestamp).format("LLL"));
        utc = moment.utc(data.timestamp).format("LLL");
      }
      utc += "UTC";
      $this.tooltip({
        content: utc
      });
    });
  };
  $(window).on('action:ajaxify.end', function(){
    window.initTimestamp($(".date-timestamp"));
  });
});
