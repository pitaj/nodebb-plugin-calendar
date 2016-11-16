const translateEvents = (translate) => {
  $('.plugin-calendar-event[data-translated=false]').each((i, elem) => {
    const el = $(elem);
    el.attr('data-translated', 'true');
    translate(el.html())
      .then((translated) => {
        el.html(translated);
        el.find('.plugin-calendar-time-date-view')
          .attr('title', (x, val) => val.replace('<br>', ' | '));
      });
  });
};

const init = (Translator) => {
  const translator = Translator.create();
  const translate = (text) => translator.translate(text);
  $(window).on([
    'action:posts.loaded',
    'action:ajaxify.end',
    'action:posts.edited',
    'action:calendar.event.display',
    'action:composer.preview',
  ].join(' '), () => translateEvents(translate));
  translateEvents(translate);
};

export default init;
