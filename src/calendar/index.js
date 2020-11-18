import { getLanguage } from 'translator';
import 'fullcalendar';

import convertToFC from './convertToFC';
import displayEvent from './displayEvent';
import locationHistory from '../client/locationHistory';

// eslint-disable-next-line camelcase, no-undef
__webpack_public_path__ = `${config.relative_path}/plugins/nodebb-plugin-calendar/bundles/`;

const queryRegExp = /calendar\/?(?:\/*event\/+([0-9]+))?/;

const begin = (momentLang) => {
  const locale = $.fullCalendar.locales[momentLang];
  const buttonText = (locale && locale.buttonText) || {};

  const calendarOptions = {
    defaultView: ajaxify.data.calendarViews.split(',', 1)[0],

    views: {
      listDay: { buttonText: buttonText.day },
      listWeek: { buttonText: buttonText.week },
      listMonth: { buttonText: buttonText.month },
      listYear: { buttonText: buttonText.year },
    },

    editable: false,
    header: {
      left: 'prev,next today',
      center: 'title',
      right: ajaxify.data.calendarViews,
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
    if ($display && !shouldHandle) {
      $display.on('click', '.dismiss', () => {
        $display.modal('hide');
        ajaxify.updateHistory('calendar');
      });
    }

    const matches = window.location.pathname.match(queryRegExp);
    const pid = matches && parseInt(matches[1], 10);
    if (pid) {
      const el = $calendar
        .data('fullCalendar')
        .clientEvents()
        .find((x) => x.id === pid);

      if (shouldHandle) {
        const event = el && el.original;
        if (event) {
          displayEvent(event);
        } else {
          window.history.replaceState({}, '', `${config.relative_path}/calendar`);
        }
      } else {
        import('../client/responses')
          .then(({ setupDTP }) => setupDTP($display.find('[data-day]'), window.calendarEventData.day));
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

let momentLang = getLanguage().toLowerCase().replace(/_/g, '-');
if (momentLang === 'en-us') {
  begin('en-us');
} else {
  import(`fullcalendar/dist/locale/${momentLang}`).catch((err) => {
    // eslint-disable-next-line no-console
    console.info(`could not load locale data (${momentLang}) for moment`, err);
    [momentLang] = momentLang.split('-');
    return import(`fullcalendar/dist/locale/${momentLang}`);
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.info(`could not load locale data (${momentLang}) for moment`, err);
    momentLang = 'en-us';
  }).then(() => begin(momentLang));
}
