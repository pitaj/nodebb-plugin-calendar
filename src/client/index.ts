import './locationHistory';

// eslint-disable-next-line camelcase, no-undef
__webpack_public_path__ = `${config.relative_path}/plugins/nodebb-plugin-calendar/bundles/`;

jQuery.fn.size = jQuery.fn.size || function size(this: JQuery) { return this.length; };

const calendarLoad = () => {
  if (ajaxify.data.template.calendar) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    requirejs(['plugins/nodebb-plugin-calendar/bundles/calendar']);

    $('#plugin-calendar-cal-event-display').modal({
      backdrop: false,
      show: !!(calendarEventData?.pid),
    });
  }
};

$(() => {
  // ensure dependencies are loaded
  requirejs(['translator', 'benchpress'], () => {
    import('./clientSideTranslation').then(({ setup: setupTranslation, initialize: initTranslation }) => {
      setupTranslation();

      let eventModal: Promise<typeof import('./eventModal')>;
      $(window).on('action:composer.enhanced', () => {
        eventModal = eventModal || Promise.all([
          initTranslation(),
          new Promise((resolve, reject) => requirejs(['composer/formatting'], formatting => (formatting ? resolve(formatting) : reject()))),
        ]).then(() => import('./eventModal'));

        eventModal.then(({ prepareFormatting }) => prepareFormatting());
      });
    });

    calendarLoad();
    $(window).on('action:ajaxify.end', calendarLoad);
  });
});
