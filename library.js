(function(exports, module, undefined){
  "use strict";

  var async = require('async'),
    fs = require("fs"),
    moment = require('moment'),
    schedule = require('node-schedule'),
    sanitize = require('google-caja').sanitize,
    groups = module.parent.require("./groups"),
    users = module.parent.require("./user"),
    utils = require("../../public/src/utils"),
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

  function user(uid){

    var thisUser = {
      can: function(perm, event, callback){
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
          function(globals, next){
            var result = false;
            if((perm === "edit" || perm === "view") && (globals.siteAdmin || globals.admin || globals.edit)){
              result = true;
            } else if(perm === "admin"  && (globals.siteAdmin || globals.admin)){
              result = true;
            } else if(perm === "create"  && (globals.siteAdmin || globals.admin || globals.edit || globals.create)){
              result = true;
            } else {
              return next(new Error("Permission doesn't exist"));
            }
            next(null, result);
          },
          function(globalResult, next){
            if(globalResult || !event || perm === "create" || perm === "admin"){
              return next(null, globalResult);
            }
            db.events.permissions.get(event, function(err, event){
              if(err){
                return next(err);
              }
              if(event.blocked.indexOf(uid) > -1){
                return next(null, false);
              }
              if(perm === "view"){
                if(event.viewers.users.indexOf(uid) > -1 || event.editors.users.indexOf(uid) > -1){
                  return next(null, true);
                }
                db.groups.isMemberOfGroups(uid, event.viewers.groups.concat(event.editors.groups), next);
              } else if(perm === "edit"){
                if(event.editors.users.indexOf(uid) > -1){
                  return next(null, true);
                }
                db.groups.isMemberOfGroups(uid, event.editors.groups, next);
              } else {
                next(new Error("Permission doesn't exist"));
              }
            });
          }
        ], callback);
      }
    };
    return thisUser;
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
        db.getEvents(function(err, events){
          if(err){
            return next(err);
          }
          res.render("/calendar", {
            settings: settings,
            events: events
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

  };

  var notifications = {
    load: function(err, notifs, callback){
      var x, date, id;

      function after(err){
        console.log("notification "+id+" failed to send");
      }

      console.log(notifs);
      for(x in notifs){
        if(notifs.hasOwnProperty(x)){
          date = new Date(notifs[x]);
          id = x;
          notifications.jobs[id] = notifications.jobs[id] || [];
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
    delete: db.notifications.remove,
    // notifications.delete(event, callback(err){})
    deleteOne: db.notifications.removeOne,
    // notifications.deleteOne(event, date, callback(err){})
    notify: function(eventID, date, callback){
      db.events.get(eventID, function(err, event){
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
          notifications.load(null, data, next);
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
