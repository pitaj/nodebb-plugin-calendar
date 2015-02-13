/* event / user spec
  fields for events {
    id: (#) unique identifier for this event
    canEdit: (Boolean) whether the current user can edit this event
    canDelete: (Boolean) whether user can delete event
    start: (Date) Date object of event start time
    end: (Date) Date object of event end time
    uid: (#) the uid of the user who made the event
    pid: (#) the post id of the event
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
(function($, app){
  "use strict";

  $("#cal-sidebar ul.nav > li").click(function(){
    if(!$(this).children().hasClass("active")){
      $(this).siblings().add(this).children().toggleClass("active");
      $("#cal-sidebar .content > .day").toggleClass("active");
    }
  });

  $("#cal-sidebar .toggle").click(function(){
    $(this).parent().toggleClass("down");
    $(this).children().toggleClass("fa-chevron-up fa-chevron-down");
  });

  $("#cal-month-select li a").click(function(){
    var value = this.innerHTML;
    $("#cal-month-select .month").html(value);
  });

  $("#cal-toolbar .left .arrows").children().click(function(){
    if($(this).hasClass("fa-chevron-circle-up")){
      $("#cal-year-select").change()[0].value++;
    } else {
      $("#cal-year-select").change()[0].value--;
    }
  });
})($, app);
