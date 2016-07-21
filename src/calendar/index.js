/* global socket, $, config, app, RELATIVE_PATH, fetch, ajaxify */

import './vendor/fullcalendar';

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
    const pid = event.id;
    fetch(`${RELATIVE_PATH}/api/post/${pid}`)
    .then(response => response.json())
    .then(path => fetch(`${RELATIVE_PATH}/api${path}`))
    .then(response => response.json())
    .then(topic => topic.posts.find(post => parseInt(post.pid, 10) === pid).content)
    .then(content => {
      const $c = $(content);
      let div = $c.filter('.plugin-calendar-event');
      if (!div.length) {
        div = $c.find('.plugin-calendar-event');
      }
      return div;
    })
    .then(div => {
      const modal = $('#plugin-calendar-cal-event-display');
      modal
        .find('.modal-body')
        .empty()
        .append(div);
      modal
        .find('.modal-footer a.btn-primary')
        .attr('href', `${RELATIVE_PATH}/post/${pid}`);
      // modal
      //   .find('.modal-body .plugin-calendar-event-responses-lists .panel-heading a')
      //   .on('click', toggle);
      modal
        .find('.plugin-calendar-event-responses-lists .panel-body')
        .addClass('topic')
        .find('ul')
        .addClass('posts');
      $(window).trigger('action:calendar.event.display', { pid, modal });
      modal
        .attr('data-pid', pid)
        .modal({
          backdrop: false,
        });
    });
  },
  timezone: 'local',
};

const openEvent = () => {
  // TODO: automatically go to an open event when pid is in hash of url
};

const init = () => {
  $('#calendar').fullCalendar(calendarOptions);
  openEvent();
};

$(document).ready(init);
$(window).on('action:ajaxify.end', () => {
  if (ajaxify.data.template.calendar) {
    init();
  }
});
