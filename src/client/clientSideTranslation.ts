import { Translator, getLanguage } from 'translator';

// eslint-disable-next-line import/no-mutable-exports
export let momentLang = getLanguage().toLowerCase().replace(/_/g, '-');
const translator = Translator.create();

let initialized: Promise<void>;
const initialize = (): Promise<void> => {
  initialized = initialized || Promise.all([
    import('moment'),
    import('../lib/translatorModule'),
    import('./responses'),
  ]).then(([
    { default: moment },
    { initialize: initTranslatorModule },
    { initialize: initResponses },
  ]) => {
    if (momentLang === 'en-us') {
      initTranslatorModule(Translator);
      initResponses();

      return Promise.resolve();
    }

    return import(`moment/locale/${momentLang}`).catch((err) => {
      // eslint-disable-next-line no-console
      console.info(`could not load locale data (${momentLang}) for moment`, err);
      [momentLang] = momentLang.split('-');
      return import(`moment/locale/${momentLang}`);
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.info(`could not load locale data (${momentLang}) for moment`, err);
      momentLang = 'en-us';
    }).then(() => {
      moment.locale(momentLang);
      initTranslatorModule(Translator);
      initResponses();
    });
  });

  return initialized;
};

const translateEvents = () => {
  const $events = $('.plugin-calendar-event[data-translated=false]');

  // need to initialize regardless of whether there are events
  // otherwise notifications will be untranslated
  initialize().then(() => {
    $events.each((i, elem) => {
      const el = $(elem);
      el.attr('data-translated', 'true');

      translator.translateInPlace(elem).then(() => {
        el.find('.plugin-calendar-time-date-view')
          .attr('title', (x, val) => val.replace('<br>', ' | '));
      });
    });
  });
};

const setup = (): void => {
  $(window).on([
    'action:posts.loaded',
    'action:ajaxify.end',
    'action:posts.edited',
    'action:calendar.event.display',
    'action:composer.preview',
  ].join(' '), translateEvents);

  translateEvents();
};

export { initialize, setup };
