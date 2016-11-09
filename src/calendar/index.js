import 'fullcalendar';
import convertToFC from './convertToFC';
import displayEvent from './displayEvent';

const queryRegExp = /calendar\/?(?:\/*event\/+([0-9]+))?/;

const begin = (momentLang) => {
  const calendarOptions = {
    editable: false,
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay',
    },
    lang: momentLang,
    events: (start, end, timezone, callback) => {
      socket.emit('plugins.calendar.getEventsByDate', {
        startDate: start.valueOf(),
        endDate: end.valueOf(),
      }, (err, events) => {
        if (err) {
          if (err.message) {
            app.alertError(err);
          }
          throw err;
        }
        callback(convertToFC(events, start, end));
      });
    },
    eventClick: ({ id: pid }, e) => {
      e.preventDefault();
      e.stopPropagation();
      displayEvent({ pid });
      ajaxify.updateHistory(`calendar/event/${pid}`);
    },
    timezone: 'local',
  };

  let shouldHandle = false;

  $(window).on('action:ajaxify.start', (e, data) => {
    const prevRelative = app.previousUrl.split('/').slice(3).join('/');
    if (prevRelative.startsWith('calendar') && data.url.startsWith('calendar')) {
      data.url = null;
      shouldHandle = true;
    } else {
      shouldHandle = false;
    }
  });

  const init = () => {
    const $calendar = $('#calendar');

    if ($calendar) {
      $calendar.fullCalendar(calendarOptions);
      const btn = $('#plugin-calendar-cal-only-yes');
      btn
        .on('click', (e) => {
          e.preventDefault();
          $calendar.toggleClass('plugin-calendar-cal-only-yes');
          btn.toggleClass('active');
        })
        .detach()
        .appendTo($calendar.find('.fc-toolbar .fc-right'));
    }

    const $display = $('#plugin-calendar-cal-event-display');
    if ($display) {
      $display.on('click', '.dismiss', () => {
        $display.modal('hide');
        ajaxify.updateHistory('calendar');
      });
    }

    const matches = location.pathname.match(queryRegExp);
    const pid = matches && parseInt(matches[1], 10);
    if (pid) {
      if (shouldHandle) {
        displayEvent({ pid });
      }
      $calendar.fullCalendar('gotoDate', window.calendarEventData.startDate);
    } else if (shouldHandle) {
      $display.modal('hide');
    }
  };

  $(document).ready(init);
  $(window).on('action:ajaxify.end', init);
};

__webpack_public_path__ = `${RELATIVE_PATH}/plugins/nodebb-plugin-calendar/bundles/`; // eslint-disable-line

const lang = config.userLang || config.defaultLang;
const momentLang = lang.toLowerCase().replace(/_/g, '-');

try {
  if (momentLang === 'en-us') {
    begin('en-us');
  } else {
    require(`bundle!fullcalendar/dist/lang/${momentLang}`)(() => { // eslint-disable-line
      begin(momentLang);
    });
  }
} catch (e) {
  begin('en-us');
  throw Error(`Could not load locale data (${momentLang}) for fullcalendar`);
}
