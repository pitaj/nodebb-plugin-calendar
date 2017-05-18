const init = (Translator) => {
  const translator = Translator.create();

  const translateEvents = () => {
    $('.plugin-calendar-event[data-translated=false]').each((i, elem) => {
      const el = $(elem);
      el.attr('data-translated', 'true');
      translator.translateInPlace(elem)
        .then(() => {
          el.find('.plugin-calendar-time-date-view')
            .attr('title', (x, val) => val.replace('<br>', ' | '));
        });
    });
  };

  $(window).on([
    'action:posts.loaded',
    'action:ajaxify.end',
    'action:posts.edited',
    'action:calendar.event.display',
    'action:composer.preview',
  ].join(' '), () => translateEvents());
  translateEvents();
};

export default init;
