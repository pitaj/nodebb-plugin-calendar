/* global $, config */

import 'eonasdan-bootstrap-datetimepicker';
import moment from 'moment';

import { eventTemplate, modalTemplate } from './templates';
import setupComposerButton from './setupComposerButton';
import createEventFactory from './createEvent';
import parse from '../lib/parse';
import initResponses from './responses';
import initTimeDateViews from './timeDateView';

const lang = config.userLang || config.defaultLang;
const momentLang = lang.toLowerCase().replace(/_/g, '-');
if (momentLang !== 'en-us') {
  require(`bundle!moment/locale/${momentLang}`)(() => {
    moment.locale(momentLang);
  });
}

window.requirejs([
  'composer',
  'composer/formatting',
  'translator',
], (composer, formatting, translator) =>
$(document).ready(() => {
  translator.translate(modalTemplate(), lang, html => {
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
    });
    const createEvent = createEventFactory();

    const prepareFormattingTools = () => {
      if (!formatting) {
        return;
      }

      formatting.addButtonDispatch('plugin-calendar-event', textarea => {
        const $textarea = $(textarea);
        const old = parse($textarea.val());
        createEvent(old || {}, event => {
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
