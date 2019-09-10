import './locationHistory';

// eslint-disable-next-line camelcase, no-undef
__webpack_public_path__ = `${config.relative_path}/plugins/nodebb-plugin-calendar/bundles/`;

jQuery.fn.size = jQuery.fn.size || function size() { return this.length; };

const calendarLoad = () => {
  if (ajaxify.data.template.calendar) {
    window.require(['plugins/nodebb-plugin-calendar/bundles/calendar']);

    $('#plugin-calendar-cal-event-display').modal({
      backdrop: false,
      show: window.calendarEventData && !!window.calendarEventData.pid,
    });
  }
};

$(document).ready(() => {
  // ensure dependencies are loaded
  window.requirejs(['translator', 'benchpress'], () => {
    import('./clientSideTranslation').then(({ setup: setupTranslation, initialize: initTranslation }) => {
      setupTranslation();

      let eventModal;
      $(window).on('action:composer.enhanced', () => {
        eventModal = eventModal || Promise.all([
          initTranslation(),
          new Promise((resolve, reject) => window.requirejs(['composer/formatting', 'benchpress'], (formatting) => (formatting ? resolve() : reject()))),
        ]).then(() => import('./eventModal'));

        eventModal.then(({ prepareFormatting }) => prepareFormatting());
      });
    });

    calendarLoad();
    $(window).on('action:ajaxify.end', calendarLoad);
  });
});
