/* global $, config */

import 'eonasdan-bootstrap-datetimepicker';
import moment from 'moment';

import { eventTemplate, modalTemplate } from './templates';
import setupComposerButton from './setupComposerButton';
import createEventFactory from './createEvent';
import parse from '../lib/parse';
import initResponses from './responses';
import initTimeDateViews from './timeDateView';
import { init as initTranslatorModule } from '../lib/translatorModule';

const lang = config.userLang || config.defaultLang;

const begin = (momentLang) => {
  window.requirejs([
    'composer',
    'composer/formatting',
    'translator',
  ], (composer, formatting, translator) =>
  $(document).ready(() => {
    initTranslatorModule(translator.Translator, moment);

    translator.translate(modalTemplate(), lang, (html) => {
      $('body').append(html);

      setupComposerButton(composer, translator);
      $('.plugin-calendar-event-editor-date').datetimepicker({
        icons: {
          time: 'fa fa-clock-o',
          date: 'fa fa-calendar',
          up: 'fa fa-arrow-up',
          down: 'fa fa-arrow-down',
          previous: 'fa fa-arrow-left',
          next: 'fa fa-arrow-right',
          today: 'fa fa-crosshairs',
          clear: 'fa fa-trash',
          close: 'fa fa-times',
        },
        allowInputToggle: true,
        locale: momentLang,
        sideBySide: true,
        useCurrent: true,
      });
      const createEvent = createEventFactory();

      const prepareFormattingTools = () => {
        if (!formatting) {
          return;
        }

        formatting.addButtonDispatch('plugin-calendar-event', (textarea) => {
          const $textarea = $(textarea);
          const old = parse($textarea.val());
          createEvent(old || {}, (event) => {
            const text = event ? eventTemplate(event) : '';
            $textarea.val(
              $textarea
              .val()
              .replace(/\[\s*event\s*\][\w\W]*\[\s*\/\s*event\s*\]/g, '\n') +
              text
            );
            $textarea.trigger('input');
          });
        });
      };

      $(window).on('action:composer.enhanced', prepareFormattingTools);

      initResponses();
      initTimeDateViews();
    });
  }));
};

__webpack_public_path__ = `${RELATIVE_PATH}/plugins/nodebb-plugin-calendar/bundles/`; // eslint-disable-line

const momentLang = lang.toLowerCase().replace(/_/g, '-');

try {
  if (momentLang === 'en-us') {
    begin('en-us');
  } else {
    require(`bundle!moment/locale/${momentLang}`)(() => { // eslint-disable-line
      moment.locale(momentLang);
      begin(momentLang);
    });
  }
} catch (e) {
  begin('en-us');
  throw Error(`could not load locale data (${momentLang}) for moment`);
}
