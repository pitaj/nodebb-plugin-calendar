(function(module){

"use strict";

var posttools = module.parent.parent.require("./postTools"),
  topics = module.parent.parent.require("./topics"),
  postsModule = module.parent.parent.require("./posts");

var posts = module.exports = {
  create: function(event, callback){
    posts.compile(event, function(err, raw){
      if(err){
        console.error(err);
        return callback(err);
      }
      topics.post({
        uid: event.uid,
        cid: event.cid,
        title: event.name,
        content: raw
      }, function(err, data){
        if(err){
          console.error(err);
          return callback(err);
        }
        event.url = "/category/"+event.cid+"/"+data.topicData.slug;
        event.pid = data.postData.pid;
        event.tid = data.postData.tid;
        callback(null, event);
      });
    });
  },
  update: function(event, callback){
    posts.compile(event, function(err, raw){
      if(err){
        console.error(err);
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
  delete: function(event, callback){
    postsModule.getPostField(event.pid, 'tid', function(err, tid) {
      if (err) {
        console.error(err);
        return callback(err);
      }
      topics.delete(tid, callback);
    });
  },
  compile: function(event, callback){
    posts.app.render('partials/calendar/post', {
      start: event.start,
      end: event.end,
      place: event.rawPlace,
      description: event.rawDescription,
      allday: event.allday
    }, callback);
  }
};

})(module);
