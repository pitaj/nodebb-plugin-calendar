"use strict";

var posttools = module.parent.parent.require("./postTools"),
  topics = module.parent.parent.require("./topics");

var posts = module.exports = {
  create: function(event, callback){
    topics.post({
      uid: event.uid,
      cid: event.cid,
      title: event.name,
      content: event.raw
    }, function(err, data){
      if(err){
        return callback(err);
      }
      event.tid = data.postData.tid;
      event.pid = data.postData.pid;
      callback(null, event);
    });
  },
  update: function(event, callback){
    posts.compile(event, function(err, raw){
      if(err){
        return callback(err);
      }
      posttools.edit({
        uid: event.uid,
        pid: event.pid,
        title: event.name,
        content: raw
      }, callback);
    });
  },
  compile: function(event, callback){
    app.render('calendar/post', {
      start: event.start,
      end: event.end,
      place: event.place,
      description: event.description,
      allday: event.allday
    }, callback);
  }
};
