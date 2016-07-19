/* global socket, $, config, app */

import './vendor/fullcalendar';

// TODO: centralized calendar interface

const convertToFC = event => {
  const ev = {
    id: event.pid,
    title: event.name,
    allDay: event.allday,
    start: event.startDate,
    end: event.endDate,
    className: [`plugin-calendar-cal-event-category-${event.cid}`],
  };

  return ev;
};

const calendarOptions = {
  editable: false,
  header: {
    left: 'prev,next today',
    center: 'title',
    right: 'month,agendaWeek,agendaDay',
  },
  lang: config.userLang || config.defaultLang,
  events: (start, end, timezone, callback) => {
    socket.emit('plugins.calendar.getEventsByDate', {
      startDate: start.valueOf(),
      endDate: end.valueOf(),
    }, (err, events) => {
      if (err) {
        app.alertError(err);
        return;
      }
      callback(events.map(convertToFC));
    });
  },
  eventClick: event => {
    // TODO: show modal on event click
  },
};

/* eslint-disable */
function shadeColor2(color, percent) {
  var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
  return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}
/* eslint-enable */

const init = () => {
  socket.emit('plugins.calendar.getCategoryColors', (err, colors) => {
    if (err) {
      app.alertError(err);
      return;
    }
    let style = '<style type="text/css" class="plugin-calendar-cal-styles">';
    for (const { cid, bgColor } of colors) {
      style += `.plugin-calendar-cal-event-category-${cid} {
        background-color: ${bgColor};
        border-color: ${shadeColor2(bgColor, -0.2)};
      }`;
    }
    style += '</style>';
    $(document.head).append(style);
  });

  $('#calendar').fullCalendar(calendarOptions);
};

$(document).ready(init);
