"use strict";

(function(module){

var database = module.parent.parent.require("./database"),
  async = require("async"),
  groups = module.parent.parent.require("./groups"),
  user = module.parent.parent.require("./user");

  var setAdd = database.setAdd;
  database.setAdd = function(key, value, callback){
    if(Array.isArray(value)){
      async.each(value, function(it){
        setAdd(key, it, callback);
      }, callback);
    } else {
      setAdd(key, value, callback);
    }
  };

var db = module.exports = {
  event: {
    last: async.apply(database.get, "plugins:calendar:events:last"),
    add: function(event, callback){
      db.event.last(function(err, last){
        if(err){
          return callback(err);
        }
        console.log("event.add");
        event.id = last+1;
        async.waterfall([
          async.apply(async.parallel, [
            async.apply(database.sortedSetAdd, "plugins:calendar:events", new Date(event.start).valueOf(), "plugins:calendar:events:"+event.id),
            async.apply(database.setObjectField, "plugins:calendar:eventsByTid", event.tid, event.id),
            async.apply(db.event.edit, event)
          ]),
          function(prev, next){
            database.increment("plugins:calendar:events:last", next);
          }
        ], function(err){
          console.log("event.add2", err);
          callback(err, event);
        });
      });
    },
    getByTid: function(tid, callback){
      database.getObjectField("plugins:calendar:eventsByTid", tid, function(err, eid){
        if(err){
          return callback(err);
        }
        if(!eid){
          return callback();
        }
        db.event.get(eid, callback);
      });
    },
    edit: function(event, callback){
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
        console.log("permissions.set");
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
            async.apply(database.setAdd, "plugins:calendar:events:"+event.id+":blocked", event.blocked),
            async.apply(database.setAdd, "plugins:calendar:events:"+event.id+":editors:users", event.editors.users),
            async.apply(database.setAdd, "plugins:calendar:events:"+event.id+":editors:groups", event.editors.groups)
          ], function(err){
            console.log("permissions.set2", err);
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
        ], function(err){
          callback(err);
        });
      },
      remove: function(event, callback){
        async.parallel([
          async.apply(database.setRemove, "plugins:calendar:notifications", event.id),
          async.apply(database.delete, "plugins:calendar:events:"+event.id+":notifications")
        ], function(err){
          callback(err);
        });
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
    },
    responses: {
      set: function(event, uid, value, callback){
        database.setObjectField("plugins:calendar:events:"+event.id+":responses", uid, value, callback);
      },
      get: function(event, callback){
        database.getObject("plugins:calendar:events:"+event.id+":responses", function(err, responses){
          event.responses = responses;
          callback(err, event);
        });
      },
      delete: function(event, callback){
        database.delete("plugins:calendar:events:"+event.id+":responses", callback);
      }
    }
  },
  getEvents: function(callback){
    async.waterfall([
      async.apply(database.getSortedSetRange, "plugins:calendar:events", 0, -1),
      database.getObjects,
      function(events, next){
        async.map(events, db.event.permissions.get, next);
      },
      function(events, next){
        async.map(events, db.event.notifications.get, next);
      },
      function(events, next){
        async.map(events, db.event.responses.get, next);
      }
    ], callback);
  },
  getEventsByDate: function(start, end, callback){
    async.waterfall([
      async.apply(database.getSortedSetRangeByScore, "plugins:calendar:events", 0, 100000, start.valueOf(), end.valueOf()),
      database.getObjects,
      function(events, next){
        async.map(events, db.event.permissions.get, next);
      }
    ], callback);
  },
  settings: {
    get: function(callback){
      database.getObject("plugins:calendar:settings", function(err, data){
        callback(err, data || {
          create: "",
          edit: "",
          admin: "",
          category: 1,
          whoisin: false
        });
      });
    },
    set: async.apply(database.setObject, "plugins:calendar:settings"),
  },
  getNotifications: async.apply(async.waterfall, [
    async.apply(database.getSetMembers, "plugins:calendar:notifications"),
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
  },
  users: {
    getInfo: function(uid, callback){
      user.getUserFields(uid, ["uid", "username", "userslug", "picture"], callback);
    }
  }
};

})(module);
