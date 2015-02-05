"use strict";

var database = module.parent.parent.require("./database"),
  async = require("async"),
  groups = module.parent.parent.require("./groups");

var db = module.exports = {
  event: {
    last: async.apply(database.get, "plugins:calendar:events:last"),
    add: function(event, callback){
      db.event.last(function(err, last){
        if(err){
          return callback(err);
        }
        event.id = last+1;
        async.waterfall([
          async.apply(async.parallel, [
            async.apply(database.sortedSetAdd, "plugins:calendar:events", event.startDate.valueOf(), "plugins:calendar:events:"+event.id),
            async.apply(db.event.edit, event)
          ]),
          async.apply(database.increment, "plugins:calendar:events:last"),
        ], function(err){
          callback(err, event);
        });
      });
    },
    edit: function(event, callback){
      var allowedKeys = ["uid", "tid", "pid", ];
      database.setObject("plugins:calendar:events:"+event.id, event, callback);
    },
    delete: function(event, callback){
      async.parallel([
        async.apply(database.delete, "plugins:calendar:events:"+event.id),
        async.apply(database.sortedSetRemove, "plugins:calendar:events", "plugins:calendar:events:"+event.id),
      ], callback);
    },
    get: function(eventID, callback){
      async.waterfall([
        async.apply(database.getObject, "plugins:calendar:events:"+eventID),
        db.event.permissions.get
      ], callback);
    },
    permissions: {
      set: function(event, callback){
        async.parallel([
          async.apply(database.delete, "plugins:calendar:events:"+event.id+":viewers:users"),
          async.apply(database.delete, "plugins:calendar:events:"+event.id+":viewers:groups"),
          async.apply(database.delete, "plugins:calendar:events:"+event.id+":blocked"),
          async.apply(database.delete, "plugins:calendar:events:"+event.id+":editors:users"),
          async.apply(database.delete, "plugins:calendar:events:"+event.id+":editors:groups")
        ], function(err){
          if(err){
            return callback(err);
          }
          async.parallel([
            async.apply(database.setAdd, "plugins:calendar:events:"+event.id+":viewers:users", event.viewers.users),
            async.apply(database.setAdd, "plugins:calendar:events:"+event.id+":viewers:groups", event.viewers.groups),
            async.apply(database.setAdd, "plugins:calendar:events:"+event.id+":viewers:blocked", event.blocked),
            async.apply(database.setAdd, "plugins:calendar:events:"+event.id+":editors:users", event.editors.users),
            async.apply(database.setAdd, "plugins:calendar:events:"+event.id+":editors:groups", event.editors.groups)
          ], function(err){
            callback(err, event);
          });
        });
      },
      get: function(event, callback){
        async.parallel({
          viewerUsers: async.apply(database.getSetMembers, "plugins:calendar:events:"+event.id+":viewers:users"),
          viewerGroups: async.apply(database.getSetMembers, "plugins:calendar:events:"+event.id+":viewers:groups"),
          viewerBlocked: async.apply(database.getSetMembers, "plugins:calendar:events:"+event.id+":blocked"),
          editorUsers: async.apply(database.getSetMembers, "plugins:calendar:events:"+event.id+":editors:users"),
          editorGroups: async.apply(database.getSetMembers, "plugins:calendar:events:"+event.id+":editors:groups"),
        }, function(err, obj){
          if(err){
            return callback(err);
          }
          event.viewers = {
            users: obj.viewerUsers,
            groups: obj.viewerGroups
          };
          event.editors = {
            users: obj.editorUsers,
            groups: obj.editorGroups
          };
          event.blocked = obj.blocked;
          callback(null, event);
        });
      },
    },
    notifications: {
      set: function(event, dates, callback){
        dates = dates.map(function(elem){
          return elem.toISOString();
        });
        async.parallel([
          async.apply(database.setAdd, "plugins:calendar:events:"+event.id+":notifications", dates),
          async.apply(database.setAdd, "plugins:calendar:notifications", "plugins:calendar:events:"+event.id+":notifications"),
        ], callback);
      },
      remove: function(event, callback){
        async.parallel([
          async.apply(database.setRemove, "plugins:calendar:notifications", event.id, callback),
          async.apply(database.delete, "plugins:calendar:events:"+event.id+":notifications")
        ], callback);
      },
      removeOne: function(event, date, callback){
        database.setRemove("plugins:calendar:events:"+event.id+":notifications", date.toISOString(), callback);
      },
      get: function(event, callback){
        database.getSetMembers("plugins:calendar:events:"+event.id+":notifications", function(err, notifs){
          event.notifications = notifs;
          callback(err, event);
        });
      },
    }
  },
  getEvents: function(callback){
    async.waterfall([
      async.apply(database.getSortedSetRange, "plugins:calendar:events", 0, -1),
      database.getObjects,
      async.apply(async.map, db.event.permissions.get),
      async.apply(async.map, db.event.notifications.get)
    ], callback);
  },
  getEventsByDate: function(start, end, callback){
    async.waterfall([
      async.apply(database.getSortedSetRangeByScore, "plugins:calendar:events", null, null, start, end),
      database.getObjects,
      async.apply(async.map, db.event.permissions.get)
    ], callback);
  },
  settings: {
    get: async.apply(database.getObject, "plugins:calendar:settings"),
    set: async.apply(database.setObject, "plugins:calendar:settings"),
  },
  getNotifications: async.apply(async.waterfall, [
    async.apply(database.getSetMembers, "plugins:calendar:notifications", 0, -1),
    function(events, next){
      async.map(events, function(event, call){
        database.getSetMembers(event, function(err, notifs){
          if(err){
            return call(err);
          }
          var id = event.match(/[0-9]*/);
          call(null, {
            id: id,
            notifications: notifs
          });
        });
      }, next);
    }
  ]),
  groups: {
    search: function(query, callback){
      groups.search(query, {}, callback);
    },
    isMember: groups.isMember,
    isMemberOfMultiple: groups.isMemberOfGroups,
    getMembers: groups.getMembers
  }

};
