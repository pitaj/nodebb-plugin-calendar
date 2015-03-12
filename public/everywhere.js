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
require(["moment"], function(moment) {
  "use strict";
  window.initTimestamp = function(elems){
    elems.each(function(){
      var $this = $(this), data = $this.data(), utc;
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
      $this.popover({
        content: utc
      });
    });
  };
  $(window).on('action:ajaxify.end', function(){
    window.initTimestamp($(".date-timestamp"));
  });
});
