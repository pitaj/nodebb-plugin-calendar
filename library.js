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

(function(exports, module, undefined){
  "use strict";

  var async = require('async'),
    fs = require("fs"),
    schedule = require('node-schedule'),
    sanitize = require('google-caja').sanitize,
    users = module.parent.require("./user"),
    pluginSocket = module.parent.parent.require("./socket.io/plugins"),
    mainSocket = module.parent.parent.require("./socket.io/index"),
    plugins = module.parent.require('./plugins'),
    Notifications = module.parent.require("./notifications"),
    translator = module.parent.require('./translator'),
    whoisin;

  var parse = async.apply(plugins.fireHook, 'filter:parse.raw');
  // parse(raw, callback(err, html){})

  var db = require("subs/db"),
    posts = require("subs/posts");

  function user(uid, events, callback){

    var globals = {}, locals = {};

    if(uid === 0){
      callback(null, function can(perm, event){
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
          siteAdmin: async.apply(users.isAdministrator, uid),
          admin: async.apply(db.groups.isMember, uid, settings.admin),
          edit: async.apply(db.groups.isMember, uid, settings.edit),
          create: async.apply(db.groups.isMember, uid, settings.create)
        }, next);
      },
      function(perms, next){
        globals.admin = perms.siteAdmin || perms.admin;
        globals.edit = globals.admin || perms.edit;
        globals.create = globals.edit || perms.create;
        globals.delete = globals.admin;
        next();
      },
      function(prev, next){
        if(!events || !events.length){
          return next();
        }
        var local;
        async.each(events, function(event, nxt){
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
              blocked: event.blocked.indexOf(uid) > -1,
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
        if(perm === "admin" || perm === "create" || !event){
          return globals[perm];
        }
        if(globals.admin){
          return true;
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
        res.render("admin/plugins/calendar", data);
      });
    },
    page: function(req, res, next){
      db.settings.get(function(err, settings){
        if(err){
          return next(err);
        }
        settings.usewhoisin = settings.usewhoisin && whoisin;
        db.getEvents(function(err, events){
          if(err){
            return next(err);
          }
          user(req.uid, events, function(err, can){
            if(err){
              return next(err);
            }
            eventstuff.trim(events, can, function(err, events){
              next(err, {
                events: events,
                canCreate: can("create"),
                settings: settings
              });
            });
          });
        });
      });
    },
    saveAdmin: function(req, res, next){
      db.settings.set(req.body, function(err, data){
        if(err){
          res.json(false);
        } else {
          res.json(true);
        }
      });
    }
  };

  var sockets = {
    emitEventChange: function(event, message, callback){
      var soks = mainSocket.server.sockets.in("calendar").sockets;
      async.each(Object.keys(soks), function(x, next){
        user(soks[x].uid).can("view", event, function(err, bool){
          if(!err && bool){
            mainSocket.server.sockets.socket(soks[x].uid).emit(message, event);
          }
        });
      }, callback);
    },
    on: {
      createEvent: function(socket, event, callback){

      },
      editEvent: function(socket, event, callback){

      },
      deleteEvent: function(socket, event, callback){

      },
      response: function(socket, response, callback){
        db.event.responses.set(response.event, response.uid, response.value, callback);
      }
    }
  };

  pluginSocket.calendar = sockets.on;

  var eventstuff = {
    edit: function(rawEvent, callback){
      var event = {
        id: rawEvent.id,
        start: rawEvent.start,
        end: rawEvent.end,
        uid: rawEvent.uid,
        name: rawEvent.name,
        place: rawEvent.place,
        description: rawEvent.description,
        allday: rawEvent.allDay
      };
      async.parallel([
        async.apply(db.event.edit, rawEvent),
        async.apply(db.event.permissions.set, rawEvent),
        async.apply(notifications.handle, rawEvent)
      ], function(err){
        callback(err, event);
      });
    },
    create: function(rawEvent, callback){
      var event = {
        id: rawEvent.id,
        start: rawEvent.start,
        end: rawEvent.end,
        uid: rawEvent.uid,
        name: rawEvent.name,
        place: rawEvent.place,
        description: rawEvent.description,
        allday: rawEvent.allDay
      };
      async.parallel([
        async.apply(db.event.add, rawEvent),
        async.apply(db.event.permissions.set, rawEvent),
        async.apply(notifications.handle, rawEvent)
      ], function(err, result){
        callback(err, result[0]);
      });
    },
    delete: function(rawEvent, callback){
      async.parallel([
        async.apply(db.event.delete, rawEvent),
        async.apply(notifications.delete, rawEvent),
        async.apply(db.event.responses.delete, rawEvent),
        async.apply(notifications.clear, rawEvent)
      ], callback);
    },
    trim: function(events, can, callback){
      events = events.filter(function(event){
        return can("view", event);
      }).map(function(event){
        event.canEdit = can("edit", event);
        event.canDelete = can("delete", event);
        if(!event.canEdit){
          event = {
            id: event.id,
            canEdit: event.canEdit,
            canDelete: event.canDelete,
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
        }
        return event;
      });
      callback(null, events);
    }
  };

  var notifications = {
    handle: function(event, callback){
      async.waterfall([
        async.apply(async.parallel, [
          async.apply(notifications.clear, event),
          async.apply(notifications.delete, event)
        ]),
        function(thing, next){
          notifications.save(event, event.notifications, next);
        },
        function(thing, next){
          notifications.load([{
            id: event.id,
            notifications: event.notifications
          }], next);
        },
      ], callback);
    },
    load: function(notifs, callback){
      var x, date, id, i, these;

      function after(err){
        if(err){
          console.log("notification "+id+" failed to send");
        }
      }

      console.log(notifs);
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
      notifications.jobs[event.id].forEach(function(it){
        it.cancel();
      });
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
      text: '<i class="fa fa-fw fa-calendar"></i><span class="visible-xs-inline"> Calendar</span>'
    });
    callback(null, header);
  };
  exports.init = function (obj, callback) {
    obj.router.get('/calendar', obj.middleware.buildHeader, render.page);
    obj.router.get('/api/calendar', render.page);
    obj.router.get('/admin/plugins/calendar', obj.middleware.admin.buildHeader, render.admin);
    obj.router.get('/api/admin/plugins/calendar', render.admin);
    obj.router.post("/api/admin/plugins/calendar/save", render.saveAdmin);
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
        db.settings.get(function(err, settings){
          if(err){
            return next(err);
          }
          try {
            whoisin = require("../nodebb-plugin-whoisin");
            if(!whoisin.include || typeof whoisin.include !== "function" || !settings.usewhoisin){
              whoisin = false;
            }
          } catch(e){
            whoisin = false;
          }
          if(whoisin){
            console.log("[nodebb-plugin-whoisin] being utilized in [nodebb-plugin-calendar]");
          }
          next();
        });
      },
      function(next){
        var rootDir = "public/translations", filePath, dirs = [];
        async.waterfall([
          async.apply(fs.readDir, rootDir),
          function(files, next){
            async.each(files, function(file, nxt){
              if(file[0] !== '.'){
                filePath = rootDir + '/' + file;
                fs.stat(filePath, function(err, stat){
                  if(err){
                    return nxt(err);
                  }
                  if(stat.isDirectory()){
                    dirs.push(file);
                  }
                  nxt();
                });
              }
            }, function(err){
              next(err, dirs);
            });
          },
          function(dirs, next){
            async.each(dirs, function(dir, nxt){
              fs.readDir(dir, function(err, files){
                if(err){
                  return nxt(err);
                }
                async.each(files, function(file, cb){
                  if(file[0] !== '.'){
                    filePath = rootDir + '/' + file;
                    translator.addTranslation(dir, filePath);
                  }
                  cb();
                }, nxt);
              });
            }, next);
          }
        ], next);
      }
    ], callback);
  };

})(module.exports, module);
