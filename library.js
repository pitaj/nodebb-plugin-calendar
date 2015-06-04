/* event / user spec
  fields for events {
    id: (#) unique identifier for this event
    canEdit: (Boolean) whether the current user can edit this event
    canDelete: (Boolean) whether user can delete event
    start: (Date) Date object of event start time
    end: (Date) Date object of event end time
    uid: (#) the uid of the user who made the event
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

"use strict";

(function(exports, module){

  var async = require('async'),
    //fs = require("fs"),
    schedule = require('node-schedule'),
    sanitize = require('google-caja').sanitize,
    pluginSocket = module.parent.require("./socket.io/plugins"),
    mainSocket = module.parent.require("./socket.io/index"),
    plugins = module.parent.require('./plugins'),
    winston = module.parent.require("winston"),
    privileges = module.parent.require("./privileges"),
    Notifications = module.parent.require("./notifications");
    //translator = module.parent.require('../public/src/translator');


  // var types = {
  //   Markdown: String,
  //   HTML: String,
  //   Integer: Number,
  //   URL: String
  // };
  //
  // function assign(input, add){
  //   for(var keys = Object.keys(input), l = keys.length, i = 0; i < l; i++){
  //     if(add.hasOwnProperty(keys[i])){
  //       input[keys[i]] = add[keys[i]];
  //     }
  //   }
  //   return input;
  // }
  //
  // function createEvent(details){
  //
  //   var Event = {
  //     id: types.Integer,
  //     start: Date(),
  //     end: Date(),
  //     uid: types.Integer(),
  //     name: String(),
  //     rawPlace: types.Markdown(),
  //     place: types.HTML(),
  //     rawDescription: types.Markdown(),
  //     description: types.HTML(),
  //     allday: Boolean(),
  //     notifications: [],
  //     responses: {},
  //     url: types.URL(),
  //     editors: {
  //       users: [],
  //       groups: []
  //     },
  //     viewers: {
  //       users: [],
  //       groups: []
  //     },
  //     blocked: []
  //   };
  //
  //   return assign(Object.create(Event), details);
  // }

  function parse(raw, callback){
    plugins.fireHook('filter:parse.raw', raw, callback);
  }
  var whoisin, buffer = 6;


  var db = require("./subs/db"),
    posts = require("./subs/posts");

  function user(uid, events, callback){

    //console.log("uid: ", uid);

    var globals = {}, locals = {};

    if(!uid){
      return callback(null, function can(perm, event){
        if(perm === "view"){
          return event.public;
        }
        return false;
      });
    }

    async.waterfall([
      db.settings.get,
      function(settings, next){
        async.parallel({
          siteAdmin: async.apply(db.users.isAdministrator, uid),
          admin: async.apply(db.groups.isMember, uid, settings.admin),
          edit: async.apply(db.groups.isMember, uid, settings.edit),
          create: async.apply(db.groups.isMember, uid, settings.create)
        }, next);
      },
      function(perms, next){
        globals.delete = globals.admin = perms.siteAdmin || perms.admin;
        globals.edit = globals.admin || perms.edit;
        globals.create = globals.edit || perms.create;
        next();
      },
      function(next){
        if(!events || !events.length){
          return next();
        }
        var local;
        async.each(Object.keys(events), function(key, nxt){
          var event = events[key];
          async.parallel({
            edit: async.apply(db.groups.isMemberOfMultiple, uid, event.editors.groups),
            view: async.apply(db.groups.isMemberOfMultiple, uid, event.viewers.groups),
          }, function(err, groupPerms){
            if(err){
              return nxt(err);
            }
            local = {
              edit: groupPerms.edit || event.editors.users.indexOf(uid) > -1,
              view: groupPerms.view || event.viewers.users.indexOf(uid) > -1,
              blocked: event.blocked ? event.blocked.indexOf(uid) > -1 : false,
              delete: event.uid === uid,
            };
            local.edit = local.edit && !local.blocked;
            local.view = (local.view || local.edit) && !local.blocked;
            locals[event.id] = local;
            nxt();
          });
        }, next);
      }
    ], function(err){
      if(err){
        return callback(err);
      }
      var can = function(perm, event){

        if(typeof perm !== "string"){
          return false;
        }
        if(globals.admin){
          return true;
        }
        if(perm === "admin" || perm === "create" || !event){
          return globals[perm];
        }
        if(globals.edit && (perm === "view" || perm === "edit")){
          return true;
        }
        return locals[event.id][perm];
      };
      callback(null, can);
    });
  }

  var render = {
    admin: function(req, res, next){
      db.settings.get(function(err, data) {
        if (err) {
          return next(err);
        }
        var settings = {
          create: data.create || "",
          edit: data.edit || "",
          admin: data.admin || "",
          category: data.category || "",
          usewhoisin: !!data.usewhoisin
        };
        res.render("admin/plugins/calendar", settings);
      });
    },
    page: function(req, res, callback){

      async.parallel({
        settings: db.settings.get,
        can: async.apply(user, req.user ? req.user.uid : 0, null)
      }, function(err, data){
        if(err){
          return callback(err);
        }
        var today = new Date();
        res.render("calendar", {
          canCreate: data.can("create"),
          whoisin: !!(data.settings.usewhoisin && whoisin),
          today: {
            date: today.getDate(),
            month: today.getMonth(),
            year: today.getFullYear()
          },
          buffer: buffer
        });
      });
      /* old version
      var today, settings, can;
      async.waterfall([
        function(next){
          db.settings.get(next);
        },
        function(sets, next){
          settings = sets;
          var ago = new Date();
          var ahead = new Date();
          ago.setMonth(ago.getMonth()-buffer);
          ahead.setMonth(ahead.getMonth()+buffer);
          today = new Date();
          eventstuff.getEvents(req.user ? req.user.uid : 0, {
            start: ago,
            end: ahead
          }, next);
        },
        function(events, next){
          user(req.user ? req.user.uid : 0, events, function(err, cn){
            can = cn;
            next(err, events);
          });
        },
      ], function(err, events){
        if(err){
          return callback(err);
        }
        res.render("calendar", {
          canCreate: can("create"),
          whoisin: !!(settings.usewhoisin && whoisin),
          today: {
            date: today.getDate(),
            month: today.getMonth(),
            year: today.getFullYear()
          },
          buffer: buffer
        });
      });
      */
    },
    saveAdmin: function(req, res){
      var settings = {
        create: req.body.create,
        edit: req.body.edit,
        admin: req.body.admin,
        category: req.body.category,
        usewhoisin: !!req.body.usewhoisin
      };
      async.waterfall([
        db.groups.getAll,
        function(groups, next){
          async.each(groups, async.apply(privileges.categories.rescind, ['find', 'mods'], settings.category), next);
        },
        async.apply(db.settings.set, settings)
      ], function(err){
        if(err){
          res.json(false);
        } else {
          res.json(true);
        }
      });
    }
  };

  function emitEventChange(data, message, callback){
    var soks = mainSocket.in("calendar").connected;

    async.waterfall([
      async.apply(db.event.get, data.event.id),
      eventstuff.getEventStuff
    ], function(err, event){
      if(err){
        return callback(err);
      }
      data.event = event;

      async.each(Object.keys(soks), function(x, next){
        user(soks[x].uid, [event], function(err, can){
          if(err){
            return next(err);
          }
          if(can("view", event)){
            mainSocket.server.sockets.connected[x].emit(message, data);
          }
          next();
        });
      }, function(err){
        callback(err, data);
      });

    });
  }

  pluginSocket.calendar = {
    getEvents: function(socket, dates, callback){
      eventstuff.getEvents(socket.uid, dates, callback);
    },
    createEvent: function(socket, event, callback){
      //console.log(JSON.stringify(event, null, 2));
      var settings;
      async.waterfall([
        async.apply(user, socket.uid, null),
        function(can, next){
          db.settings.get(function(err, sets){
            if(err){
              return next(err);
            }
            settings = sets;
            if(!can("create")){
              next(new Error("[[calendar:permissions.forbidden.create]]"));
            } else {
              next(null, can);
            }
          });
        },
        function(can, next){
          async.parallel({
            place: async.apply(parse, event.rawPlace),
            description: async.apply(parse, event.rawDescription),
            name: function(next){
              next(null, sanitize(event.name));
            },
          }, next);
        },
        function(parsed, next){
          event = {
            start: event.start,
            end: event.end,
            uid: socket.uid,
            rawPlace: event.rawPlace,
            rawDescription: event.rawDescription,
            place: parsed.place,
            description: parsed.description,
            name: parsed.name,
            allday: event.allday,
            public: event.public,
            notifications: event.notifications,
            editors: event.editors,
            viewers: event.viewers,
            blocked: event.blocked,
            cid: event.cid || settings.category
          };
          next(null, event);
        },
        posts.create,
        eventstuff.create,
        eventstuff.getEventStuff,
        function(event, next){
          emitEventChange({
            event: event
          }, "calendar.event.create", function(err){
            event.canEdit = event.canDelete = true;
            next(err, event);
          });
        }
      ], callback);
    },
    editEvent: function(socket, event, callback){
      var settings;
      async.waterfall([
        async.apply(user, socket.uid, null),
        function(can, next){
          db.settings.get(function(err, sets){
            if(err){
              return next(err);
            }
            settings = sets;
            if(!can("create")){
              next(new Error("[[calendar:permissions.forbidden.create]]"));
            } else {
              next(null, can);
            }
          });
        },
        function(can, next){
          async.parallel({
            place: async.apply(parse, event.rawPlace),
            description: async.apply(parse, event.rawDescription),
            name: function(next){
              next(null, sanitize(event.name));
            },
          }, next);
        },
        function(parsed, next){
          db.event.get(event.id, function(err, oldEvent){
            next(err, { oldEvent: oldEvent, parsed: parsed });
          });
        },
        function(obj, next){
          event = {
            id: event.id,
            uid: event.uid,
            pid: obj.oldEvent.pid,
            start: new Date(event.start).toISOString(),
            end: new Date(event.end).toISOString(),
            rawPlace: event.rawPlace,
            rawDescription: event.rawDescription,
            place: obj.parsed.place,
            description: obj.parsed.description,
            public: event.public,
            name: obj.parsed.name,
            allday: !!event.allday,
            notifications: event.notifications,
            editors: event.editors,
            viewers: event.viewers,
            blocked: event.blocked,
            cid: event.cid || settings.category
          };
          next(null, event);
        },
        posts.update,
        eventstuff.edit,
        function(event, next){
          emitEventChange({
            event: event
          }, "calendar.event.edit", function(err, data){
            data.event.canEdit = data.event.canDelete = true;
            next(err, data.event);
          });
        }
      ], callback);
    },
    deleteEvent: function(socket, event, callback){
      async.waterfall([
        async.apply(db.event.get, event.id),
        function(ev, next){
          event = ev;
          user(socket.uid, [event], next);
        },
        function(can, next){
          //console.log("uid: ", socket.uid, "can delete: ", can("delete"));
          if(!can("delete", event)){
            next(new Error("[[calendar:permissions.forbidden.delete]]"));
          } else {
            next(null, event);
          }
        },
        function(event, next){
          emitEventChange({
            event: {
              id: event.id
            }
          }, "calendar.event.delete", function(err){
            next(err, event);
          });
        },
        posts.delete,
        eventstuff.delete
      ], callback);
    },
    respond: function(socket, response, callback){
      async.waterfall([
        async.apply(user, response.uid, [response.event]),
        function(can, next){
          if(!can("view", response.event)){
            return next(new Error("[[calendar:permissions.forbidden.view]]"));
          }
          next();
        },
        async.apply(db.event.responses.set, response.event, response.uid, response.value),
        function(next){
          emitEventChange(response, "calendar.event.respond", function(err){
            next(err, response);
          });
        }
      ], callback);
    }
  };

  var eventstuff = {
    edit: function(rawEvent, callback){
      async.parallel([
        async.apply(db.event.edit, rawEvent),
        async.apply(db.event.permissions.set, rawEvent),
        async.apply(notifications.handle, rawEvent)
      ], function(err){
        callback(err, rawEvent);
      });
    },
    create: function(rawEvent, callback){
      async.parallel([
        async.apply(db.event.add, rawEvent),
        async.apply(db.event.permissions.set, rawEvent),
        async.apply(notifications.handle, rawEvent)
      ], function(err, result){
        callback(err, result[0]);
      });
    },
    getEvents: function(uid, dates, callback){
      var evs, can;
      async.waterfall([
        function(next){
          db.getEventsByDate(new Date(dates.start), new Date(dates.end), next);
        },
        function(events, next){
          evs = events;
          user(uid, events, next);
        },
        function(cn, next){
          can = cn;
          eventstuff.trim(evs, can, next);
        },
        function(events, next){
          //console.log("events: ", events);
          async.each(Object.keys(events), function(key, nxt){
            var event = events[key];
            eventstuff.getEventStuff(event, nxt);
          }, function(err){
            next(err, events);
          });
        }
      ], callback);
    },
    getEventStuff: function(event, callback){
      event.allday = event.allday === "true" || event.allday === true;
      event.responses = event.responses || {};
      event.editors = event.editors || {};
      event.editors.users = event.editors.users || [];
      event.editors.groups = event.editors.groups || [];
      event.viewers = event.viewers || {};
      event.viewers.users = event.viewers.users || [];
      event.viewers.groups = event.viewers.groups || [];
      event.blocked = event.blocked || [];
      async.parallel([
        function(n){
          async.each(Object.keys(event.responses), function(key, cb){
            db.users.getInfo(key, function(err, info){
              if(err){
                return cb(err);
              }
              event.responses[key] = {
                value: event.responses[key],
                username: info.username,
                userslug: info.userslug,
                picture: info.picture
              };
              cb();
            });
          }, n);
        },
        function(n){
          async.each(Object.keys(event.editors.users), function(key, cb){
            db.users.getInfo(key, function(err, info){
              if(err){
                return cb(err);
              }
              event.editors.users[key] = {
                uid: info.uid,
                username: info.username,
                userslug: info.userslug,
                picture: info.picture
              };
              cb();
            });
          }, n);
        },
        function(n){
          async.each(Object.keys(event.viewers.users), function(key, cb){
            db.users.getInfo(key, function(err, info){
              if(err){
                return cb(err);
              }
              event.viewers.users[key] = {
                uid: info.uid,
                username: info.username,
                userslug: info.userslug,
                picture: info.picture
              };
              cb();
            });
          }, n);
        },
        function(n){
          async.each(Object.keys(event.blocked), function(key, cb){
            db.users.getInfo(key, function(err, info){
              if(err){
                return cb(err);
              }
              event.blocked[key] = {
                uid: info.uid,
                username: info.username,
                userslug: info.userslug,
                picture: info.picture
              };
              cb();
            });
          }, n);
        },
        function(cb){
          db.users.getInfo(event.uid, function(err, info){
            if(err){
              return cb(err);
            }
            event.user = {
              uid: info.uid,
              username: info.username,
              userslug: info.userslug,
              picture: info.picture
            };
            cb();
          });
        },
      ], function(err){
        if(err){
          return callback(err);
        }
        callback(null, event);
      });
    },
    delete: function(rawEvent, callback){
      async.parallel([
        async.apply(db.event.delete, rawEvent),
        async.apply(notifications.delete, rawEvent),
        async.apply(db.event.responses.delete, rawEvent),
        async.apply(notifications.clear, rawEvent)
      ], function(err){
        callback(err, rawEvent);
      });
    },
    trim: function(events, can, callback){
      events = events.filter(function(event){
        return can("view", event);
      }).map(function(event){
        event.canEdit = can("edit", event);
        event.canDelete = can("delete", event);
        var ev = {
          id: event.id,
          start: event.start,
          end: event.end,
          uid: event.uid,
          name: event.name,
          place: event.place,
          description: event.description,
          allday: event.allday,
          responses: event.responses,
          url: event.url,
        };
        if(event.canEdit){
          ev.canEdit = true;
          ev.canDelete = event.canDelete;
          ev.rawPlace = event.rawPlace;
          ev.rawDescription = event.rawDescription;
          ev.notifications = event.notifications;
        }
        return ev;
      });

      var evs = [];
      for(var i=0; i<events.length; i++){
        evs[events[i].id] = events[i];
      }

      callback(null, evs);
    }
  };

  var notifications = {
    handle: function(event, callback){
      async.waterfall([
        async.apply(async.parallel, [
          async.apply(notifications.clear, event),
          async.apply(db.event.notifications.remove, event)
        ]),
        function(thing, next){
          notifications.save(event, event.notifications, next);
        },
        function(next){
          notifications.load([{
            id: event.id,
            notifications: event.notifications
          }], next);
        },
      ], function(err){
        callback(err);
      });
    },
    load: function(notifs, callback){
      var x, date, id, i, these;

      function after(err){
        if(err){
          winston.log("notification "+id+" failed to send");
        }
      }

      //console.log("line 420: ", notifs);
      for(x in notifs){
        if(notifs.hasOwnProperty(x)){
          id = notifs[x].id;
          these = notifs[x].notifications;
          notifications.jobs[id] = notifications.jobs[id] || [];
          for(i=0; i<these.length; i++){
            date = new Date(these[i]);
            notifications.jobs[id].push(
              schedule.scheduleJob(
                date,
                async.apply(
                  notifications.notify,
                  id,
                  date,
                  after
                )
              )
            );
          }
        }
      }
      callback();
    },
    clear: function(event, callback){
      if(notifications.jobs[event.id]){
        notifications.jobs[event.id].forEach(function(it){
          it.cancel();
        });
      }
      notifications.jobs[event.id] = [];
      callback();
    },
    // cancel all node-schedule jobs for the event given
    delete: db.event.notifications.remove,
    // notifications.delete(event, callback(err){})
    deleteOne: db.event.notifications.removeOne,
    // notifications.deleteOne(event, date, callback(err){})
    save: db.event.notifications.set,
    notify: function(eventID, date, callback){
      db.event.get(eventID, function(err, event){
        if(err){
          return callback(err);
        }
        async.parallel([
          async.apply(async.map, event.viewers.groups, db.groups.getMembers),
          async.apply(async.map, event.editors.groups, db.groups.getMembers)
        ], function(err, users){
          if(err){
            return callback(err);
          }
          users = users[0].concat(users[1]);
          users = Array.prototype.concat.apply([], users);
          users.reduce(function(elem){
            return event.blocked.indexOf(elem) > -1;
          });
          Notifications.create({
            nid: "calendar:notify:events["+event.id+"]",
            pid: event.pid,
            tid: event.tid,
            bodyShort: "Calendar: "+event.name,
            bodyLong: event.html,
            from: event.uid
          }, function(err, notif){
            if(err){
              return callback(err);
            }
            Notifications.push(notif, users, function(err){
              if(err){
                return callback(err);
              }
              notifications.deleteOne(event.id, date, callback);
            });
          });
        });

      });
    },
    jobs: {}
  };

  // hooks
  exports.addAdminNavigation = function(header, callback) {
    header.plugins.push({
      route: '/plugins/calendar',
      icon: 'fa-calendar',
      name: 'Calendar configuration'
    });
    callback(null, header);
  };
  exports.addNavigation = function(header, callback) {
    header.navigation.push({
      class: "calendar",
      route: "/calendar",
      name: "Calendar",
      title: "Calendar",
      iconClass: 'fa-calendar',
      text: 'Calendar',
      textClass: 'visible-xs-inline'
    });
    callback(null, header);
  };

  exports.init = function(obj, callback) {
    obj.router.get('/calendar', obj.middleware.buildHeader, render.page);
    obj.router.get('/api/calendar', render.page);
    obj.router.get('/admin/plugins/calendar', obj.middleware.admin.buildHeader, render.admin);
    obj.router.get('/api/admin/plugins/calendar', render.admin);
    obj.router.post('/api/admin/plugins/calendar/save', render.saveAdmin);

    posts.app = obj.app;

    async.parallel([
      function(next){
        db.getNotifications(function(err, data){
          if(err){
            return next(err);
          }
          notifications.load(data, next);
        });
      },
      function(next){
        try {
          whoisin = require("../nodebb-plugin-whoisin");
          if(!whoisin.include || typeof whoisin.include !== "function"){
            whoisin = false;
          }
        } catch(e){
          whoisin = false;
        }
        if(whoisin){
          winston.log("[nodebb-plugin-whoisin] being utilized in [nodebb-plugin-calendar]");
        }
        next();
      },
    ], function(err){
      callback(err);
    });
  };

  exports.topicFilter = function(topicData, callback){
    if(!topicData.topic || !topicData.uid || !topicData.topic.tid){
      return callback(null, topicData);
    }
    db.event.getByTid(topicData.topic.tid, function(err, event){
      if(err){
        return callback(err);
      }
      if(!event || !event.id){
        return callback(null, topicData);
      }
      user(topicData.uid, [event], function(err, can){
        if(err){
          return callback(err);
        }
        if(can("view", event)){
          callback(null, topicData);
        } else {
          callback(null, null);
        }
      });
    });
  };

  var reg = new RegExp("\\[\\s*allday\\s*\\=\\s*(\\w*)\\s*date\\s*\\=\\s*((\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z))|(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d([+-][0-2]\\d:[0-5]\\d|Z))|(\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d([+-][0-2]\\d:[0-5]\\d|Z)))\\s*\\]", "g");
  var otherReg = new RegExp("\\[\\s*(h1|h2|h3|h4|h5|h6|strong|b|em|i)\\s*\\]\\s*([a-zA-Z0-9\\.\\:\\-\\;]+)\\[\\s*\\/\\s*(h1|h2|h3|h4|h5|h6|strong|b|em|i)\\s*\\]", "g");
  exports.postParse = function(postContent){
    postContent = postContent.replace(reg, '<span class="date-timestamp" data-allday="$1" data-timestamp="$2" data-onlytime="false"></span>');
    postContent = postContent.replace(/\[\s*hr\s*\]/g, "<hr>");
    return postContent.replace(otherReg, "<$1>$2</$1>");
  };

})(module.exports, module);
