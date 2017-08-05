import 'fullcalendar';
import convertToFC from './convertToFC';
import displayEvent from './displayEvent';
import locationHistory from '../client/locationHistory';
import { setupDTP } from '../client/responses';

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

        callback(convertToFC(events));
      });
    },
    eventClick: ({ original, id: pid }, e) => {
      e.preventDefault();
      e.stopPropagation();
      displayEvent(original);
      if (original.repeats) {
        ajaxify.updateHistory(`calendar/event/${pid}/${original.day}`);
      } else {
        ajaxify.updateHistory(`calendar/event/${pid}`);
      }
    },
    timezone: 'local',
  };

  let shouldHandle = false;

  locationHistory.listen((state, data) => {
    if (state.prev.startsWith('calendar') && state.current.startsWith('calendar')) {
      data.url = null; // eslint-disable-line no-param-reassign
      shouldHandle = true;
    } else {
      shouldHandle = false;
    }
  });

  const init = () => {
    const $calendar = $('#calendar');

    if ($calendar && !shouldHandle) {
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
      const el = $calendar
        .data('fullCalendar')
        .getEventCache()
        .find(x => x.id === pid);

      if (shouldHandle) {
        const event = el && el.original;
        if (event) {
          displayEvent(event);
        } else {
          history.replaceState({}, '', `${RELATIVE_PATH}/calendar`);
        }
      } else {
        setupDTP($display.find('[data-day]'), window.calendarEventData.day);
      }
      $calendar.fullCalendar('gotoDate', el ? el.start : (
        window.calendarEventData.day || window.calendarEventData.startDate
      ));
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
    require(`bundle-loader!fullcalendar/dist/locale/${momentLang}`)(() => { // eslint-disable-line
      begin(momentLang);
    });
  }
} catch (e) {
  try {
    require(`bundle-loader!fullcalendar/dist/locale/${momentLang.split('-')[0]}`)(() => { // eslint-disable-line
      begin(momentLang);
    });
  } catch (er) {
    begin('en-us');
    throw Error(`Could not load locale data (${momentLang}) for fullcalendar`);
  }
}
