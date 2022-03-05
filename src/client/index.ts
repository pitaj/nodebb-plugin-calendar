import './locationHistory';

// eslint-disable-next-line camelcase, no-undef
__webpack_public_path__ = `${config.relative_path}/assets/plugins/nodebb-plugin-calendar/bundles/`;

jQuery.fn.size = jQuery.fn.size || function size(this: JQuery) { return this.length; };

const calendarLoad = () => {
  if (ajaxify.data.template.calendar) {
    import('../calendar');

    $('#plugin-calendar-cal-event-display').modal({
      backdrop: false,
      show: !!(calendarEventData?.pid),
    });
  }
};

$(() => {
  // ensure dependencies are loaded
  Promise.all([
    import('translator'),
    import('benchpress'),
    import('alerts'),
  ]).then(() => {
    calendarLoad();
    $(window).on('action:ajaxify.end', calendarLoad);

    return import('./clientSideTranslation');
  }).then(({ setup: setupTranslation, initialize: initTranslation }) => {
    setupTranslation();

    let eventModal: Promise<typeof import('./eventModal')>;
    $(window).on('action:composer.enhanced', () => {
      eventModal = eventModal || Promise.all([
        initTranslation(),
        import('composer/formatting'),
      ]).then(() => import('./eventModal'));

      eventModal.then(({ prepareFormatting }) => prepareFormatting());
    });
  });
});
