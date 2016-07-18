/* global socket, $ */

// TODO: centralized calendar interface

const convertToFullCalendar = event => {
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

socket.emit('plugins.calendar.getCategoryColors', colors => {
  let style = '<style type="text/css">';
  for (const cid of Object.keys(colors)) {
    style += `.plugin-calendar-cal-event-category-${cid} {
      background-color: ${colors[cid]};
    }`;
  }
  style += '</style>';
  $(document.head).append(style);
});
