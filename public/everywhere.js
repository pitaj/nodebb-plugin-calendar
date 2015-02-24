/* global moment */

window.initTimestamp = function(){
  "use strict";
  $(".date-timestamp").each(function(){
    var $this = $(this), data = $this.data(), utc;
    if(data.onlytime){
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
    $this.attr("data-original-title", utc).tooltip();
  });
};

$(window).on('action:ajaxify.end', window.initTimestamp);
