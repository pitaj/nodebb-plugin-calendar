/* global socket, $, config, app, RELATIVE_PATH, fetch */

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

const toggle = e => {
  const panel = $(e.target).closest('.panel');
  const cont = panel.find('.panel-collapse');
  const height = cont.children()[0].scrollHeight;
  cont.css('height', `${height}px`);
  panel.toggleClass('closed');
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
      modal
        .find('.modal-body .plugin-calendar-event-responses-lists .panel-heading a')
        .on('click', toggle);
      modal
        .find('.plugin-calendar-event-responses-lists .panel-body')
        .addClass('topic')
        .find('ul')
        .addClass('posts');
      $(window).trigger('action:calendar.event.display', { pid, modal });
      modal
        .attr('data-pid', pid)
        .modal('show');
    });
  },
};

/* eslint-disable */
// function shadeColor2(color, percent) {
//   var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
//   return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
// }
/* eslint-enable */

const init = () => {
  // socket.emit('plugins.calendar.getCategoryColors', (err, colors) => {
  //   if (err) {
  //     app.alertError(err);
  //     return;
  //   }
  //   let style = '<style type="text/css" class="plugin-calendar-cal-styles">';
  //   for (const { cid, bgColor } of colors) {
  //     style += `.plugin-calendar-cal-event-category-${cid} {
  //       background-color: ${bgColor};
  //       border-color: ${shadeColor2(bgColor, -0.2)};
  //     }`;
  //   }
  //   style += '</style>';
  //   $(document.head).append(style);
  // });

  $('#calendar').fullCalendar(calendarOptions);

  $(window).on('action:ajaxify.end', () => {
    // TODO: automatically go to and open event when pid is in hash of url
  });
};

$(document).ready(init);
